import React, { useEffect, useContext, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUserDetails from './fetchUser';
import { AppStateContext } from '../components/AppContext';
import { auth } from './firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import SplashScreen from '../components/SplashScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const ContextGate = ({ children }) => {
  const { setUserProfile, setFirebaseUser } = useContext(AppStateContext);
  const [authLoading, setAuthLoading] = useState(true);

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
        // fail silently here; we handle it below
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
