import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, View, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export function InModalBanner({ visible, text = '', duration = 2000, onHidden }) {
    const opacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        let hideTimeout
        if (visible) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            }).start(() => {
                hideTimeout = setTimeout(() => {
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true
                    }).start(() => {
                        if (onHidden) onHidden()
                    })
                }, duration)
            })
        } else {
            // hide immediately if visible toggled off
            Animated.timing(opacity, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true
            }).start()
        }

        return () => clearTimeout(hideTimeout)
    }, [visible, duration, opacity, onHidden])

    if (!visible) return null

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <View style={styles.box}>
                <Text style={styles.text}>{text}</Text>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        width
    },
    box: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        maxWidth: width - 60
    },
    text: {
        color: '#fff',
        textAlign: 'center'
    }
})
