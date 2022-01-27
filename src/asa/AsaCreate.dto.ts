import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsNotEmpty, IsInt, IsString, IsDateString } from "class-validator";
import SignedTxDto from "./SignedTx.dto";

export class AttributeDto {
    @IsInt()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    value: string;

    @IsString()
    @IsNotEmpty()
    comparator: string;
}

export class AsaCreateDto {

    @ValidateNested()
    @Type(() => SignedTxDto)
    txSig: SignedTxDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeDto)
    attributes: AttributeDto[];

    @IsString()
    expireDate: string;
}


