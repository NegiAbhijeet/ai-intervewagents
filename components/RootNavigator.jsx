import React, { useContext, useEffect, useState } from 'react';
import AuthStack from './navigation/AuthStack';
import AppTabs from './navigation/AppTabs';
import TopBar from './TopBar';
import { AppStateContext } from './AppContext';

const RootNavigator = () => {
  const { firebaseUser } = useContext(AppStateContext);
  return firebaseUser ? (
    <>
      <TopBar />
      <AppTabs />
    </>
  ) : (
    <AuthStack />
  );
};

export default RootNavigator;
