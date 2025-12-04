import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Modal,
    ActivityIndicator,
    Linking,
    Share,
    Platform,
} from 'react-native'
import Certificate from '../components/certificate'
import { ScrollView } from 'react-native-gesture-handler'
import { API_URL, JAVA_API_URL } from '../components/config'
import Layout from './Layout'
import { AppStateContext } from '../components/AppContext'
import LANGUAGES from '../libs/languages'
import fetchWithAuth from '../libs/fetchWithAuth'
import Toast from 'react-native-toast-message'
import { useNavigation } from '@react-navigation/native'

const { width: SCREEN_W } = Dimensions.get('window')
const CIRCLESIZE = 120


export default function SharePage({ route }) {
    const { setFirstInterviewObject, userProfile, language, myCandidate, setLeaderboardRank } = useContext(AppStateContext)
    const navigation = useNavigation()
    const { t } = useTranslation()
    const [score, setScore] = useState(route.params?.score || 0)
    const [meetingId, setMeetingId] = useState(route.params?.meetingId || 0)
    const [meetingReport, setMeetingReport] = useState(null)
    const [isInterviewStart, setIsInterviewStart] = useState(false)
    useEffect(() => {
        if (route.params?.meetingId) {
            setScore(route.params.score)
            setMeetingId(route.params.meetingId)
        }
    }, [route.params?.score, route.params?.meetingId])

    // fetch meeting report when meetingId is present
    useEffect(() => {
        if (!meetingId) return

        async function fetchMeeting(id) {
            try {
                const url = `${JAVA_API_URL}/api/meetings/${id}`
                const res = await fetch(url)
                const result = await res.json()

                const report = result.data || {}
                if (report?.streak) {
                    setLeaderboardRank(report?.streak)
                }

                setMeetingReport(report)
            } catch (err) {
                console.error('failed to fetch meeting', err)
            }
        }

        fetchMeeting(meetingId)
    }, [meetingId])

    const extractMeetingDateTimeParts = dateTime => {
        const date = new Date(dateTime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')

        return {
            date: `${year}-${month}-${day}`,
            hour,
            minute,
        }
    }

    // start / continue interview logic unchanged
    const onPress = async () => {
        try {
            if (!meetingId) return
            const now = new Date()
            const { date, hour, minute } = extractMeetingDateTimeParts(now)
            const myLanguage = LANGUAGES.find((item) => item?.code === language)
            const parsedDuration = parseInt(10)

            const payload = {
                uid: userProfile?.uid,
                hour,
                minute,
                date,
                duration: parsedDuration * 60,
                position: myCandidate?.position,
                role: 'candidate',
                candidateId: myCandidate?.canId || '',
                canEmail: userProfile?.email || userProfile?.user_email || '',
                interviewType: "Technical",
                type: meetingReport?.interviewType || 'practice',
                requiredSkills: myCandidate?.requiredSkills,
                experience: myCandidate?.experienceYears || 0,
                language: myLanguage?.label_en || "English"
            }

            setIsInterviewStart(true)

            const response = await fetchWithAuth(`${API_URL}/interview-agent/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const message = errorData?.error || 'Failed to create interview.'
                throw new Error(message)
            }

            const result = await response.json().catch(() => ({}))
            const meetingUrl = result?.meeting_url

            if (meetingUrl) {
                const urlParams = new URLSearchParams(meetingUrl.split('?')[1] || '')
                const meetingId = urlParams.get('meetingId')
                const canId = urlParams.get('canId')
                const interviewType = urlParams.get('interviewType')
                const candidateName = urlParams.get('candidateName') || 'User'
                const interviewTime = urlParams.get('interviewTime')

                const firstPayload = {
                    canId,
                    meetingId,
                    interviewType,
                    interviewTime,
                    candidateName,
                    adminId: userProfile?.uid
                }
                setFirstInterviewObject(firstPayload)
                navigation.navigate("index")
            } else {
                throw new Error('No meeting URL returned from server.')
            }
        } catch (error) {
            console.log('handleContinue error:', error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'Something went wrong',
            })
        } finally {
            setIsInterviewStart(false)
        }
    }

    // ----- LinkedIn share logic -----
    const shareOnLinkedIn = async () => {
        try {
            if (!meetingId) {
                Toast.show({ type: 'error', text1: 'Share failed', text2: 'No certificate available' })
                return
            }

            const certificateUrl = `https://aiinterviewagents.com/certificate/${meetingId}`
            const position = meetingReport?.position || 'the role'
            const shareText = `I completed a mock interview for ${position} on AI Interview Agents.\nScore: ${score}\nCheck my certificate: ${certificateUrl}`

            // LinkedIn web share URL
            const webShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${encodeURIComponent(shareText)}`

            // Attempt app deep link. Include summary param; some LinkedIn app versions pick up url only.
            // Note: iOS requires adding "linkedin" to LSApplicationQueriesSchemes for canOpenURL to return true.
            const appDeepLink = `linkedin://shareArticle?mini=true&url=${encodeURIComponent(certificateUrl)}&summary=${encodeURIComponent(shareText)}`

            // Try opening LinkedIn app first
            const canOpen = await Linking.canOpenURL(appDeepLink)
            if (canOpen) {
                await Linking.openURL(appDeepLink)
                return
            }

            // If the app link cannot be opened, fall back to the web share page
            // This opens in the device browser and shows the LinkedIn post composer with the URL prefilled.
            await Linking.openURL(webShareUrl)
        } catch (err) {
            // As a last resort, open native share sheet with the certificate URL and text
            try {
                await Share.share({
                    message: `${shareText}`,
                    url: `https://aiinterviewagents.com/certificate/${meetingId}`,
                    title: 'My interview certificate'
                })
            } catch (err2) {
                console.error('sharing failed', err, err2)
                Toast.show({ type: 'error', text1: 'Share failed', text2: 'Unable to share certificate' })
            }
        }
    }

    // ----- UI -----
    return (
        <Layout>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {isInterviewStart && (
                    <Modal transparent visible animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.spinnerContainer}>
                                <ActivityIndicator size="large" style={styles.spinner} />
                            </View>
                        </View>
                    </Modal>
                )}
                <View style={styles.container}>
                    <Text style={styles.title}>Congratulations!</Text>
                    <Text style={styles.subtitle}>Great job on your score.</Text>

                    <View style={styles.scoreWrap}>
                        <View style={styles.scoreCircle}>
                            <Image
                                source={require('../assets/images/element.png')}
                                resizeMode="contain"
                                style={{ position: 'absolute', top: 0, left: 0, width: CIRCLESIZE, height: CIRCLESIZE }}
                            />
                            <Text style={{ fontSize: 8, transform: "translateY(3px)" }}>Your Score</Text>
                            <Text style={styles.scoreNumber}>{score}%</Text>
                        </View>

                        <TouchableOpacity style={styles.analysisButton} onPress={() => { navigation.navigate("reports", { report: meetingReport }) }}>
                            <Image
                                source={require('../assets/images/growth.png')}
                                resizeMode="contain"
                                style={styles.analysisIcon}
                            />
                            <Text style={styles.analysisText}>View detailed analysis</Text>
                        </TouchableOpacity>

                        <Text style={styles.issued}>Issued Certificate</Text>

                        <View style={styles.certificateBox}>
                            <Certificate meetingReport={meetingReport} />
                            <TouchableOpacity style={styles.linkedin} onPress={shareOnLinkedIn}>
                                <Image
                                    source={require('../assets/images/linkedin.png')}
                                    resizeMode="contain"
                                    style={styles.linkedinIcon}
                                />
                                <Text style={styles.linkedinText}>Share on Linkedin</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.takeAgain} onPress={onPress}>
                            <Image
                                source={require('../assets/images/retry.png')}
                                resizeMode="contain"
                                style={styles.retryIcon}
                            />
                            <Text style={styles.takeAgainText}>Take Another Interview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ backgroundColor: "black", marginHorizontal: "auto", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop:10 }}
                            onPress={() => navigation.navigate("index")}
                        >
                            <Text style={{ color: "white" }}>Go to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </Layout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 36
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(60, 60, 60, 1)',
        marginTop: 6,
        marginBottom: 18,
        textAlign: 'center'
    },
    scoreWrap: {
        width: Math.min(360, SCREEN_W - 40),
        alignItems: 'center'
    },
    scoreCircle: {
        width: CIRCLESIZE,
        height: CIRCLESIZE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    scoreNumber: {
        fontSize: 26,
        fontWeight: '700',
        color: "rgba(114, 28, 197, 1)"
    },
    analysisButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        backgroundColor: '#6b46ff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12
    },
    analysisIcon: {
        width: 18,
        height: 18,
        marginRight: 8
    },
    analysisText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14
    },
    issued: {
        marginTop: 18,
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(0,0,0,1)'
    },
    certificateBox: {
        width: '100%',
        marginTop: 12,
        alignItems: 'center'
    },
    linkedin: {
        marginTop: 18,
        backgroundColor: 'rgba(29, 78, 216, 1)',
        width: '90%',
        alignSelf: 'stretch',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', marginHorizontal: "auto"
    },
    linkedinIcon: {
        width: 20,
        height: 20,
        marginRight: 8
    },
    linkedinText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        flexShrink: 1
    },
    takeAgain: {
        marginTop: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    retryIcon: {
        width: 18,
        height: 18,
        marginRight: 8
    },
    takeAgainText: {
        color: 'rgba(14, 12, 12, 1)',
        fontSize: 14
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    spinnerContainer: {
        width: 96,
        height: 96,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 10
    },
    spinner: {
        transform: [{ scale: 1 }]
    }
})
