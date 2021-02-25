import { decodeUnsignedTransaction, Transaction, TxSig } from "algosdk";
import { plainToClass, Transform } from "class-transformer";
import SignedTxDto from "src/asa/SignedTx.dto";
import { jsonEncodedUint8ArrayToUint8Array } from "src/lib/Helpers";

export default class SendAsaDto {
    @Transform(txSig => plainToClass(SignedTxDto, txSig))
    checkLevelSigTx: TxSig;

    @Transform(txSig => plainToClass(SignedTxDto, txSig))
    paymentSigTx: TxSig;
    
    @Transform(blob => decodeUnsignedTransaction(jsonEncodedUint8ArrayToUint8Array(blob)))
    asaTransferTx: Transaction;
}