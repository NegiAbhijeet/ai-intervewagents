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
// import PlayInstallReferrer from 'react-native-play-install-referrer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import { JAVA_API_URL } from '../components/config';
const modulePlayInstallReferrer = NativeModules.PlayInstallReferrer;
const ContextGate = ({ children }) => {
  const {
    setUserProfile,
    setFirebaseUser,
    userProfile,
    setUnreadNotification,
  } = useContext(AppStateContext);

  const [authLoading, setAuthLoading] = useState(true);
  const [myRefId, setMyRefId] = useState('');
  useEffect(() => {
    const checkAndSendReferrer = async () => {
      console.log('--- Referrer check started ---');

      try {
        console.log(
          'modulePlayInstallReferrer defined',
          typeof modulePlayInstallReferrer !== 'undefined',
        );
        console.log(
          'modulePlayInstallReferrer keys',
          Object.keys(modulePlayInstallReferrer || {}),
        );

        const alreadySent = await AsyncStorage.getItem('referrerSent');
        console.log('Already sent referrer?', alreadySent);
        if (alreadySent) {
          console.log('Referrer already sent, skipping');
          return;
        }

        // quick mock switch for local testing
        const USE_MOCK = false;
        if (USE_MOCK) {
          console.log('Using mock referrer for local testing');
          const mockInfo = {
            installReferrer: 'utm_clg=mockCollege&utm_source=mockSource',
            referrerClickTimestampSeconds: Math.floor(Date.now() / 1000),
            installBeginTimestampSeconds: Math.floor(Date.now() / 1000),
          };
          await handleInfoAndSend(mockInfo);
          return;
        }

        // getInfo adapts to both promise and callback APIs
        const getInfo = () =>
          new Promise(async (resolve, reject) => {
            let settled = false;
            const timeoutMs = 8000;
            const to = setTimeout(() => {
              if (settled) return;
              settled = true;
              const msg = `Timeout waiting for getInstallReferrerInfo after ${timeoutMs} ms`;
              console.error(msg);
              reject(new Error(msg));
            }, timeoutMs);

            try {
              const nativeFn =
                modulePlayInstallReferrer?.getInstallReferrerInfo;
              if (typeof nativeFn !== 'function') {
                clearTimeout(to);
                settled = true;
                const msg = 'Native method getInstallReferrerInfo not found';
                console.warn(msg);
                return reject(new Error(msg));
              }

              console.log(
                'Native function arity',
                nativeFn.length,
                'invoking accordingly',
              );

              // promise-style native method (arity 0)
              if (nativeFn.length === 0) {
                try {
                  const result = await nativeFn();
                  if (settled) {
                    console.warn(
                      'Promise resolved after timeout, ignoring result',
                      result,
                    );
                    clearTimeout(to);
                    return;
                  }
                  settled = true;
                  clearTimeout(to);
                  console.log('Native promise resolved with', result);
                  return resolve(result);
                } catch (err) {
                  if (settled) {
                    console.warn(
                      'Promise rejected after timeout, ignoring',
                      err,
                    );
                    clearTimeout(to);
                    return;
                  }
                  settled = true;
                  clearTimeout(to);
                  console.error('Native promise rejected', err);
                  return reject(err);
                }
              }

              // callback-style native method (expects callback arg)
              console.log('Invoking native method in callback style');
              try {
                nativeFn((info, error) => {
                  if (settled) {
                    console.warn('Callback invoked after timeout, ignoring', {
                      info,
                      error,
                    });
                    return;
                  }
                  settled = true;
                  clearTimeout(to);
                  console.log('Callback invoked with', { info, error });
                  if (error) return reject(error);
                  resolve(info);
                });
              } catch (e) {
                if (settled) return;
                settled = true;
                clearTimeout(to);
                console.error(
                  'Exception when calling native callback method',
                  e,
                );
                reject(e);
              }
            } catch (e) {
              if (settled) return;
              settled = true;
              clearTimeout(to);
              console.error('Unexpected error in getInfo', e);
              reject(e);
            }
          });

        const info = await getInfo();
        console.log('Install Referrer raw info', info);
        await handleInfoAndSend(info);
      } catch (err) {
        console.error('Error checking referrer', err);
      } finally {
        console.log('--- Referrer check completed ---');
      }
    };

    async function handleInfoAndSend(infoObj) {
      try {
        console.log('Handling info object', infoObj);
        const installReferrer = info?.installReferrer;
        if (!installReferrer) {
          console.log('No installReferrer string in response');
          return;
        }

        // detect if it’s a key=value string or a plain value
        let refId;
        if (installReferrer.includes('=')) {
          // typical UTM or key=value string
          const urlParams = new URLSearchParams(installReferrer);
          refId = urlParams.get('ref') || urlParams.get('referrer');
        } else {
          // direct referrer, like your UUID
          refId = installReferrer.trim();
        }

        console.log('Extracted Referrer ID:', refId);
        if (!refId) {
          console.log('No valid referrer ID found in', installReferrer);
          return;
        }
        setMyRefId(refId);
        console.log('Sending referrer ID to API', refId);
        try {
          const res = await fetch(
            `${JAVA_API_URL}/api/campaigns/${refId}/increment?type=install`,
            {
              method: 'PATCH',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            },
          );

          console.log('API response status', res.status);
          if (!res.ok) {
            console.warn('Referrer post failed with status', res.status);
            return;
          }
          await AsyncStorage.setItem('referrerSent', 'true');
          console.log('Referrer sent and saved');
        } catch (e) {
          console.error('Network error sending referrer', e);
        }
      } catch (e) {
        console.error('Error in handleInfoAndSend', e);
      }
    }

    checkAndSendReferrer();
  }, []);

  // 🔹 2️⃣ Messaging foreground listener
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
        <View className="flex-1">
          {myRefId ? (
            <View
              style={{ height: 2, width: '100%', backgroundColor: 'green' }}
            ></View>
          ) : (
            <View
              style={{ height: 2, width: '100%', backgroundColor: 'red' }}
            ></View>
          )}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

export default ContextGate;
