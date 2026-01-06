import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";

export default function CustomAlert({
    visible,
    title = "Error",
    message = "",
    onClose,
}) {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{title}</Text>

                    <Text style={styles.message}>{message}</Text>
                    <Pressable
                        onPress={onClose}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </Pressable>

                </View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
    },

    alertBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 22,
        paddingHorizontal: 18,

        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },

    title: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        color: "#111",
        marginBottom: 10,
    },

    message: {
        fontSize: 14,
        color: "#444",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },

    button: {
        alignSelf: "center",
        backgroundColor: "#000",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
    },

    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
