import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction, TxSig } from "algosdk";
import AlgorandService from "src/algorand/algorand.service";
import { SignedTx } from "src/algorand/algosdk.types";
import { Repository } from "typeorm";
import { Asa } from "./asa.entity";
import AssetConfigDto from "./AssetConfigDto";
import * as algosdk from 'algosdk';

@Injectable()
export class AsaService {
    constructor(
        private readonly algorandService: AlgorandService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>
    ) { }

    public async createAsaTx(assetConfig: AssetConfigDto): Promise<Transaction> {
        return this.algorandService.createAssetTx(assetConfig);
    }

    public async createAsa(signedAsaTx: TxSig): Promise<void> {

        const response = await this.algorandService.sendSignedTx(signedAsaTx);

        const decodedAsaTx = algosdk.decodeSignedTransaction(signedAsaTx.blob).txn;

        const newAsa = this.asaRepository.create({
            asaId: response["asset-index"],
            assetUrl: decodedAsaTx.assetURL,
            name: decodedAsaTx.assetName,
            unitName: decodedAsaTx.assetUnitName,
        })

        await this.asaRepository.save(newAsa);
    }
}
