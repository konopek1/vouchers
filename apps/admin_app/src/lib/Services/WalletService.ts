import { KeysData } from "key-store";
import { PublicKeyData } from "../Storage/KeyStorage";
import { Asa } from "./AsaService";
import { User } from "./AuthService";
import { Service } from "./Service";

export class WalletService extends Service {
    protected readonly route = '/wallet';

    private readonly ADD_WALLET = `${this.route}/add-wallet`;

    async addWallet(wallets: KeysData<PublicKeyData>, asaID?: number): Promise<void> {

        if(!asaID) throw new Error("Can not create wallet asaID was not specified!");

        const newWallet = wallets[asaID.toString()];

        const requestDto: AddWalletDto = {
            asaID,
            metadata: newWallet.metadata,
            encryptedPrivateKey: newWallet.private,
            publicKey: newWallet.public
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

