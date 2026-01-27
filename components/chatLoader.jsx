import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const Dot = ({ delay }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return <Animated.View style={[styles.dot, { opacity }]} />;
};

const ChatLoader = () => {
    return (
        <View style={styles.container}>
            <Dot delay={0} />
            <Dot delay={150} />
            <Dot delay={300} />
        </View>
    );
};

export default ChatLoader;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderRadius: 9,
        width: 120,
        marginVertical: 8,
        borderTopLeftRadius: 0
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#000",
        marginHorizontal: 4,
    },
});
