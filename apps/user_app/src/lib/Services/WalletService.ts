import { RawKeyData } from "key-store";
import { PublicKeyData } from "../Storage/KeyStorage";
import { Asa } from "./AsaService";
import { User } from "./AuthService";
import { Service } from "./Service";

export class WalletService extends Service {
    protected readonly route = '/wallet';

    private readonly ADD_WALLET = `${this.route}/add-wallet`;

    async addWallet(wallet: RawKeyData<PublicKeyData>, asaID?: number): Promise<void> {

        if(!asaID) throw new Error("Can not create wallet asaID was not specified!");

        const requestDto: AddWalletDto = {
            asaID,
            metadata: wallet.metadata,
            encryptedPrivateKey: wallet.private,
            publicKey: wallet.public
        }

        return (await this.client.post(this.ADD_WALLET, requestDto));
    }
}

export interface Wallet {
    id: number;
    publicKey: string;
    encryptedPrivateKey: string;
    asa: Asa;
    owner: User;
    metadata: Metadata;
}

export interface Metadata {
    iterations: number;
    nonce: string;
}

export interface AddWalletDto {
    asaID: number;

    metadata: Metadata;

    encryptedPrivateKey: string;

    publicKey: string;
}

