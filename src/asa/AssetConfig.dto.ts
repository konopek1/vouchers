import { Optional } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsBoolean, IsNumber, IsString, IsUrl, Length, Max, Min } from "class-validator";

export default class AssetConfigDto {

    @IsString()
    @Length(58, 58)
    addr: string;  // the account issuing the transaction; the asset creator

    @Optional()
    @IsNumber()
    readonly fee = Math.pow(2, -55);  // the number of microAlgos per byte to pay as a transaction fee

    @IsBoolean()
    @Optional()
    readonly defaultFrozen = true;  // whether user accounts will need to be unfrozen before transacting

    @IsNumber()
    totalIssuance: number;  // total number of this asset in circulation

    @Max(19)
    @Min(0)
    readonly decimals = 0;  // hint that the units of this asset are whole-integer amounts

    @IsString()
    @Length(58, 58)
    reserve: string;     // specified address is considered the asset reserve (it has no special privileges, this is only informational)

    @IsString()
    @Length(58, 58)
    freeze: string;     // specified address can freeze or unfreeze user asset holdings

    @IsString()
    @Length(58, 58)
    clawback: string;   // specified address can revoke user asset holdings and send them to other addresses

    @IsString()
    @Length(58, 58)
    manager: string;    // specified address can change reserve, freeze, clawback, and manager

    @IsString()
    unitName: string;   // used to display asset units to user

    @IsString()
    assetName: string;  // "friendly name" of asset

    @Transform((note: string) => new Uint8Array(Buffer.from(note, "utf-8")))
    note: Uint8Array;       // arbitrary data to be stored in the transaction; here, none is stored

    @IsUrl()
    assetURL: string;   // optional string pointing to a URL relating to the asset

    @Optional()
    assetMetadataHash: string = undefined;
}