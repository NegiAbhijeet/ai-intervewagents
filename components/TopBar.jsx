import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Button,
} from 'react-native';
import { AppStateContext } from './AppContext';
import { auth } from '../libs/firebase';
import { signOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const TopBar = () => {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const getInitial = name => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const logout = async () => {
    try {
      setModalVisible(false);

      const currentUser = auth.currentUser;

      // if no currentUser, still attempt to clear state
      if (currentUser) {
        const isGoogleProvider = currentUser.providerData?.some(
          p => p.providerId === 'google.com',
        );

        if (isGoogleProvider) {
          // only call Google APIs when provider is google
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
      }

      await signOut(auth);
      setUserProfile(null);

      console.log('[Logout] User successfully logged out');
    } catch (err) {
      console.error('Error signing out:', err);
      Toast.show({
        type: 'error',
        text1: 'Logout failed',
        text2: 'Something went wrong while signing out. Please try again.',
      });
    }
  };

  const goToProfile = () => {
    setModalVisible(false);
    navigation.navigate('Profile');
  };

  return (
    <View className="flex-row justify-between items-center px-4 pt-4 pb-3 bg-white border-b border-gray-200 shadow-md">
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center gap-2"
      >
        <Image
          source={require('../assets/images/logo.png')}
          className="w-9 h-9 rounded-full"
        />
        <Text className="font-semibold text-xl">AI Interview Agents</Text>
      </TouchableOpacity>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => navigation.navigate('leaderBoard')}
          className="flex-row items-center gap-2"
        >
          <View
            className="flex-row items-center justify-center gap-2 border border-gray-300 rounded-full px-3 h-10"
            style={{ overflow: 'hidden' }} // ensures border-radius works properly
          >
            <Text className="text-xl font-semibold">
              {userProfile?.current_streak || 0}
            </Text>
            <Image
              source={require('../assets/images/flame.png')}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {userProfile?.image_url ? (
            <Image
              source={{ uri: userProfile?.image_url }}
              className="w-9 h-9 rounded-full bg-gray-200"
            />
          ) : (
            <View className="w-9 h-9 rounded-full bg-blue-500 justify-center items-center">
              <Text className="text-white font-bold text-base">
                {getInitial(userProfile?.first_name)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        style={{ zIndex: 1111 }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            paddingTop: 60,
            paddingRight: 20,
          }}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              paddingVertical: 10,

              elevation: 5,
              width: 180,
            }}
          >
            <TouchableOpacity
              onPress={goToProfile}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#333"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16, color: '#333' }}>Profile</Text>
            </TouchableOpacity>

            {/* Divider line */}
            <View
              style={{
                height: 1,
                backgroundColor: '#e5e7eb',
                marginVertical: 5,
              }}
            />

            <TouchableOpacity
              onPress={logout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#333"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16, color: '#333' }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default TopBar;
