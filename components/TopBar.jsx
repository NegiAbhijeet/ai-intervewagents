import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const TopBar = ({ user, onProfilePress }) => {
  const getInitial = name => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      <Image
        source={require('../assets/images/logo.png')}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
        }}
      />
      {/* Right: Profile Image or Initial */}
      <TouchableOpacity onPress={onProfilePress}>
        {!user?.image ? (
          <Image
            // source={{ uri: user.image }}
            source={require('../assets/images/profile.png')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#E5E7EB',
            }}
          />
        ) : (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              {getInitial(user?.name)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;
