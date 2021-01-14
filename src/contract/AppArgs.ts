import { HttpException, HttpStatus } from "@nestjs/common";
import { type } from "os";

type ArgValue = number | string;


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
    } else if (typeof value === "number") {
        return new Uint8Array([value]);
    } else {
        throw new HttpException("App arg have to be string|number", HttpStatus.BAD_REQUEST);
    }
}