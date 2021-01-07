import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as algosdk from 'algosdk';
import { Transaction, TxSig } from "algosdk";
import AlgorandService from "src/algorand/algorand.service";
import { Repository } from "typeorm";
import { Asa } from "./asa.entity";
import AssetConfigDto from "./AssetConfigDto";
import UpdateAsaDto from "./UpdateAsaDto";

@Injectable()
export class AsaService {
    constructor(
        private readonly algorandService: AlgorandService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>
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
    public async createUpdateAsaTx(updateAsaDto: UpdateAsaDto ) {
        const asa = await this.asaRepository.findOneOrFail({id: updateAsaDto.entityAsaID});
        const defaultParameters = await this.algorandService.getTransactionDefaultParameters();

        const asset = await this.algorandService.getAsa(asa.asaID);
        const newEscrow = algosdk.encodeAddress(updateAsaDto.signedTeal);

        const modifiedAsa = algosdk.makeAssetConfigTxnWithSuggestedParams(
            asset.params.manager,
            asset.params.creator,
            asa.asaID,
            asset.params.manager,
            asset.params.reserve,
            asset.params.freeze,
            newEscrow,
            defaultParameters,
            true
        )


        return modifiedAsa;
    }

}
