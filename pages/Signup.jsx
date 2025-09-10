import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
// import { Eye, EyeOff } from "lucide-react-native"

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { AppStateContext } from '../components/AppContext';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from '../components/config';
import Toast from 'react-native-toast-message';
import Ionicons from '@react-native-vector-icons/ionicons';

const SignupScreen = ({ setActiveTab }) => {
  const { setUserProfile, userProfile } = useContext(AppStateContext);
  const navigation = useNavigation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [termsCheckbox, setTermsCheckbox] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSignupLoading, setIsEmailSignupLoading] = useState(false);
  const [isGoogleSignupLoading, setIsGoogleSignupLoading] = useState(false);

  const isFormValid =
    fullName.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    cPassword !== '' &&
    termsCheckbox;

  const handleSubmit = async () => {
    if (password !== cPassword) {
      //   Toast.error("Passwords do not match")
      return;
    }

    try {
      setIsEmailSignupLoading(true);
      const [first_name, ...last] = fullName.trim().split(' ');
      const last_name = last.join(' ');

      const payload = {
        email,
        password,
        first_name,
        last_name,
        uid: userProfile?.uid,
      };

      const res = await fetchWithAuth(`${API_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create profile');

      //   toast.success("Account created successfully.")
      setActiveTab('login');
    } catch (err) {
      console.error(err);
      //   toast.error(err.message || "Signup error.")
    } finally {
      setIsEmailSignupLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setIsGoogleSignupLoading(true);

      const signedInUser = result.user;
      const token = await signedInUser.getIdToken();
      const displayName = signedInUser.displayName || '';
      const [first_name, ...last] = displayName.trim().split(' ');
      const last_name = last.join(' ');

      const response = await fetchWithAuth(`${API_URL}/profiles/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: signedInUser.uid,
          email: signedInUser.email,
          first_name,
          last_name,
          plan: 1,
          image_url: signedInUser?.photoURL,
          role: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to create profile');
      }

      await fetchUserDetails(signedInUser, setUserProfile, navigation);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsGoogleSignupLoading(false);
      //   toast.error(error.message || "Login failed.")
      await signOut(auth);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      {/* Title */}
      <Text className="text-4xl font-bold text-black mb-1">Sign Up</Text>
      <Text className="text-gray-500 mb-6 text-lg">
        Create a new account to get started
      </Text>

      {/* Full Name */}
      <View className="mb-4">
        <Text className="font-medium text-gray-700 mb-2">Full Name</Text>
        <TextInput
          placeholder="John Doe"
          className="bg-white px-4 h-16 rounded-xl border border-gray-300 text-base"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Email */}
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

      {/* Password */}
      {/* Password */}
<View className="mb-4">
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
  <Text className="text-xs text-gray-500 mt-1">
    Must be at least 8 characters long
  </Text>
</View>

      {/* Confirm Password */}
      <View className="mb-4">
        <Text className="font-medium text-gray-700 mb-2">Confirm Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          className="bg-white px-4 h-16 rounded-xl border border-gray-300 text-base"
          value={cPassword}
          onChangeText={setCPassword}
        />
      </View>

      {/* Terms and Conditions */}
      <View className="flex-row items-start mb-6">
        <TouchableOpacity
          className="h-5 w-5 border border-gray-400 rounded mr-3 items-center justify-center"
          onPress={() => setTermsCheckbox(!termsCheckbox)}
        >
          {termsCheckbox && <Text>✓</Text>}
        </TouchableOpacity>
        <Text className="text-sm text-gray-600 flex-1">
          I agree to the{' '}
          <Text className="text-blue-600" onPress={() => Linking.openURL('#')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text className="text-blue-600" onPress={() => Linking.openURL('#')}>
            Privacy Policy
          </Text>
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`h-14 rounded-full flex-row items-center justify-center ${
          !isFormValid || isEmailSignupLoading || isGoogleSignupLoading
            ? 'bg-gray-300'
            : 'bg-blue-500'
        }`}
        disabled={!isFormValid || isEmailSignupLoading || isGoogleSignupLoading}
        onPress={handleSubmit}
      >
        {isEmailSignupLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center text-lg font-semibold">
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      {/* Link to Login */}
      <TouchableOpacity
        className="mt-6"
        onPress={() => {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      >
        <Text className="text-blue-600 text-center font-semibold">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;
