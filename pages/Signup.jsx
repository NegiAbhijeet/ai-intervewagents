import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from '../components/config';
import Toast from 'react-native-toast-message';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';

const SignupScreen = () => {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [termsCheckbox, setTermsCheckbox] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSignupLoading, setIsEmailSignupLoading] = useState(false);

  const isFormValid =
    fullName.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    cPassword !== '' &&
    termsCheckbox;

  const handleSubmit = async () => {
    if (!isFormValid) {
      Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please complete all fields and agree to the terms.',
      });
      return;
    }

    if (password !== cPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password mismatch',
        text2: 'Passwords do not match. Please try again.',
      });
      return;
    }

    setIsEmailSignupLoading(true);

    try {
      const [first_name, ...last] = fullName.trim().split(' ');
      const last_name = last.join(' ');

      const payload = {
        email,
        password,
        first_name,
        last_name,
      };

      const res = await fetchWithAuth(`${API_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: 'You can now log in with your credentials.',
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.error('Signup error:', err.message);
      Toast.show({
        type: 'error',
        text1: 'Signup failed',
        text2: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsEmailSignupLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 relative">
      {/* Gradient Header */}
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
          <Text className="text-4xl text-white font-bold mb-1">Sign Up</Text>
          <Text className="text-white mb-6 text-lg text-center w-[80%]">
            Create a new account to get started
          </Text>
        </LinearGradient>
      </View>
      {/* Form Card */}
      <View className="mx-auto w-[90%] bg-white p-6 elevation-xl py-8 rounded-3xl -translate-y-10">
        {/* Full Name */}
        <View className="flex-row items-center px-4 h-16 border border-gray-300 rounded-xl mb-6">
          <Ionicons
            name="person-outline"
            size={22}
            color="#64748b"
            style={{ marginRight: 12 }}
          />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#bbb"
            className="flex-1 text-base text-black"
            value={fullName}
            onChangeText={setFullName}
            style={{ paddingVertical: 0 }}
          />
        </View>

        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm Password */}
        <View className="flex-row items-center px-4 h-16 border border-gray-300 rounded-xl mb-6">
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#64748b"
            style={{ marginRight: 12 }}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            className="flex-1 text-base text-black"
            value={cPassword}
            onChangeText={setCPassword}
            style={{ paddingVertical: 0 }}
          />
        </View>
        <View className="flex-row items-start mb-6">
          <TouchableOpacity
            className="h-5 w-5 border border-gray-400 rounded mr-3 items-center justify-center"
            onPress={() => setTermsCheckbox(!termsCheckbox)}
          >
            {termsCheckbox && <Text>✓</Text>}
          </TouchableOpacity>
          <Text className="text-sm text-gray-600 flex-1">
            I agree to the{' '}
            <Text
              className="text-blue-600"
              onPress={() => Linking.openURL('#')}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              className="text-blue-600"
              onPress={() => Linking.openURL('#')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
        {/* Submit Button */}
        <TouchableOpacity
          className={`h-14 rounded-xl flex-row items-center justify-center ${
            !isFormValid || isEmailSignupLoading ? 'bg-gray-300' : 'bg-blue-500'
          }`}
          disabled={!isFormValid || isEmailSignupLoading}
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
      </View>

      {/* Link to Login */}
      <TouchableOpacity
        className="flex-row items-center justify-center"
        onPress={() => {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      >
        <Text className="text-base">Already have an account? </Text>
        <Text className="text-blue-600 text-center font-semibold text-base">
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;
