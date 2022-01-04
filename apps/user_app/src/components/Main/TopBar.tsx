import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { Fragment, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { LOGIN, REGISTER } from '../../Constants/routes';
import { UserContext, userContext } from '../Auth/useUser';
import AccountBalanceRoundedIcon from '@material-ui/icons/AccountBalanceRounded';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100vw'
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  bankIcon: {
    marginRight: theme.spacing(2)
  }
}));

export const TopBar: React.FC = () => {
  const classes = useStyles();
  const routes = useHistory();  
  const { user, logOut } = useContext(userContext) as UserContext;

  const exit = async () => {
    await logOut();
    routes.push(LOGIN);
  }

  return (
    <div className={classes.root}>
      <AppBar>
        <Toolbar>
          <AccountBalanceRoundedIcon className={classes.bankIcon}></AccountBalanceRoundedIcon>
          <Typography variant="h6" className={classes.title}>
            Vouchers
          </Typography>
          {!user ?
            (<Fragment>
              <Button color="inherit" onClick={() => routes.push(LOGIN)}>Log in</Button>
              <Button color="inherit" onClick={() => routes.push(REGISTER)}>Register</Button>
            </Fragment>)
            :
            (<Button color="inherit" onClick={exit}>Log out</Button>)
          }
        </Toolbar>
      </AppBar>
    </div>
  );
}