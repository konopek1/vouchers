import { createStore, KeysData, KeyStore } from 'key-store';
import { Wallet, WalletService } from '../Services/WalletService';

export type PublicKeyData = string;
export type PrivateKeyData = string;

export default class KeyStorage {
    private keyStore: KeyStore<PrivateKeyData, PublicKeyData>;
    private walletService: WalletService;

    public constructor(wallets: Wallet[], save: (k: KeysData<PublicKeyData>) => void, walletService: WalletService) {
        this.keyStore = this.initKeyStore(wallets, save);
        this.walletService = walletService;
    }

    private initKeyStore(wallets: Wallet[], save: (k: KeysData<PublicKeyData>) => void) {
        const keys = keysFromWallet(wallets);


        return createStore<PrivateKeyData, PublicKeyData>(save, keys);
    }

    public async store(asaID: string, publicKey: PublicKeyData, privateKey: PrivateKeyData, password: string): Promise<string> {

        await this.keyStore.saveKey(asaID, password, privateKey, publicKey);

        const keysData = await this.keyStore.getRawKeyData(asaID);

        await this.walletService.addWallet(keysData, Number(asaID));

        return asaID;
    }

    public getAccountKeys(asaID: string, password: string): [string, Uint8Array] {
        const publicKey = this.keyStore.getPublicKeyData(asaID);
        const privateKey = Uint8Array.from(Buffer.from(this.keyStore.getPrivateKeyData(asaID, password), "base64"));

        return [publicKey, privateKey];
    }

    public getPublicAddress(asaID: string): string {
        return this.keyStore.getPublicKeyData(asaID);
    }

}

export function keysFromWallet(wallets: Wallet[]): KeysData<PublicKeyData> {
    const keys = wallets.map((w: Wallet) => {
        return {
            metadata: w.metadata,
            private: w.encryptedPrivateKey,
            public: w.publicKey
        }
    });

    const indexedKeys: Record<string, any> = {};

    for (let i = 0; i < wallets.length; i++) {
        const walletIndex = wallets[i].asa.id.toString();

        indexedKeys[walletIndex] = keys[i];
    }

    return indexedKeys;
}


