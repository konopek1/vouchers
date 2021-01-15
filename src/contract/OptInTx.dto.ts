import { IsNumber, IsString } from "class-validator";

export default class OptInTxDto {
    @IsString()
    address: string;

    @IsNumber()
    entityAsaID: number;
    
}