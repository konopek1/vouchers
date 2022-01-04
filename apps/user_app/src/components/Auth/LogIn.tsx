import { Box, Button, makeStyles, TextField } from '@material-ui/core';
import { useFormik } from 'formik';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { HOME } from '../../Constants/routes';
import AuthService, { LogInDto } from '../../lib/Services/AuthService';
import { useService } from '../../lib/Services/useService';
import { RegisterSchema } from '../../lib/Validations';
import { UserContext, userContext } from './useUser';

const INITIAL_STATE: LogInDto = {
    email: '',
    password: ''
}

const LogIn: React.FC = () => {
    const style = useStyles();
    const registerService = useService<AuthService>(AuthService);
    const history = useHistory();
    const { setUser } = useContext(userContext) as UserContext;

    const onSubmit = async (registerData: LogInDto) => {
        try {
            const user = await registerService.logIn(registerData);
            setUser(user);
            history.push(HOME);
        } catch (e) {
            form.setErrors({
                email: e.request.response ? JSON.parse(e.request.response).message : e.toString()
            });
        }
    }

    const form = useFormik({
        initialValues: INITIAL_STATE,
        validationSchema: RegisterSchema,
        onSubmit,
    });

    return (
        <Box className={style.root}>
                <form onSubmit={form.handleSubmit} className={style.form}>
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={form.values.email}
                            onChange={form.handleChange}
                            error={form.touched.email && Boolean(form.errors.email)}
                            helperText={form.touched.email && form.errors.email}
                        />
                    </Box>
                    <Box mb={4}>
                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={form.values.password}
                            onChange={form.handleChange}
                            error={form.touched.password && Boolean(form.errors.password)}
                            helperText={form.touched.password && form.errors.password}
                        />
                    </Box>
                    <Button variant="contained" color="primary" type="submit">Sign in</Button>
                </form>
        </Box>
    );
}

const useStyles = makeStyles({
    root: {
        height: '100%',
        width: '100%'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: ' space-around',
        alignItems: 'center',
        height: '100%'
    },
});

export { LogIn };

