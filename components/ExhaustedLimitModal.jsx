import React from 'react'
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import BackgroundGradient2 from './backgroundGradient2'
import LinearGradient from 'react-native-linear-gradient'

const ExhaustedLimitModal = ({
    visible,
    onClose,
    onUpgradePress,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <BackgroundGradient2 />
                <TouchableOpacity
                    onPress={onClose}
                    accessibilityRole="button"
                    style={styles.closeButton}
                >
                    <Ionicons name="close" size={30} color="#475569" />
                </TouchableOpacity>
                <View style={styles.container}>
                    <Text style={styles.heading}>
                        You've reached free limit
                    </Text>

                    <Text style={styles.description}>
                        Upgrade to Premium for 200 monthly minutes and uninterrupted practice.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onUpgradePress}
                        accessibilityRole="button"
                    >
                        <LinearGradient
                            colors={['rgba(233, 181, 11, 1)', 'rgba(232, 207, 125, 1)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: "#E9B50B",

                            }}
                        >
                            <Text style={styles.buttonText}>Unlock Premium</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export default ExhaustedLimitModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: 327,
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
    },

    closeButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        borderWidth: 0.3,
        borderColor: "gray",
        borderRadius: 9999,
        padding: 5
    },

    heading: {
        width: 295,
        height: 30,
        justifyContent: 'center',
        color: '#0F172A',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 30,
        marginTop: 16,
    },

    description: {
        width: 290,
        height: 52,
        justifyContent: 'center',
        color: '#475569',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 26,
        marginTop: 12,
    },

    button: {
        width: "100%",
        height: 56,
        marginTop: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 14
        // overflow: "hidden"
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
})
