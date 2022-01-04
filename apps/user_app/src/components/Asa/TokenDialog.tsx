import { Box, Button, CircularProgress, Dialog, Typography } from '@material-ui/core';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import { generateAccount } from 'algosdk';
import React, { Fragment, useContext, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { securePrompt } from '../../lib/SecurePrompt';
import { AsaService } from '../../lib/Services/AsaService';
import { ParticipationService } from '../../lib/Services/ParticipationService';
import { useService } from '../../lib/Services/useService';
import KeyStorage from '../../lib/Storage/KeyStorage';
import { keyStoreContext } from '../../lib/Storage/UseKeyStore';
import { userContext, UserContext } from '../Auth/useUser';
import { toastContext } from '../Main/Toast';
import { DialogContent, DialogTitle } from './ReceiveDialog';

export interface TokenDialogProps {
    asaID: number;
}

export const TokenDialog: React.FC<TokenDialogProps> = ({ asaID }) => {
    const [open, setOpen] = useState(false);
    const { updateUser } = useContext(userContext) as UserContext;
    const [token, setToken] = useState<string>('');
    const { error } = useContext(toastContext);

    const keyStore = useContext(keyStoreContext) as KeyStorage;

    const asaService = useService<AsaService>(AsaService);
    const participationService = useService<ParticipationService>(ParticipationService);

    const onOptIn = async () => {
        setOpen(true);

        const { addr, sk } = generateAccount();
        const encodedSk = Buffer.from(sk).toString('base64');

        await keyStore.store(
            asaID.toString(),
            addr,
            encodedSk,
            securePrompt("Password for private key:"));

        try {
            await asaService.optIn(asaID, addr, sk);
            const token = await participationService.generateToken(asaID);
            setToken(token);
        } catch (e) { setOpen(false); error("Couldn't opt in voucher."); return; }

    };

    const handleClose = () => { setOpen(false); updateUser(); }

    return (
        <div>
            <Button startIcon={<LibraryAddIcon />} color="secondary" variant="outlined" onClick={onOptIn}>
                Participate
            </Button>
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle  id="customized-dialog-title" onClose={handleClose}>
                    Your token
                </DialogTitle>
                <DialogContent>
                    <Box>
                        {token !== '' ?
                            (<Fragment>
                                <Typography variant="h6">{token}</Typography>
                                <CopyToClipboard text={token}>
                                    <Button color="primary" variant="outlined">Copy</Button>
                                </CopyToClipboard>
                            </Fragment>)
                            :
                            (<CircularProgress color="secondary" />)}
                    </Box>
                </DialogContent>

            </Dialog>
        </div>
    );
};
