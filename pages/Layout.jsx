import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppStateProvider } from '../components/AppContext';

const Layout = ({ children }) => {
  return (
    <AppStateProvider>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-5">{children}</View>
      </SafeAreaView>
    </AppStateProvider>
  );
};

export default Layout;
