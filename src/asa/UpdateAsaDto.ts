import { Transform } from "class-transformer";
import { IsArray, IsNumber } from "class-validator";

export default class UpdateAsaDto {

    @IsNumber()
    entityAsaID: number;

    @IsArray()
    @Transform((array) => Uint8Array.from(array))
    signedTeal: Uint8Array;

}