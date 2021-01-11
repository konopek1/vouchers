
export class AppArgs {

    public args: string[];

    constructor(...args: string[]) {
        this.args = args;
    }

    public parse() {
        return this.args.map(AppArg)
    }
}

export function AppArg(value: string) {
    return new Uint8Array(Buffer.from(value));
}