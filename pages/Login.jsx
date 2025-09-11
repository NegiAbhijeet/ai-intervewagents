// app/screens/LoginScreen.tsx

import React, { useState, useContext } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../libs/firebase';
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import fetchUserDetails from '../libs/fetchUser';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from '../components/config';
import { AppStateContext } from '../components/AppContext';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Ionicons from '@react-native-vector-icons/ionicons';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setUserProfile } = useContext(AppStateContext);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      }
    } catch (err) {
      console.error('Login error:', err.message);
      Toast.show({
        type: 'error',
        text1: 'Invalid credentials',
        text2: 'Please enter valid credentials.',
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-4xl font-bold text-black mb-1">Login</Text>
      <Text className="text-gray-500 mb-6 text-lg">
        Welcome back to the app
      </Text>
      <View className="mb-4">
        <Text className="font-medium text-gray-700 mb-2">Email Address</Text>
        <TextInput
          placeholder="hello@example.com"
          placeholderTextColor="#bbb"
          className="bg-white px-4 h-16 rounded-xl border border-gray-300 text-base"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="mb-8">
        <Text className="font-medium text-gray-700 mb-2">Password</Text>
        <View className="flex-row items-center h-16 border border-gray-300 rounded-xl px-3 bg-white">
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            className="flex-1 text-base text-black"
            value={password}
            onChangeText={setPassword}
            style={{ paddingVertical: 0 }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <Ionicons name="eye-off-outline" size={24} color="#64748b" />
            ) : (
              <Ionicons name="eye-outline" size={24} color="#64748b" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        className="h-14 rounded-full bg-blue-500 flex-row items-center justify-center"
        onPress={handleSubmit}
        disabled={isEmailLoading}
      >
        {isEmailLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center text-lg font-semibold">
            Login
          </Text>
        )}
      </TouchableOpacity>
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-2 text-sm text-gray-400">or sign in with</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <TouchableOpacity
        className="bg-gray-100 h-14 rounded-full flex-row justify-center items-center border border-gray-300 mb-4 "
        onPress={loginWithGoogle}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Image
              source={require('../assets/images/google.png')}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <Text className="text-black font-semibold text-base">
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-2"
        onPress={() => {
          navigation.reset({ index: 0, routes: [{ name: 'Signup' }] });
        }}
      >
        <Text className="text-blue-600 text-center font-semibold">
          Create an account
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
