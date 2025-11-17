import React, { useEffect, useContext, useState, useCallback } from 'react';
import { View, StatusBar } from 'react-native';
import fetchUserDetails from '../libs/fetchUser';
import { AppStateContext } from '../components/AppContext';
import auth from './firebase';
import SplashScreen from '../components/SplashScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayInstallReferrer } from 'react-native-play-install-referrer';
import { JAVA_API_URL } from '../components/config';
import fetchWithAuth from './fetchWithAuth';

const ContextGate = ({ children }) => {
  const {
    setUserProfile,
    setFirebaseUser,
    userProfile,
    setUnreadNotification,
  } = useContext(AppStateContext);

  const [authLoading, setAuthLoading] = useState(true);

  const incrementInstall = useCallback(async referrer => {
    if (!referrer) return;
    try {
      console.log('Calling install increment for', referrer);
      await fetchWithAuth(
        `${JAVA_API_URL}/api/campaigns/${referrer}/increment?type=install`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      console.error('install increment failed for', referrer, err);
    }
  }, []);

  const incrementSignupOnce = useCallback(async referrer => {
    if (!referrer) return;
    const signupKey = `signupCalled_${referrer}`;
    try {
      const already = await AsyncStorage.getItem(signupKey);
      if (already) {
        console.log('Signup already counted for', referrer);
        return;
      }

      console.log('Calling signup increment for', referrer);
      await fetchWithAuth(
        `${JAVA_API_URL}/api/campaigns/${referrer}/increment?type=signup`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      await AsyncStorage.setItem(signupKey, 'true');
    } catch (err) {
      console.error('signup increment failed for', referrer, err);
    }
  }, []);

  // Read install referrer once and record install
  useEffect(() => {
    let mounted = true;

    const checkAndSaveReferrer = async () => {
      try {
        const storedRefId = await AsyncStorage.getItem('referrerId');
        if (storedRefId) {
          console.log('Referrer ID loaded from storage:', storedRefId);
          if (userProfile?.uid) {
            incrementSignupOnce(storedRefId);
          }
          return;
        }

        PlayInstallReferrer.getInstallReferrerInfo(
          async (installReferrerInfo, error) => {
            if (!mounted) return;
            if (error) {
              console.warn('Failed to get install referrer info:', error);
              return;
            }

            const referrer = installReferrerInfo?.installReferrer;
            console.log('Install referrer =', referrer);

            if (referrer && referrer !== 'utm_source=google-play&utm_medium=organic') {
              await AsyncStorage.setItem('referrerId', referrer);
              await incrementInstall(referrer);

              if (userProfile?.uid) {
                await incrementSignupOnce(referrer);
              }
            } else {
              console.log('No valid referrer to record or organic referrer');
            }
          },
        );
      } catch (e) {
        console.error('Error handling referrer logic:', e);
      }
    };

    checkAndSaveReferrer();

    return () => {
      mounted = false;
    };
    // Intentionally empty deps to run once on mount
  }, []);

  // When a user logs in, try attributing signup once for stored referrer
  useEffect(() => {
    if (!userProfile?.uid) return;

    let mounted = true;

    const trySignupForStoredReferrer = async () => {
      try {
        const referrer = await AsyncStorage.getItem('referrerId');
        if (!referrer) {
          console.log('No stored referrer to attribute signup to');
          return;
        }
        if (mounted) await incrementSignupOnce(referrer);
      } catch (err) {
        console.error('Error attempting signup increment after login:', err);
      }
    };

    trySignupForStoredReferrer();

    return () => {
      mounted = false;
    };
  }, [userProfile?.uid, incrementSignupOnce]);

  // Foreground messaging listener
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = messaging().onMessage(async remoteMessage => {
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

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [userProfile?.uid]);

  // Notification opened while app in background
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      if (!remoteMessage) return;
      setUnreadNotification(prev => (typeof prev === 'number' ? prev + 1 : 1));
    });

    return () => {
      unsubscribeOpened && unsubscribeOpened();
    };
  }, [userProfile?.uid]);

  // Auth state listener using native auth instance
  useEffect(() => {
    // If you configured GoogleSignin elsewhere, no need to do it here.
    // Example: GoogleSignin.configure({ webClientId: '...', offlineAccess: true });

    const unsubscribe = auth().onAuthStateChanged(async user => {
      console.log('Auth state changed', user);
      setFirebaseUser(user || null);

      let profile = null;
      try {
        if (user?.uid) {
          profile = await fetchUserDetails(user.uid);
        }
      } catch (err) {
        setUserProfile(null);
        console.log('Error fetching user details:', err);
      }

      if (profile) setUserProfile(profile);
      else setUserProfile(null);

      setAuthLoading(false);
    });

    return () => {
      unsubscribe && unsubscribe();
    };
    // empty deps: attach listener once on mount
  }, [setFirebaseUser, setUserProfile]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {authLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <SplashScreen />
        </View>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </SafeAreaView>
  );
};

export default ContextGate;
