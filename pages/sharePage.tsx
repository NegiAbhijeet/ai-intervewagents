import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import getLevelData from '../libs/getLevelData'
import { InModalBanner } from '../components/InModalBanner'

const { width: SCREEN_W } = Dimensions.get('window')
const CIRCLESIZE = 120


export default function SharePage({ visible = false, onRequestClose = () => { }, meetingId, score }) {
    const { setFirstInterviewObject, userProfile, language, myCandidate, setLeaderboardRank } = useContext(AppStateContext)
    const navigation = useNavigation()
    const { t } = useTranslation()
    const [meetingReport, setMeetingReport] = useState(null)
    const [isInterviewStart, setIsInterviewStart] = useState(false)
    const [certificateUrl, setCertificateUrl] = useState("")
    const [certificateData, setCertificateData] = useState(null)
    const [showMessage, setShowMessage] = useState(false)

    const LEVELS = useMemo(() => getLevelData(language) || {}, [language])
    useEffect(() => {
        if (!meetingId) return
        async function fetchMeetingDetails(meetingId) {
            try {
                const res = await fetch(`${API_URL}/congratulations/${meetingId}/`)
                const json = await res.json()
                const data = json?.meetingData ?? {}
                setCertificateData((s) => ({
                    ...s,
                    loading: false,
                    positionTitle: data.position || "",
                    candidateName: `${data?.candidateDetails?.firstName ?? ""} ${data?.candidateDetails?.lastName ?? ""}`.trim(),
                    averageScore: data?.feedback?.averagePercentage ?? null,
                    totalCandidates: json?.candidateCount ?? 0,
                    rank: data?.rank ?? null,
                    score: data?.score ?? null,
                    maxScore: data?.maxScore ?? 100,
                    percentile: data?.percentile ?? null,
                }))
            } catch (err) {
                console.error("Error fetching meeting details:", err)

            }
        }
        async function fetchMeeting(id) {
            try {
                const url = `${JAVA_API_URL}/api/meetings/${id}`
                const res = await fetch(url)
                const result = await res.json()

                const report = result.data || {}
                if (report?.streak) {
                    setLeaderboardRank(report?.streak)
                    setCertificateUrl(report?.certificateUrl || null)
                }

                setMeetingReport(report)
            } catch (err) {
                console.error('failed to fetch meeting', err)
            }
        }

        fetchMeeting(meetingId)
        fetchMeetingDetails(meetingId)
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
            const missing = []
            if (!meetingId) missing.push('meetingId')
            if (!certificateData?.totalCandidates) missing.push('total candidates')
            if (!meetingReport?.position) missing.push('position')
            if (!Array.isArray(meetingReport?.candidateRequiredSkills) || meetingReport.candidateRequiredSkills.length === 0) {
                missing.push('skills')
            }

            if (missing.length > 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Share failed.'
                })
                return
            }
            setShowMessage(true)

            const certificateUrl = `https://aiinterviewagents.com/certificate/${meetingId}`
            const userLevel = meetingReport.requiredExperience
            const finalLevel = LEVELS.find(item => Number(item.value) === Number(userLevel))

            // array skills → cleaned string with one space after each comma
            const normalizedSkills = meetingReport.candidateRequiredSkills
                .map(s => String(s).trim())
                .filter(Boolean)
                .join(', ') + '.'

            const text =
                `Just finished a full Technical interview for a ${meetingReport.position} role on AI Interview Agents.
I scored ${score}% at the ${finalLevel?.label} and covered key skills including ${normalizedSkills}
Sharing this to connect with professionals and recruiters working in ${meetingReport.position} roles.
You can view my certificate and profile through the link below on AI Interview Agents.
Always open to learning, feedback, and new opportunities.`
            console.log(text)
            const shareUrl =
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`

            // Wait 1.5 seconds before opening
            setTimeout(() => {
                setShowMessage(false)
                Linking.openURL(shareUrl)
            }, 2000)

        } catch (err) {
            console.error('share failed', err)
            Toast.show({
                type: 'error',
                text1: 'Share failed',
                text2: 'Unable to open LinkedIn'
            })
        }
    }



    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                onRequestClose()
            }}
        >
            <Layout gradientType="3">
                <InModalBanner
                    visible={showMessage}
                    text="Post copied. Paste the text in your LinkedIn post."
                    onHidden={() => { }}
                />
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
                                <Certificate imageUrl={certificateUrl} />
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
                                style={{ backgroundColor: "black", marginHorizontal: "auto", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 10 }}
                                onPress={() => { onRequestClose(); navigation.navigate("index") }}
                            >
                                <Text style={{ color: "white" }}>Go to Home</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </Layout>
        </Modal>
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
