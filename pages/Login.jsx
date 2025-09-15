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
import LinearGradient from 'react-native-linear-gradient';

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
          role: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to create profile');
      }

      const final = await fetchUserDetails(user.uid);
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
    <View className="flex-1 bg-gray-100">
      <View className="h-[35vh] w-full max-h-[300px]">
        <LinearGradient
          colors={['#3b82f6', 'purple']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`rounded-xl p-4 w-full h-full flex items-center justify-center`}
        >
          <View className="bg-white rounded-xl p-2 mb-6">
            <Image
              source={require('../assets/images/logo.png')}
              className="w-16 h-16"
            />
          </View>
          <Text className="text-4xl text-white font-bold mb-1">Sign In</Text>
          <Text className="text-white mb-6 text-lg text-center w-[80%]">
            Welcome back! Continue your journey to smarter interviews.
          </Text>
        </LinearGradient>
      </View>
      <View className="mx-auto w-[90%] bg-white p-6 elevation-xl py-8 rounded-3xl -translate-y-10">
        <View className="flex-row items-center px-4 h-16 border border-gray-300 rounded-xl mb-6">
          <Ionicons
            name="mail-outline"
            size={22}
            color="#64748b"
            style={{ marginRight: 12 }}
          />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#bbb"
            className="flex-1 text-base text-black"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={{ paddingVertical: 0 }}
          />
        </View>

        <View className="flex-row items-center px-4 h-16 border border-gray-300 rounded-xl mb-6">
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#64748b"
            style={{ marginRight: 12 }}
          />
          <TextInput
            placeholder="Password"
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

        <TouchableOpacity
          className="h-14 rounded-xl bg-blue-500 flex-row items-center justify-center"
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
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-2 text-sm text-gray-400">or sign in with</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity
          className="bg-gray-100 h-14 rounded-xl flex-row justify-center items-center border border-gray-300 mb-4 "
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
      </View>
      <TouchableOpacity
        className="flex-row items-center justify-center"
        onPress={() => {
          navigation.reset({ index: 0, routes: [{ name: 'Signup' }] });
        }}
      >
        <Text className="text-base">Don't have an account? </Text>
        <Text className="text-blue-600 text-center font-semibold text-base">
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
