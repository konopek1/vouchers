import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfirmedTxInfo, makeAssetTransferTxnWithSuggestedParams, makeLogicSig, makePaymentTxnWithSuggestedParams, signLogicSigTransaction, Transaction } from "algosdk";
import AlgorandService from "src/algorand/algorand.service";
import { Asa } from "src/asa/asa.entity";
import SignedTxDto from "src/asa/SignedTx.dto";
import { ContractService } from "src/contract/contract.service";
import { encodeCompiledTeal } from "src/lib/Helpers";
import { Repository } from "typeorm";
import AsaTransferTxDto from "./AsaTransferTx.dto";
import AtomicAsaTx, { SerializedAtomicAsaTx } from "./AtomicAsaTx";
import SendAsaDto from "./SendAsa.dto";
import { EMPTY_NOTE } from "src/lib/Constants";

//TODO consider renaming all create*Tx to make*Tx 
@Injectable()
export class PaymentService {

    constructor(
        private readonly algorandService: AlgorandService,
        private readonly contractService: ContractService,
        @InjectRepository(Asa)
        private readonly asaRepository: Repository<Asa>
    ) { }



    async makeTransferTx(from: string, to: string, amount: number): Promise<Transaction> {
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const paymentTx = makePaymentTxnWithSuggestedParams(
            from,
            to,
            amount,
            to,
            EMPTY_NOTE,
            suggestedParams
        );

        return paymentTx;
    }

    async sendTransfer(signedTx: SignedTxDto): Promise<ConfirmedTxInfo> {
        return await this.algorandService.sendSignedTx(signedTx);
    }

    // 1 - check-level tx signed by user
    // 2 - asset transfer tx
    // 3 - payment for escrow address because of fees - to be deleted, but first contract have to be redesigned 
    async makeAssetTransferTx(asaTransferDto: AsaTransferTxDto): Promise<SerializedAtomicAsaTx> {
        const asa = await this.asaRepository.findOneOrFail({ id: asaTransferDto.asaEntityID });
        const suggestedParams = await this.algorandService.getTransactionDefaultParameters();

        const checkLevelCallTx = await this.contractService.makeCheckLevelCallTx(asa.id, asaTransferDto.from, asaTransferDto.to);

        const paymentTx = await this.makeTransferTx(asaTransferDto.from, asa.clawback, asaTransferDto.amount);

        const assetTransferCallTx = makeAssetTransferTxnWithSuggestedParams(
            asaTransferDto.from,
            asaTransferDto.from,
            asaTransferDto.to,
            asa.clawback,
            asaTransferDto.amount,
            EMPTY_NOTE,
            asa.asaID,
            suggestedParams
        );

        const groupedTxs = new AtomicAsaTx()
            .setCheckLevelTx(checkLevelCallTx)
            .setAsaTransferTx(assetTransferCallTx)
            .setPaymentTx(paymentTx)
            .resolve();

        return groupedTxs;
    }


    async sendAsaTransfer(txs: SendAsaDto) {
        const signedCheckLevelTx = txs.checkLevelSigTx;
        const signedPaymentTx = txs.paymentSigTx;
        const unSignedTransferAsaTx = txs.asaTransferSigTx;

        const asaEntityID = unSignedTransferAsaTx.assetIndex;
        const asa = await this.asaRepository.findOneOrFail({ id: asaEntityID });

        const escrow = (await this.contractService.compileEscrow(asa.id)).result;
        const logicSigEscrow = makeLogicSig(encodeCompiledTeal(escrow));
        const signedTransferTx = signLogicSigTransaction(unSignedTransferAsaTx, logicSigEscrow);

        const signedGroupedTxs = AtomicAsaTx.groupSignedTxs(signedCheckLevelTx, signedTransferTx, signedPaymentTx);

        return await this.algorandService.sendSignedTxs(signedGroupedTxs);
    }



}

