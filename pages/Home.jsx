// src/screens/Home.tsx
import Layout from './Layout';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import ActionButton from '../components/ActionButton';
import SessionItem from '../components/SessionItem';
import StatsCard from '../components/StatsCard';

const Home = () => {
  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-semibold mb-4">
          Welcome back, Sarah 👋
        </Text>

        {/* Stats */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatsCard label="Total Interviews" value="24" />
          <StatsCard label="Average Score" value="8.5" color="green" />
          <StatsCard label="Time Practiced" value="12h" color="purple" />
          <StatsCard label="Leaderboard Rank" value="#15" color="yellow" />
        </View>

        {/* Actions */}
        <ActionButton
          label="Practice Interview"
          description="Mock interview sessions"
          buttonText="Start Practice"
        />
        <ActionButton
          label="Revise Interview"
          description="Review past responses"
          buttonText="Start Review"
          color="green"
        />

        {/* Recent Sessions */}
        <Text className="text-lg font-semibold mt-8 mb-2">Recent Sessions</Text>
        <View className="gap-2">
          <SessionItem
            title="Frontend Developer"
            date="Dec 15, 2024"
            score="8.5"
          />
          <SessionItem
            title="Product Manager"
            date="Dec 12, 2024"
            score="7.8"
          />
          <SessionItem title="Data Scientist" date="Dec 10, 2024" score="9.2" />
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Home;
