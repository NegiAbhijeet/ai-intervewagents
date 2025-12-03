import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Shadow } from 'react-native-shadow-2'

const PENGUIN = require('../assets/images/quitPeng.png')

export default function ExitInterviewModal({ onContinue, onQuit }) {
    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                <View style={styles.topBar} />
                <Image source={PENGUIN} style={styles.penguin} resizeMode="contain" />

                <Text style={styles.title}>Leaving already?</Text>
                <Text style={styles.subtitle}>Do you want to continue your interview or exit?</Text>

                <Shadow
                    distance={5}
                    startColor="rgba(255,255,255,0.08)"
                    finalColor="rgba(0,0,0,0)"
                    offset={[0, 1]}
                    radius={12}
                    style={styles.shadowWrapper}
                >
                    <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
                        <Text style={styles.primaryText}>Continue Interview</Text>
                    </TouchableOpacity>
                </Shadow>

                <TouchableOpacity style={styles.ghostButton} onPress={onQuit}>
                    <Text style={styles.ghostText}>Quit Interview</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        zIndex: 1111,
        width: "100%"
    },
    container: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 18,
        paddingVertical: 28,
        paddingHorizontal: 22,
        paddingTop: 0,
        alignItems: 'stretch', // allow children to use full width

        // New styling from Figma
        backgroundColor: 'rgba(0, 0, 0, 0.93)',
        borderWidth: 1,
        borderColor: 'rgba(60, 60, 60, 1)',
        shadowColor: 'rgba(0, 0, 0, 1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 20,
    },
    topBar: {
        height: 3,
        width: 30,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 2,
        marginTop: 5,
        marginBottom: 16
    },
    penguin: {
        width: 76,
        height: 76,
        marginBottom: 12,
        marginHorizontal: "auto"
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: {
        color: '#cfcfcf',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20
    },

    // Shadow wrapper style. Width 100 percent plus borderRadius keeps shadow aligned with button
    shadowWrapper: {
        width: '100%',
        marginBottom: 12,
        borderRadius: 12,
        // no padding here so shadow matches the button box exactly
    },

    primaryButton: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center'
    },
    primaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    ghostButton: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)'
    },
    ghostText: {
        color: '#fff',
        opacity: 0.9,
        fontSize: 16,
        fontWeight: '600'
    },

    // helper to center a few items while keeping parent allow full width
    centered: {
        alignSelf: 'center'
    }
})
