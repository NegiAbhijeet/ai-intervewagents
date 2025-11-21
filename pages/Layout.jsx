import React from 'react';
import { View } from 'react-native';
import BackgroundGradient1 from '../components/backgroundGradient1';
import BackgroundGradient2 from '../components/backgroundGradient2';

const Layout = ({ children, gradient = true }) => {
  return <View className="flex-1 px-[8%] bg-white">{gradient && <BackgroundGradient2 />}{children}</View>;
};

export default Layout;
