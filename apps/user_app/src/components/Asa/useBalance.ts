import { useCallback, useEffect, useState } from "react";
import { UserService } from "../../lib/Services/UserService";
import { useService } from "../../lib/Services/useService";

export const useBalance = (): WalletBalance => {

    const service = useService<UserService>(UserService);
    
    const [balance, setBalance]  = useState<WalletBalance>(new Proxy({}, {
        get(target, name) {
            return -1;
        }
    }));

    const fetch = async () => setBalance(await service.balance());
    
    const stableFetch = useCallback(fetch, [service]);

    useEffect(() => {
        stableFetch();

        const interval = setInterval(stableFetch, 5_000);

        return () => clearInterval(interval);
    }, [stableFetch]);

    return balance;
}

export type WalletBalance = {
    [asaID: number]: number
}