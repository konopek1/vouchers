import {
  Box,
  ButtonGroup,
  Divider,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { Asa } from '../../lib/Services/AsaService';
import PaymentDialog from './PaymentDialog';
import ReceiveDialog from './ReceiveDialog';

export interface AsaViewProps {
  asa: Asa;
  balance: number;
}

export const AsaView: React.FC<AsaViewProps> = ({ asa, balance }) => {
  const classes = useStyles();

  return (
    <Box>
      <Paper variant="elevation" elevation={8} className={classes.paper}>
        <Typography className={classes.space} variant="h5">
          {asa.name}
        </Typography>
        <Divider></Divider>
        <Typography className={classes.space} variant="h6">
          Balance: {balance >= 0 && balance} {asa.unitName}'s
        </Typography>
        <ButtonGroup className={classes.buttons}>
          <PaymentDialog asaID={asa.id.toString()}></PaymentDialog>
          <Box />
          <ReceiveDialog asaID={asa.id.toString()}></ReceiveDialog>
        </ButtonGroup>
      </Paper>
    </Box>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    padding: '10px',
    backgroundColor: 'rgba(159,197,255,0.15)',
  },
  space: {
    marginTop: '7px',
  },
  buttons: {
    marginTop: '12px',
  },
}));
