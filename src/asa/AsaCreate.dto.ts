import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsString, IsNotEmpty, IsEnum, IsIn } from "class-validator";
import { AttributeKind, Comparator, ValueType } from "../attribute/attribute.entity";
import SignedTxDto from "./SignedTx.dto";

export class AttributeDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsEnum(AttributeKind)
    kind: AttributeKind;

    @IsIn(["<", ">", "="])
    operator: Comparator;

    @IsString()
    @IsNotEmpty()
    value: string;

    @IsIn(["string", "number"])
    valueType: ValueType;
}

export class AsaCreateDto {

    @ValidateNested()
    @Type(() => SignedTxDto)
    txSig: SignedTxDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeDto)
    attributes: AttributeDto[];
}


