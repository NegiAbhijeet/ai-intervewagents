import Layout from './Layout';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import StatsCard from '../components/StatsCard';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { AppStateContext } from '../components/AppContext';
import { JAVA_API_URL } from '../components/config';
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
          height={96}
          marginBottom={16}
          borderRadius={12}
        />
        <SkeletonPlaceholder.Item
          width="48%"
          height={96}
          marginBottom={16}
          borderRadius={12}
        />
        <SkeletonPlaceholder.Item
          width="48%"
          height={96}
          marginBottom={16}
          borderRadius={12}
        />
        <SkeletonPlaceholder.Item
          width="48%"
          height={96}
          marginBottom={16}
          borderRadius={12}
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
const Home = () => {
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

  const leaderboardRank = 15; // Replace with actual API if available

  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-semibold mb-4">
          Welcome back, {userProfile?.first_name || '_'} 👋
        </Text>

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
      </ScrollView>
    </Layout>
  );
};

export default Home;
