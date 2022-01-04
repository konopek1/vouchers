import { signTransaction } from "algosdk";
import { useCallback, useContext, useEffect, useState } from "react";
import { securePrompt } from "../../lib/SecurePrompt";
import { AsaService } from "../../lib/Services/AsaService";
import { User } from "../../lib/Services/AuthService";
import { useService } from "../../lib/Services/useService";
import KeyStorage, { DEFAULT_WALLET } from "../../lib/Storage/KeyStorage";
import { keyStoreContext } from "../../lib/Storage/UseKeyStore";
import { toastContext } from "../Main/Toast";

export const useWhitelist = (asaID: number) => {

    const [isLoading, setLoading] = useState(true);
    const [whitelist, setWhitelist] = useState<User[]>([]);
    const asaService = useService<AsaService>(AsaService);
    const keyStore = useContext(keyStoreContext) as KeyStorage;
    const { info, error, success } = useContext(toastContext);

    const fetch = async () => {
        setLoading(true);
        const fetchedWhitelist = (await asaService.getWhitelist(asaID)) || [];

        setWhitelist(fetchedWhitelist);
        setLoading(false);
    }

    const addToWhitelist = async (email: string) => {
        let secretKey;

        try {
           secretKey = keyStore.getAccountKeys(DEFAULT_WALLET, securePrompt("Tell my your secret:"))[1];
        } catch (e) { error('Wrong secret!'); return; };

        try {

            const managedAssets = await asaService.getManaged();
            const asa = managedAssets.find((a) => asaID === a.id);
            const addToWhitelistTxs = await asaService.makeAddToWhiteListTxs({
                asaEntityID: asaID,
                emails: [email],
                from: asa!.manager
            });

            info("Adding to whitelist!");

            const signedTx = signTransaction(addToWhitelistTxs[0], secretKey);
            await asaService.updateWhiteList(signedTx);

            success(`Whitelist updated!`);
        } catch (e) {
            error(`Couldn't add ${email} to whitelist`);
            return;
        }

        fetch();
    }

    const stableFetch = useCallback(fetch, [asaService, asaID]);

    useEffect(() => {
        stableFetch();
    }, [stableFetch]);
    return { isLoading, whitelist, addToWhitelist };

}
