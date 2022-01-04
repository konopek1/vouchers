import {
  Box,
  Button,
  LinearProgress,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import { useFormik } from 'formik';
import React, { useContext, useRef, useState } from 'react';
import * as yup from 'yup';
import { securePrompt } from '../../lib/SecurePrompt';
import { AsaService } from '../../lib/Services/AsaService';
import { useService } from '../../lib/Services/useService';
import KeyStorage, { DEFAULT_WALLET } from '../../lib/Storage/KeyStorage';
import { keyStoreContext } from '../../lib/Storage/UseKeyStore';
import { toastContext } from '../Main/Toast';

export interface CreateAsaFormDto {
  assetName: string;
  assetURL: string;
  totalIssuance: number;
  unitName: string;
}

const INITIAL_STATE: CreateAsaFormDto = {
  assetName: '',
  assetURL: '',
  totalIssuance: 21000000,
  unitName: '',
};

export const CreateAsaForm: React.FC = () => {
  const { success } = useContext(toastContext);

  const style = useStyles();
  const asaService = useService<AsaService>(AsaService);
  const keyStorage = useContext(keyStoreContext) as KeyStorage;

  const [error, setError] = useState<Error | null>(null);

  const progressValue = useRef(0);
  const [progress, setProgress] = useState(progressValue.current);
  const makeProgress = (percentage: number) => {
    progressValue.current = percentage;
    setProgress(progressValue.current);
  };

  const onSubmit = async (form: CreateAsaFormDto) => {
    try {
      setError(null);
      const [pk, sk] = keyStorage.getAccountKeys(
        DEFAULT_WALLET,
        securePrompt('Password for private key:'),
      );

      await asaService.createAsa(
        {
          addr: pk,
          clawback: pk,
          freeze: pk,
          manager: pk,
          reserve: pk,
          assetName: form.assetName,
          assetURL: form.assetURL,
          totalIssuance: Number(form.totalIssuance),
          unitName: form.unitName,
        },
        sk,
        makeProgress,
      );

      success(`Voucher ${form.assetName} created!`);
      makeProgress(0);
    } catch (e: any) {
      makeProgress(0);
      setError(e.response.data.message);
      console.error(e);
    }
  };

  const form = useFormik({
    initialValues: INITIAL_STATE,
    //TODO add validation schema
    validationSchema: yup.object(),
    onSubmit,
  });

  return (
    <Box className={style.root}>
      <Box
        display="flex"
        margin="auto"
        textAlign="center"
        mb={5}
        maxWidth="60%"
      >
        {error && (
          <Typography variant="caption" color="error">
            {error?.toString().slice(0, 30) + '...'}
          </Typography>
        )}
        <LinearProgressWithLabel value={progress} />
      </Box>

      <form onSubmit={form.handleSubmit} className={style.form}>
        <Box mb={2}>
          <TextField
            fullWidth
            id="unitName"
            name="unitName"
            label="Unit name"
            type="text"
            variant="outlined"
            value={form.values.unitName}
            onChange={form.handleChange}
            error={form.touched.unitName && Boolean(form.errors.unitName)}
            helperText={form.touched.unitName && form.errors.unitName}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            id="assetName"
            name="assetName"
            label="Voucher name"
            type="text"
            variant="outlined"
            value={form.values.assetName}
            onChange={form.handleChange}
            error={form.touched.assetName && Boolean(form.errors.assetName)}
            helperText={form.touched.assetName && form.errors.assetName}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            id="assetURL"
            name="assetURL"
            label="Voucher URL"
            type="text"
            variant="outlined"
            value={form.values.assetURL}
            onChange={form.handleChange}
            error={form.touched.assetURL && Boolean(form.errors.assetURL)}
            helperText={form.touched.assetURL && form.errors.assetURL}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            id="totalIssuance"
            name="totalIssuance"
            label="Number of tokens"
            type="number"
            variant="outlined"
            value={form.values.totalIssuance}
            onChange={form.handleChange}
            error={
              form.touched.totalIssuance && Boolean(form.errors.totalIssuance)
            }
            helperText={form.touched.totalIssuance && form.errors.totalIssuance}
          />
        </Box>

        <Box mb={2}>
          <TextField
            id="date"
            label="Expiration date"
            type="date"
            variant="outlined"
            // defaultValue="2017-05-24"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <Button variant="contained" color="primary" type="submit">
          Create Voucher
        </Button>
      </form>
    </Box>
  );
};

function LinearProgressWithLabel(props: { value: number }) {
  return props.value !== 0 ? (
    <Box width="100%">
      <Box width="100%" mr={1}>
        <LinearProgress variant="indeterminate" color="secondary" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  ) : (
    <Box></Box>
  );
}

const useStyles = makeStyles({
  root: {
    height: '100%',
    width: '100%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
});
