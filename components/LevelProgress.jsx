import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

const MAX_SCORE = 1000

const getLevelStyles = (percent) => {
    if (percent < 30) {
        return {
            borderColor: '#C084FC',
            gradient: ['#C084FC', '#A855F7'],
            textColor: "#8063B7"
        }
    }

    if (percent < 70) {
        return {
            borderColor: '#38BDF8',
            gradient: ['#38BDF8', '#0EA5E9'],
            textColor: "#0EA5E9"
        }
    }

    return {
        borderColor: '#22C55E',
        gradient: ['#22C55E', '#16A34A'],
        textColor: "#10E90C"
    }
}

const LevelProgress = ({ rating = 0 }) => {
    const safeRating = Math.max(0, Math.min(rating, MAX_SCORE))
    const percent = (safeRating / MAX_SCORE) * 100
    const { borderColor, gradient, textColor } = getLevelStyles(percent)

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: textColor }]}>Level Progress</Text>
                <Text style={[styles.score, { color: textColor }]}>{safeRating}/{MAX_SCORE}</Text>
            </View>

            <View style={[styles.progressBar]}>
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.progressFill,
                        { width: `${percent}%` },
                        { borderColor }
                    ]}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "77%",
        minWidth: 250,
        marginVertical: 24,
        gap: 12,
        alignSelf: "center"
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    title: {
        fontSize: 14,
        fontWeight: '500',
    },

    score: {
        fontSize: 14,
        fontWeight: '500',
    },

    progressBar: {
        width: '100%',
        height: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.10)",
        backgroundColor: '#F2F2F2',
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 8,
    },
})

export default LevelProgress
