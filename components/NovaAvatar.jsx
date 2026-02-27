import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";

const AVATAR_SIZE = 70;
const WAVE_COUNT = 3;

export default function NovaAvatar({ status }) {
    const waves = useRef(
        [...Array(WAVE_COUNT)].map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        if (status === "ai-speaking") {
            const animations = waves.map((anim, index) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(index * 300),
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 1200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ])
                )
            );

            animations.forEach(a => a.start());
        } else {
            waves.forEach(anim => {
                anim.stopAnimation();
                anim.setValue(0);
            });
        }
    }, [status]);

    return (
        <View style={styles.container}>
            <View style={styles.novaCard}>

                {/* AVATAR + WAVES */}
                <View style={styles.avatarWrapper}>

                    {/* 🌊 WAVES (BEHIND AVATAR) */}
                    {status === "ai-speaking" &&
                        waves.map((anim, index) => {
                            const scale = anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.5],
                            });

                            const opacity = anim.interpolate({
                                inputRange: [0, 0.6, 1],
                                outputRange: [0.5, 0.25, 0],
                            });

                            return (
                                <Animated.View
                                    key={index}
                                    pointerEvents="none"
                                    style={[
                                        styles.wave,
                                        {
                                            transform: [{ scale }],
                                            opacity,
                                        },
                                    ]}
                                />
                            );
                        })}

                    {/* 🧠 AVATAR */}
                    <View style={styles.avatarCircle}>
                        <Image
                            source={require("../assets/images/nova-avatar.jpeg")}
                            style={styles.avatarImage}
                        />
                    </View>
                </View>

                <Text style={styles.avatarName}>Nova</Text>
            </View>

            <Text style={styles.speakingText}>
                {status === "recording"
                    ? "Listening..."
                    : status === "ai-speaking"
                    ? "Nova Speaking..."
                    : ""}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        alignSelf: "flex-end",
    },

    novaCard: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        height: 130,
        width: 130,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
        backgroundColor: "#FFFFFF",
    },

    avatarWrapper: {
        position: "relative",
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },

    avatarCircle: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        overflow: "hidden",
        zIndex: 2,
    },

    avatarImage: {
        width: "100%",
        height: "100%",
    },

    wave: {
        position: "absolute",
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "rgba(0,0,0,0.85)", // black ring
        zIndex: 1,
    },

    avatarName: {
        marginTop: 6,
        fontWeight: "600",
    },

    speakingText: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
});