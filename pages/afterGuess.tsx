// AfterGuessModal.js
import React, { useEffect, useRef, useState } from 'react'
import { Modal, Dimensions, Image, Animated, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import Layout from './Layout'
import { JAVA_API_URL } from '../components/config'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: SCREEN_W } = Dimensions.get('window')
const PENG_WIDTH = Math.min(320, Math.round(SCREEN_W * 0.30))

function parseRange(rangeString) {
    const matches = rangeString?.match(/(\d{1,3})\D+(\d{1,3})/)
    if (!matches) return null
    const low = parseInt(matches[1], 10)
    const high = parseInt(matches[2], 10)
    return { low, high }
}

const AfterGuessModal = ({
    visible = false,
    onRequestClose = () => { },
    onNext = () => { },
    guessedRange = '',
    interviewId = '',
    serverScore = null,
    setServerScore,
    maxTries = 10, // default 20 attempts -> 20 * 3s = 60s
    intervalMs = 3000
}) => {
    const navigation = useNavigation()
    const rotateAnim = useRef(new Animated.Value(0)).current
    const guessed = parseRange(guessedRange)

    const [status, setStatus] = useState('polling') // polling | ready | error | timeout
    const pollingRef = useRef(null)
    const isActiveRef = useRef(false)
    const attemptsRef = useRef(0)

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true
            })
        ).start()
    }, [rotateAnim])

    async function fetchOnce() {
        try {
            console.log("calling api with", interviewId, `${JAVA_API_URL}/api/meetings/${interviewId}`)
            const url = `${JAVA_API_URL}/api/meetings/${interviewId}`
            const res = await fetch(url)
            const result = await res.json()

            attemptsRef.current = attemptsRef.current + 1
            const report = result.data || {}

            // Case 1: Feedback available (final score ready)
            if (report?.feedback && typeof report.feedback.averagePercentage === 'number' && report?.streak !== null) {
                stopPolling()
                setServerScore(report.feedback.averagePercentage)
                setStatus('ready')
                return
            }

            // Case 2: API indicates error explicitly
            if (report?.error) {
                stopPolling()
                setStatus('error')
                return
            }

            // Case 3: Still processing
            if (attemptsRef.current >= maxTries) {
                stopPolling()
                setStatus('timeout')
            } else {
                setStatus('polling')
            }

        } catch (err) {
            attemptsRef.current = attemptsRef.current + 1

            // Network or unexpected failures count as errors
            stopPolling()
            setStatus('error')
        }
    }


    function startPolling() {
        // reset counters and states
        attemptsRef.current = 0
        setServerScore(null)
        setStatus('polling')
        isActiveRef.current = true
        // immediate check counts as first attempt
        fetchOnce()
        // start interval only if maxTries > 1
        if (maxTries > 1) {
            pollingRef.current = setInterval(() => {
                // guard if already stopped
                if (!isActiveRef.current) return
                // avoid extra requests if already exceeded
                if (attemptsRef.current >= maxTries) {
                    stopPolling()
                    setStatus('timeout')
                    return
                }
                fetchOnce()
            }, intervalMs)
        }
    }

    function stopPolling() {
        isActiveRef.current = false
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
    }

    // open / close effects
    useEffect(() => {
        if (visible) {
            startPolling()
        } else {
            stopPolling()
        }
        return () => stopPolling()
    }, [visible, interviewId, maxTries])

    function retryPolling() {
        // allow user to retry without re-opening modal
        attemptsRef.current = 0
        setServerScore(null)
        setStatus('polling')
        stopPolling()
        startPolling()
    }

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    const isGuessCorrect = () => {
        if (serverScore == null || !guessed) return false
        return serverScore >= guessed.low && serverScore <= guessed.high
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                stopPolling()
                onRequestClose()
            }}
        >
            <SafeAreaView
                style={{
                    flex: 1,
                }}
            >
                <Layout gradientType="3">
                    <View style={styles.container}>
                        <View style={styles.guessChipWrapper}>
                            <View style={styles.guessChip}>
                                <Text style={styles.guessChipText}>
                                    Your Guess: <Text style={styles.guessValue}>{guessedRange || '—'}</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.headerWrap}>
                            <Image source={require('../assets/images/afterGuessPeng.png')} style={styles.penguin} resizeMode="contain" />
                            <Text style={styles.title}>
                                {status !== 'ready'
                                    ? 'Keep going'
                                    : isGuessCorrect()
                                        ? 'Great guess'
                                        : 'Wrong guess'}
                            </Text>


                            <Text style={styles.subtitle}>
                                {status === 'ready' ? 'Here is your final score' : "We're calculating your real score..."}
                            </Text>
                        </View>
                        {
                            (status === "polling" || status === "ready") &&
                            <View style={styles.progressWrap}>
                                <Animated.Image
                                    source={require('../assets/images/Container.png')}
                                    style={[
                                        styles.progressRing,
                                        status !== 'ready' && { transform: [{ rotate }] }
                                    ]}
                                    resizeMode="contain"
                                />
                                <View style={styles.progressCenter}>
                                    {status === 'polling' && <>
                                        <Text style={styles.progressLabel}>Analyzing</Text>
                                    </>}

                                    {status === 'ready' && <>
                                        <Text style={styles.progressValue}>{serverScore}%</Text>
                                    </>}
                                </View>
                            </View>
                        }

                        <View style={styles.processingCard}>
                            {(status === "polling") && <Text style={styles.processingTitle}>Processing your interview data</Text>}

                            {status === 'ready' && (
                                <View style={{ marginTop: 12, alignItems: 'center' }}>
                                    <Text style={{ fontWeight: '700', marginBottom: 8 }}>
                                        {isGuessCorrect() ? 'Nice job. Your guess was correct.' : `Your guess was not correct. Final score ${serverScore}%`}
                                    </Text>

                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => {
                                            stopPolling()
                                            onNext()
                                        }} style={styles.nextButton}>
                                            <Text style={{ color: '#fff', fontWeight: '700' }}>Next</Text>
                                        </TouchableOpacity>

                                        {/* <TouchableOpacity onPress={() => {
                                        stopPolling()
                                        onRequestClose()
                                    }} style={styles.secondaryButton}>
                                        <Text style={{ color: '#6B21A8', fontWeight: '700' }}>Close</Text>
                                    </TouchableOpacity> */}
                                    </View>
                                </View>
                            )}

                            {(status === 'timeout' || status === 'error') && (
                                <View style={{ marginTop: 12, alignItems: 'center' }}>
                                    <Text style={{ marginBottom: 12, color: "red" }}>Error while creating the report.</Text>

                                    <View style={{ flexDirection: 'row' }}>
                                        {/* <TouchableOpacity onPress={retryPolling} style={styles.nextButton}>
                                        <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
                                    </TouchableOpacity> */}
                                        <TouchableOpacity onPress={() => {
                                            stopPolling()
                                            onRequestClose()
                                        }} style={styles.secondaryButton}>
                                            <Text style={{ color: '#6B21A8', fontWeight: '700' }}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                        </View>
                    </View>
                </Layout>
            </SafeAreaView>
        </Modal>
    )
}

export default AfterGuessModal

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', alignItems: 'center', paddingTop: 40 },
    guessChipWrapper: { position: 'absolute', right: 0, top: 12, borderRadius: 9999, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, backgroundColor: '#ffffff' },
    guessChip: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, overflow: 'hidden' },
    guessChipText: { fontSize: 12, fontWeight: '600' },
    guessValue: { color: '#6B21A8', fontWeight: '800' },
    headerWrap: { width: '85%', alignItems: 'center', marginTop: 6, marginBottom: 8 },
    penguin: { width: 170, height: 176, zIndex: 1, marginTop: 6 },
    title: { fontSize: 36, fontWeight: '700', marginTop: 6, color: "rgba(60, 60, 60, 1)" },
    subtitle: { fontSize: 18, color: 'rgba(60, 60, 60, 1)', marginTop: 6, fontWeight: '500' },
    progressWrap: { width: '100%', alignItems: 'center', marginTop: 12, position: 'relative', height: 200, justifyContent: 'center' },
    progressRing: { width: 160, height: 160, position: 'absolute' },
    progressCenter: { alignItems: 'center' },
    progressValue: { fontSize: 30, fontWeight: '700' },
    progressLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(60, 60, 60, 1)' },
    processingCard: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 22, marginTop: 20, borderWidth: 0.6, borderColor: 'rgba(0,0,0,0.04)' },
    processingTitle: { fontSize: 12, fontWeight: '500', marginBottom: 10, textAlign: 'center', color: 'rgba(55, 65, 81, 1)' },
    processRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 10, height: 10, borderRadius: 6 },
    dotGreen: { backgroundColor: '#10B981' }, dotBlue: { backgroundColor: '#3B82F6' }, dotGray: { backgroundColor: '#9CA3AF' },
    rowText: { fontSize: 11, fontWeight: '400' },
    rowPercent: { fontSize: 11, fontWeight: '600' },
    nextButton: { backgroundColor: '#6b46ff', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, marginRight: 12 },
    secondaryButton: { backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(107,70,255,0.12)' }
})
