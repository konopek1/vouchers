import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { Fragment, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { LOGIN } from '../../Constants/routes';
import { UserContext, userContext } from '../Auth/useUser';
import SimpleMenu from './Menu';


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
          {user && <SimpleMenu></SimpleMenu>}
          <Typography variant="h6" align="center" className={classes.title}>
            Vouchers
          </Typography>
          {!user ?
            (<Fragment>
              <Button color="inherit" onClick={() => routes.push(LOGIN)}>Log in</Button>
            </Fragment>)
            :
            (<Button color="inherit" onClick={exit}>Log out</Button>)
          }
        </Toolbar>
      </AppBar>
    </div>
  );
}

