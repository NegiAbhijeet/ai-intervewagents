import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const MainButton = ({ outline = false, onPress = () => { }, text = "" }) => {
    return (
        <Pressable
            style={outline ? styles.secondaryButton : styles.primaryButton}
            onPress={onPress}
        >
            <Text style={outline ? styles.secondaryButtonText : styles?.primaryButtonText}>
                {text}
            </Text>
        </Pressable>
    )
}

export default MainButton

const styles = StyleSheet.create({
    primaryButton: {
        width: '85%',
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,1)',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 27.2
    },
    secondaryButton: {
        width: '85%',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,1)',
    },
    secondaryButtonText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 27.2
    },
})