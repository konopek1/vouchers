export default class AppArgs {
    
    public args: string[];

    constructor(...args: string[]) {
        this.args = args;
     }

    public parse() {
        return this.args.map((arg: string) => new Uint8Array(Buffer.from(arg)))
    }
}