import { decodeUnsignedTransaction, signTransaction, Transaction, TxSig } from "algosdk";
import { Service } from "./Service";

export class PaymentService extends Service {
    protected readonly route = '/payment';

    private readonly MAKE_ASA_TRANSFER_TX = `${this.route}/makeAsaTransferTX`;

    private readonly SEND_ASA_TRANSFER_TX = `${this.route}/sendAsaTransfer`;

    private readonly MAKE_TRANSFER_TX = `${this.route}/makeTransferTx`;

    private readonly SEND_TRANSFER_TX = `${this.route}/sendTransfer`;

    private readonly CHECK_BALANCE = (address: string) => `${this.route}/balance/${address}`;

    private async makeAsaTransferTx(asaTransferTxDto: AsaTransferTxDto): Promise<SerializedAtomicAsaTx> {
        return (await this.client.post(this.MAKE_ASA_TRANSFER_TX, asaTransferTxDto)).data;
    }

    private async sendAsaTransferTx(sendAsaDto: SendAsaDto): Promise<unknown> {
        return (await this.client.post(this.SEND_ASA_TRANSFER_TX, sendAsaDto)).data;
    }

    async makeTransferTx(paymentTxDto: PaymentTxDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_TRANSFER_TX, paymentTxDto)).data;
    }

    async sendTransferTx(signedTx: TxSig): Promise<unknown> {
        return (await this.client.post(this.SEND_TRANSFER_TX, signedTx)).data;
    }

    async checkBalance(address: string, asaID: number): Promise<number> {
        return (await this.client.get(this.CHECK_BALANCE(address))).data[asaID];
    }


    public async sendAsa(from: string, to: string, asaID: number, amount: number, sk: Uint8Array): Promise<void> {
        const decode = (arr: number[]) => decodeUnsignedTransaction(Uint8Array.from(arr));

        const sendAsaAtomicTx = await this.makeAsaTransferTx({
            asaEntityID: asaID,
            amount,
            from,
            to
        });

        const checkLevelSigTx = signTransaction(decode(sendAsaAtomicTx.checkLevelTx), sk);
        const paymentSigTx = signTransaction(decode(sendAsaAtomicTx.paymentTx), sk);

        await this.sendAsaTransferTx({
            asaTransferTx: sendAsaAtomicTx.asaTransferTx,
            checkLevelSigTx,
            paymentSigTx
        });
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

    asaTransferTx: Array<number>;
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
