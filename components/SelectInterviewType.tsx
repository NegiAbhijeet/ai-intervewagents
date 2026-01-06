import Ionicons from "@react-native-vector-icons/ionicons";
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import DifficultyDropdown from "../components/DifficultyDropdown";
import Layout from "../pages/Layout";
import CustomAlert from "./CustomAlert"
const OPTIONS = ["Easy", "Hard"];

export default function SelectInterviewType({ onClose, setSelectedInterviewType, handleSubmit, type, error, setError }) {
    const [selectedValue, setSelectedValue] = useState("Technical");
    const [difficulty, setDifficulty] = useState(OPTIONS[0] || "Easy");

    const Card = ({
        id,
        title,
        duration,
        description,
        tags,
        badge,
        badgeIcon,
        icon
    }) => {
        const isSelected = selectedValue === id;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedValue(id)}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        <Ionicons name={icon} size={16} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardDuration}>{duration}</Text>
                    </View>

                    <View style={styles.radio}>
                        <View style={isSelected ? styles.radioSelected : { display: "none" }} />
                    </View>
                </View>

                <Text style={styles.cardDescription}>{description}</Text>

                {/* <View style={styles.tagRow}>
                    {tags.map(tag => (
                        <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View> */}

                <View style={{ width: "100%", height: 1, backgroundColor: "rgba(0, 0, 0, 0.1)", marginVertical: 14 }} />

                <View style={styles.badgeRow}>
                    <Text style={styles.badgeIconSmall}>{badgeIcon}</Text>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={true} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent={true}>
            <CustomAlert
                visible={!!error}
                message={error}
                onClose={() => setError("")}
            />
            <Layout removePadding={true}>
                <SafeAreaView style={styles.container}>
                    <Pressable
                        style={{
                            borderWidth: 0.8,
                            borderColor: "rgba(217, 217, 217, 1)",
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 8,
                            marginLeft: 16,
                        }}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={28} color="#000" />
                    </Pressable>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.title}>Select Interview Type</Text>
                        <Text style={styles.subtitle}>
                            Pick an interview type and start improving.
                        </Text>

                        <View style={{ marginVertical: 32 }}>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "rgba(60, 60, 60, 1)",
                                    marginBottom: 8,
                                    fontWeight: 600
                                }}
                            >
                                Choose Difficulty
                            </Text>

                            <View style={styles.difficultyRow}>
                                {OPTIONS.map(option => {
                                    const isSelected = difficulty === option;

                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            activeOpacity={0.9}
                                            onPress={() => setDifficulty(option)}
                                            style={[
                                                styles.difficultyCard,
                                                isSelected && styles.difficultyCardSelected,
                                            ]}
                                        >
                                            <View style={styles.radio}>
                                                {isSelected && <View style={styles.radioSelected} />}
                                            </View>

                                            <Text
                                                style={[
                                                    styles.difficultyText,
                                                    isSelected && styles.difficultyTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <Card
                            id="Technical"
                            title="Technical"
                            duration="10–15 mins"
                            description="Evaluation of your specific skills and problem-solving abilities to ensure you can perform the core tasks of the job."
                            tags={["Algorithms", "Data Structures", "System Design"]}
                            badge="Most Challenging"
                            badgeIcon="⚡"
                            icon="code"
                        />

                        <Card
                            id="Behavioural"
                            title="Behavioural"
                            duration="10–15 mins"
                            description="Discussion of your past experiences and soft skills to determine how you handle work challenges and fit into the company culture."
                            tags={["Leadership", "Teamwork", "Communication"]}
                            badge="Popular Choice"
                            badgeIcon="🔥"
                            icon="people"
                        />
                    </ScrollView>

                    <TouchableOpacity
                        disabled={!selectedValue}
                        style={[
                            styles.startButton,
                            !selectedValue && styles.startButtonDisabled,
                        ]}
                        onPress={() => { setSelectedInterviewType(selectedValue); handleSubmit(type, selectedValue, difficulty) }}
                    >
                        <Text style={styles.startButtonText}>Start Interview</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Layout>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
        // backgroundColor: "#FFFFFF",
        paddingHorizontal: 12
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "rgba(60, 60, 60, 1)",
        width: "100%",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 400,
        color: "rgba(0, 0, 0, 0.8)",
        marginTop: 6,
        textAlign: "center",
    },
    scrollContent: {
        paddingBottom: 24,
        paddingHorizontal: 16,
        paddingVertical: 4
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        boxShadow: "0px 8.19px 10.24px -6.14px rgba(0, 0, 0, 0.1), 0px 20.48px 25.6px -5.12px rgba(0, 0, 0, 0.1), 0px -1px 4px 0px rgba(0, 0, 0, 0.2)",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#6C4CF1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    cardDuration: {
        fontSize: 12,
        color: "#5E5E6F",
        marginTop: 2,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#8f8fa3ff",
    },
    radioSelected: {
        backgroundColor: "rgba(60, 60, 60, 1)",
        width: 16,
        height: 16,
        borderRadius: 8,
        margin: 2,
    },
    cardDescription: {
        fontSize: 14,
        color: "#3A3A45",
        marginTop: 10,
        lineHeight: 18,
        fontWeight: 400,
    },
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: "rgba(217, 217, 217, 0.3)",
    },
    tagText: {
        fontSize: 12,
        color: "rgba(60, 60, 60, 1)",
        fontWeight: 500
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    badgeIconSmall: {
        marginRight: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "rgba(60, 60, 60, 0.9)",
    },
    startButton: {
        height: 52,
        borderRadius: 16,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        width: "85%",
        alignSelf: "center",
        marginVertical: 10
    },
    startButtonDisabled: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    startButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    difficultyRow: {
        flexDirection: "row",
        gap: 12,
    },

    difficultyCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#D1D1D6",
        backgroundColor: "#FFFFFF",
    },

    difficultyCardSelected: {
        borderColor: "rgba(60, 60, 60, 1)",
        backgroundColor: "rgba(0, 0, 0, 0.03)",
    },

    difficultyText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#3A3A45",
        marginLeft: 10,
    },

    difficultyTextSelected: {
        fontWeight: "600",
        color: "rgba(60, 60, 60, 1)",
    },

});
