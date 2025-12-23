import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

export default function DifficultyDropdown({ value, onChange, OPTIONS }) {
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });

    useEffect(() => {
        if (visible && triggerRef.current) {
            triggerRef.current.measure((fx, fy, width, height, px, py) => {
                setPosition({
                    x: px,
                    y: py + height + 4,
                    width,
                });
            });
        }
    }, [visible]);

    return (
        <View>
            <TouchableOpacity
                ref={triggerRef}
                activeOpacity={0.8}
                style={styles.trigger}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.triggerText}>{value}</Text>
                <Ionicons name="chevron-down" size={18} color="rgba(60, 60, 60, 1)" />
            </TouchableOpacity>

            {visible && (
                <Modal transparent animationType="fade">
                    <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                        <View style={styles.overlay}>
                            <View
                                style={[
                                    styles.dropdown,
                                    {
                                        top: position.y,
                                        left: position.x,
                                        width: position.width,
                                    },
                                ]}
                            >
                                {OPTIONS.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.option}
                                        onPress={() => {
                                            onChange(option);
                                            setVisible(false);
                                        }}
                                    >
                                        <Text style={styles.optionText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    trigger: {
        height: 44,
        borderWidth: 1,
        borderColor: "rgba(217, 217, 217, 1)",
        borderRadius: 18,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
    },
    triggerText: {
        fontSize: 14,
        color: "rgba(60, 60, 60, 1)",
        fontWeight: 400
    },
    overlay: {
        flex: 1,
    },
    dropdown: {
        position: "absolute",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    optionText: {
        fontSize: 14,
        color: "#1A1A1A",
    },
});
