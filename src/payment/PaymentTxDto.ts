import { IsNumber, IsString } from "class-validator";

export default class PaymentTxDto {

    @IsString()
    from: string;

    @IsString()
    to: string;

    @IsNumber()
    amount: number;
}
