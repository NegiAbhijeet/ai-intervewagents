import React, { useEffect, useContext, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUserDetails from './fetchUser';
import { AppStateContext } from '../components/AppContext';
import { auth } from './firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import SplashScreen from '../components/SplashScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

const ContextGate = ({ children }) => {
  const {
    setUserProfile,
    setFirebaseUser,
    userProfile,
    setUnreadNotification,
  } = useContext(AppStateContext);

  const [authLoading, setAuthLoading] = useState(true);
  // subscribe to foreground messages and increment unread count
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // optional: normalize remoteMessage to your notifications shape
      const incoming = {
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        read: false,
        received_at: new Date().toISOString(),
      };

      setUnreadNotification(prev => (typeof prev === 'number' ? prev + 1 : 1));

      Toast.show({
        type: 'info',
        text1: incoming.title || 'Notification',
        text2: incoming.body || '',
      });
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (!remoteMessage) return;
        setUnreadNotification(prev =>
          typeof prev === 'number' ? prev + 1 : 1,
        );
      },
    );

    return () => unsubscribeOpened();
  }, [userProfile?.uid]);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '611623329833-4t054i14kdj2u7ccdvtb4b5tsev1jgfr.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setFirebaseUser(user);
      let profile = null;

      try {
        if (user?.uid) {
          profile = await fetchUserDetails(user.uid);
        }
      } catch (err) {
        setUserProfile(null);
        console.log('Error fetching user details:', err);
      }

      if (profile) {
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={authLoading ? '#4f46e5' : 'white'}
        translucent={false}
      />

      {authLoading ? (
        <View className="flex-1 justify-center items-center">
          <SplashScreen />
        </View>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </SafeAreaView>
  );
};

export default ContextGate;
