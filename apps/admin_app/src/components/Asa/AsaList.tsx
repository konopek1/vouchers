import { Box, CircularProgress, makeStyles, Typography } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from 'react';
import { Asa, AsaService } from "../../lib/Services/AsaService";
import { useService } from "../../lib/Services/useService";
import { AsaView } from "./AsaView";

export interface AsaListProps {
}

export const AsaList: React.FC<AsaListProps> = () => {

    const [isLoading, asaList] = useAssets();
    const classes = useStyles();

    return (
        <Box textAlign="center">
            {isLoading && <CircularProgress color="secondary" />}

            {!isLoading && <Box mb={3}><Typography variant="h5">Managed vouchers:</Typography></Box>}
            {!isLoading && asaList.map((asa) => (
                <Box className={classes.asa} key={asa.id}>
                    <AsaView asa={asa}></AsaView>
                </Box>
            ))}
        </Box>
    );
}

const useStyles = makeStyles({
    asa: {
        marginTop: '5px'
    }
});


const useAssets = (): [boolean, Asa[]] => {

    const [isLoading, setLoaded] = useState(true);
    const [asaList, setAsaList] = useState<Asa[]>([]);
    const asaService = useService<AsaService>(AsaService);

    const fetch = async () => {
        const fetchedAsaList = (await asaService.getManaged()) || [];
        setAsaList(fetchedAsaList);
        setLoaded(false);
    }

    const stableFetch = useCallback(fetch, [asaService]);

    useEffect(() => {
        stableFetch();
    }, [stableFetch]);

    return [isLoading, asaList];
}