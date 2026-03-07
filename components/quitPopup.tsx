import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function ExitInterviewModal({ onContinue, onQuit }) {
    return (
        <View style={styles.overlay}>
            <View style={styles.container}>

                <Text style={styles.title}>Do you want to exit now?</Text>

                <View style={styles.buttonRow}>

                    <TouchableOpacity
                        style={styles.yesButton}
                        onPress={onQuit}
                    >
                        <Text style={styles.yesText}>Yes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.noButton}
                        onPress={onContinue}
                    >
                        <Text style={styles.noText}>No</Text>
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
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 999
    },

    container: {
        width: '85%',
        maxWidth: 360,
        backgroundColor: '#071426',   // dark navy like screenshot
        borderRadius: 18,
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },

    title: {
        fontSize: 22,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 28,
        fontWeight: '500'
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    yesButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#8AA4C8',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 12,
    },

    noButton: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },

    yesText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500'
    },

    noText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '500'
    }

})