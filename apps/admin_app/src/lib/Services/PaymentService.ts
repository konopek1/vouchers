import { Transaction, TxSig } from "algosdk";
import { Service } from "./Service";

export class PaymentService extends Service {
    protected readonly route = '/payment';

    public readonly MAKE_ASA_TRANSFER_TX = `${this.route}/makeAsaTransferTX`;

    public readonly SEND_ASA_TRANSFER_TX = `${this.route}/sendAsaTransfer`;

    public readonly MAKE_TRANSFER_TX = `${this.route}/makeTransferTx`;

    public readonly SEND_TRANSFER_TX = `${this.route}/sendTransfer`;

    async makeAsaTransferTx(asaTransferTxDto: AsaTransferTxDto): Promise<SerializedAtomicAsaTx> {
        return (await this.client.post(this.MAKE_ASA_TRANSFER_TX, asaTransferTxDto)).data;
    }

    async sendAsaTransferTx(sendAsaDto: SendAsaDto): Promise<unknown> {
        return (await this.client.post(this.SEND_ASA_TRANSFER_TX, sendAsaDto)).data;
    }

    async makeTransferTx(paymentTxDto: PaymentTxDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_TRANSFER_TX, paymentTxDto)).data;
    }

    async sendTransferTx(signedTx: TxSig): Promise<unknown> {
        return (await this.client.post(this.SEND_TRANSFER_TX, signedTx)).data;
    }
}

export interface AsaTransferTxDto {
    from: string;
    to: string;
    asaEntityID: number;
    amount: number;
}

export interface SendAsaDto {
    checkLevelSigTx: TxSig;

    paymentSigTx: TxSig;

    asaTransferTx: Transaction;
}

export interface PaymentTxDto {
    from: string;
    to: string;
    amount: number;
}

export interface SerializedAtomicAsaTx {
    checkLevelTx: Array<number>;
    asaTransferTx: Array<number>;
    paymentTx: Array<number>;
}
