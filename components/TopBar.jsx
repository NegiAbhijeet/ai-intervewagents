import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const TopBar = ({ user, onProfilePress }) => {
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View className="flex-row justify-between items-center px-5 pt-4 pb-3 bg-white border-b border-gray-200 shadow-md">
      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        className="w-9 h-9 rounded-full"
      />

      {/* Profile / Initial */}
      <TouchableOpacity onPress={onProfilePress}>
        {!user?.image ? (
          <Image
            source={require('../assets/images/profile.png')}
            className="w-9 h-9 rounded-full bg-gray-200"
          />
        ) : (
          <View className="w-9 h-9 rounded-full bg-blue-500 justify-center items-center">
            <Text className="text-white font-bold text-base">
              {getInitial(user?.name)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;
