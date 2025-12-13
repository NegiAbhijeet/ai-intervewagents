import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, View, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export function InModalBanner({
    visible,
    text = '',
    duration = 2000,
    onHidden
}) {
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(-20)).current

    useEffect(() => {
        let hideTimeout

        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start(() => {
                hideTimeout = setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true
                        }),
                        Animated.timing(translateY, {
                            toValue: -20,
                            duration: 200,
                            useNativeDriver: true
                        })
                    ]).start(() => {
                        if (onHidden) onHidden()
                    })
                }, duration)
            })
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true
            }).start()
        }

        return () => clearTimeout(hideTimeout)
    }, [visible, duration, onHidden, opacity, translateY])

    if (!visible) return null

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }]
                }
            ]}
        >
            <View style={styles.box}>
                <Text style={styles.text}>{text}</Text>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        width
    },
    box: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        maxWidth: width - 40
    },
    text: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14
    }
})
