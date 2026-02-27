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
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

export default function StepPaywallPopup({
    visible,
    onClose,
    showContinueButton = true
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
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale: scaleValue }] },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20, alignItems: "center" }}
                        style={{ width: '100%' }}
                        bounces={false}
                    >
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.lockIconContainer}
                        >
                            <Text style={styles.lockIcon}>🔒</Text>
                        </LinearGradient>

                        {/* Title */}
                        <Text style={styles.title}>
                            Keep Improving{"\n"}
                            Don't Stop Now
                        </Text>
                        {/* Subtitle */}

                        <Text style={styles.sectionTitle}>
                            Go Premium and Get:
                        </Text>

                        {/* Benefits */}
                        <View style={styles.benefitsBox}>
                            <View style={styles.benefitRow}>
                                <View style={styles.checkIcon} />
                                <Text style={styles.benefit}>
                                    AI Mock Interviews
                                </Text>
                            </View>

                            <View style={styles.benefitRow}>
                                <View style={styles.checkIcon} />
                                <Text style={styles.benefit}>
                                    Real time AI Trainer with Answer Guidance
                                </Text>
                            </View>

                            <View style={styles.benefitRow}>
                                <View style={styles.checkIcon} />
                                <Text style={styles.benefit}>
                                    Instant Detailed Feedback
                                </Text>
                            </View>

                            <View style={styles.benefitRow}>
                                <View style={styles.checkIcon} />
                                <Text style={styles.benefit}>
                                    Advanced Performance Analytics
                                </Text>
                            </View>

                            <View style={styles.benefitRow}>
                                <View style={styles.checkIcon} />
                                <Text style={styles.benefit}>
                                    Multi language Practice
                                </Text>
                            </View>
                        </View>

                        {/* Secondary CTA */}
                        {
                            showContinueButton && <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancel}>
                                    Continue with Limited Access
                                </Text>
                            </TouchableOpacity>
                        }

                        {/* Primary CTA */}
                        <TouchableOpacity
                            style={styles.ctaButtonWrapper}
                            onPress={() => {
                                navigation.navigate('pricing');
                                onClose();
                            }}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['rgba(131, 102, 6, 1))', 'rgba(233, 181, 11, 1)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.ctaGradient}
                            >
                                <Text style={styles.ctaText}>
                                    Upgrade to Premium
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                    </ScrollView>

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
        padding: 16,
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
        marginBottom: 12,
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
        elevation: 2,
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
        marginBottom: 16,

    },
    cancel: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '700',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 6,
    },
    closeIcon: {
        fontSize: 20,
        fontWeight: '900',
        color: '#374151',
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 12,
        marginTop: 0,
        alignSelf: 'flex-start',
    },
});