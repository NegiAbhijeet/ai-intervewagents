import React, { useContext } from 'react';
import AuthStack from './navigation/AuthStack';
import AppTabs from './navigation/AppTabs';
import { AppStateContext } from './AppContext';

const RootNavigator = () => {
  const { userProfile } = useContext(AppStateContext);

  return userProfile ? <AppTabs /> : <AuthStack />;
};

export default RootNavigator;
