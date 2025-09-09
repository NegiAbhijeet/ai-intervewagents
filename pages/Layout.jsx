import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

import { AppStateProvider } from '../components/AppContext';

const Layout = ({ children }) => {
  return (
    <AppStateProvider>
      <SafeAreaView className="flex-1 bg-white">
        <TopBar />
        <View className="flex-1 p-5 pb-0">{children}</View>
      </SafeAreaView>
    </AppStateProvider>
  );
};

export default Layout;
