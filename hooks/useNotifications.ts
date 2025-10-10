import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../components/config';

export const useNotification = (userId, profileFcmToken) => {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        // iOS permissions handled by messaging().requestPermission()
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    };

    const sendTokenToServer = async token => {
      if (!userId || !token) return false;
      try {
        await axios.put(`${API_URL}/profile/${userId}/fcm-token/`, { token });
        console.log('Token synced to server');
        return true;
      } catch (err) {
        console.error('Error syncing token:', err.message || err);
        return false;
      }
    };

    const syncToken = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        const newToken = await messaging().getToken();
        const storedToken = await AsyncStorage.getItem('fcm_token');

        if (!storedToken || storedToken !== newToken) {
          console.log('New or changed token detected, syncing to server');
          const ok = await sendTokenToServer(newToken);
          if (ok) {
            await AsyncStorage.setItem('fcm_token', newToken);
            console.log('Token saved locally after successful sync');
          } else {
            console.log('Server sync failed, token not saved locally');
          }
        }

        if (storedToken && !profileFcmToken) {
          console.log('Profile missing token, syncing stored token');
          await sendTokenToServer(storedToken);
        }
      } catch (err) {
        console.error('Error syncing token:', err);
      }
    };

    const handleTokenRefresh = async newToken => {
      console.log('Token refreshed, syncing to server');
      const ok = await sendTokenToServer(newToken);
      if (ok) {
        await AsyncStorage.setItem('fcm_token', newToken);
        console.log('Refreshed token saved locally');
      }
    };

    const initNotifications = async () => {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        console.log('Notification permission not granted, skipping setup');
        return;
      }

      await syncToken();

      const unsubscribe = messaging().onTokenRefresh(handleTokenRefresh);
      return unsubscribe;
    };

    let unsubscribe;
    initNotifications().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, profileFcmToken]);
};
