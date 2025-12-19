import Ionicons from "@react-native-vector-icons/ionicons";
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SelectInterviewType({ onClose, setSelectedInterviewType }) {
    const [selectedValue, setSelectedValue] = useState("technical");
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
                style={[
                    styles.card,
                    // isSelected && styles.cardSelected,
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        <Ionicons name={icon} size={16} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardDuration}>{duration}</Text>
                    </View>

                    <View style={[styles.radio]}>
                        <View style={isSelected ? styles.radioSelected : { display: "none" }}></View>
                    </View>
                </View>

                <Text style={styles.cardDescription}>{description}</Text>

                <View style={styles.tagRow}>
                    {tags.map(tag => (
                        <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ width: "100%", height: 1, backgroundColor: "rgba(0, 0, 0, 0.1)", marginVertical: 14 }}></View>

                <View style={styles.badgeRow}>
                    <Text style={styles.badgeIconSmall}>{badgeIcon}</Text>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
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
                }}
                onPress={onClose}
            >
                <Ionicons name="close" size={28} color="#000" />
            </Pressable>
            <Text style={styles.title}>Select Interview Type</Text>
            <Text style={styles.subtitle}>
                Pick an interview type and start improving.
            </Text>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Card
                    id="technical"
                    title="Technical"
                    duration="10–15 mins"
                    description="Test your coding skills, algorithms, data structures, and system design knowledge with real-world technical challenges."
                    tags={["Algorithms", "Data Structures", "System Design"]}
                    badge="Most Challenging"
                    badgeIcon="⚡"
                    icon="code"
                />
                <Card
                    id="behavioral"
                    title="Behavioral"
                    duration="10–15 mins"
                    description="Practice answering questions about your past experiences, teamwork, leadership, and problem-solving abilities."
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
                onPress={() => setSelectedInterviewType(selectedValue)}
            >
                <Text style={styles.startButtonText}>Start Interview</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 20,
        textAlign: "center",
    },
    scrollContent: {
        paddingBottom: 24,
        padding: 16
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        boxShadow: "0px 8.19px 10.24px -6.14px rgba(0, 0, 0, 0.1), 0px 20.48px 25.6px -5.12px rgba(0, 0, 0, 0.1), 0px -1px 4px 0px rgba(0, 0, 0, 0.2)",
    },
    cardSelected: {
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
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
    iconText: {
        color: "#FFFFFF",
        fontSize: 16,
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
        display: "flex",
        borderColor: "rgba(60, 60, 60, 1)",
        backgroundColor: "rgba(60, 60, 60, 1)",
        width: 16,
        height: 16,
        borderRadius: 8,
        margin: 2,
    },
    cardDescription: {
        fontSize: 13,
        color: "#3A3A45",
        marginVertical: 10,
        lineHeight: 18,
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
        marginHorizontal: "auto"
    },
    startButtonDisabled: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    startButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
