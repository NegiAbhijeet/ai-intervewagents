import Layout from './Layout';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { AppStateContext } from '../components/AppContext';
import { API_URL, JAVA_API_URL } from '../components/config';
import TopBar from '../components/TopBar';
import { useNotification } from '../hooks/useNotifications';
import fetchWithAuth from '../libs/fetchWithAuth';
import { RefreshControl } from 'react-native-gesture-handler';
import InterviewScreen from '../components/interviewScreen';
import HomeTopPenguin from "../assets/images/homeTopPeng.svg"
import { useTranslation } from 'react-i18next';
import LANGUAGES from '../libs/languages';

const HomePage = () => {
    const {
        userProfile,
        fcmTokenUpdated,
        setFcmTokenUpdated,
        setLeaderboardRank,
        firstInterviewObject,
        setFirstInterviewObject,
        myCandidate,
        setMyCandidate,
        language
    } = useContext(AppStateContext);
    const [lastMeeting, setLastMeeting] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInterviewStart, setIsInterviewStart] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false);

    const spin = useRef(new Animated.Value(0)).current
    const { t } = useTranslation();
    const interviews = [
        {
            key: 'practice',
            title: t('home.interviews.practice.title'),
            description: t('home.interviews.practice.description'),
            gradient: 'blue',
            action: t('home.interviews.common.action'),
            value: 'Practice',
            icon: require("../assets/images/mock.png"),
            bottomLine: t('home.interviews.practice.bottomLine')
        },
        {
            key: 'train',
            title: t('home.interviews.train.title'),
            description: t('home.interviews.train.description'),
            gradient: 'purple',
            action: t('home.interviews.common.action'),
            value: 'Revise',
            icon: require("../assets/images/trainer.png"),
            bottomLine: t('home.interviews.train.bottomLine')
        },
    ];

    useEffect(() => {
        let animation = null
        if (isLoading) {
            animation = Animated.loop(
                Animated.timing(spin, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.linear,
                    useNativeDriver: true
                })
            )
            animation.start()
        } else {
            // stop and reset
            spin.stopAnimation(() => spin.setValue(0))
        }
        return () => {
            if (animation) animation.stop()
            spin.setValue(0)
        }
    }, [isLoading, spin])

    const rotate = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })
    const fetchCandidatedata = async () => {
        try {
            const response = await fetchWithAuth(
                `${JAVA_API_URL}/api/candidates/uid/${userProfile?.uid}`,
            );
            const data = await response.json();
            if (data?.data && data?.data.length > 0) {
                setMyCandidate(data.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch candidate:', error);
        }
    };
    async function fetchMeetings(isRefreshingCall = false) {
        setIsLoading(true);
        if (isRefreshingCall) {
            setIsRefreshing(true);
        }
        try {
            const response = await fetchWithAuth(
                `${JAVA_API_URL}/api/meetings/uid/${userProfile?.uid}`,
                {
                    headers: {
                        Authorization: `Bearer ${userProfile?.token}`,
                    },
                },
            );
            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            const sortedMeetings = data?.data.sort((a, b) => {
                const dateTimeA = new Date(`${a.interviewDate}T${a.interviewTime}`);
                const dateTimeB = new Date(`${b.interviewDate}T${b.interviewTime}`);
                return dateTimeB - dateTimeA;
            });

            const completedMeetings = sortedMeetings.filter(
                item => item?.status === 'Completed',
            );
            if (completedMeetings.length > 0) {
                setLastMeeting(completedMeetings[0])
            }
            // setMeetings(completedMeetings);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            if (isRefreshingCall) {
                setIsRefreshing(false);
            }
        }
    }
    function fetchUserRank() {
        setLeaderboardRank(userProfile?.current_streak || 0);
    }
    useNotification(userProfile?.uid, fcmTokenUpdated, setFcmTokenUpdated);

    useEffect(() => {
        if (userProfile?.uid) {
            fetchMeetings();
            fetchUserRank();
            fetchCandidatedata()
        }
    }, [userProfile?.uid]);
    const onRefresh = () => {
        setIsLoading(true);
        fetchMeetings(true);
        fetchUserRank();
        fetchCandidatedata()
    };

    const extractMeetingDateTimeParts = dateTime => {
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');

        return {
            date: `${year}-${month}-${day}`,
            hour,
            minute,
        };
    };
    const handleSubmit = async (practiceOrRevise) => {
        try {
            setIsInterviewStart(true);

            const now = new Date();
            const { date, hour, minute } = extractMeetingDateTimeParts(now);
            const parsedDuration = parseInt(10);
            const myLanguage = LANGUAGES.find((item) => item?.code === language)
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
                type: practiceOrRevise,
                requiredSkills: myCandidate?.requiredSkills,
                experience: myCandidate?.experienceYears || 0,
                language: myLanguage?.label_en || "English"
            };


            const response = await fetchWithAuth(`${API_URL}/interview-agent/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || 'Failed to create interview.');
            }

            const result = await response.json();
            const meetingUrl = result?.meeting_url;

            if (meetingUrl) {
                const urlParams = new URLSearchParams(meetingUrl.split('?')[1]);

                const meetingId = urlParams.get('meetingId');
                const canId = urlParams.get('canId');
                const languageCode = urlParams.get('languageCode');
                const interviewType = urlParams.get('interviewType');
                const candidateName = urlParams.get('candidateName') || 'User';
                const interviewTime = urlParams.get('interviewTime');

                const firstPayload = {
                    canId,
                    meetingId,
                    languageCode,
                    interviewType,
                    interviewTime,
                    candidateName,
                    adminId: userProfile?.uid
                }
                setFirstInterviewObject(firstPayload)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsInterviewStart(false);
        }
    };
    function getScoreText(score) {
        if (score <= 25) return t('home.score.bad');
        if (score <= 75) return t('home.score.good');
        return t('home.score.excellent');
    }

    return (
        <>
            {isInterviewStart && (
                <Modal transparent visible animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.spinnerContainer}>
                            <ActivityIndicator size="large" style={styles.spinner} />
                        </View>
                    </View>
                </Modal>
            )}
            {/* <StreakProgress visible={true} currentDay={5} /> */}

            <TopBar />

            {firstInterviewObject && (
                <InterviewScreen
                    {...firstInterviewObject}
                    showInterviewScreen={true}
                    setShowInterviewScreen={() => setFirstInterviewObject(null)}
                />
            )}

            <Layout>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    {!userProfile ? (
                        <SkeletonPlaceholder borderRadius={8}>
                            <SkeletonPlaceholder.Item width={200} height={28} marginBottom={16} />
                        </SkeletonPlaceholder>
                    ) : (
                        <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: '700' }}>
                                    {t('home.greeting', { name: myCandidate?.firstName || t('home.userFallback') })}
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: '400' }}>
                                    {t('home.welcome')}
                                </Text>
                            </View>
                            <HomeTopPenguin />
                        </View>
                    )}

                    <View style={{ backgroundColor: "rgba(103, 86, 239, 0.08)", borderWidth: 1, borderRadius: 14, borderColor: "rgba(239, 239, 239, 1)", marginTop: 15, paddingHorizontal: 24, paddingVertical: 12, alignSelf: 'center', width: '85%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: '700' }}>{lastMeeting?.position || t('home.noInterview')}</Text>
                            <Text style={{ fontSize: 10, fontWeight: '600' }}>
                                {t('home.scoreLabel')} {lastMeeting?.feedback?.averagePercentage || t('home.na')}
                                {lastMeeting?.feedback?.averagePercentage ? '%' : ''}
                            </Text>
                            <Text style={{ fontSize: 10, fontWeight: '400' }}>
                                {t('home.youScored', { scoreText: getScoreText(lastMeeting?.feedback?.averagePercentage || 0) })}
                            </Text>
                        </View>

                        {isLoading ? (
                            <Animated.Image
                                source={require('../assets/images/reload.png')}
                                style={{
                                    width: 28,
                                    height: 28,
                                    transform: [{ rotate }],
                                    resizeMode: 'contain'
                                }}
                            />
                        ) : (
                            <Pressable onPress={() => { handleSubmit(lastMeeting?.type) }}>
                                <Image
                                    source={require('../assets/images/reload.png')}
                                    style={{ width: 28, height: 28, resizeMode: 'contain' }}
                                />
                            </Pressable>
                        )}
                    </View>

                    <View style={{ marginBottom: 40 }}>
                        <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '700', lineHeight: 21, marginBottom: 18, marginTop: 25 }}>
                            {t('home.chooseMode')}
                        </Text>

                        {interviews.map(({ title, description, icon, value, bottomLine }, index) => (
                            <Pressable key={index} onPress={() => handleSubmit(value)} style={{ marginBottom: 8 }}>
                                <ImageBackground source={require('../assets/images/homeCardWrapper.png')} style={{ width: '100%', aspectRatio: 371 / 209 }} imageStyle={{ resizeMode: 'contain' }}>
                                    <View style={{ position: 'absolute', height: '100%', width: '100%', top: 0, left: 0, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                            <Image source={icon} />
                                            <Text style={{ fontSize: 16, fontWeight: '600', lineHeight: 20 }}>
                                                {title}
                                            </Text>
                                        </View>
                                        <Text style={{ fontSize: 12, fontWeight: '500', lineHeight: 20, marginTop: 16, textAlign: 'center', color: 'rgba(60,60,60,1)' }}>
                                            {description}
                                        </Text>
                                    </View>
                                    <Text style={{ position: 'absolute', bottom: 8, left: '50%', transform: [{ translateX: "-50%" }], color: 'white', fontSize: 12 }}>
                                        {bottomLine}
                                    </Text>
                                </ImageBackground>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            </Layout>
        </>
    );
};

export default HomePage;


const styles = StyleSheet.create({
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