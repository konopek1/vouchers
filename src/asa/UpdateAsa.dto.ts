import { IsNumber, IsString } from "class-validator";

export default class UpdateAsaDto {

    @IsNumber()
    entityAsaID: number;

    @IsString()
    clawbackAddress: string;
}