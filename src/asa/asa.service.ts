import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import AlgorandService from "src/algorand/algorand.service";
import { AssetInfo, SignedTx, Tx } from "src/algorand/algosdk.types";
import { Repository } from "typeorm";
import { Asa } from "./asa.entity";
import AssetConfigDto from "./AssetConfigDto";
const algosdk = require('algosdk');

@Injectable()
export class AsaService {
    constructor(
        private readonly algorandService: AlgorandService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>
    ) { }

    public async createAsaTx(assetConfig: AssetConfigDto): Promise<Tx> {
        return this.algorandService.createAssetTx(assetConfig);
    }

    public async createAsa(signedAsaTx: SignedTx): Promise<void> {

        const response = await this.algorandService.sendSignedTx(signedAsaTx);

        const decodedAsaTx = algosdk.decodeSignedTransaction(response.signedTx.blob).txn;

        const newAsa = this.asaRepository.create({
            asaId: response.asaId,
            assetUrl: decodedAsaTx.assetURL,
            name: decodedAsaTx.assetName,
            unitName: decodedAsaTx.assetUnitName,
        })

        await this.asaRepository.save(newAsa);
    }
}
