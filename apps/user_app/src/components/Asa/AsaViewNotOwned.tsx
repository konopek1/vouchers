import { Box, makeStyles, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { Asa } from '../../lib/Services/AsaService';
import { TokenDialog } from './TokenDialog';

export interface AsaViewProps {
  asa: Asa;
}


export const AsaViewNotOwned: React.FC<AsaViewProps> = ({ asa}) => {
  const classes = useStyles();

  return (
    <Box>
      <Paper variant="elevation" elevation={8} className={classes.paper}>
        <Typography className={classes.space} variant="h5">{asa.name}</Typography>
        <Box className={classes.space}><TokenDialog asaID={asa.id}></TokenDialog></Box>
      </Paper>
    </Box>

  );
}


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    padding: '10px',
    backgroundColor: 'rgba(224,224,224,0.5)'
  },
  space: {
    marginTop: '7px'
  },
  buttons: {
    marginTop: '12px'
  }
}));