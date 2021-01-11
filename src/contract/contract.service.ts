import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CompileOut, ConfirmedTxInfo, decodeSignedTransaction, encodeObj, makeApplicationCreateTxn, makeApplicationNoOpTxn, makeApplicationOptInTxn, TxSig } from "algosdk";
import AlgorandService from "src/algorand/algorand.service";
import { TxPendingInformation } from "src/algorand/algosdk.types";
import { Asa } from "src/asa/asa.entity";
import SignedTxDto from "src/asa/SignedTxDto";
import FileReader from 'src/lib/FileReader';
import { Repository } from "typeorm";
import { AppArg, AppArgs } from "./AppArgs";
import OptInTxDto from "./OptInTxDto";
import PoiContractDto from "./PoiContractDto";
const parseTemplate = require("string-template");

@Injectable()
export class ContractService {

    public static SET_LEVEL = "set-level";
    public static ENABLED = "1";
    public static DISABLED = "0";
    public static CALL_INDEX = 0;
    public static ASA_INDEX = 0;
    public static LEVEL_INDEX = 1;

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

        const compiledPoiApprovalTeal = (await this.algorandService.compile(poiApprovalTeal)).result;
        const compiledPoiClearTeal =  (await this.algorandService.compile(poiClearTeal)).result;

        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const asa = await this.asaRepository.findOneOrFail({ id: contractConfig.asaEntityID })

        const args = new AppArgs(asa.asaID.toString(), ContractService.ENABLED);

        return makeApplicationCreateTxn(
            contractConfig.from,
            suggestedParams,
            contractConfig.onComplete,
            Uint8Array.from(Buffer.from(compiledPoiApprovalTeal, "base64")),
            Uint8Array.from(Buffer.from(compiledPoiClearTeal, "base64")),
            contractConfig.localInts,
            contractConfig.localBytesSlices,
            contractConfig.globalInts,
            contractConfig.globalBytesSlices,
            args.parse()
        );
    }


    public async createPoiContract(signedPoiTx: TxSig): Promise<ConfirmedTxInfo> {
        const decodedTx = decodeSignedTransaction(signedPoiTx.blob).txn;
        const algoAsaID = Number(Buffer.from(decodedTx.appArgs[ContractService.ASA_INDEX]));

        const confirmedTx = await this.algorandService.sendSignedTx(signedPoiTx);

        const asa = await this.asaRepository.findOneOrFail({ asaID: algoAsaID });

        asa.appID = confirmedTx['application-index'];
        
        await this.asaRepository.save(asa);

        return confirmedTx;
    }


    // have to be signed with algosdk.tealSign
    public async createEscrowTx(asaEntityID: number): Promise<CompileOut> {
        const asa = await this.asaRepository.findOneOrFail({ id: asaEntityID });

        const escrowTealTemplate = await this.fileReader.read(this.configService.get('CLAWBACK_ESCROW_TEAL'));
 
        const escrowTeal = parseTemplate(escrowTealTemplate, {
            asaID: asa.asaID,
            appID: asa.appID
        });

        return await this.algorandService.compile(escrowTeal);
    }

    public async createOptInContractTx(optInTxDto: OptInTxDto) {
        const asa = await this.asaRepository.findOneOrFail({ id: optInTxDto.entityAsaID });
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const optInTx = makeApplicationOptInTxn(optInTxDto.address, suggestedParams, asa.appID)

        return optInTx;
    }

    public async sendOptInTx(signedOptInTx: SignedTxDto): Promise<ConfirmedTxInfo> {
        return await this.algorandService.sendSignedTx(signedOptInTx);
    }

    public async createCallAddToWhitelistTx(asaEntityID: number, from: string, target: string) {
        const asa = await this.asaRepository.findOneOrFail({ id: asaEntityID });
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const args = new AppArgs(ContractService.SET_LEVEL, ContractService.ENABLED);

        const callTx = makeApplicationNoOpTxn(from, suggestedParams, asa.appID, args.parse(),[target]);

        return callTx;
    }

    public async createCallRemoveFromWhitelistTx(asaEntityID: number, from: string, target: string) {
        const asa = await this.asaRepository.findOneOrFail({ id: asaEntityID });
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const args = new AppArgs(ContractService.SET_LEVEL, ContractService.DISABLED);

        const callTx = makeApplicationNoOpTxn(from, suggestedParams, asa.appID, args.parse(), [target]);

        return callTx;
    }

    public static isSetLevelCall(arg: Uint8Array[]) {
        return arg[ContractService.CALL_INDEX] === AppArg(ContractService.SET_LEVEL);
    }

    public static isEnableArg(arg: Uint8Array[]) {
        return arg[ContractService.LEVEL_INDEX] === AppArg(ContractService.ENABLED);
    }
    
    public static isDisableArg(arg: Uint8Array[]) {
        return arg[ContractService.LEVEL_INDEX] === AppArg(ContractService.ENABLED);
    }
}