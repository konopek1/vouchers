import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps, Color } from '@material-ui/lab/Alert';
import React, { createContext, useContext, useState } from 'react';


export const Toast: React.FC = () => {

    const {open, setOpen, severity, message} = useToast();

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={severity}>
                {message}
            </Alert>
        </Snackbar>
    );
}

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}


const useToast = () => {
    const [severity, setSeverity] = useState<Color>('info'); 
    const [open, setOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    
    const ctx = useContext(toastContext);
    ctx.error = (message: string) => {setSeverity('error'); setMessage(message); setOpen(true);}
    ctx.info = (message: string) => {setSeverity('info'); setMessage(message); setOpen(true);}
    ctx.success = (message: string) => {setSeverity('success'); setMessage(message); setOpen(true);}

    return {
        severity,
        open,
        setOpen,
        message,
    };
}

export type ToastContext = {
    info: (message: string) => void;
    error: (message: string) => void;
    success: (message: string) => void;
};

export const defaultToastContext = {
    info: console.log,
    error: console.log,
    success: console.log,
};

export const toastContext = createContext<ToastContext>(defaultToastContext);
