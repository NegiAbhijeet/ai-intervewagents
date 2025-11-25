import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Image,
    Pressable,
    Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { API_URL, PRIVACY_POILCY_URL, TERMS_OF_USE_URL } from '../components/config';
import GoogleLoginButton from '../components/GoogleLoginButton';
import Layout from './Layout';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import fetchWithAuth from '../libs/fetchWithAuth';
import { useTranslation } from 'react-i18next';

export default function SignupScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
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

    const handleSignup = async () => {
        console.log(email, password)
        if (!validateInputs()) return;
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/signup/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create profile');
            }

            Toast.show({
                type: 'success',
                text1: 'Verification email sent',
                text2: 'Check your inbox and confirm your email to continue.',
            });
            navigation.navigate("Login")
        } catch (err) {
            console.error('Signup error:', err.code);

            let errorMessage = 'Something went wrong.';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'That email address is already in use!';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'That email address is invalid!';
            }

            Toast.show({
                type: 'error',
                text1: 'Signup Failed',
                text2: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout gradient={false}>
            <View style={styles.bg}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.topLogoWrapper}>
                        <Image source={require("../assets/images/loginPeng.png")} style={styles.penguin} />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.title}>{t('signup.title')}</Text>

                        <View style={styles.field}>
                            <Text style={styles.label}>{t('signup.emailLabel')}</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('signup.emailPlaceholder')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                placeholderTextColor="rgba(139, 71, 239, 0.4)"
                                editable={!loading && !isGoogleLoading}
                            />
                        </View>

                        <View style={[styles.field, { marginTop: 16 }]}>
                            <Text style={styles.label}>{t('signup.passwordLabel')}</Text>
                            <View style={{ justifyContent: 'center' }}>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={t('signup.passwordPlaceholder')}
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
                            style={[styles.loginButton, { marginTop: 24 }]}
                            onPress={handleSignup}
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
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.loginText}>{t('signup.button')}</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.orRow}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>{t('signup.or')}</Text>
                            <View style={styles.line} />
                        </View>

                        <GoogleLoginButton
                            setIsGoogleLoading={setIsGoogleLoading}
                            isGoogleLoading={isGoogleLoading}
                        />
                    </View>

                    <View style={{ marginTop: 15, alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                            disabled={loading || isGoogleLoading}
                        >
                            <Text style={{ color: 'rgba(139, 70, 239, 1)', fontWeight: '600' }}>
                                {t('signup.haveAccount')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                    <Pressable onPress={() => Linking.openURL(TERMS_OF_USE_URL)}>
                        <Text style={{ color: 'black', textDecorationLine: 'underline' }}>
                            {t('legal.terms')}
                        </Text>
                    </Pressable>

                    <Text style={{ color: 'black', marginHorizontal: 6, fontWeight: '700' }}>
                        .
                    </Text>

                    <Pressable onPress={() => Linking.openURL(PRIVACY_POILCY_URL)}>
                        <Text style={{ color: 'black', textDecorationLine: 'underline' }}>
                            {t('legal.privacy')}
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
        fontWeight: '600', // Changed from 600 to '600' string for strict standard compliance
        marginBottom: 20,
    },
    field: {
        width: '100%',
    },
    label: {
        color: 'rgba(139, 71, 239, 1)',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '600'
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
    eyeIcon: {
        position: 'absolute',
        right: 15,
        alignSelf: 'center',
    },
});