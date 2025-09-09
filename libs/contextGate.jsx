import React, { useEffect, useContext, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUserDetails from './fetchUser';
import { AppStateContext } from '../components/AppContext';
import { auth } from './firebase';
import Toast from 'react-native-toast-message';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const ContextGate = ({ children }) => {
  const { setUserProfile } = useContext(AppStateContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '611623329833-4t054i14kdj2u7ccdvtb4b5tsev1jgfr.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user?.uid) {
        try {
          const profile = await fetchUserDetails(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            setUserProfile(null);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        } catch (err) {
          setUserProfile(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } finally {
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View className="flex-1">
      <Toast />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </View>
  );
};

export default ContextGate;
