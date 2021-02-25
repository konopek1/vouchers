import { assignGroupID, Transaction, TxSig } from "algosdk";
import { encodeTx } from "src/lib/TransactionSerializerInterceptor";

export default class AtomicAsaTx {
    private static readonly CHECK_LEVEL_TX_INDEX = 0;

    private static readonly ASA_TRANSFER_TX_INDEX = 1;

    private static readonly PAYMENT_TX_INDEX = 2;

    private txs: Transaction[] = [];

    static groupSignedTxs(checkLevelTx: TxSig, asaTransferTx: TxSig, paymentTx: TxSig): TxSig[] {
        const groupedTxs = [];
        groupedTxs[AtomicAsaTx.CHECK_LEVEL_TX_INDEX] = checkLevelTx;
        groupedTxs[AtomicAsaTx.ASA_TRANSFER_TX_INDEX] = asaTransferTx;
        groupedTxs[AtomicAsaTx.PAYMENT_TX_INDEX] = paymentTx;

        return groupedTxs;
    }

    setCheckLevelTx(tx: Transaction): AtomicAsaTx {
        this.txs[AtomicAsaTx.CHECK_LEVEL_TX_INDEX] = tx;

        return this;
    }

    getCheckLevelTx(): Transaction {
        return this.txs[AtomicAsaTx.CHECK_LEVEL_TX_INDEX];
    }

    setAsaTransferTx(tx: Transaction): AtomicAsaTx {
        this.txs[AtomicAsaTx.ASA_TRANSFER_TX_INDEX] = tx;

        return this;
    }

    getAsaTransferTx(): Transaction {
        return this.txs[AtomicAsaTx.ASA_TRANSFER_TX_INDEX];
    }

    setPaymentTx(tx: Transaction): AtomicAsaTx {
        this.txs[AtomicAsaTx.PAYMENT_TX_INDEX] = tx;

        return this;
    }

    getPaymentTx(): Transaction {
        return this.txs[AtomicAsaTx.PAYMENT_TX_INDEX];
    }


    resolve(): SerializedAtomicAsaTx {
        if (this.txs.length === 3) {

            assignGroupID(this.txs);

            return {
                checkLevelTx: encodeTx(this.getCheckLevelTx()),
                asaTransferTx: encodeTx(this.getAsaTransferTx()),
                paymentTx: encodeTx(this.getPaymentTx())
            };
        } else {
            throw Error(`Transaction group should equal 3 nut equals ${this.txs.length}`)
        }
    }
}

export interface SerializedAtomicAsaTx {
    checkLevelTx: Array<number>;
    asaTransferTx: Array<number>;
    paymentTx: Array<number>;
}
