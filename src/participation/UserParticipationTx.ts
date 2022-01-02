import { SerializedAtomicAsaTx } from "src/payment/AtomicAsaTx";

export class UserParticipationTx implements SerializedAtomicAsaTx {
    checkLevelTx: number[];
    asaTransferTx: number[];
    paymentTx: number[];
    userSetLevelTx: number[]
}