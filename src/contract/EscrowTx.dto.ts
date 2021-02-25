import { IsNumber } from "class-validator";

export default class EscrowTxDto {
    @IsNumber()
    asaEntityID: number;
}