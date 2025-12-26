import React, { useRef, useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Pressable,
    Text,
    Linking,
} from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import Certificate from './certificate'
import LinearGradient from 'react-native-linear-gradient'
import Toast from 'react-native-toast-message'
import Clipboard from '@react-native-clipboard/clipboard'
import { API_URL } from './config'

const { width: SCREEN_W } = Dimensions.get('window')

const CARD_WIDTH = SCREEN_W * 0.8
const ARROW_WIDTH = 20
const ARROW_HEIGHT = 62
const ARROW_OFFSET = 8

const leftArrow = require('../assets/images/pricingArrow1.png')
const rightArrow = require('../assets/images/pricingArrow2.png')

export default function CertificateCarousel({ certificates = [], LEVELS, showShareButton = true }) {
    const carouselRef = useRef(null)
    const [index, setIndex] = useState(0)
    const [cardHeight, setCardHeight] = useState(null)
    const [meetingDetailsLoading, setMeetingDetailsLoading] = useState(false)
    useEffect(() => {
        if (!certificates.length) return

        const firstUrl = certificates[0]?.certificate_url
        if (!firstUrl) return

        Image.getSize(
            firstUrl,
            (width, height) => {
                const scaledHeight = (CARD_WIDTH * height) / width
                setCardHeight(scaledHeight)
            },
            () => {
                setCardHeight(200)
            }
        )
    }, [certificates])


    const shareOnLinkedIn = async (meetingId) => {
        try {
            setMeetingDetailsLoading(true)
            const res = await fetch(`${API_URL}/congratulations/${meetingId}/`)
            const json = await res.json()
            const meetingReport = json?.meetingData ?? {}
            const score = meetingReport?.feedback?.averagePercentage ?? 0

            const missing = []

            if (!meetingId) missing.push('meetingId')
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

            const certificateUrl = `https://aiinterviewagents.com/certificate/${meetingId}`
            const userLevel = meetingReport.requiredExperience
            const finalLevel = LEVELS.find(item => Number(item.value) === Number(userLevel))

            // array skills → cleaned string with one space after each comma
            const normalizedSkills = meetingReport.candidateRequiredSkills
                .map(s => String(s).trim())
                .filter(Boolean)
                .join(', ') + '.'

            const text =
                `I scored ${score}% at the ${finalLevel?.label} and covered key skills including ${normalizedSkills}
    Sharing this to connect with professionals and recruiters working in ${meetingReport.position} roles.
    You can view my certificate and profile through the link below on AI Interview Agents.
    Always open to learning, feedback, and new opportunities.`

            Clipboard.setString(text)
            const postText = `Just finished a full Technical interview for a ${meetingReport.position} role on AI Interview Agents.`
            const shareUrl =
                `https://www.linkedin.com/feed/?linkOrigin=LI_BADGE&shareActive=true&shareUrl=${encodeURIComponent(certificateUrl)}&text=${postText}`
            setMeetingDetailsLoading(false)
            Linking.openURL(shareUrl)
        } catch (err) {
            console.error('share failed', err)
            Toast.show({
                type: 'error',
                text1: 'Share failed',
                text2: 'Unable to open LinkedIn'
            })
        } finally {
            setMeetingDetailsLoading(false)
        }
    }

    if (!cardHeight) {
        return null
    }

    return (
        <View style={styles.wrapper}>
            <View style={[styles.container, { height: cardHeight }]}>
                <Carousel
                    ref={carouselRef}
                    width={CARD_WIDTH}
                    height={cardHeight}
                    data={certificates}
                    pagingEnabled
                    snapEnabled
                    loop={false}
                    onSnapToItem={setIndex}
                    renderItem={({ item }) => {
                        if (!item?.certificate_url) return null

                        return (
                            <View style={[styles.card, { height: cardHeight }]}>
                                <Certificate
                                    imageUrl={item.certificate_url}
                                    parentWidth={CARD_WIDTH}
                                    thumbHeight={cardHeight}
                                />
                            </View>
                        )
                    }}
                />

                <TouchableOpacity
                    style={[
                        styles.arrow,
                        styles.left,
                        {
                            top: cardHeight / 2 - ARROW_HEIGHT / 2,
                            opacity: index === 0 ? 0.3 : 1,
                        },
                    ]}
                    disabled={index === 0}
                    onPress={() => carouselRef.current?.prev()}
                    activeOpacity={0.7}
                >
                    <Image source={leftArrow} style={styles.arrowImage} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.arrow,
                        styles.right,
                        {
                            top: cardHeight / 2 - ARROW_HEIGHT / 2,
                            opacity: index === certificates.length - 1 ? 0.3 : 1,
                        },
                    ]}
                    disabled={index === certificates.length - 1}
                    onPress={() => carouselRef.current?.next()}
                    activeOpacity={0.7}
                >
                    <Image source={rightArrow} style={styles.arrowImage} />
                </TouchableOpacity>
            </View>

            {
                showShareButton &&
                <Pressable style={{ marginTop: 10, width: CARD_WIDTH }} onPress={() => { shareOnLinkedIn(certificates[index]?.meeting_id) }} disabled={meetingDetailsLoading}>
                    <LinearGradient
                        colors={['rgba(59, 130, 246, 1)', 'rgba(14, 165, 233, 1)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            flexDirection: 'row',
                            borderRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingVertical: 16,
                            width: "100%",
                            gap: 8
                        }}
                    >
                        {
                            meetingDetailsLoading ? (
                                <Text style={{ color: "white", fontWeight: 600 }}>Preparing...</Text>
                            ) : <><Image source={require("../assets/images/linkedin.png")} /><Text style={{ color: "white", fontWeight: 600 }}>Share on Linkedin</Text></>
                        }
                    </LinearGradient>
                </Pressable>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
    },
    container: {
        width: CARD_WIDTH,
    },
    card: {
        width: CARD_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        position: 'absolute',
        width: ARROW_WIDTH,
        height: ARROW_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    left: {
        left: -ARROW_WIDTH - ARROW_OFFSET,
    },
    right: {
        right: -ARROW_WIDTH - ARROW_OFFSET,
    },
    arrowImage: {
        width: ARROW_WIDTH,
        height: ARROW_HEIGHT,
        resizeMode: 'contain',
    },
})
