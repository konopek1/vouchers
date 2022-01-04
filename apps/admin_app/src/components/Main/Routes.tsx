import { Box } from '@material-ui/core';
import React, { useContext } from 'react';
import {
  Route, Switch
} from "react-router-dom";
import { ADMIN, CREATE_ASA, HOME, LOGIN, WILDCARD } from '../../Constants/routes';
import { LogIn } from '../Auth/LogIn';
import { UserContext, userContext } from '../Auth/useUser';
import { AdminView } from './AdminView';
import { AuthRoute } from './AuthRoute';
import { CreateAsaForm } from '../Asa/CreateAsaForm';
import { TopBar } from './TopBar';


export const Routes: React.FC = () => {
  const { user } = useContext(userContext) as UserContext;

  const isAuth = user !== null;

  return (
    <Box display="flex" flexDirection="column" width="100%" maxHeight="80%">
      <Box width="100%"><TopBar></TopBar></Box>
      <Box display="flex" flexGrow="1" overflow="scrollY">
        <Switch>
            <AuthRoute isAuth={isAuth} component={<AdminView />} path={ADMIN} />
            <AuthRoute isAuth={isAuth} component={<AdminView />} path={HOME} />
            <AuthRoute isAuth={isAuth} component={<CreateAsaForm />} path={CREATE_ASA} />
          <Route path={WILDCARD} component={LogIn} />
          <Route path={LOGIN} component={LogIn} />
        </Switch>
      </Box>
    </Box>
  );
}