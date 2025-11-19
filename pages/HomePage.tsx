import Layout from './Layout';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Button, Easing, Image, ImageBackground, ImageSourcePropType, Pressable, ScrollView, Text, View } from 'react-native';
import StatsCard from '../components/StatsCard';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { AppStateContext } from '../components/AppContext';
import { API_URL, JAVA_API_URL } from '../components/config';
import GradientCard from '../components/GradientCard';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import TopBar from '../components/TopBar';
import { useNotification } from '../hooks/useNotifications';
import fetchWithAuth from '../libs/fetchWithAuth';
import { RefreshControl } from 'react-native-gesture-handler';
import InterviewScreen from '../components/interviewScreen';
import BackgroundGradient2 from '../components/backgroundGradient2';
import HomeTopPenguin from "../assets/images/homeTopPeng.svg"
const img = require('../assets/images/homeCardWrapper.png');
const { width: imgW, height: imgH } = Image.resolveAssetSource(img);
const interviews = [
    {
        title: 'Mock Interview',
        description:
            'Mock Interview with instant feedback to boost your skill and knowledge.',
        gradient: 'blue',
        action: 'Start',
        value: 'Practice',
        icon: require("../assets/images/mock.png"),
        bottomLine: "Test Now >>"
    },
    {
        title: 'Trainer Interview',
        description:
            'Trainer mode guides you like a coach correcting errors, completing answers, and teaching you how to respond confidently every time.',
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
        setFirstInterviewObject
    } = useContext(AppStateContext);
    const [meetings, setMeetings] = useState([]);
    const [lastMeeting, setLastMeeting] = useState([]);
    const [overallScore, setOverallScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
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
        }
    }, [userProfile?.uid]);
    const onRefresh = () => {
        setIsLoading(true);
        fetchMeetings(true);
        fetchUserRank();
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

    const totalInterviews = meetings.length;
    // const [open, setOpen] = useState(false);
    return (
        <>
            <TopBar />
            {
                firstInterviewObject && <InterviewScreen
                    {...firstInterviewObject}
                    showInterviewScreen={true}
                    setShowInterviewScreen={() => setFirstInterviewObject(null)}
                />
            }
            <Layout>
                <BackgroundGradient2 />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="py-5"
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
                                    Hello {userProfile?.first_name || '_'} 👋
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
                            <Pressable key={index} onPress={() => navigation.navigate('interview', { type: value })} style={{ marginBottom: 8 }}>
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
