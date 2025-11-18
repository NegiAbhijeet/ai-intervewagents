import React from 'react';
import { View } from 'react-native';

const Layout = ({ children }) => {
  return <View className="flex-1 px-[6%] bg-white">{children}</View>;
};

export default Layout;
