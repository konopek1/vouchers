import { IsArray, IsString, Length } from "class-validator";
import { SignedTx } from "src/algorand/algosdk.types";
import { Transform } from "class-transformer";

export default class SignedTxDto implements SignedTx {
    @IsString()
    @Length(52,52)
    txID: string;
    
    @IsArray()
    @Transform((array) => Uint8Array.from(array))
    blob: Uint8Array;
}