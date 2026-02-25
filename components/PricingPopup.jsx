import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function StepPaywallPopup({
    visible,
    onClose,
}) {
    const navigation = useNavigation();
    const scaleValue = new Animated.Value(1);

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleValue, {
                toValue: 1.05,
                friction: 3,
                useNativeDriver: true,
            }).start();
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
                    {/* Gradient Lock Icon */}
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.lockIconContainer}
                    >
                        <Text style={styles.lockIcon}>🔒</Text>
                    </LinearGradient>

                    <Text style={styles.title}>
                        Don't Stop Your Momentum
                    </Text>

                    <Text style={styles.subtitle}>
                        Unlock unlimited AI interviews, real-time feedback,{' '}
                        <Text style={styles.subtitleBold}>and performance insights</Text>{' '}
                        to ace your next job interview.
                    </Text>

                    <View style={styles.benefitsBox}>
                        <View style={styles.benefitRow}>
                            <View style={styles.checkIcon} />
                            <Text style={styles.benefit}>Unlimited Practice Interviews</Text>
                        </View>
                        <View style={styles.benefitRow}>
                            <View style={styles.checkIcon} />
                            <Text style={styles.benefit}>Instant AI Feedback</Text>
                        </View>
                        <View style={styles.benefitRow}>
                            <View style={styles.checkIcon} />
                            <Text style={styles.benefit}>Detailed Performance Analytics</Text>
                        </View>
                        <View style={styles.benefitRow}>
                            <View style={styles.checkIcon} />
                            <Text style={styles.benefit}>Multi-Language Practice</Text>
                        </View>
                    </View>

                    {/* Primary CTA Button */}
                    <TouchableOpacity 
                        style={styles.ctaButtonWrapper}
                        onPress={() => navigation.navigate('pricing')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6', '#EC4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>Unlock Unlimited Access 🚀</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Secondary Button */}
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancel}>Continue with Limits</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        maxWidth: 340,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 15,
    },
    lockIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    lockIcon: {
        fontSize: 32,
        color: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        color: '#111827',
        marginBottom: 12,
        letterSpacing: -0.4,
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        color: '#6B7280',
        marginBottom: 24,
        paddingHorizontal: 12,
    },
    subtitleBold: {
        fontWeight: '700',
        color: '#374151',
    },
    benefitsBox: {
        alignSelf: 'stretch',
        marginBottom: 24,
        gap: 12,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    checkIcon: {
        backgroundColor: '#10B981',
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefit: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        flex: 1,
        lineHeight: 20,
    },
    ctaButtonWrapper: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 10,
    },
    ctaGradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    ctaText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 17,
        letterSpacing: 0.3,
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    cancel: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '700',
    },
});