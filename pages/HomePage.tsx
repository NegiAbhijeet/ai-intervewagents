import Layout from './Layout';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { AppStateContext } from '../components/AppContext';
import { API_URL, JAVA_API_URL } from '../components/config';
import { useNotification } from '../hooks/useNotifications';
import fetchWithAuth from '../libs/fetchWithAuth';
import { RefreshControl } from 'react-native-gesture-handler';
import InterviewScreen from '../components/interviewScreen';
import HomeTopPenguin from "../assets/images/homeTopPeng.svg"
import { useTranslation } from 'react-i18next';
import LANGUAGES from '../libs/languages';
import StreakProgress from '../components/streakProgress';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import SelectInterviewType from '../components/SelectInterviewType';
import LevelProgress from "../components/LevelProgress"
import { useNavigation } from '@react-navigation/native';
import ExhaustedLimitModal from "../components/ExhaustedLimitModal"
import { minutesToSeconds } from "../libs/getInterviewTime"
import PricingPopup from '../components/PricingPopup';

const HomePage = ({ route }) => {
    const navigation = useNavigation()
    const {
        userProfile,
        setUserProfile,
        fcmTokenUpdated,
        setFcmTokenUpdated,
        leaderboardRank,
        setLeaderboardRank,
        firstInterviewObject,
        setFirstInterviewObject,
        myCandidate,
        setMyCandidate,
        language,
        showDailyStreak,
        totalMinutes,
        usedMinutes,
        setShowDailyStreak,
        isNeedToShowAd
    } = useContext(AppStateContext);
    const [showPricingPopup, setShowPricingPopup] = useState(false)

    const [lastMeeting, setLastMeeting] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInterviewStart, setIsInterviewStart] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedInterviewType, setSelectedInterviewType] = useState("")
    const [selectedType, setSelectedType] = useState("")
    const [error, setError] = useState("")
    const [showExhaustedModal, setShowExhaustedModal] = useState(false)

    const [openSelectInterviewOptions, setOpenSelectInterviewOptions] = useState(false)
    function streakHandleSubmit() { setSelectedType("Practice"); setOpenSelectInterviewOptions(true) }

    useEffect(() => {
        if (route.params?.startInterview) {
            streakHandleSubmit()
        }
    }, [route.params?.startInterview]);



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
                const candidate = data.data[0];
                if (!candidate?.position || !candidate?.industry || !candidate?.experienceYears) {
                    setUserProfile((user) => ({
                        ...user,
                        position: "",
                        industry: "",
                    }));
                }
                setMyCandidate(candidate);
            }
        } catch (error) {
            console.error('Failed to fetch candidate:', error);
        }
    };
    const onStartClick = (value) => {
        const leftMinutes = Math.max(0, Math.min(10, totalMinutes - usedMinutes))
        if (leftMinutes <= 0) {
            setShowExhaustedModal(true)
            return
        }
        // show pricing popup on every action click, then open interview options
        setSelectedType(value);
        setOpenSelectInterviewOptions(true);

    }
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
        setLeaderboardRank(userProfile?.current_streak || 1);
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
    const handleSubmit = async (type, interviewType, difficulty) => {
        try {
            if (!myCandidate?.position) {
                Toast.show({
                    type: 'error',
                    text1: 'Please update your role in your profile.'
                });

                return
            }
            setIsInterviewStart(true);

            const now = new Date();
            const { date, hour, minute } = extractMeetingDateTimeParts(now);
            const myLanguage = LANGUAGES.find((item) => item?.code === language)
            const duration = Math.max(0, Math.min(10, totalMinutes - usedMinutes))
            const durationInSecond = minutesToSeconds(duration)
            const payload = {
                uid: userProfile?.uid,
                hour,
                minute,
                date,
                duration: durationInSecond,
                position: myCandidate?.position,
                role: 'candidate',
                candidateId: myCandidate?.canId || '',
                canEmail: userProfile?.email || userProfile?.user_email || '',
                interviewType: interviewType || "Technical",
                type: type || "Practice",
                requiredSkills: myCandidate?.requiredSkills,
                experience: myCandidate?.experienceYears || 0,
                language: myLanguage?.label_en || "English",
                difficultyLevel: difficulty || "Easy",
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
                setOpenSelectInterviewOptions(false)
                setTimeout(() => {
                    setShowPricingPopup(true);
                }, 0);
            }
        } catch (error) {
            setError(error.message || "Something went wrong.")
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
            {(isInterviewStart || !myCandidate || !myCandidate?.position) && (
                <Modal transparent visible animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.spinnerContainer}>
                            <ActivityIndicator size="large" style={styles.spinner} />
                        </View>
                    </View>
                </Modal>
            )}
            {/* <StreakProgress visible={true} currentDay={5} /> */}

            <ExhaustedLimitModal
                visible={showExhaustedModal}
                onClose={() => setShowExhaustedModal(false)}
                onUpgradePress={() => { navigation.navigate('pricing'); setShowExhaustedModal(false); }}
            />
            {
                showPricingPopup && isNeedToShowAd &&
                <PricingPopup
                    visible={showPricingPopup}
                    onClose={() => setShowPricingPopup(false)}
                />
            }

            {firstInterviewObject && (
                <InterviewScreen
                    {...firstInterviewObject}
                    showInterviewScreen={true}
                    setShowInterviewScreen={() => { setFirstInterviewObject(null); setSelectedInterviewType("") }}

                    position={myCandidate?.position || ""}
                    skills={myCandidate?.requiredSkills || []}
                    selectedInterviewType={selectedInterviewType}
                    setSelectedInterviewType={setSelectedInterviewType}
                    handleSubmit={handleSubmit}
                />
            )}

            <Layout>
                {
                    showDailyStreak && firstInterviewObject === null && <StreakProgress currentDay={Math.max(1, leaderboardRank)} setShowDailyStreak={setShowDailyStreak} isHome={true} streakHandleSubmit={() => { streakHandleSubmit() }} />
                }
                {
                    openSelectInterviewOptions && selectedType && <SelectInterviewType onClose={() => { setFirstInterviewObject(null); setOpenSelectInterviewOptions(false); }} type={selectedType} setSelectedInterviewType={setSelectedInterviewType} handleSubmit={handleSubmit} error={error} setError={setError} />
                }
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
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
                    <LevelProgress rating={userProfile?.rating || 0} />

                    <View style={{ backgroundColor: "rgba(103, 86, 239, 0.08)", borderWidth: 1, borderRadius: 14, borderColor: "rgba(239, 239, 239, 1)", paddingHorizontal: 24, paddingVertical: 12, alignSelf: 'center', width: '85%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        {/* new update */}
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
                            <Pressable onPress={() => { handleSubmit(lastMeeting?.type, lastMeeting?.interviewType, lastMeeting?.difficultyLevel); }}>
                                <Image
                                    source={require('../assets/images/reload.png')}
                                    style={{ width: 28, height: 28, resizeMode: 'contain' }}
                                />
                            </Pressable>
                        )}
                    </View>
                    <View style={{ paddingHorizontal: 6 }}>
                        <View style={styles.parent}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, lineHeight: 21, marginBottom: 20 }}>
                                {t('home.chooseMode')}
                            </Text>
                            {interviews.map(
                                ({ title, description, value }, index) => (
                                    <View key={index} style={styles.card}>
                                        <View style={{ flexDirection: "row", alignItems: 'center', marginBottom: 8, gap: 6 }}>
                                            <Image source={value === 'Revise' ? require("../assets/images/trainer.png") : require("../assets/images/mock.png")} style={{ width: 16, height: 16, }} />
                                            <Text style={styles.cardTitle}>{title}</Text>
                                        </View>

                                        <Text style={styles.cardDescription}>
                                            {description}
                                        </Text>

                                        <Pressable
                                            onPress={() => onStartClick(value)}
                                            style={styles.button}
                                        >
                                            <LinearGradient
                                                colors={['rgba(135, 68, 236, 1)', 'rgba(99, 88, 239, 1)']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{
                                                    borderRadius: 9999,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',

                                                }}
                                            >
                                                <Text style={styles.buttonText}>
                                                    {value === 'Revise' ? 'Train Now' : 'Test Now'}
                                                </Text>
                                            </LinearGradient>
                                        </Pressable>
                                    </View>
                                )
                            )}
                        </View>
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
    },

    parent: {
        // backgroundColor: 'rgba(255, 255, 255, 0.5)',
        // borderRadius: 18,
        // padding: 20,
        marginVertical: 16,
        // boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15), 0px -1px 4px 0px rgba(0, 0, 0, 0.15)",
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
        color: '#111',
    },
    card: {
        backgroundColor: 'rgba(242, 242, 242, 0.50)',
        borderRadius: 10,
        paddingVertical: 22,
        paddingHorizontal: 18,
        marginBottom: 12,
        alignItems: 'center',
        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.25)",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 500,
        color: '#000',
    },
    cardDescription: {
        fontSize: 12,
        textAlign: 'center',
        color: '#3C3C3C',
        marginBottom: 16,
        lineHeight: 18,
        fontWeight: 400
    },
    button: {
        width: "70%"
    },
    buttonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 700,
        width: '100%',
        textAlign: 'center',
        paddingVertical: 8,
    },
    iconButton: {
        borderWidth: 1,
        borderColor: 'rgba(217, 217, 217, 1)',
        padding: 6,
        borderRadius: 999,
    },
})