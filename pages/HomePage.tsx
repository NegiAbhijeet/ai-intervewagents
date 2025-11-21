import Layout from './Layout';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Button, Easing, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { AppStateContext } from '../components/AppContext';
import { API_URL, JAVA_API_URL } from '../components/config';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { useNotification } from '../hooks/useNotifications';
import fetchWithAuth from '../libs/fetchWithAuth';
import { RefreshControl } from 'react-native-gesture-handler';
import InterviewScreen from '../components/interviewScreen';
import HomeTopPenguin from "../assets/images/homeTopPeng.svg"
const img = require('../assets/images/homeCardWrapper.png');
const { width: imgW, height: imgH } = Image.resolveAssetSource(img);
const interviews = [
    {
        title: 'Test Yourself',
        description:
            'Mock Interview with instant feedback to boost your skill and knowledge.',
        gradient: 'blue',
        action: 'Start',
        value: 'Practice',
        icon: require("../assets/images/mock.png"),
        bottomLine: "Test Now >>"
    },
    {
        title: 'Train Yourself',
        description:
            'Trainer mode acts like a coach that improves your answers and builds your confidence.',
        gradient: 'purple',
        action: 'Start',
        value: 'Revise',
        icon: require("../assets/images/trainer.png"),
        bottomLine: "Train Now >>"
    },
];


const HomePage = () => {
    const ratio = useMemo(() => imgW / imgH || 1, [imgW, imgH]);

    const navigation = useNavigation();
    const {
        userProfile,
        mainUsedMinutes,
        fcmTokenUpdated,
        setFcmTokenUpdated,
        setLeaderboardRank,
        firstInterviewObject,
        setFirstInterviewObject,
        myCandidate,
        setMyCandidate
    } = useContext(AppStateContext);
    const [meetings, setMeetings] = useState([]);
    const [lastMeeting, setLastMeeting] = useState([]);
    const [overallScore, setOverallScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isInterviewStart, setIsInterviewStart] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false);
    const finalLoading = isLoading || !userProfile;

    const spin = useRef(new Animated.Value(0)).current

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
                console.log(data?.data[0])
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
        fetchWithAuth(`${API_URL}/get-users-rating/`)
            .then(res => res.json())
            .then(res => {
                let data = res.profiles || [];
                if (userProfile?.user_email) {
                    let sortedUsers = [...data]
                        .sort((a, b) => b.rating - a.rating)
                        .map((user, index) => ({
                            ...user,
                            rank: index + 1,
                            image: user.user_photo_url,
                        }));
                    const found = sortedUsers.find(
                        u => u.user_email === userProfile.user_email,
                    );
                    if (found) {
                        setLeaderboardRank(found?.rank || 0);
                    }
                }
            })
            .catch(err => {
                console.error('Failed to fetch leaderboard:', err);
            });
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
    useEffect(() => {
        if (meetings.length > 0) {
            const totalScore = meetings.reduce(
                (acc, item) => acc + (item.feedback?.averagePercentage ?? 0),
                0,
            );
            const calculatedScore = parseFloat(
                (totalScore / meetings.length).toFixed(2),
            );
            setOverallScore(calculatedScore);
        }
    }, [meetings]);
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
                interviewType: "Technical" || '',
                type: practiceOrRevise,
                requiredSkills: myCandidate?.requiredSkills,
                experience: myCandidate?.experienceYears || 0,
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
                const interviewType = urlParams.get('interviewType');
                const candidateName = urlParams.get('candidateName') || 'User';
                const interviewTime = urlParams.get('interviewTime');

                const firstPayload = {
                    canId,
                    meetingId,
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
            <TopBar />
            {
                firstInterviewObject && <InterviewScreen
                    {...firstInterviewObject}
                    showInterviewScreen={true}
                    setShowInterviewScreen={() => setFirstInterviewObject(null)}
                />
            }
            <Layout>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="py-5 "
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    {!userProfile ? (
                        <SkeletonPlaceholder borderRadius={8}>
                            <SkeletonPlaceholder.Item
                                width={200}
                                height={28}
                                marginBottom={16}
                            />
                        </SkeletonPlaceholder>
                    ) : (
                        <View className='px-4 flex-row items-center justify-between'>
                            <View className=''>
                                <Text style={{ fontSize: 18, fontWeight: 700, lineHeight: 18 }}>
                                    Hello {myCandidate?.firstName || 'User'} 👋
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: 400 }}>
                                    Welcome to your home!
                                </Text>
                            </View>
                            <HomeTopPenguin />
                        </View>
                    )}
                    <View style={{ backgroundColor: "rgba(103, 86, 239, 0.08)", borderWidth: 1, borderRadius: 14, borderColor: "rgba(239, 239, 239, 1)", marginTop: 15 }} className='px-8 py-4 flex-row items-center justify-between w-[85%] mx-auto'>
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: 700 }}>{lastMeeting?.position || "No Interview Found"}</Text>
                            <Text style={{ fontSize: 10, fontWeight: 600 }}>Score : {lastMeeting?.feedback?.averagePercentage || "N/A"}{lastMeeting?.feedback?.averagePercentage && "%"}</Text>
                            <Text style={{ fontSize: 10, fontWeight: 400 }}>You're Getting Better!</Text>
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
                        ) : (<Pressable onPress={fetchMeetings}>
                            <Image
                                source={require('../assets/images/reload.png')}
                                style={{ width: 28, height: 28, resizeMode: 'contain' }}
                            /></Pressable>
                        )}
                    </View>

                    <View className="mb-10">
                        <Text className="text-center" style={{ fontSize: 16, fontWeight: 700, lineHeight: 21, marginBottom: 18, marginTop: 25 }}>
                            Choose Your Interview Mode
                        </Text>
                        {interviews.map(({ title, description, icon, value, bottomLine }, index) =>
                        (
                            <Pressable key={index} onPress={() => handleSubmit(value)} style={{ marginBottom: 8 }}>
                                <ImageBackground source={require('../assets/images/homeCardWrapper.png')} style={{ width: '100%', aspectRatio: 371 / 209 }} imageStyle={{ resizeMode: 'contain' }}>
                                    <View className="absolute h-full w-full top-0 left-0 p-8">
                                        <View className="w-full items-center flex-row justify-center gap-4">
                                            <Image source={icon} />
                                            <Text style={{ fontSize: 16, fontWeight: 600, lineHeight: 20 }}>
                                                {title}
                                            </Text>
                                        </View>
                                        <Text style={{ fontSize: 12, fontWeight: 500, lineHeight: 20, marginTop: 16, textAlign: 'center', color: 'rgba(60,60,60,1)' }}>
                                            {description}
                                        </Text>
                                    </View>
                                    <Text className='absolute bottom-2 left-1/2 -translate-x-1/2 text-white' style={{ fontSize: 12 }}>
                                        {bottomLine}
                                    </Text>
                                </ImageBackground>
                            </Pressable>))}
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