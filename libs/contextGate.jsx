import React, { useEffect, useContext, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import fetchUserDetails from './fetchUser';
import { AppStateContext } from '../components/AppContext';
import { auth } from './firebase';
import TopBar from '../components/TopBar';

const ContextGate = ({ children }) => {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {

      if (user?.uid) {
        try {
          // Always fetch profile on app start / reload
          const profile = await fetchUserDetails(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
  }, []);

  return (
    <View className="flex-1">
      {/* TopBar is always visible */}
      <TopBar
        user={userProfile}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {/* Main content */}
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
