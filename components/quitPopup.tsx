import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function ExitInterviewModal({  onContinue, onQuit }) {


    return (
        <View style={styles.overlay}>
            <View style={styles.container}>

                <Text style={styles.title}>Do you want to exit now?</Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onQuit}
                    >
                        <Text style={styles.primaryText}>
                            Yes
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onContinue}
                    >
                        <Text style={styles.secondaryText}>
                            No
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 999
    },

    container: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#ffffff',
        borderRadius: 18,
        paddingVertical: 28,
        paddingHorizontal: 24,
        alignItems: 'center',
        elevation: 10
    },

    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12
    },

    title: {
        fontSize: 20,
        fontWeight: '500',
        color: '#111',
        marginBottom: 20,
        textAlign: 'center'
    },

    primaryButton: {
        flex: 1,
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center'
    },

    secondaryButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center'
    },

    primaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },

    secondaryText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600'
    }

})