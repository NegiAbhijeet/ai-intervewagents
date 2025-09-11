import React from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const gradients = {
  blue: ['#93c5fd', '#bfdbfe'],      // lighter blue
  purple: ['#c4b5fd', '#ddd6fe'],    // lighter purple
  green: ['#6ee7b7', '#a7f3d0'],     // lighter green
  yellow: ['#fef08a', '#fef9c3'],    // lighter yellow
};

const GradientCard = ({ gradient, className = '', children, ...props }) => {
  const colors = Array.isArray(gradient)
    ? gradient
    : gradients[gradient] || gradients.blue;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`rounded-xl p-4 ${className}`}
      {...props}
    >
      <View>{children}</View>
    </LinearGradient>
  );
};

export default GradientCard;
