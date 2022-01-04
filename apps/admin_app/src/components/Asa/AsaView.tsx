import { Accordion, AccordionDetails, AccordionSummary, Box, Button, makeStyles, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { useState } from 'react';
import { Asa } from '../../lib/Services/AsaService';
import { Whitelist } from './Whitelist';

export interface AsaViewProps {
  asa: Asa;
}

export type AsaViewChild = React.ReactElement<{ asa: Asa }>

export const AsaView: React.FC<AsaViewProps> = ({ asa }) => {
  const classes = useStyles();
  const [whitelistVisible, showWhitelist] = useState<boolean>(false);

  return (
    <Box>
      <Accordion className={classes.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{asa.name}</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <Box textAlign="left" mb={2}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => showWhitelist(!whitelistVisible)}
            >whitelist
            </Button>
          </Box>
          {whitelistVisible && <Whitelist asaID={asa.id} />}

        </AccordionDetails>
      </Accordion>
    </Box>

  );
}


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  accordion: {
    minWidth: '80%',
    flex: "column",
  },
  details: {
    display: 'flex',
    flexDirection: 'column'
  },
  unitName: {
    fontSize: theme.typography.pxToRem(12),
  }
}));