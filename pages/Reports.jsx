import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import Layout from './Layout';
import { AppStateContext } from '../components/AppContext';
import { JAVA_API_URL } from '../components/config';
import fetchWithAuth from '../libs/fetchWithAuth';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useNavigation } from '@react-navigation/native';

const Reports = () => {
  const { userProfile } = useContext(AppStateContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${JAVA_API_URL}/api/meetings/uid/${userProfile.uid}`,
      );
      const data = await response.json();
      if (data?.data) {
        const finalMeetings = data.data.filter(
          item => item.status === 'Completed',
        );
        const sortedMeetings = finalMeetings.sort((a, b) => {
          const dateTimeA = new Date(`${a.interviewDate}T${a.interviewTime}`);
          const dateTimeB = new Date(`${b.interviewDate}T${b.interviewTime}`);
          return dateTimeB - dateTimeA;
        });
        setMeetings(sortedMeetings);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.uid) fetchMeetings();
  }, [userProfile]);

  const calculatePercentage = report => {
    const rawScores = [
      report?.feedback?.report?.problem_solving?.score,
      report?.feedback?.report?.communication?.score,
      report?.feedback?.report?.cultural_fit_and_mindset?.score,
      report?.feedback?.report?.leadership_potential?.score,
      report?.feedback?.report?.motivation_and_engagement?.score,
      report?.feedback?.report?.behaviour_competency?.score,
      report?.feedback?.report?.technical_skills?.score,
      report?.feedback?.report?.technical_proficiency?.score,
    ];
    const validScores = rawScores.filter(
      score => typeof score === 'number' && !isNaN(score),
    );
    const average = validScores.length
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : 0;
    return Math.round((average / 10) * 100);
  };

  const formatDateTime = (dateStr, timeStr) => {
    const dateTime = new Date(`${dateStr}T${timeStr}`);
    return dateTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  const formatDuration = duration => {
    if (!duration) return '0 min';

    let seconds = 0;

    if (typeof duration === 'string') {
      seconds = parseInt(duration, 10);
      if (isNaN(seconds)) return '0 min';
    } else if (typeof duration === 'number') {
      seconds = duration;
    } else {
      return '0 min';
    }

    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <Layout>
        <ScrollView showsVerticalScrollIndicator={false} className="py-5">
          <Text className="text-2xl font-semibold mb-4">Interview Reports</Text>
          <SkeletonPlaceholder borderRadius={12}>
            {[...Array(4)].map((_, index) => (
              <SkeletonPlaceholder.Item
                key={index}
                width="100%"
                marginBottom={12}
                padding={16}
                borderRadius={12}
                borderWidth={1}
                borderColor="#E5E7EB"
                backgroundColor="#F9FAFB"
              >
                {/* Top Row: Avatar + Text + Badge */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* Avatar & Info */}
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    alignItems="center"
                  >
                    <SkeletonPlaceholder.Item>
                      <SkeletonPlaceholder.Item
                        width={120}
                        height={16}
                        borderRadius={4}
                      />
                      <SkeletonPlaceholder.Item
                        marginTop={6}
                        width={100}
                        height={14}
                        borderRadius={4}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>

                  {/* Badge */}
                  <SkeletonPlaceholder.Item
                    width={60}
                    height={20}
                    borderRadius={6}
                  />
                </SkeletonPlaceholder.Item>

                {/* Date */}
                <SkeletonPlaceholder.Item
                  marginTop={12}
                  width={100}
                  height={12}
                  borderRadius={4}
                />

                {/* Action Buttons */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  marginTop={12}
                  justifyContent="space-between"
                >
                  <SkeletonPlaceholder.Item
                    width="96%"
                    height={40}
                    borderRadius={8}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>
            ))}
          </SkeletonPlaceholder>
        </ScrollView>
      </Layout>
    );
  }

  if (!loading && meetings.length === 0) {
    return (
      <Layout>
        <ScrollView showsVerticalScrollIndicator={false} className="py-5">
          <Text className="text-2xl font-semibold mb-4">Interview Reports</Text>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 12,
              backgroundColor: '#fff',
              height: 200,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: '#111',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              No Interview Reports Found
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#555',
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              Complete some interviews to see reports here.
            </Text>
          </View>
        </ScrollView>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false} className="py-5">
        <Text className="text-2xl font-semibold mb-4">Interview Reports</Text>

        {meetings.map(report => {
          const percentage = calculatePercentage(report);

          return (
            <View
              key={report.meetingId}
              style={{
                backgroundColor: '#F9FAFB',
                padding: 16,
                marginBottom: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              {/* Avatar & Info */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontWeight: '600', fontSize: 16 }}>
                      {report.position}
                    </Text>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text style={{ fontWeight: '500' }}>Duration: </Text>
                      <Text style={{ fontWeight: '500', color: '#6B7280' }}>
                        {formatDuration(report.interviewDuration)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor:
                      percentage >= 85
                        ? '#DCFCE7'
                        : percentage >= 70
                        ? '#FEF3C7'
                        : '#FEE2E2',
                    borderWidth: 1,
                    borderColor:
                      percentage >= 85
                        ? '#BBF7D0'
                        : percentage >= 70
                        ? '#FCD34D'
                        : '#FECACA',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color:
                        percentage >= 85
                          ? '#166534'
                          : percentage >= 70
                          ? '#B45309'
                          : '#991B1B',
                    }}
                  >
                    {percentage}% Match
                  </Text>
                </View>
              </View>

              {/* Date */}
              <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>
                {formatDateTime(report.interviewDate, report.interviewTime)}
              </Text>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#2563EB',
                    paddingVertical: 10,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() =>
                    navigation.navigate('ReportDetail', {
                      meetingId: report.meetingId,
                    })
                  }
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>
                    Report
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Layout>
  );
};

export default Reports;
