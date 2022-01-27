import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CompileOut, ConfirmedTxInfo, decodeSignedTransaction, makeApplicationCreateTxn, makeApplicationNoOpTxn, makeApplicationOptInTxn, makeLogicSig, makePaymentTxnWithSuggestedParams, mnemonicToSecretKey, signTransaction, Transaction, TxSig } from "algosdk";
import AlgorandService from "../algorand/algorand.service";
import { Asa } from "../asa/asa.entity";
import SignedTxDto from "../asa/SignedTx.dto";
import { EMPTY_NOTE, ESCROW_SUPPLY, ZERO_ADDRESS } from "../lib/Constants";
import FileReader from '../lib/FileReader';
import { areArraysEqual, encodeCompiledTeal } from "../lib/Helpers";
import { Repository } from "typeorm";
import { AppArg, AppArgs, argToUint64 } from "./AppArgs";
import OptInTxDto from "./OptInTx.dto";
import PoiContractDto from "./PoiContract.dto";
import { assert } from "console";
const parseTemplate = require("string-template");

@Injectable()
export class ContractService {

    public static CHECK_LEVEL = "check-level"
    public static SET_LEVEL = "set-level";
    public static SUPPLIER = 2;
    public static ENABLED = 1;
    public static DISABLED = 0;
    public static USER = 0;
    public static CALL_INDEX = 0;
    public static ASA_INDEX = 0;
    public static LEVEL_INDEX = 1;

    constructor(
        private readonly algorandService: AlgorandService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>,
        private readonly fileReader: FileReader,
        private readonly configService: ConfigService,
    ) { }

    public async createPoiContractTx(contractConfig: PoiContractDto): Promise<any> {
        const poiApprovalTeal = await this.fileReader.read(this.configService.get('POI_TEAL'));
        const poiClearTeal = await this.fileReader.read(this.configService.get('POI_CLEAR_TEAL'));

        const compiledPoiApprovalTeal = (await this.algorandService.compile(poiApprovalTeal)).result;
        const compiledPoiClearTeal = (await this.algorandService.compile(poiClearTeal)).result;

        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const asa = await this.asaRepository.findOneOrFail({ id: contractConfig.asaEntityID })

        const args = new AppArgs(asa.asaID, ContractService.ENABLED);

        return makeApplicationCreateTxn(
            contractConfig.from,
            suggestedParams,
            contractConfig.onComplete,
            encodeCompiledTeal(compiledPoiApprovalTeal),
            encodeCompiledTeal(compiledPoiClearTeal),
            contractConfig.localInts,
            contractConfig.localBytesSlices,
            contractConfig.globalInts,
            contractConfig.globalBytesSlices,
            args.parse()
        );
    }


    public async createPoiContract(signedPoiTx: TxSig): Promise<ConfirmedTxInfo> {
        const decodedTx = decodeSignedTransaction(signedPoiTx.blob).txn;
        const algoAsaID = Number(argToUint64(decodedTx.appArgs[ContractService.ASA_INDEX]));

        const confirmedTx = await this.algorandService.sendSignedTx(signedPoiTx);

        const asa = await this.asaRepository.findOneOrFail({ asaID: algoAsaID });

        asa.appID = confirmedTx['application-index'];

        await this.asaRepository.save(asa);

        return confirmedTx;
    }


    public async compileEscrow(asaEntityID: number): Promise<CompileOut> {
        const asa = await this.asaRepository.findOneOrFail({ id: asaEntityID });

        const escrowTealTemplate = await this.fileReader.read(this.configService.get('CLAWBACK_ESCROW_TEAL'));

        const escrowTeal = parseTemplate(escrowTealTemplate, {
            asaID: asa.asaID,
            appID: asa.appID,
            roundNumber: await this.calculateExpireRoundNumber(asa.expireDate),
        });

        const compiledEscrow = await this.algorandService.compile(escrowTeal);

        asa.escrowContract = compiledEscrow.result;

        await this.asaRepository.save(asa);

        await this.fundEscrow(compiledEscrow.result);

        return compiledEscrow;
    }

    private async calculateExpireRoundNumber(expireTimestamp: number): Promise<number> {
        const roundTime = 4500;
        const currentRound = await this.algorandService.getCurrentRound();

        const now = (new Date()).getTime();

        assert(expireTimestamp > now, `Wrong expire date, now: ${expireTimestamp} ${now}`);
        const roundsToPass = (expireTimestamp - now) / roundTime;

        return currentRound + Math.ceil(roundsToPass);
    }

    private async fundEscrow(compiledEscrow: string): Promise<void> {
        const escrowAddress = makeLogicSig(encodeCompiledTeal(compiledEscrow)).address();

        const supplierMnemonic = await this.configService.get('SUPPLIER_MNEMONIC');

        const { addr, sk } = mnemonicToSecretKey(supplierMnemonic);

        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const fundEscrowTx = makePaymentTxnWithSuggestedParams(
            addr,
            escrowAddress,
            ESCROW_SUPPLY,
            ZERO_ADDRESS,
            EMPTY_NOTE,
            suggestedParams
        );

        const signedFundEscrowTx = signTransaction(fundEscrowTx, sk);

        await this.algorandService.sendSignedTx(signedFundEscrowTx);
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

    private async makeCallTx(asaEntityID: number, from: string, target: string, appArgs: AppArgs): Promise<Transaction> {
        const asa = await this.asaRepository.findOneOrFail({ id: asaEntityID });
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const callTx = makeApplicationNoOpTxn(from, suggestedParams, asa.appID, appArgs.parse(), [target]);

        return callTx;
    }

    public async createCallAddToWhitelistTx(asaEntityID: number, from: string, target: string): Promise<Transaction> {
        const args = new AppArgs(ContractService.SET_LEVEL, ContractService.ENABLED);
        return await this.makeCallTx(asaEntityID, from, target, args);
    }

    public async createCallRemoveFromWhitelistTx(asaEntityID: number, from: string, target: string): Promise<Transaction> {
        const args = new AppArgs(ContractService.SET_LEVEL, ContractService.DISABLED);
        return await this.makeCallTx(asaEntityID, from, target, args);
    }

    public async createCallAddUserTx(asaEntityID: number, from: string, target: string): Promise<Transaction> {
        const args = new AppArgs(ContractService.SET_LEVEL, ContractService.USER);
        return await this.makeCallTx(asaEntityID, from, target, args);
    }

    public async createCallAddSupplierTx(asaEntityID: number, from: string, target: string): Promise<Transaction> {
        const args = new AppArgs(ContractService.SET_LEVEL, ContractService.SUPPLIER);
        return await this.makeCallTx(asaEntityID, from, target, args);
    }

    public async makeCheckLevelCallTx(asaEntityID: number, from: string, target: string): Promise<Transaction> {
        const args = new AppArgs(ContractService.CHECK_LEVEL);

        return await this.makeCallTx(asaEntityID, from, target, args);
    }

    public static isSetLevelCall(arg: Uint8Array[]): boolean {
        return areArraysEqual(arg[ContractService.CALL_INDEX], AppArg(ContractService.SET_LEVEL));
    }

    public static isEnableArg(arg: Uint8Array[]): boolean {
        return areArraysEqual(arg[ContractService.LEVEL_INDEX], AppArg(ContractService.ENABLED));
    }

    public static isDisableArg(arg: Uint8Array[]): boolean {
        return areArraysEqual(arg[ContractService.LEVEL_INDEX], AppArg(ContractService.DISABLED));
    }
}