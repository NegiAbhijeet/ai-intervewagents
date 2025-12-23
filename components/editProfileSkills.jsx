import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, { useState } from "react";
import Layout from "../pages/Layout";
import Ionicons from "@react-native-vector-icons/ionicons";
import { API_URL } from "./config";
import fetchWithAuth from "../libs/fetchWithAuth";
import Toast from "react-native-toast-message";

const MAX_SKILLS = 5;

const EditProfileSkills = ({
    visible,
    onClose,
    allSkills,
    searchValue = "",
    onSearchChange,
    myCandidate,
    setMyCandidate
}) => {
    const [selectedSkills, setSelectedSkills] = useState(
        myCandidate?.requiredSkills || []
    );
    const normalizedInput = searchValue.trim().toLowerCase();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = React.useState("");

    const filteredSkills =
        normalizedInput.length > 0
            ? allSkills.filter(
                skill =>
                    skill.toLowerCase().includes(normalizedInput) &&
                    !selectedSkills.includes(skill)
            )
            : [];

    const canAddMore = selectedSkills.length < MAX_SKILLS;

    const canAddCustomSkill =
        normalizedInput.length > 0 &&
        !allSkills.some(
            skill => skill.toLowerCase() === normalizedInput
        ) &&
        !selectedSkills.some(
            skill => skill.toLowerCase() === normalizedInput
        );
    function handleError(errorMessage) {
        setError(errorMessage);

        setTimeout(() => {
            setError("");
        }, 2000);
    }
    const handleAddSkill = skill => {
        if (selectedSkills.length >= MAX_SKILLS) {
            handleError("You can only add up to 5 skills");
            return;
        }

        setSelectedSkills(prev => [...prev, skill]);
    };

    async function handleSubmit() {
        try {
            if (selectedSkills.length === 0) {
                handleError("Add at least one skill");
                return
            }
            const payload = {
                skills: selectedSkills,
                uid: myCandidate?.uid,
                canId: myCandidate?.canId,
            }

            setIsLoading(true)
            const url = `${API_URL}/candidate/update/`
            const response = await fetchWithAuth(url, {
                method: 'Patch',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.error || 'Update failed');
            }
            Toast.show({ type: 'success', text1: 'Profile updated!' })
            setMyCandidate((prev) => ({
                ...prev,
                requiredSkills: selectedSkills,
            }));
            onClose();
        } catch (error) {
            console.error(error)
            Toast.show({ type: 'error', text1: 'Failed to update profile' })
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Layout>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Pressable onPress={onClose}>
                                <Text style={styles.close}>✕</Text>
                            </Pressable>

                            <Text style={styles.title}>
                                Edit Skills
                            </Text>

                            <Pressable onPress={handleSubmit} disabled={isLoading}>
                                <Text style={styles.done}>{isLoading ? "Wait..." : "Done"}</Text>
                            </Pressable>
                        </View>

                        <View style={styles.selectedWrapper}>
                            <View style={styles.selectedRow}>
                                {selectedSkills.length === 0 ? <Text>Add at least one skill</Text> : selectedSkills.map((skill, i) => (
                                    <View key={i} style={styles.selectedItem}>
                                        <Text style={styles.selectedText}>{skill}</Text>

                                        <Pressable
                                            onPress={() =>
                                                setSelectedSkills(prev =>
                                                    prev.filter(s => s !== skill)
                                                )
                                            }
                                            style={styles.removeButton}
                                        >
                                            <Text style={styles.removeIcon}>✕</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        </View>


                        <View style={styles.searchWrapper}>
                            <Ionicons
                                name="search"
                                size={18}
                                color="rgba(60, 60, 60, 1)"
                                style={styles.searchIcon}
                            />

                            <TextInput
                                placeholder="Search or add skill"
                                value={searchValue}
                                onChangeText={onSearchChange}
                                style={styles.searchInput}
                                placeholderTextColor="rgba(60, 60, 60, 1)"
                            />
                        </View>

                        <ScrollView>
                            <View style={{ paddingHorizontal: 16, gap: 6 }}>
                                {filteredSkills.map((skill, i) => (
                                    <Pressable key={i} style={styles.row}
                                        // disabled={!canAddMore}
                                        onPress={() => handleAddSkill(skill)}>
                                        <Text style={styles.skill}>{skill}</Text>
                                        <View
                                        >
                                            <Text
                                                style={[
                                                    styles.add,
                                                    !canAddMore && styles.disabled,
                                                ]}
                                            >
                                                +
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))}
                                {/* 
                                {canAddCustomSkill && canAddMore && (
                                    <View style={styles.row}>
                                        <Text style={styles.skill}>
                                            Add "{searchValue}"
                                        </Text>

                                        <Pressable
                                            onPress={() =>
                                                handleAddSkill(searchValue.trim())
                                            }
                                        >
                                            <Text style={styles.add}>+</Text>
                                        </Pressable>
                                    </View>
                                )} */}

                                {error.length > 0 && (
                                    <Text style={styles.errorText}>
                                        {error}
                                    </Text>
                                )}

                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Layout>
        </Modal>
    );
};

export default EditProfileSkills;


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    container: {
        paddingBottom: 24,
        height: "100%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        marginBottom: 18,
    },
    close: {
        fontSize: 18,
        borderColor: "rgba(217, 217, 217, 1)",
        borderWidth: 1,
        borderRadius: 999,
        height: 40,
        width: 40,
        textAlign: "center",
        textAlignVertical: "center",
        fontWeight: 600
    },
    title: {
        fontSize: 20,
        fontWeight: 600,
    },
    done: {
        color: "rgba(60, 60, 60, 1)",
        fontSize: 16,
        fontWeight: 600,
        color: "rgba(60, 60, 60, 1)",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 9,
        borderColor: "rgba(217, 217, 217, 1)",
        borderWidth: 1
    },
    selectedWrapper: {
        padding: 18,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        borderColor: "rgba(255, 255, 255, 0.4)",
        borderWidth: 1,
        boxShadow: "0px 3.96px 15.83px 0px rgba(251, 207, 232, 0.2),0px 7.92px 31.67px 0px rgba(147, 197, 253, 0.3)",
        marginBottom: 30
    },
    selectedRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    selectedItem: {
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    selectedText: {
        fontSize: 12,
    },
    removeButton: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 14,
        height: 14,
        borderRadius: 999,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },

    removeIcon: {
        color: "#fff",
        fontSize: 6,
        marginBottom: 1
    },
    searchWrapper: {
        position: "relative",
        paddingHorizontal: 16,
        paddingBottom: 8,
    },

    searchIcon: {
        position: "absolute",
        left: 32,
        top: "52%",
        transform: [{ translateY: -9 }],
    },

    searchInput: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 12,
        paddingLeft: 44,
        paddingRight: 12,
        paddingVertical: 12,
        fontSize: 12,
        borderColor: "rgba(217, 217, 217, 1)",
        borderWidth: 1
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "rgba(217, 217, 217, 1)",
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        borderRadius: 10
    },
    skill: {
        fontSize: 14,
    },
    add: {
        fontSize: 18,
        color: "rgba(60, 60, 60, 1)",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        textAlign: "center",
        marginBottom: 12,
    },
});
