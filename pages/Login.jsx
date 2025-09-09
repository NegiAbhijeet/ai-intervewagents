// app/screens/LoginScreen.tsx

import React, { useState, useContext, useEffect } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../libs/firebase';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import fetchUserDetails from '../libs/fetchUser';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from '../components/config';
import { AppStateContext } from '../components/AppContext';
import LinearGradient from 'react-native-linear-gradient';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setUserProfile } = useContext(AppStateContext);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '611623329833-4t054i14kdj2u7ccdvtb4b5tsev1jgfr.apps.googleusercontent.com',
    });
  }, []);

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
          role: 'candidate',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to create profile');
      }

      const final = await fetchUserDetails(user.uid);
      console.log('====3', final);
      setUserProfile(final);
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
        text1: error.message || 'Google Sign-In failed. Please try again.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsEmailLoading(true);
    try {
      const authInstance = auth;
      const userCredential = await signInWithEmailAndPassword(
        authInstance,
        email,
        password,
      );
      const user = userCredential.user;

      if (user) {
        const final = await fetchUserDetails(user.uid);
        setUserProfile(final);
        console.log('[Email Sign-In] Login successful');
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'AppTabs' }],
        // });
      }
    } catch (err) {
      console.error('Login error:', err.message);
      Toast.show({ type: 'error', text1: 'Invalid credentials' });
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Welcome Back!
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Enter your email and password to access your account
      </Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
        <TextInput
          placeholder="name@example.com"
          placeholderTextColor="#aaa"
          className="bg-blue-50 px-4 py-2 rounded-xl text-gray-800 border border-blue-200"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm font-medium text-gray-700">Password</Text>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text className="text-xs text-blue-500">
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-blue-50 rounded-xl px-3 border border-blue-200">
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            className="flex-1 py-2 text-gray-800"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>
      <View className="rounded-md overflow-hidden h-16">
        <LinearGradient
          colors={['#60a5fa', '#ec4899']} // blue to pink
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-md mb-4 h-full pt-4"
        >
          <TouchableOpacity
            className="flex-row justify-center items-center"
            disabled={isEmailLoading || isGoogleLoading}
            onPress={handleSubmit}
          >
            {isEmailLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-xl">Login</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-2 text-xs text-gray-400">OR</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <TouchableOpacity
        className="bg-white py-3 rounded-xl flex-row justify-center items-center border border-gray-300 shadow-sm"
        onPress={loginWithGoogle}
        disabled={isEmailLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-black font-semibold text-lg">
            Continue with Google
          </Text>
        )}
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default LoginScreen;
