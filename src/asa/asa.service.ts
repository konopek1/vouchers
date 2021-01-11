import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as algosdk from 'algosdk';
import { ConfirmedTxInfo, encodeAddress, Transaction, TxSig } from "algosdk";
import AlgorandService from "src/algorand/algorand.service";
import { TxPendingInformation } from "src/algorand/algosdk.types";
import { ContractService } from "src/contract/contract.service";
import User from "src/user/user.entity";
import Wallet from "src/wallet/wallet.entity";
import { Repository } from "typeorm";
import { Asa } from "./asa.entity";
import AssetConfigDto from "./AssetConfigDto";
import SignedTxDto from "./SignedTxDto";
import UpdateAsaDto from "./UpdateAsaDto";

@Injectable()
export class AsaService {
    constructor(
        private readonly algorandService: AlgorandService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>,
        @InjectRepository(Wallet)
        private readonly walletRepository: Repository<Wallet>,
        private readonly contractService: ContractService,
    ) { }


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
            new Uint8Array(),
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

    public async updateAsa(signedUpdateAsaTx: SignedTxDto): Promise<ConfirmedTxInfo> {
        return await this.algorandService.sendSignedTx(signedUpdateAsaTx);
    }

    public async createAddUsersToWhitelistTxs(users: User[], entityAsaID: number, from: string): Promise<any[]> {
        const asa = await this.asaRepository.findOneOrFail(entityAsaID);

        const notWhitelistedUsers = users.filter(
            (user: User) => !asa.whitelist.includes(user)
        );

        const transactions = notWhitelistedUsers.map(
            async (user: User) => {

                const target = user.wallets.find((w) => w.asa.asaID === entityAsaID).publicKey;

                return await this.contractService.createCallAddToWhitelistTx(entityAsaID, from, target);
            }
        );

        return transactions;
    }


    public async createRemoveUsersFromWhitelistTxs(users: User[], entityAsaID: number, from: string): Promise<any[]> {

        const asa = await this.asaRepository.findOneOrFail(entityAsaID);

        const whitelistedUsers = users.filter(
            (user: User) => asa.whitelist.includes(user)
        );

        const transactions = whitelistedUsers.map(
            async (user: User) => {

                const target = user.wallets.find((w: Wallet) => w.asa.asaID === entityAsaID).publicKey;

                return await this.contractService.createCallRemoveFromWhitelistTx(entityAsaID, from, target);
            }
        )

        return transactions;
    }

    public async modifyWhitelist(signTx: TxSig) {
        const decodedTx = algosdk.decodeSignedTransaction(signTx.blob).txn;

        await this.algorandService.sendSignedTx(signTx)

        const asa = await this.asaRepository.findOneOrFail({ appID: decodedTx.appIndex });
        const whiteListedAccounts = decodedTx.appAccounts;

        const appArgs = decodedTx.appArgs;

        if (ContractService.isSetLevelCall(appArgs)) {
            const user = (await this.walletRepository.findOneOrFail({ publicKey: encodeAddress(whiteListedAccounts[0]) })).owner;

            if (ContractService.isEnableArg(appArgs)) {
                asa.whitelist.push(user);
            } else if (ContractService.isDisableArg(appArgs[1])) {
                asa.whitelist = asa.whitelist.filter((u: User) => u.id !== user.id);
            }
            
            await this.asaRepository.save(asa);


        } else {
            throw new HttpException("Wrong app arg, first argument should be set level", HttpStatus.BAD_REQUEST);
        }
    }

    //TODO: add validate action which check if asa is set-up properly and set its status in db
}
