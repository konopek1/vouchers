import { Box } from '@material-ui/core';
import React from 'react';
import { AsaList } from '../Asa/AsaList';

export const BalanceView: React.FC = () => {

    return (
        <Box width="100%">
            <AsaList></AsaList>
        </Box>
    );
}
