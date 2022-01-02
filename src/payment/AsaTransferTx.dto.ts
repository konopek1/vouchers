import { IsString, IsNumber } from "class-validator";

export default class AsaTransferTxDto {
    @IsString()
    from: string;

    @IsString()
    to: string;

    @IsNumber()
    asaEntityID: number;

    @IsNumber()
    amount: number;

}