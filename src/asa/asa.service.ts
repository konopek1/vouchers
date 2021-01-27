import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as algosdk from 'algosdk';
import { encodeAddress, Transaction, TxSig } from "algosdk";
import AlgorandService from "src/algorand/algorand.service";
import { ContractService } from "src/contract/contract.service";
import User from "src/user/user.entity";
import { UserService } from "src/user/user.service";
import { WalletService } from "src/wallet/wallet.service";
import { Repository } from "typeorm";
import { Asa } from "./asa.entity";
import AssetConfigDto from "./AssetConfig.dto";
import SignedTxDto from "./SignedTx.dto";
import UpdateAsaDto from "./UpdateAsa.dto";
import { EMPTY_NOTE } from "src/lib/Constants";

@Injectable()
export class AsaService {
    constructor(
        private readonly algorandService: AlgorandService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>,
        private readonly walletService: WalletService,
        private readonly userService: UserService,
        private readonly contractService: ContractService,
    ) {
    }

    async getByIDOrFail(id: number) {
        return await this.asaRepository.findOneOrFail(id);
    }

    async getByAppIDOrFail(appID: number) {
        return await this.asaRepository.findOneOrFail({ appID });
    }

    async getAll() {
        return await this.asaRepository.find();
    }


    async createAsaTx(assetConfig: AssetConfigDto): Promise<Transaction> {
        const defaultParameters = await this.algorandService.getTransactionDefaultParameters();
        const asa = algosdk.makeAssetCreateTxnWithSuggestedParams(
            assetConfig.addr,
            assetConfig.note,
            assetConfig.totalIssuance,
            assetConfig.decimals,
            true,
            assetConfig.manager,
            assetConfig.reserve,
            assetConfig.freeze,
            assetConfig.clawback,
            assetConfig.unitName,
            assetConfig.assetName,
            assetConfig.assetURL,
            assetConfig.assetMetadataHash,
            defaultParameters
        );

        return asa;
    }

    public async createAsa(signedAsaTx: TxSig): Promise<Asa> {

        const response = await this.algorandService.sendSignedTx(signedAsaTx);

        const decodedAsaTx = algosdk.decodeSignedTransaction(signedAsaTx.blob).txn;

        const newAsa = this.asaRepository.create({
            asaID: response["asset-index"],
            assetUrl: decodedAsaTx.assetURL,
            name: decodedAsaTx.assetName,
            unitName: decodedAsaTx.assetUnitName,
            manager: encodeAddress(decodedAsaTx.assetManager.publicKey),
            clawback: encodeAddress(decodedAsaTx.assetClawback.publicKey),
        })

        return await this.asaRepository.save(newAsa);
    }

    // For now it only updates clawback address but can be extended with ease
    public async createUpdateAsaTx(updateAsaDto: UpdateAsaDto) {
        const asa = await this.asaRepository.findOneOrFail({ id: updateAsaDto.entityAsaID });
        const defaultParameters = await this.algorandService.getTransactionDefaultParameters();

        const asset = await this.algorandService.getAsa(asa.asaID);

        const updateAsaTx = algosdk.makeAssetConfigTxnWithSuggestedParams(
            asset.params.manager,
            EMPTY_NOTE,
            asa.asaID,
            asset.params.manager,
            asset.params.reserve,
            asset.params.freeze,
            updateAsaDto.clawbackAddress,
            defaultParameters,
            true
        )

        return updateAsaTx;
    }
    //TODO hardcoded only for updating clawback should be changed
    public async updateAsa(signedUpdateAsaTx: SignedTxDto): Promise<Asa> {
        const decodedTx = algosdk.decodeSignedTransaction(signedUpdateAsaTx.blob).txn;
        const asaID = decodedTx.assetIndex;
        const asa = await this.asaRepository.findOneOrFail({ asaID });

        const confirmedTx = await this.algorandService.sendSignedTx(signedUpdateAsaTx);
        asa.clawback = encodeAddress(decodedTx.assetClawback.publicKey);

        await this.asaRepository.save(asa);

        return asa;
    }

    public async createAddUsersToWhitelistTxs(emails: string[], entityAsaID: number, from: string): Promise<any[]> {
        const users = await this.userService.getUsersByEmails(emails);
        const asa = await this.getByIDOrFail(entityAsaID);

        const notWhitelistedUsers = users.filter(
            (user: User) => !asa.whitelist.some(user.compare.bind(user))
        );

        const transactions = await Promise.all(notWhitelistedUsers.map(
            async (user: User) => {
                const target = this.getWalletAddressByUserAndAsa(user, entityAsaID);

                return await this.contractService.createCallAddToWhitelistTx(entityAsaID, from, target);
            }
        ));

        return transactions;
    }


    public async createRemoveUsersFromWhitelistTxs(emails: string[], entityAsaID: number, from: string): Promise<any[]> {
        const users = await this.userService.getUsersByEmails(emails);
        const asa = await this.getByIDOrFail(entityAsaID);

        const whitelistedUsers = users.filter(
            (user: User) => asa.whitelist.some(user.compare.bind(user))
        );

        const transactions = await Promise.all(whitelistedUsers.map(
            async (user: User) => {
                const target = this.getWalletAddressByUserAndAsa(user, entityAsaID);

                return await this.contractService.createCallRemoveFromWhitelistTx(entityAsaID, from, target);
            }
        ));

        return transactions;
    }

    private getWalletAddressByUserAndAsa(user: User, entityAsaID: number): string {
        try {
            return user.wallets.find((w) => w.asa.id === entityAsaID).publicKey;
        } catch (e) {
            throw new HttpException(`No wallet found for user ${user.email} for ASA ${entityAsaID}`, HttpStatus.BAD_REQUEST);
        }
    }

    public async modifyWhitelist(signTx: TxSig) {
        const decodedTx = algosdk.decodeSignedTransaction(signTx.blob).txn;
        const whiteListedAccounts = decodedTx.appAccounts;

        await this.algorandService.sendSignedTx(signTx)

        const asa = await this.getByAppIDOrFail(decodedTx.appIndex);

        const appArgs = decodedTx.appArgs;

        if (ContractService.isSetLevelCall(appArgs)) {

            const publicKey = encodeAddress(whiteListedAccounts[0].publicKey);
            const user = (await this.walletService.getWalletByPublicKeyOrFail(publicKey)).owner;

            if (ContractService.isEnableArg(appArgs)) {
                asa.whitelist.push(user);
            } else if (ContractService.isDisableArg(appArgs)) {
                asa.whitelist = asa.whitelist.filter((u: User) => u.id !== user.id);
            } else {
                throw new HttpException("Wrong app arg, second argument have to be disable/enable arg", HttpStatus.BAD_REQUEST);
            }

            await this.asaRepository.save(asa);


        } else {
            throw new HttpException("Wrong app arg, first argument should be set level", HttpStatus.BAD_REQUEST);
        }
    }

    //TODO: add validate action which check if asa is set-up properly and set its status in db
}
