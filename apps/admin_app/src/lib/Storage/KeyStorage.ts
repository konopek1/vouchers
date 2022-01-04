import { createStore, KeysData, KeyStore } from 'key-store';
import { Wallet } from '../Services/WalletService';

export type PublicKeyData = string;
export type PrivateKeyData = string;


// TODO if using cordova migrate to CordovaSecureStoragePlugin
export default class KeyStorage {
    private keyStore: KeyStore<PrivateKeyData, PublicKeyData>;

    public constructor(wallets: Wallet[], save: (k: KeysData<PublicKeyData>) => void) {
        this.keyStore = this.initKeyStore(wallets, save);
    }

    private initKeyStore(wallets: Wallet[], save: (k: KeysData<PublicKeyData>) => void) {
        const keys = keysFromWallet(wallets);        

        return createStore<PrivateKeyData, PublicKeyData>(save, keys);
    }

    public async store(walletID: string, publicKey: PublicKeyData, privateKey: PrivateKeyData, password: string): Promise<string> {
        await this.keyStore.saveKey(walletID, password, privateKey, publicKey);

        return walletID;
    }

    public getAccountKeys(walletID: string, password: string): [string, Uint8Array] {
        const publicKey = this.keyStore.getPublicKeyData(walletID);
        const privateKey = Uint8Array.from(Buffer.from(this.keyStore.getPrivateKeyData(walletID, password),"base64"));

        return [publicKey, privateKey];
    }

    public getPublicAddress(walletID: string): string {
        return this.keyStore.getPublicKeyData(walletID);
    }
    
}

export function keysFromWallet(wallets: Wallet[]): KeysData<PublicKeyData> {
    const keys = wallets.map((w: Wallet) => {
        return {
            metadata: w.metadata,
            private:  w.encryptedPrivateKey,
            public: w.publicKey
        }
    });
    const indexedKeys: Record<string, any> = {};

    let genWalletCount = 0;
    for (let i = 0; i < wallets.length; i++) {
        const asa = wallets[i].asa;
        const walletIndex = asa ? asa.id.toString() :  `${GEN_WALLET_PREFIX}${(genWalletCount++).toString()}`;
        console.log(walletIndex)
        indexedKeys[walletIndex] = keys[i];
    }

    return indexedKeys;
}

export const GEN_WALLET_PREFIX = 'GEN_WALLET_';
export const DEFAULT_WALLET = GEN_WALLET_PREFIX + '0';

