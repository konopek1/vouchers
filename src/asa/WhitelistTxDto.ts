import { IsEmail, IsNumber, IsString } from "class-validator";

export default class WhiteListTxDto {
    
    @IsEmail(undefined, { each: true })
    emails: string[];

    @IsNumber()
    asaEntityID: number;

    @IsString()
    from: string;
}