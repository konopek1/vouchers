import { IsNumber, IsString } from "class-validator";

export default class ParticipateTxDto {

    @IsString()
    encodedToken: string;

    @IsString()
    from: string;

    @IsNumber()
    amount: number;
}