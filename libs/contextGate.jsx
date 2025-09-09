// ContextGate.tsx
import React, { useEffect, useContext, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUserDetails from './fetchUser';
import { AppStateContext } from '../components/AppContext';
import { auth } from './firebase';

const ContextGate = ({ children }) => {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    console.log(userProfile, "===1")
    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user?.uid) {
        try {
          // Only fetch profile if not already set
          if (!userProfile) {
            const profile = await fetchUserDetails(user.uid);
            if (profile) {
              setUserProfile(profile);
            } else {
              // No profile in API, force login
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
          }
        } catch (err) {
          console.error('Failed to fetch user profile', err);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } finally {
          setLoading(false);
        }
      } else {
        // No Firebase user logged in
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    });

    return () => unsubscribe();
  }, [userProfile]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <>{children}</>;
};

export default ContextGate;
