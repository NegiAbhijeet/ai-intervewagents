import React from 'react';
import { View } from 'react-native';
import BackgroundGradient1 from '../components/backgroundGradient1';
import BackgroundGradient2 from '../components/backgroundGradient2';
import BackgroundGradient3 from '../components/backgroundGradient3';

const Layout = ({ children, gradient = true, gradientType = '2', removePadding }) => {
  const renderGradient = () => {
    if (!gradient) return null;
    if (gradientType === '1') return <BackgroundGradient1 />;
    if (gradientType === '3') return <BackgroundGradient3 />;
    return <BackgroundGradient2 />;
  };

  return (
    <View className={`flex-1 ${removePadding ? 'px-0' : 'px-[5%]'} bg-white`}>
      {renderGradient()}
      {children}
    </View>
  );
};

export default Layout;
