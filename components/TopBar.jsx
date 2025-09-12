import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { AppStateContext } from './AppContext';
import { auth } from '../libs/firebase';
import { signOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const TopBar = () => {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [modalVisible, setModalVisible] = useState(false);

  const getInitial = name => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const logout = async () => {
    try {
      setModalVisible(false);

      // Clear Google sign-in cache
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut(); // Ensures account picker shows next time

      // Clear Firebase session
      await signOut(auth);

      // Reset app context
      setUserProfile(null);

      console.log('[Logout] User successfully logged out');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  return (
    <View className="flex-row justify-between items-center px-5 pt-4 pb-3 bg-white border-b border-gray-200 shadow-md">
      <TouchableOpacity onPress={() => setModalVisible(true)} className='flex-row items-center gap-2'>
        <Image
          source={require('../assets/images/logo.png')}
          className="w-9 h-9 rounded-full"
        />
        <Text className='font-semibold text-xl'>AI Interview Agents</Text>
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

      {/* Side Popup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
              paddingHorizontal: 20,
              elevation: 5,
              width: 150,
            }}
          >
            <TouchableOpacity onPress={logout}>
              <Text
                style={{ fontSize: 16, paddingVertical: 10, color: '#333' }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default TopBar;
