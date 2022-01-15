import { INestApplication } from "@nestjs/common";
import { decodeUnsignedTransaction, signTransaction } from "algosdk";
import { PaymentService } from "../src/payment/payment.service";

const decode = (arr: number[]) => decodeUnsignedTransaction(Uint8Array.from(arr));

export async function transfer(app: INestApplication, asaEntityID: number, from: string, to: string, sk: Uint8Array, amount: number) {

    const paymentService = app.get(PaymentService);

    const txs = await paymentService.makeAssetTransferTx({ amount, asaEntityID, from, to });

    const SCheckLevel = signTransaction(decode(txs.checkLevelTx), sk);
    const SPaymentSigTx = signTransaction(decode(txs.paymentTx), sk);

    await paymentService.sendAsaTransfer({
        asaTransferTx: decodeUnsignedTransaction(Uint8Array.from(txs.asaTransferTx)),
        checkLevelSigTx: SCheckLevel,
        paymentSigTx: SPaymentSigTx
    })

}