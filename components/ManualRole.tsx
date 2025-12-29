import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    TouchableOpacity,
} from "react-native";

const ManualRole = ({
    visible,
    onClose,
    onSave,
    customRole,
    setCustomRole,
    customError,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 100,
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            borderRadius: 999,
                            padding: 4,
                        }}
                    >
                        <Ionicons name="close" size={22} color="gray" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Add Role</Text>

                    <TextInput
                        placeholder="Type your Role"
                        value={customRole}
                        onChangeText={setCustomRole}
                        style={styles.input}
                        placeholderTextColor={"gray"}
                    />
                    {customError ? (
                        <Text style={{ color: "red", marginBottom: 8, textAlign: "center" }}>
                            {customError}
                        </Text>
                    ) : null}


                    <Pressable
                        style={styles.saveBtn}
                        onPress={() => {
                            onSave();
                        }}
                    >
                        <Text style={styles.saveText}>Save</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default ManualRole;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCard: {
        width: "85%",
        backgroundColor: "rgba(217, 217, 217, 1)",
        borderRadius: 16,
        padding: 16,
        paddingTop: 32,

    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 20,
        textAlign: "center",
        color: "rgba(0, 0, 0, 1)"
    },
    input: {
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.25)",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: 8,
        marginBottom: 10,
        color: "black",
        fontSize: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        boxShadow: "0px 3.83px 3.83px 0px rgba(37, 73, 150, 0.1)"
    },
    saveBtn: {
        backgroundColor: "#000",
        paddingVertical: 10,
        paddingHorizontal: 26,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
        marginHorizontal: "auto",
    },
    saveText: {
        color: "#fff",
        fontWeight: 400,
        fontSize: 14
    },
});
