import React, { useContext } from 'react';
import AuthStack from './navigation/AuthStack';
import AppTabs from './navigation/AppTabs';
import { AppStateContext } from './AppContext';
import TopBar from './TopBar';

const RootNavigator = () => {
  const { userProfile } = useContext(AppStateContext);

  return userProfile ? (
    <>
      <TopBar />
      <AppTabs />
    </>
  ) : (
    <AuthStack />
  );
};

export default RootNavigator;
