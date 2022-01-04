import { useContext } from "react";
import { UserContext, userContext } from "../../components/Auth/useUser";
import { keyStoreContext, useKeyStore } from "./UseKeyStore"

export const KeyStorageProvider: React.FC = ({children}) => {
    const { user } = useContext(userContext) as UserContext;
    const keyStorage = useKeyStore(user);

    return (
    <keyStoreContext.Provider value={keyStorage}>
        {children}
    </keyStoreContext.Provider>
    );
}