import React, { useContext, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '../libs/firebase';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from './config';
import fetchUserDetails from '../libs/fetchUser';
import { AppStateContext } from './AppContext';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

const WEB_CLIENT_ID = '611623329833-4t054i14kdj2u7ccdvtb4b5tsev1jgfr.apps.googleusercontent.com';

const GoogleLoginButton = ({ isGoogleLoading, setIsGoogleLoading, setFirebaseUser }) => {
  const { setUserProfile, setOnboardingComplete } = useContext(AppStateContext);
  const { t } = useTranslation();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.warn('[Login] GoogleSignin.signOut pre-clean failed', e);
      }
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken || userInfo?.data?.idToken;

      if (!idToken) throw new Error('No idToken found.');

      const credential = auth.GoogleAuthProvider.credential(idToken);
      const firebaseUser = await auth().signInWithCredential(credential);
      const user = firebaseUser.user;
      setFirebaseUser(user)
      const displayName = user.displayName || '';
      const parts = displayName.trim().split(/\s+/);
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';

      const token = await user.getIdToken();

      const response = await fetchWithAuth(`${API_URL}/profiles/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          first_name,
          last_name,
          plan: 1,
          image_url: user.photoURL || '',
          role: '',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Profile creation failed');
      }

      const final = await fetchUserDetails(user.uid);
      setUserProfile(final);
      setOnboardingComplete(true);

    } catch (error) {
      console.error('[Google Sign-In] Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in operation is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      }

      Toast.show({
        type: 'error',
        text1: 'Google Sign-In failed. Please try again.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <TouchableOpacity
      style={styles.googleBtn}
      onPress={loginWithGoogle}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <ActivityIndicator />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../assets/images/google.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>{t('auth.googleContinue')}</Text>
        </View>

      )}
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;

const styles = StyleSheet.create({
  googleBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(213,213,213,1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    height: 54,
    justifyContent: 'center',
    backgroundColor: 'rgba(245,245,245,1)',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
