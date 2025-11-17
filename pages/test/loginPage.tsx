import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';
import fetchUserDetails from '../../libs/fetchUser';
import { AppStateContext } from '../../components/AppContext';

import fetchWithAuth from '../../libs/fetchWithAuth';
import { API_URL } from '../../components/config';
import auth from '@react-native-firebase/auth';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import LoginPen from "../../assets/images/loginPeng.svg"
// const penguin = require('../../assets/images/loginPeng.png');
// const google = require('../../assets/images/google1.png');
const { width: screenWidth } = Dimensions.get('window');

export default function LoginScreen() {
  const { setUserProfile, setOnboardingComplete, setFirebaseUser } =
    useContext(AppStateContext);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [confirmObj, setConfirmObj] = useState(null);
  const [timer, setTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  useEffect(() => {
    let t;
    if (timer > 0) {
      t = setTimeout(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [timer]);

  const normalizePhone = raw => {
    if (!raw) return raw;
    const trimmed = raw.trim();
    if (trimmed.startsWith('+')) return trimmed;
    const digits = trimmed.replace(/\D/g, '');
    // default to +91 for local 10 digit input
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  const sendOtp = async isResend => {
    try {
      setOtpLoading(true);
      // let x = '+1 897-958-4098';
      const phoneNumber = normalizePhone(phone);

      if (!phoneNumber || phoneNumber.length < 6) {
        Toast.show({
          type: 'error',
          text1: 'Invalid phone number',
          text2: 'Please enter a valid phone number.',
        });
        setOtpLoading(false);
        return;
      }

      // use the normalized phone number for sending OTP
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirmObj(confirmation);
      setOtp(['', '', '', '', '', '']);
      setTimer(120); // 2 minutes cooldown

      // autofocus first OTP box
      setTimeout(() => {
        if (inputs[0].current) inputs[0].current.focus();
      }, 200);

      console.log('OTP sent to', phoneNumber);
      if (isResend) {
        Toast.show({
          type: 'success',
          text1: 'New OTP sent',
          text2: 'A new verification code has been sent to your phone.',
        });
      } else {
        // success toast after send
        Toast.show({
          type: 'success',
          text1: 'OTP sent',
          text2: `A verification code was sent to ${phoneNumber}`,
        });
      }
    } catch (err) {
      console.error('send OTP error', err.code, err.message);
      Toast.show({
        type: 'error',
        text1: 'Send OTP failed',
        text2: err.message || 'Unable to send OTP. Try again.',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpAndLogin = async () => {
    const code = otp.join('');
    if (!confirmObj) {
      Toast.show({
        type: 'info',
        text1: 'Request OTP first',
        text2: 'Please request an OTP before verifying.',
      });
      return;
    }
    if (code.length < 6) {
      Toast.show({
        type: 'info',
        text1: 'Enter full OTP',
        text2: 'Please enter the 6 digit code you received.',
      });
      return;
    }
    try {
      setOtpLoading(true);

      // confirm returns the user credential; use that to get the user
      const firebaseUserCredential = await confirmObj.confirm(code);
      const user = firebaseUserCredential?.user;

      if (!user) {
        throw new Error('No user returned after confirmation');
      }
      setFirebaseUser(user);

      const token = await user.getIdToken();

      // create or update profile on your backend
      const response = await fetchWithAuth(`${API_URL}/profiles/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          mobile_number: user.phoneNumber || '',
          plan: 1,
          role: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to create profile');
      }

      // fetch profile details from backend and update local state
      const final = await fetchUserDetails(user.uid);

      setUserProfile(final);
      setOnboardingComplete(true);
    } catch (err) {
      // log the full error for debugging
      console.error('confirmCode error', err);

      // clear input boxes and focus the first input
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        if (inputs?.[0]?.current) inputs[0].current.focus();
      }, 200);

      // map common firebase error codes to friendly messages
      let friendly = 'Verification failed. Please try again.';
      const code = err?.code;
      const message = err?.message;

      if (code === 'auth/invalid-verification-code') {
        friendly =
          'The code you entered is invalid. Check the code and try again.';
      } else if (
        code === 'auth/code-expired' ||
        code === 'auth/session-expired'
      ) {
        friendly = 'The verification code expired. Request a new code.';
      } else if (code === 'auth/invalid-phone-number') {
        friendly = 'The phone number is invalid. Please request OTP again.';
      } else if (message) {
        friendly = message;
      }

      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: friendly,
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const onOtpChange = (text, i) => {
    const v = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[i] = v.slice(-1);
    setOtp(newOtp);
    if (v && i < 5) {
      inputs[i + 1].current?.focus();
    }
    if (!v && i > 0) {
      inputs[i - 1].current?.focus();
    }
  };

  const resendOtp = async () => {
    if (timer > 0) {
      Toast.show({
        type: 'info',
        text1: 'Please wait',
        text2: `You can resend OTP after ${timer} seconds.`,
      });
      return;
    }

    await sendOtp(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.topLogoWrapper}>
            <LoginPen width={280} height={230} />
            {/* <Image source={penguin} style={styles.penguin} /> */}
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Let’s You In</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="rgba(139, 71, 239, 0.4)"
                maxLength={15}
                editable={!isGoogleLoading || !otpLoading}
              />
            </View>

            {/* Show Send OTP when no confirmation yet. Once OTP sent, hide send and show boxes */}
            {!confirmObj ? (
              <TouchableOpacity
                style={[styles.loginButton, { marginTop: 24 }]}
                onPress={sendOtp}
                activeOpacity={0.8}
                disabled={otpLoading || phone.length < 10}
              >
                <LinearGradient
                  colors={['rgba(143, 68, 239, 1)', 'rgba(92, 92, 239, 1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 35,
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: phone.length >= 10 ? 1 : 0.5,
                  }}
                >
                  {otpLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.loginText}>Send OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.otpRow}>
                  {otp.map((o, i) => (
                    <TextInput
                      key={i}
                      ref={inputs[i]}
                      value={o}
                      onChangeText={t => onOtpChange(t, i)}
                      keyboardType="numeric"
                      maxLength={1}
                      style={styles.otpBox}
                      editable={!isGoogleLoading || !otpLoading}
                    />
                  ))}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                >
                  {/* When timer is active show timer and hide resend button.
                      When timer is zero hide timer and show resend button. */}
                  {timer > 0 ? (
                    <>
                      <Text style={styles.resend}>Resend OTP? </Text>
                      <Text style={styles.resend2}>
                        {`${String(Math.floor(timer / 60)).padStart(
                          2,
                          '0',
                        )} : ${String(timer % 60).padStart(2, '0')}`}
                      </Text>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ color: '#999' }}>Wait</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.resend}>Resend OTP? </Text>
                      <TouchableOpacity
                        onPress={resendOtp}
                        disabled={isGoogleLoading || otpLoading}
                        style={{ marginLeft: 12 }}
                      >
                        <Text
                          style={{
                            color:
                              isGoogleLoading || otpLoading
                                ? '#999'
                                : 'rgba(139, 70, 239, 1)',
                          }}
                        >
                          Resend
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={verifyOtpAndLogin}
                  activeOpacity={0.8}
                  disabled={!confirmObj || isGoogleLoading || otpLoading}
                >
                  <LinearGradient
                    colors={['rgba(143, 68, 239, 1)', 'rgba(92, 92, 239, 1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 35,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {otpLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.loginText}>Login</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* Login button verifies OTP when confirmObj exists. If no confirmObj, it is disabled. */}

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>
            <GoogleLoginButton
              setIsGoogleLoading={setIsGoogleLoading}
              isGoogleLoading={isGoogleLoading}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bg: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLogoWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 35,
  },
  penguin: {
    width: 280,
    height: 230,
  },
  card: {
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 20,
  },
  field: {
    width: '100%',
  },
  label: {
    color: 'rgba(139, 71, 239, 1)',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 600
  },
  input: {
    borderWidth: 1.2,
    borderColor: 'rgba(139, 71, 239, 1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
    maxWidth: Math.min(360, screenWidth * 0.85),
  },
  otpBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 71, 239, 1)',
    textAlign: 'center',
    fontSize: 20,
    flexShrink: 1,
  },
  resend: {
    color: 'rgba(60, 60, 60, 1)',
    fontWeight: '600',
  },
  resend2: {
    color: 'rgba(180, 180, 180, 1)',
  },
  loginButton: {
    marginTop: 24,
    width: '100%',
    borderRadius: 30,
    height: 54,
  },
  loginText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e6e6e6',
  },
  orText: {
    marginHorizontal: 8,
    color: '#9a9a9a',
  },
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
  signupRow: {
    flexDirection: 'row',
    marginTop: 14,
    alignItems: 'center',
  },
  signupText: {
    color: 'rgba(60, 60, 60, 1)',
    fontWeight: '600',
  },
  signupLink: {
    color: 'rgba(139, 70, 239, 1)',
    fontWeight: '600',
  },
});
