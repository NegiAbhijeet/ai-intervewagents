import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

import ContextGate from "../libs/contextGate"
import { AppStateProvider } from '../components/AppContext';

const Layout = ({ children, user, onProfilePress }) => {
  return (
    <AppStateProvider>
      <ContextGate>
        <SafeAreaView className="flex-1 bg-white">
          
          <View className="flex-1 p-5 pb-0">{children}</View>
        </SafeAreaView>
      </ContextGate>
    </AppStateProvider>
  );
};

export default Layout;
