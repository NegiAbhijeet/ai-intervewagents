import React from 'react'
import { View, Text, Pressable, StyleSheet, Modal, Dimensions, ScrollView, Image } from 'react-native'
import Animated, { scrollTo, useAnimatedRef, useDerivedValue, useSharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const PRIMARY = 'rgba(197, 131, 40, 1)'
const INACTIVE_BG = 'rgba(156, 163, 175, 1)'
const MUTED_TEXT = '#8A8A8A'
const itemWidth = 70

export default function StreakProgress({ visible = true, daysCount = 100, currentDay = 1, onStart = () => { } }) {
    const days = Array.from({ length: daysCount }, (_, i) => i + 1)
    const animatedRef = useAnimatedRef();
    useDerivedValue(() => {
        const offset = (currentDay - 1) * itemWidth - width / 2 + itemWidth / 2;
        scrollTo(animatedRef, 0, offset + (width / 2), true);
    });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Pressable onPress={() => { }} style={styles.closeButton}>
                        <Text style={styles.closeText}>×</Text>
                    </Pressable>

                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Start Your Journey!</Text>
                    </View>

                    <Text style={styles.subtitle}>Complete a 15min Interview to get started</Text>

                    <Animated.ScrollView
                        ref={animatedRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >

                        <View style={styles.progressContainer}>
                            {days.map((day, index) => {
                                const isDone = day <= currentDay
                                const isCurrent = day === currentDay

                                return (
                                    <View key={day} style={styles.dayWrapper}>
                                        {index > 0 && (

                                            <View style={[
                                                styles.connector,
                                                isDone || isCurrent ? styles.connectorActive : styles.connectorInactive
                                            ]} />
                                        )}
                                        {
                                            currentDay === day && <View style={{ position: "absolute", bottom: "100%" }}>
                                                <Image
                                                    source={require('../assets/images/streakFlame.png')}
                                                    style={{ width: 58, height: 74, resizeMode: 'contain' }}
                                                />
                                                <Text style={{ position: "absolute", bottom: 5, fontSize: 24, color: "rgba(207, 139, 43, 1)", fontWeight: 700, left: "50%", transform: [{ translateX: "-50%" }] }}>{currentDay}</Text>
                                            </View>
                                        }

                                        <View style={[
                                            styles.circle,
                                            isDone ? styles.circleDone : styles.circleInactive
                                        ]}>
                                            <View style={[styles.innerBlackcircle, isDone ? {} : styles.circleFirstInactive]}>
                                                <View style={[styles.innerPrimarycircle, isDone ? {} : styles.circleSecondInactive]}></View>
                                            </View>
                                        </View>

                                        < Text style={[styles.dayLabel, isCurrent && styles.dayLabelCurrent]} > Day{day}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </Animated.ScrollView>

                    <Pressable style={styles.button} onPress={onStart}>
                        <Text style={styles.buttonText}>Start Interview</Text>
                    </Pressable>
                </View >
            </View >
        </Modal >
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    card: {
        width: "100%",
        minHeight: '50%',
        backgroundColor: '#000',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center'
    },
    headerRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff'
    },
    closeButton: {
        position: 'absolute',
        left: 20,
        top: 15,
        zIndex: 10,
        padding: 10,
    },
    closeText: {
        color: '#fff',
        fontSize: 30,
        lineHeight: 30,
    },
    subtitle: {
        color: MUTED_TEXT,
        marginTop: 8,
        marginBottom: 30,
        fontSize: 14,
    },

    progressContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: "flex-end",
        paddingBottom: 40,
        minHeight: 140,
        transform: [{ translateX: width / 2 }]
    },

    dayWrapper: {
        height: 60,
        width: itemWidth,
        alignItems: 'center',
        position: 'relative',
    },

    connector: {
        position: 'absolute',
        left: -30,
        width: '100%',
        top: 16,
        height: 8,
        zIndex: 1,
    },
    connectorActive: {
        backgroundColor: PRIMARY
    },
    connectorInactive: {
        backgroundColor: INACTIVE_BG
    },

    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderWidth: 0,
        position: 'absolute',
        top: 4,
    },
    innerBlackcircle: {
        width: 26,
        height: 26,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        borderWidth: 0,
        position: 'absolute',
        top: 3,
        backgroundColor: "black"
    },
    innerPrimarycircle: {
        width: 16,
        height: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 4,
        borderWidth: 0,
        position: 'absolute',
        top: 5,
        backgroundColor: PRIMARY
    },
    circleDone: {
        backgroundColor: PRIMARY,
    },

    circleInactive: {
        backgroundColor: INACTIVE_BG,
    },
    circleFirstInactive: {
        backgroundColor: "black",
    },
    circleSecondInactive: {
        backgroundColor: INACTIVE_BG
    },
    circleText: {
        fontWeight: '700',
        fontSize: 14,
    },
    circleTextDone: {
        color: '#fff',
    },
    circleTextInactive: {
        color: '#D3D3D3',
    },

    flameCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 2,
        position: 'absolute',
        top: -10,
    },
    flameCircleText: {
        color: PRIMARY,
        fontSize: 24,
        fontWeight: '900',
    },

    dayLabel: {
        color: MUTED_TEXT,
        fontSize: 12,
        position: 'absolute',
        bottom: 0,
    },
    dayLabelCurrent: {
        color: '#fff',
        fontWeight: '700',
    },

    button: {
        backgroundColor: PRIMARY,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 36,
        width: '80%',
        alignItems: 'center',
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 20
    }
})