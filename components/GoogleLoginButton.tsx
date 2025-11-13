import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext } from 'react';
import { Image } from 'react-native-svg';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { auth } from '../libs/firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from './config';
import fetchUserDetails from '../libs/fetchUser';
import { AppStateContext } from './AppContext';
import Toast from 'react-native-toast-message';

const GoogleLoginButton = ({ isGoogleLoading, setIsGoogleLoading, src }) => {
  const { setUserProfile, setOnboardingComplete } = useContext(AppStateContext);

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken || userInfo?.data?.idToken;

      if (!idToken) throw new Error('No idToken found.');

      const authInstance = auth;
      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(
        authInstance,
        credential,
      );
      const user = firebaseUserCredential.user;

      const displayName = user.displayName || '';
      const [first_name, ...last] = displayName.trim().split(' ');
      const last_name = last.join(' ');

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to create profile');
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
        <>
          <Image
            source={src}
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
          <Text className="text-black font-semibold text-base">
            Continue with Google
          </Text>
        </>
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
    borderColor: 'rgba(213, 213, 213, 1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    height: 54,
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 245, 245, 1)',
  },
  googleIcon: {
    width: 21,
    height: 21,
    marginRight: 10,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
