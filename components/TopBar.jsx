import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { AppStateContext } from './AppContext';
import { auth } from '../libs/firebase';
import { signOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Ionicons from '@react-native-vector-icons/ionicons';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from './config';

const TopBar = () => {
  const {
    userProfile,
    setUserProfile,
    unreadNotification,
    notifications,
    setNotifications,
    setUnreadNotification,
  } = useContext(AppStateContext);

  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();

  const unreadCount = useMemo(() => {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    if (typeof setUnreadNotification === 'function') {
      setUnreadNotification(unreadCount);
    }
  }, [unreadCount, setUnreadNotification]);
  function fetchNotifications() {
    fetchWithAuth(`${API_URL}/notifications/${userProfile.uid}/`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          setNotifications([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
      });
  }
  useEffect(() => {
    if (userProfile?.uid) {
      fetchNotifications();
    }
  }, [userProfile?.uid, unreadNotification]);
  const getInitial = name => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const performLogout = async () => {
    setIsLoggingOut(true);

    try {
      setConfirmVisible(false);
      setMenuVisible(false);

      const currentUser = auth.currentUser;

      if (currentUser) {
        const isGoogleProvider = currentUser.providerData?.some(
          p => p.providerId === 'google.com',
        );

        if (isGoogleProvider) {
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
    } finally {
      setIsLoggingOut(false);
    }
  };

  const onLogoutPress = () => {
    setConfirmVisible(true);
  };

  // read badge value from context if provided
  const unreadBadge =
    typeof unreadNotification === 'number' ? unreadNotification : 0;

  return (
    <View className="flex-row justify-between items-center px-4 pt-4 pb-3 bg-white border-b border-gray-200 shadow-md">
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        className="flex-row items-center gap-2"
      >
        <Image
          source={require('../assets/images/logo.png')}
          className="w-9 h-9 rounded-full"
        />
        <Text className="font-semibold text-xl">AIIA</Text>
      </TouchableOpacity>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => navigation.navigate('leaderBoard')}
          className="flex-row items-center gap-2"
        >
          <View
            className="flex-row items-center justify-center gap-2 border border-gray-300 rounded-full px-3 h-10"
            style={{ overflow: 'hidden' }}
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

        {/* Notification Bell */}
        <TouchableOpacity
          onPress={() => {
            // setIsNotificationDrawerOn(true);
            navigation.navigate('notifications');
          }}
          accessibilityLabel="Notifications"
          className="relative"
          style={{ paddingHorizontal: 6, paddingVertical: 6 }}
        >
          <Ionicons name="notifications-outline" size={22} color="#111827" />
          {unreadBadge > 0 && (
            <View
              className="absolute -top-1 -right-1 rounded-full items-center justify-center"
              style={{
                minWidth: 18,
                height: 18,
                paddingHorizontal: 4,
                backgroundColor: '#ef4444',
              }}
            >
              <Text className="text-[10px] text-white font-semibold">
                {unreadBadge > 99 ? '99+' : `${unreadBadge}`}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
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

      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
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
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              paddingVertical: 6,
              elevation: 5,
              width: 180,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('profile');
              }}
              disabled={isLoggingOut}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 16,
                opacity: isLoggingOut ? 0.6 : 1,
              }}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#333"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16, color: '#333' }}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                onLogoutPress();
              }}
              disabled={isLoggingOut}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 16,
                opacity: isLoggingOut ? 0.6 : 1,
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

      {/* Confirm Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmVisible}
        onRequestClose={() => {
          if (!isLoggingOut) setConfirmVisible(false);
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          onPress={() => {
            if (!isLoggingOut) setConfirmVisible(false);
          }}
        >
          <View
            style={{
              width: '90%',
              maxWidth: 320,
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
              Are you sure you want to logout?
            </Text>
            <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 18 }}>
              You will need to sign in again to continue
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => {
                  if (!isLoggingOut) setConfirmVisible(false);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  marginRight: 8,
                }}
                disabled={isLoggingOut}
              >
                <Text style={{ fontSize: 16, color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={performLogout}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  backgroundColor: '#ef4444',
                  borderRadius: 6,
                  minWidth: 110,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={{ fontSize: 16, color: '#fff' }}>Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default TopBar;
