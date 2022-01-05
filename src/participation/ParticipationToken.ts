import { fromBase64, toBase64 } from "../lib/Helpers";

export class ParticipationToken {
    constructor(
        private readonly userID: number,
        private readonly asaID: string
    ) { }

    private static readonly SPLIT_SIGN = '#';

    static fromEncoded(encodedToken: string): ParticipationToken {
        const decodedToken = fromBase64(encodedToken);

        const [userID, asaID] = decodedToken.split(ParticipationToken.SPLIT_SIGN);

        return new ParticipationToken(Number(userID), asaID);
    }

    encode(): string {
        const token = `${this.userID}#${this.asaID}`
        return toBase64(token.toString());
    }

    getUserID(): number {
        return Number(this.userID);
    }

    getAsaID(): number {
        return Number(this.asaID);
    }

}