import { Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { useContext, useState } from 'react';
import QrReader from 'react-qr-reader';
import { securePrompt } from '../../lib/SecurePrompt';
import { PaymentService } from '../../lib/Services/PaymentService';
import { useService } from '../../lib/Services/useService';
import KeyStorage from '../../lib/Storage/KeyStorage';
import { keyStoreContext } from '../../lib/Storage/UseKeyStore';
import { toastContext } from '../Main/Toast';
import SendIcon from '@material-ui/icons/Send';
import { DialogContent, DialogTitle } from './ReceiveDialog';

export default function ReceiveDialog({ asaID }: QRCodeProps) {
  const [open, setOpen] = useState(false);
  const keyStore = useContext(keyStoreContext) as KeyStorage;
  const paymentService = useService<PaymentService>(PaymentService);
  const { error, success, info } = useContext(toastContext);

  const onScan = async (scannedJson: string) => {
    if (scannedJson) {
      let publicKey: string;
      let privateKey: Uint8Array;
      let payload: QrCodeData;

      try {
        [publicKey, privateKey] = keyStore.getAccountKeys(
          asaID,
          securePrompt('Tell my your secret:'),
        );
      } catch (e) {
        setOpen(false);
        error('Wrong secret for private key!');
        console.log(e);
        return;
      }

      try {
        payload = JSON.parse(scannedJson) as QrCodeData;
        if (!payload.amount || !payload.publicKey) throw Error();
      } catch (e) {
        error('Invalid qr code!');
        return;
      }

      const transactionTime = new Date().getTime();

      paymentService
        .sendAsa(
          publicKey!,
          payload!.publicKey,
          Number(asaID),
          Number(payload!.amount),
          privateKey!,
        )
        .then((response) =>
          success(
            `Transaction approved! - ${(
              (new Date().getTime() - transactionTime) /
              1000
            ).toFixed(2)} sec`,
          ),
        )
        .catch((errorResponse) => error('Transaction rejected!'));

      handleClose();
      info('Transaction sent...');
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Button
        startIcon={<SendIcon />}
        color="secondary"
        variant="contained"
        onClick={handleClickOpen}
      >
        Pay
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Scan QR code
        </DialogTitle>
        <DialogContent dividers>
          <Box width="70vw">
            <QrReader
              delay={300}
              onError={(e: any) => console.log(e)}
              onScan={onScan}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export interface QRCodeProps {
  asaID: string;
}

export interface QrCodeData {
  amount: number;
  publicKey: string;
}
