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
    Dimensions,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import Layout from './Layout'; // Assuming you have a Layout component
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = () => {
        if (!email || !email.includes('@')) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address.',
            });
            return false;
        }
        return true;
    };

    const handleSendCode = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        try {
            await auth().sendPasswordResetEmail(email);
            Toast.show({
                type: 'success',
                text1: 'Password Reset Email Sent',
                text2: 'Please check your inbox (and spam folder) for instructions.',
                visibilityTime: 6000,
            });
            // Optionally navigate back to login after sending the email
            navigation.navigate('Login');
        } catch (error) {
            console.error('Forgot Password error:', error.code, error.message);
            let errorMessage = 'Could not send password reset email.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with that email address.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'The email address is not valid.';
            }

            Toast.show({
                type: 'error',
                text1: 'Error Sending Email',
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
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address to receive a verification code.
                        </Text>

                        <View style={[styles.field, { marginTop: 20 }]}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="hello@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                placeholderTextColor="rgba(139, 71, 239, 0.4)"
                                editable={!loading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.sendCodeButton, { marginTop: 30 }]}
                            onPress={handleSendCode}
                            activeOpacity={0.8}
                            disabled={loading}
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
                                    <Text style={styles.sendCodeText}>Send Code</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.rememberPasswordRow}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text style={{ color: 'rgba(139, 70, 239, 1)', fontWeight: '600' }}>
                                    Remember Password? Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
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
        marginBottom: 30,
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
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    field: {
        width: '100%',
    },
    label: {
        color: 'rgba(139, 71, 239, 1)',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '600',
        alignSelf: 'flex-start', // Align label to the left
    },
    input: {
        borderWidth: 1.2,
        borderColor: 'rgba(139, 71, 239, 1)',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        width: '100%',
    },
    sendCodeButton: {
        width: '100%',
        borderRadius: 30,
        height: 54,
        marginTop: 20,
    },
    sendCodeText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    rememberPasswordRow: {
        flexDirection: 'row',
        marginTop: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rememberText: {
        color: '#666',
        fontWeight: '500',
    },
    loginLink: {
        color: 'rgba(139, 70, 239, 1)',
        fontWeight: '600',
        marginLeft: 5,
    },
});