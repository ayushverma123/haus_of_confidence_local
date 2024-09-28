import React, { ReactElement, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';

import { Routes, Route } from "react-router-dom"
import { useObserver } from 'mobx-react-lite';
import { storeContext as userAccountStoreContext } from './stores/userAccountStore'
import { StoreProvider as UserAccountStore } from './stores/userAccountStore'
import { StoreProvider as ScheduledMessagesStore } from './stores/automatedMessagesStore'
import { fullscreen } from './styles';
import { routeKeys, routes, routesConfig } from './config/routes';
import { AuthorizationPage } from './pages/AuthorizationPage';
import { LoginPage } from './pages/loginPage';
import { TopBar } from './components/topBar';
import { RouteConfigTuple } from './model/RouteConfigTuple';


const styles = {
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    ...fullscreen
  }
}

const AppBase: React.FC = () => {
  const userAccountStore = React.useContext(userAccountStoreContext)
  if (!userAccountStore) throw Error("UserAccountStore shouldn't be null")

  return useObserver(() => (
      // @ts-ignore
    <div className="App" style={styles.rootContainer}>
      { userAccountStore.isLoggedIn &&
        <Fragment>
          <span></span>
          <TopBar />
            <Routes>
                {routesConfig.map((item: RouteConfigTuple) => 
                  <Route path={item[0]} element={item[1]} />
                )}
            </Routes>
        </Fragment> 
      }
      { !userAccountStore.isLoggedIn &&
        <LoginPage />
      }
    </div>
  ))
}


const App: React.FC = () => (
  <UserAccountStore>
  <ScheduledMessagesStore>
    <AppBase />
  </ScheduledMessagesStore>
  </UserAccountStore>
)

export default App