import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CompileOut, ConfirmedTxInfo, decodeSignedTransaction, makeApplicationCreateTxn, makeApplicationOptInTxn, TxSig } from "algosdk";
import AlgorandService from "src/algorand/algorand.service";
import { Asa } from "src/asa/asa.entity";
import FileReader from 'src/lib/FileReader';
import { renderString } from "template-file";
import { Repository } from "typeorm";
import AppArgs from "./AppArgs";
import PoiContractDto from "./PoiContractDto";

@Injectable()
export class ContractService {

    constructor(
        private readonly algorandService: AlgorandService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>,
        private readonly fileReader: FileReader,
        private readonly configService: ConfigService
    ) { }

    public async createPoiContractTx(contractConfig: PoiContractDto): Promise<CompileOut> {
        const poiApprovalTeal = await this.fileReader.read(this.configService.get('POI_TEAL'));
        const poiClearTeal = await this.fileReader.read(this.configService.get('POI_CLEAR_TEAL'));

        const compiledPoiApprovalTeal = await this.algorandService.compile(poiApprovalTeal);
        const compiledPoiClearTeal = await this.algorandService.compile(poiClearTeal);

        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const asa = await this.asaRepository.findOneOrFail({id: contractConfig.asaEntityID})

        // TODO Im not sure :(
        const args = new AppArgs(asa.asaID.toString(), "1");

        return makeApplicationCreateTxn(
            contractConfig.from,
            suggestedParams,
            contractConfig.onComplete,
            compiledPoiApprovalTeal,
            compiledPoiClearTeal,
            contractConfig.localInts,
            contractConfig.localBytesSlices,
            contractConfig.globalInts,
            contractConfig.globalBytesSlices,
            args.parse()
        );
    }

    
    public async createPoiContract(signedPoiTx: TxSig): Promise<ConfirmedTxInfo> {
        const decodedTx = decodeSignedTransaction(signedPoiTx.blob).txn;

        const asa = await this.asaRepository.findOneOrFail({ appID: decodedTx.assetIndex});

        asa.appID = decodedTx.appIndex;

        await this.asaRepository.save(asa);

        return await this.algorandService.sendSignedTx(signedPoiTx);
    }


    // have to be signed with algosdk.tealSign
    public async createEscrowTx(asaEntityID: number): Promise<CompileOut> {
        const asa = await this.asaRepository.findOneOrFail({id: asaEntityID});

        const escrowTealTemplate = await this.fileReader.read(this.configService.get('CLAWBACK_ESCROW_TEAL'));
        const escrowTeal = await renderString(escrowTealTemplate, {
            asaID: asa.asaID,
            appIDL: asa.appID
        });

        return await this.algorandService.compile(escrowTeal);
    }

    public async createOptInContractTx(asaEntityID: number, from: string) {
        const asa = await this.asaRepository.findOneOrFail({id: asaEntityID});
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const optInTx = makeApplicationOptInTxn(from, suggestedParams, asa.appID)
        
        return optInTx;
    }

    
}