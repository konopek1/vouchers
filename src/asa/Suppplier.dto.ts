import { TxSig } from "algosdk";
import { plainToClass, Transform } from "class-transformer";
import SignedTxDto from "./SignedTx.dto";

export class SupplierDto {

    @Transform(v => plainToClass(SignedTxDto, v))
    optInTxSig: SignedTxDto;

    @Transform(v => plainToClass(SignedTxDto, v))
    setLevelTxSig: SignedTxDto;
}