import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import fetchUserDetails from '../libs/fetchUser';
import { AppStateContext } from '../components/AppContext';
import { API_URL, PRIVACY_POILCY_URL, TERMS_OF_USE_URL } from '../components/config';
import auth, { signInWithEmailAndPassword } from '@react-native-firebase/auth';
import GoogleLoginButton from '../components/GoogleLoginButton';
import Layout from './Layout';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import fetchWithAuth from '../libs/fetchWithAuth';
const { width: screenWidth } = Dimensions.get('window');

export default function LoginScreen() {
  const { setUserProfile, setOnboardingComplete, setFirebaseUser } =
    useContext(AppStateContext);
  const navigation = useNavigation()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateInputs = () => {
    if (!email || !email.includes('@')) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return false;
    }
    if (!password || password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters long.',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return
    setLoading(true)

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password)
      const user = userCredential.user

      if (!user) {
        throw new Error('No user returned from signIn')
      }

      // if email not verified, send verification and stop the flow
      if (!user.emailVerified) {
        await auth().signOut()

        Toast.show({
          type: 'error',
          text1: 'Email not verified',
          text2: 'Complete verification before logging in.'
        })

        return
      }

      // user is verified, continue with your profile creation flow
      setFirebaseUser(user)
      const token = await user.getIdToken()
      const response = await fetchWithAuth(`${API_URL}/profiles/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          plan: 1,
          image_url: user.photoURL || '',
          role: ''
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Profile creation failed')
      }

      const final = await fetchUserDetails(user.uid)
      setUserProfile(final)
      setOnboardingComplete(true)
    } catch (err) {
      // log the whole error object for better debugging
      console.error('Login error:', err)
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: 'Please check your credentials and try again.'
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <Layout gradient={false}>
      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.topLogoWrapper}>
            {/* <LoginPen width={280} height={230} /> */}
            <Image source={require("../assets/images/loginPeng.png")} style={styles.penguin} />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Log In</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="hello@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="rgba(139, 71, 239, 0.4)"
                editable={!loading && !isGoogleLoading}
              />
            </View>

            <View style={[styles.field, { marginTop: 16 }]}>
              <Text style={styles.label}>Password</Text>
              <View style={{ justifyContent: 'center' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  secureTextEntry={!isPasswordVisible}
                  style={[styles.input, { paddingRight: 50 }]}
                  placeholderTextColor="rgba(139, 71, 239, 0.4)"
                  editable={!loading && !isGoogleLoading}
                />

                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={22}
                    color="rgba(139, 71, 239, 0.8)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              disabled={loading || isGoogleLoading}
              style={{ alignSelf: "flex-end", marginTop: 10 }}
            >
              <Text style={{ color: 'rgba(139, 70, 239, 1)', fontWeight: '600' }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { marginTop: 24 }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading || isGoogleLoading}
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
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginText}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>
            <GoogleLoginButton
              setIsGoogleLoading={setIsGoogleLoading}
              isGoogleLoading={isGoogleLoading}
              setFirebaseUser={setFirebaseUser}
            />
          </View>
          <View style={{ marginTop: 15, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Signup")}
              disabled={loading || isGoogleLoading}
            >
              <Text style={{ color: 'rgba(139, 70, 239, 1)', fontWeight: '600' }}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <View className="flex-row justify-center items-center mb-1">
          <Pressable onPress={() => Linking.openURL(TERMS_OF_USE_URL)}>
            <Text className="text-black underline">
              Terms of Use
            </Text>
          </Pressable>

          <Text className="text-black mx-1 -translate-y-1 font-bold">
            .
          </Text>

          <Pressable onPress={() => Linking.openURL(PRIVACY_POILCY_URL)}>
            <Text className="text-black underline">
              Privacy Policy
            </Text>
          </Pressable>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
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
  },
  penguin: {
    width: 230,
    height: 180,
  },
  card: {
    width: '100%',
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
    color: "black",
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
    maxWidth: Math.min(360, screenWidth),
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
  eyeIcon: {
    position: 'absolute',
    right: 15,
    alignSelf: 'center',
  },
});
