import { IsNumber, IsString } from "class-validator";
import { Metadata } from "./wallet.entity";

export default class AddWalletDto {

    @IsNumber()
    public asaID: number;

    @IsNumber()
    public userID: number;

    public metadata: Metadata;

    @IsString()
    public encryptedPrivateKey: string;

    @IsString()
    public publicKey: string;
    
}