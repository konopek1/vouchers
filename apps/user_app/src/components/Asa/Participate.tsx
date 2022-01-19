import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Typography,
} from '@material-ui/core';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import { generateAccount } from 'algosdk';
import React, { Fragment, useContext, useState } from 'react';
import { securePrompt } from '../../lib/SecurePrompt';
import { AsaService } from '../../lib/Services/AsaService';
import { OAuthService } from '../../lib/Services/OAuthService';
import { useService } from '../../lib/Services/useService';
import KeyStorage from '../../lib/Storage/KeyStorage';
import { keyStoreContext } from '../../lib/Storage/UseKeyStore';
import { userContext, UserContext, useUser } from '../Auth/useUser';
import { toastContext } from '../Main/Toast';
import { DialogContent, DialogTitle } from './ReceiveDialog';

export interface ParticipateProps {
  asaID: number;
}

export const Participate: React.FC<ParticipateProps> = ({ asaID }) => {
  const [open, setOpen] = useState(false);
  const { updateUser } = useContext(userContext) as UserContext;
  const { error } = useContext(toastContext);
  const { user } = useUser();

  const keyStore = useContext(keyStoreContext) as KeyStorage;

  const oauthService = useService<OAuthService>(OAuthService);
  const asaService = useService<AsaService>(AsaService);

  const onOptIn = async () => {
    setOpen(true);
  };

  const onConfirm = async () => {
    const { addr, sk } = generateAccount();
    const encodedSk = Buffer.from(sk).toString('base64');

    await keyStore.store(
      asaID.toString(),
      addr,
      encodedSk,
      securePrompt('Password for private key:'),
    );

    await asaService.optIn(asaID, addr, sk);

    const { url } = await oauthService.redirect(asaID, user!.id);

    document.location.href = url;
  };

  const handleClose = () => {
    setOpen(false);
    updateUser();
  };

  return (
    <div>
      <Button
        startIcon={<LibraryAddIcon />}
        color="secondary"
        variant="outlined"
        onClick={onOptIn}
      >
        Participate
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Attributes authorization
        </DialogTitle>
        <DialogContent>
          <Box>
            {`Now you will be redirected to CyberID, where you will authorize your attributes:`}
            <br></br>
            {'- age > 18'}
            <br></br>
            <Button onClick={onConfirm} color="primary">
              Ok
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};
