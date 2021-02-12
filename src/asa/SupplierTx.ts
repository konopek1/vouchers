import { IsNumber, IsString } from "class-validator";

export class SupplierTx {

    @IsNumber()
    asaID: number;

    @IsString()
    supplierAddress: string;
}