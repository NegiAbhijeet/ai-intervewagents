import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { API_URL } from '../components/config';

export const useNotification = (
  userId,
  fcmTokenUpdated,
  setFcmTokenUpdated,
) => {
  useEffect(() => {
    if (!userId) return;

    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

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
      if (!userId || !token || fcmTokenUpdated) return;
      try {
        await axios.put(`${API_URL}/profile/${userId}/fcm-token/`, { token });
        console.log('Token sent to server');
        setFcmTokenUpdated(true);
      } catch (err) {
        console.error('Error sending token to server:', err.message || err);
      }
    };

    const init = async () => {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        console.log('Notification permission not granted');
        return;
      }

      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        if (token) {
          console.log('Sending token to server on init');
          await sendTokenToServer(token);
        }
      } catch (err) {
        console.error('Error initializing notifications:', err);
      }

      messaging().onTokenRefresh(async newToken => {
        console.log('Token refreshed, sending to server');
        await sendTokenToServer(newToken);
      });
    };

    init();
  }, [userId]);
};
