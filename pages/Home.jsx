import Layout from './Layout';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import StatsCard from '../components/StatsCard';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { AppStateContext } from '../components/AppContext';
import { JAVA_API_URL } from '../components/config';
import GradientCard from '../components/GradientCard';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
const interviews = [
  {
    title: 'Practice Interview',
    description:
      'Includes both technical and behavioral questions to simulate a real interview experience.',
    duration: '30-45 minutes',
    icon: 'laptop-outline',
    gradient: 'blue',
    link: 'InterviewPrepPractice',
    action: 'Start',
    value: 'Practice',
  },
  {
    title: 'Revise Interview',
    description:
      'Asks technical or behavioral questions. If an answer is incorrect, the system explains the correct one and then re-asks the same question to reinforce learning.',
    duration: '20-30 minutes',
    icon: 'checkmark-circle-outline',
    gradient: 'purple',
    link: 'InterviewPrepRevise',
    action: 'Start',
    value: 'Revise',
  },
];
const StatsSkeleton = () => {
  return (
    <SkeletonPlaceholder borderRadius={8}>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="space-between"
      >
        {/* 4 Placeholder Cards - 2 per row */}
        <SkeletonPlaceholder.Item
          width="48%"
          height={72}
          marginBottom={16}
          borderRadius={12}
        />
        <SkeletonPlaceholder.Item
          width="48%"
          height={72}
          marginBottom={16}
          borderRadius={12}
        />
        <SkeletonPlaceholder.Item
          width="48%"
          height={72}
          marginBottom={16}
          borderRadius={12}
        />
        <SkeletonPlaceholder.Item
          width="48%"
          height={72}
          marginBottom={16}
          borderRadius={12}
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
const Home = () => {
  const navigation = useNavigation();
  const { userProfile, usedMinutes } = useContext(AppStateContext);
  const [meetings, setMeetings] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const finalLoading = isLoading || !userProfile;
  async function fetchMeetings() {
    setIsLoading(true);
    try {
      const response = await fetch(
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
      setMeetings(completedMeetings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (userProfile) {
      fetchMeetings();
    }
  }, [userProfile]);

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

  const leaderboardRank = 15;
  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false} className="py-5">
        {!userProfile ? (
          <SkeletonPlaceholder borderRadius={8}>
            <SkeletonPlaceholder.Item
              width={200}
              height={28}
              marginBottom={16}
            />
          </SkeletonPlaceholder>
        ) : (
          <Text className="text-2xl font-semibold mb-4">
            Welcome back, {userProfile?.first_name || '_'} 👋
          </Text>
        )}
        {/* Stats */}
        {finalLoading ? (
          <StatsSkeleton />
        ) : (
          <View className="flex-row flex-wrap justify-between mb-6">
            <StatsCard
              label="Total Interviews"
              value={totalInterviews.toString()}
            />
            <StatsCard
              label="Average Score"
              value={overallScore.toString()}
              color="green"
            />
            <StatsCard
              label="Time Practiced"
              value={`${usedMinutes}h`}
              color="purple"
            />
            <StatsCard
              label="Leaderboard Rank"
              value={`#${leaderboardRank}`}
              color="yellow"
            />
          </View>
        )}
        <View className="mb-10">
          <Text className="text-lg font-semibold mb-2">Interview Type</Text>

          {interviews.map(
            (
              {
                title,
                description,
                duration,
                icon,
                gradient,
                link,
                action,
                value,
              },
              index,
            ) => (
              <Pressable
                key={index}
                onPress={() =>
                  navigation.navigate('interview', {
                    type: value,
                  })
                }
                className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-4"
              >
                <GradientCard
                  key={index}
                  gradient={gradient}
                  className="flex flex-col justify-between p-5"
                >
                  <View>
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="p-3 rounded-full bg-white/20">
                        <Ionicons name={icon} size={30} color="#000" />
                      </View>
                      <Text className="font-semibold text-lg text-black">
                        {title}
                      </Text>
                    </View>
                    <Text className="text-base text-black mb-4">
                      {description}
                    </Text>
                    <Text className="text-sm text-black">
                      Duration: {duration}
                    </Text>
                  </View>

                  <View className="flex-row justify-end items-center mt-4">
                    <Pressable
                      onPress={() => navigation.navigate(link)}
                      className="flex-row items-center bg-white/20 hover:bg-white/30 transition-colors duration-200 border border-white/30 rounded-md px-3 py-1 gap-2"
                    >
                      <Text className="text-base text-black">{action}</Text>
                      <Ionicons
                        name="arrow-forward-outline"
                        size={18}
                        color="#000"
                      />
                    </Pressable>
                  </View>
                </GradientCard>
              </Pressable>
            ),
          )}
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Home;
