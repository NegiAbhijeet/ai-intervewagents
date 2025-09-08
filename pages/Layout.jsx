import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar'; 

const Layout = ({ children, user, onProfilePress }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <TopBar user={user} onProfilePress={onProfilePress} />
      <View className="flex-1 p-5">
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Layout;
