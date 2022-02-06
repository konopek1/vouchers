import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Typography,
} from '@material-ui/core';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import { generateAccount } from 'algosdk';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { securePrompt } from '../../lib/SecurePrompt';
import { AsaService, Attributes } from '../../lib/Services/AsaService';
import { OAuthService } from '../../lib/Services/OAuthService';
import { useService } from '../../lib/Services/useService';
import KeyStorage from '../../lib/Storage/KeyStorage';
import { keyStoreContext } from '../../lib/Storage/UseKeyStore';
import { useUser } from '../Auth/useUser';
import { DialogContent, DialogTitle } from './ReceiveDialog';

export interface ParticipateProps {
  asaID: number;
}

export const Participate: React.FC<ParticipateProps> = ({ asaID }) => {
  const [open, setOpen] = useState(false);
  const { user, updateUser } = useUser();

  const keyStore = useContext(keyStoreContext) as KeyStorage;

  const oauthService = useService<OAuthService>(OAuthService);
  const asaService = useService<AsaService>(AsaService);

  const [attrList, setAttrList] = useState<Attributes[]>([]);

  useEffect(() => {
    asaService.getRequiredAttributes(asaID).then(setAttrList);

    return () => {};
  }, []);

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

    const promise = asaService.optIn(asaID, addr, sk);

    alert('Now you will be redirect (it may take a while)');

    await promise;

    const { url } = await oauthService.redirect(asaID, user!.id);

    await updateUser();

    document.location.href = url;
  };

  const handleClose = () => {
    setOpen(false);
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
        fullScreen
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Attributes authorization
        </DialogTitle>
        <DialogContent>
          <Box>
            {`Now you will be redirected to CyberID, where you will you will be requested to share this attributes:`}
            <br></br>
            {attrList.map((attr) => (
              <li>{`${attr.type.name}, to fulfil your attribute ${attr.type.kind} have to ${attr.comparator}  ${attr.value}`}</li>
            ))}
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
