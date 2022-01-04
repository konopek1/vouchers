import { Box } from '@material-ui/core';
import React, { useContext } from 'react';
import {
  Route, Switch
} from "react-router-dom";
import { HOME, REGISTER, WILDCARD } from '../../Constants/routes';
import { LogIn } from '../Auth/LogIn';
import { Register } from '../Auth/Register';
import { UserContext, userContext } from '../Auth/useUser';
import { AuthRoute } from './AuthRoute';
import { BalanceView } from './Balance';
import { TopBar } from './TopBar';


export const Routes: React.FC = () => {
  const { user } = useContext(userContext) as UserContext;

  const isAuth = user !== null;

  return (
    <Box display="flex" flexDirection="column" width="100%" maxHeight="80%">
      <Box width="100%"><TopBar></TopBar></Box>
      <Box display="flex" flexGrow="1" overflow="scrollY">
        <Switch>
          <AuthRoute isAuth={isAuth} component={<BalanceView />} path={HOME} />
          <Route path={REGISTER} component={Register} />
          <Route path={WILDCARD} component={LogIn} />
        </Switch>
      </Box>
    </Box>
  );
}