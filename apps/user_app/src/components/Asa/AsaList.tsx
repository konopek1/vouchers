import { Box, CircularProgress, Divider, Typography } from "@material-ui/core";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Asa, AsaService } from "../../lib/Services/AsaService";
import { useService } from "../../lib/Services/useService";
import { userContext } from "../Auth/useUser";
import { AsaView } from "./AsaView";
import { AsaViewNotOwned } from "./AsaViewNotOwned";
import { useBalance } from "./useBalance";

export interface AsaListProps {
    Component?: React.FC<{ asa: Asa }>
}

export const AsaList: React.FC<AsaListProps> = () => {

    const [isLoading, asaList, ownedByUserAsa] = useAssets();
    const balances = useBalance();

    return (
        <Box textAlign="center">
            {isLoading && <CircularProgress color="secondary" />}

            {!isLoading && <Box textAlign="left" mb={3}><Typography variant="h5">Yours vouchers</Typography></Box>}

            {!isLoading && ownedByUserAsa.map((asa) => (
                <Box mb={3} key={asa.id}>
                    <AsaView asa={asa} balance={balances[asa.id]} />
                </Box>))}
            <Divider></Divider>
            {!isLoading && (
                <Box textAlign="left" mt={4} mb={3}>
                    <Typography variant="h5">Vouchers you can participate in</Typography>
                </Box>)}

            {!isLoading && asaList.map((asa) => (
                <Box key={asa.id} mb={3}>
                    <AsaViewNotOwned asa={asa} />
                </Box>))}
        </Box>
    );
}


const useAssets = (): [boolean, Asa[], Asa[]] => {

    const [isLoading, setLoaded] = useState(true);
    const [asaList, setAsaList] = useState<Asa[]>([]);
    const [ownedByUserAsa, setOwnedByUserAsa] = useState<Asa[]>([]);
    const { user } = useContext(userContext)!;

    const asaService = useService<AsaService>(AsaService);

    const fetch = async () => {
        const fetchedAsaList = (await asaService.getOwnedByUser()) || [];

        //TODO remove after adding admin users
        fetchedAsaList.ownedByUser.filter(a => a.id !== 1);
        fetchedAsaList.rest.filter(a => a.id !== 1);

        setAsaList(fetchedAsaList.rest);
        setOwnedByUserAsa(fetchedAsaList.ownedByUser);
        setLoaded(false);
    }

    const stableFetch = useCallback(fetch, [asaService]);

    useEffect(() => {
        stableFetch();
    }, [stableFetch, user]);

    return [isLoading, asaList, ownedByUserAsa];
}