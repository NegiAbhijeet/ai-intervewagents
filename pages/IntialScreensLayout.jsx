import React from 'react';
import { View } from 'react-native';

const Layout = ({ children }) => {
  return (
    <View style={{ width: '80%' }}>
      {children}
    </View>
  );
};

export default Layout;
