import { Container, makeStyles } from '@material-ui/core';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext, userContext, useUser } from './components/Auth/useUser';
import { Routes } from './components/Main/Routes';
import { defaultToastContext, Toast, toastContext } from './components/Main/Toast';
import ServiceRegistry, { ServiceRegistryContext } from './lib/Services/ServiceRegistry';

function App() {
  const styles = useStyles();

  const user = useUser() as UserContext;

  return (
    <ServiceRegistryContext.Provider value={ServiceRegistry.getInstance()}>
      <Router>
        <toastContext.Provider value={defaultToastContext}>
          <userContext.Provider value={user}>
            <Container className={styles.main}>
              <Routes></Routes>
            </Container>
          </userContext.Provider>
          <Toast></Toast>
        </toastContext.Provider>
      </Router>
    </ServiceRegistryContext.Provider>
  );
}


const useStyles = makeStyles({
  main: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: ' center',
    alignItems: 'center',
  }
});

export default App;
