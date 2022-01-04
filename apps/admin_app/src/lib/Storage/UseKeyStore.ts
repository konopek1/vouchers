import { KeysData } from "key-store";
import { createContext } from "react";
import { useUser } from "../../components/Auth/useUser";
import AuthService, { User } from "../Services/AuthService";
import { useService } from "../Services/useService";
import { WalletService } from "../Services/WalletService";
import KeyStorage, { PublicKeyData } from "./KeyStorage";

export function useKeyStore(user: User, asaID?: number): KeyStorage {

    const walletService = useService<WalletService>(WalletService);
    
    const authService = useService<AuthService>(AuthService);
    
    const { setUser } = useUser();

    const save = async (keysData: KeysData<PublicKeyData>) => { 
        await walletService.addWallet(keysData, asaID);      
        const user = await authService.currentUser();

        setUser(user);
    };

    const keyStore = new KeyStorage(user.wallets, save);

    return keyStore;
}   

export const keyStoreContext = createContext<KeyStorage|null>(null);
