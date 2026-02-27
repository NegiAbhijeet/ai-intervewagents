import React, { useEffect, useRef } from 'react';
import {
    Animated,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

const AnimatedActionButton = ({
    enabled,
    onPress,
    style,
    disabledStyle,
    children,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const animationRef = useRef(null);

    useEffect(() => {
        if (enabled) {
            animationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.02,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 450,
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
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={onPress}
                disabled={!enabled}
                activeOpacity={0.8}
                style={[style, !enabled && disabledStyle]}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default AnimatedActionButton;