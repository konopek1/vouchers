import { Box, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import React, { useContext, useState } from 'react';
import { QRCode } from 'react-qr-svg';
import KeyStorage from '../../lib/Storage/KeyStorage';
import { keyStoreContext } from '../../lib/Storage/UseKeyStore';
import WalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { useService } from '../../lib/Services/useService';
import { ParticipationService } from '../../lib/Services/ParticipationService';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toastContext } from '../Main/Toast';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
      paddingRight: '5rem',
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
    </MuiDialogTitle>
  );
});

export const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
}))(MuiDialogContent);

const INITIAL_AMOUNT = 10;

export default function PaymentDialog({ asaID }: QRCodeProps) {
  const [open, setOpen] = useState(false);
  const keyStore = useContext(keyStoreContext) as KeyStorage;
  const participationService = useService<ParticipationService>(
    ParticipationService,
  );
  const [token, setToken] = useState('fetching...');
  const { error } = useContext(toastContext);

  const [QRCodeValue, setQRCodeValue] = useState({
    publicKey: '',
    amount: INITIAL_AMOUNT,
  });

  const handleClickOpen = () => {
    participationService
      .generateToken(Number(asaID))
      .then(setToken)
      .catch(() => error('Could not fetch token'));

    const publicKey = keyStore.getPublicAddress(asaID);

    setQRCodeValue({ ...QRCodeValue, publicKey });

    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const amountChange = (event: any) =>
    setQRCodeValue({ ...QRCodeValue, amount: event.target.value });

  return (
    <div>
      <Button
        startIcon={<WalletIcon />}
        color="primary"
        variant="contained"
        onClick={handleClickOpen}
      >
        Receive
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Your QR code
        </DialogTitle>
        <Box ml={5} mr={5}>
          <TextField
            autoFocus
            id="amount"
            label="amount"
            type="number"
            value={QRCodeValue.amount}
            onChange={amountChange}
          />
        </Box>
        <DialogContent>
          <QRCode level="Q" value={JSON.stringify(QRCodeValue)} width="100%" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export interface QRCodeProps {
  asaID: string;
}
