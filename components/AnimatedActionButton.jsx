import React, { useEffect, useRef } from 'react';
import {
    Animated,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedActionButton = ({
    enabled,
    onPress,
    text = "Stop Speaking",
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const animationRef = useRef(null);

    useEffect(() => {
        if (enabled) {
            animationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.04,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            );
            animationRef.current.start();
        } else {
            animationRef.current?.stop();
            scaleAnim.setValue(1);
        }

        return () => animationRef.current?.stop();
    }, [enabled]);

    return (
        <Animated.View
            style={[
                styles.wrapper,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.85}
                disabled={!enabled}
                onPress={onPress}
                style={{ opacity: enabled ? 1 : 0.6 }}
            >
                <LinearGradient
                    colors={enabled ? ['#2EC4F3', '#3A6BFF'] : ['#8c8c8c', '#a9a9a9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                >
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 14,
                        paddingHorizontal: 32,
                    }}>
                        <Image
                            source={require('../assets/images/pause.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.text}>{text}</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default AnimatedActionButton;

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    button: {
        borderRadius: 40,
        elevation: 5, // Android shadow
        shadowColor: '#3A6BFF', // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },

    icon: {
        width: 18,
        height: 18,
        tintColor: '#FFFFFF',
    },

    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});