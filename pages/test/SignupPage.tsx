import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const penguin = require('../../assets/images/signupPeng.png');
const google = require('../../assets/images/google1.png');

export default function SignupScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const onOtpChange = (text, i) => {
    const v = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[i] = v.slice(-1);
    setOtp(newOtp);
    if (v && i < 3) inputs[i + 1].current.focus();
    if (!v && i > 0) inputs[i - 1].current.focus();
  };

  const onLogin = () => {
    // implement login action here
    const code = otp.join('');
    console.log('phone', phone, 'otp', code);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.topLogoWrapper}>
            <Image source={penguin} style={styles.penguin} />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

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
              />
            </View>

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
              <Text style={styles.resend}>Resend OTP? </Text>
              <Text style={styles.resend2}>02 : 00</Text>
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={onLogin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(143, 68, 239, 1)', 'rgba(92, 92, 239, 1)']}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 35,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={styles.loginText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Image source={google} style={styles.googleIcon} />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Already have an Account ? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Signup</Text>
              </TouchableOpacity>
            </View>
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
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  field: {
    width: '100%',
  },
  label: {
    color: 'rgba(139, 71, 239, 1)',
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(139, 71, 239, 1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    width: '60%',
  },
  otpBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 71, 239, 1)',
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 48,
  },
  resend: {
    color: 'rgba(60, 60, 60, 1)',
    fontWeight: 600,
  },
  resend2: {
    color: 'rgba(180, 180, 180, 1)',
  },
  loginButton: {
    marginTop: 16,
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
    fontWeight: 600,
  },
  signupRow: {
    flexDirection: 'row',
    marginTop: 14,
    alignItems: 'center',
  },
  signupText: {
    color: 'rgba(60, 60, 60, 1)',
    fontWeight: 600,
  },
  signupLink: {
    color: 'rgba(139, 70, 239, 1)',
    fontWeight: '600',
  },
});
