import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as algosdk from 'algosdk';
import { encodeAddress, Transaction, TxSig } from "algosdk";
import AlgorandService from "../algorand/algorand.service";
import { ContractService } from "../contract/contract.service";
import OptInTxDto from "../contract/OptInTx.dto";
import { EMPTY_NOTE, ZERO_ADDRESS } from "../lib/Constants";
import User from "../user/user.entity";
import { UserService } from "../user/user.service";
import { WalletService } from "../wallet/wallet.service";
import { In, Repository } from "typeorm";
import { Asa } from "./asa.entity";
import AssetConfigDto from "./AssetConfig.dto";
import { OwnedByUserAsasDto } from "./OwnedByUser.dto";
import SignedTxDto from "./SignedTx.dto";
import UpdateAsaDto from "./UpdateAsa.dto";

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
        return await this.asaRepository.findOneOrFail(id, { relations: ['whitelist'] });
    }

    async getByAppIDOrFail(appID: number) {
        return await this.asaRepository.findOneOrFail({ where: { appID }, relations: ['whitelist'] });
    }

    async getAll() {
        return await this.asaRepository.find();
    }

    async getByManager(managerID: number): Promise<Asa[]> {
        const managerWallets = await this.walletService.getOwnedByUser(managerID);

        return await this.asaRepository.find({
            where: {
                manager: In(managerWallets.map(w => w.publicKey))
            }
        });
    }

    async getOwnedByUser(userID: number): Promise<OwnedByUserAsasDto> {
        const ownedByUser = (await this.walletService.getOwnedByUser(userID)).map(w => w.asa);

        const allAsa = await this.getAll();

        const allAsaWithoutOwnedByUser = allAsa.filter(asa => !ownedByUser.some(
            secondAsa => secondAsa.id === asa.id
        ));

        return new OwnedByUserAsasDto(ownedByUser, allAsaWithoutOwnedByUser);
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

    // TODO other suppliers can be added here
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

        await this.algorandService.sendSignedTx(signedUpdateAsaTx);
        asa.clawback = encodeAddress(decodedTx.assetClawback.publicKey);

        await this.asaRepository.save(asa);

        return asa;
    }

    public async addSupplierTx(asaEntityID: number, target: string): Promise<[Transaction, Transaction]> {
        const optInAppTx = await this.contractService.createOptInContractTx({ address: target, entityAsaID: asaEntityID });

        const asa = await this.asaRepository.findOneOrFail(asaEntityID);

        const supplierPermissionTx = await this.contractService.createCallAddSupplierTx(asaEntityID, target, asa.manager);

        return [
            optInAppTx,
            supplierPermissionTx
        ];
    }

    public async addSupplier(optInTx: TxSig, setLevelTx: TxSig): Promise<void> {
        await this.algorandService.sendSignedTx(optInTx);
        await this.algorandService.sendSignedTx(setLevelTx);
    }

    public async createAddUsersToWhitelistTxs(emails: string[], entityAsaID: number, from: string): Promise<Transaction[]> {
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


    public async createRemoveUsersFromWhitelistTxs(emails: string[], entityAsaID: number, from: string): Promise<Transaction[]> {
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

    public async modifyWhitelist(signTx: TxSig): Promise<void> {
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

    public async makeOptInTx(optInTxDto: OptInTxDto): Promise<Transaction> {
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const asa = await this.asaRepository.findOneOrFail({ id: optInTxDto.entityAsaID });

        const assetTransferCallTx = algosdk.makeAssetTransferTxnWithSuggestedParams(
            optInTxDto.address,
            optInTxDto.address,
            ZERO_ADDRESS,
            ZERO_ADDRESS,
            0,
            EMPTY_NOTE,
            asa.asaID,
            suggestedParams
        );

        return assetTransferCallTx;
    }

    //TODO: add validate action which check if asa is set-up properly and set its status in db
}
