import { HttpException, HttpStatus } from "@nestjs/common";
 
 
type ArgValue = number | string | bigint;


export class AppArgs {

    public args: ArgValue[];

    constructor(...args: ArgValue[]) {
        this.args = args;
    }

    public parse() {
        return this.args.map(AppArg)
    }
}

export function AppArg(value: ArgValue) {
    if(typeof value === "string") {
        return new Uint8Array(Buffer.from(value));
    } else if (typeof value === "number" || typeof value === "bigint") {
        const buffer = Buffer.alloc(8);
        const bigIntValue = BigInt(value);
        buffer.writeBigUInt64BE(bigIntValue)

        return Uint8Array.from(buffer);
    } else {
        throw new HttpException("App arg have to be string|number|bigint", HttpStatus.BAD_REQUEST);
    }
}

export function argToString(arg: Uint8Array): string {
    return Buffer.from(arg).toString();
}

export function argToUint64(arg: Uint8Array): BigInt {
    const buffer = Buffer.from(arg);

    return buffer.readBigUInt64BE();
}