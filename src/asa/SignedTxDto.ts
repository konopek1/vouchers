import { IsString, Length } from "class-validator";
import { SignedTx } from "src/algorand/algosdk.types";
import { Transform } from "class-transformer";

export default class SignedTxDto implements SignedTx {
    @IsString()
    @Length(52, 52)
    txID: string;

    @Transform(jsonEncodedUint8ArrayToUint8Array)
    blob: Uint8Array;
}

function jsonEncodedUint8ArrayToUint8Array(jsonUint8Array: Object) {
    const arr = new Uint8Array(Object.keys(jsonUint8Array).length);

    Object.entries(jsonUint8Array).map(([key, value]) => {
        arr[Number(key)] = value;
    });

    return arr;
}