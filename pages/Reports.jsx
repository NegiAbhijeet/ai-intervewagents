import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  RefreshControl,
} from 'react-native';
import Layout from './Layout';
import { AppStateContext } from '../components/AppContext';
import { JAVA_API_URL } from '../components/config';
import fetchWithAuth from '../libs/fetchWithAuth';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import TopBar from '../components/TopBar';
import ReportModal from '../components/reportModal';
const Reports = () => {
  const { userProfile } = useContext(AppStateContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [isViewDetails, setIsViewDetails] = useState(false);
  const [isViewSkills, setIsViewSkills] = useState(false);

  // small animated rotation for the refresh icon when active
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotate = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ).start();
  };

  const stopRotate = () => {
    rotateAnim.stopAnimation(() => rotateAnim.setValue(0));
  };

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
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      stopRotate();
    }
  };

  useEffect(() => {
    if (userProfile?.uid) fetchMeetings();
  }, [userProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    startRotate();
    fetchMeetings();
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

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Single return. Child areas are conditional inside the layout.
  return (
    <>
      <TopBar />
      <Layout>
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="py-5"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-semibold">Interview Reports</Text>
            {/* <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <TouchableOpacity
                onPress={onRefresh}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: '#EFF6FF',
                  borderWidth: 1,
                  borderColor: '#DBEAFE',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Animated.View
                  style={{ transform: [{ rotate: rotateInterpolate }] }}
                >
                  <Ionicons name="refresh" size={18} />
                </Animated.View>
                <Text style={{ fontWeight: '600' }}>Refresh</Text>
              </TouchableOpacity>
            </View> */}
          </View>

          {/* Top user-friendly status banner */}
          <View
            style={{
              // flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              marginBottom: 12,
              backgroundColor: '#FFF7ED',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FDE3BF',
              gap: 10,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Text style={{ fontSize: 14 }}>
                Your reports may take a moment to load
              </Text>
            </View>
          </View>

          {/* Loading skeleton block (visible when loading) */}
          {loading && (
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
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
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

                    <SkeletonPlaceholder.Item
                      width={60}
                      height={20}
                      borderRadius={6}
                    />
                  </SkeletonPlaceholder.Item>

                  <SkeletonPlaceholder.Item
                    marginTop={12}
                    width={100}
                    height={12}
                    borderRadius={4}
                  />

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
          )}

          {/* Empty state (visible when not loading and no meetings) */}
          {!loading && meetings.length === 0 && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 12,
                backgroundColor: '#fff',
                height: 200,
                padding: 16,
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
          )}

          {/* Content list (visible when not loading and there are meetings) */}
          {!loading && meetings.length > 0 && (
            <>
              {meetings.map(report => {
                const percentage = report?.feedback?.averagePercentage || 0;
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
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <View>
                          <Text style={{ fontWeight: '600', fontSize: 16 }}>
                            {report.position}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontWeight: '500' }}>
                              Duration:{' '}
                            </Text>
                            <Text
                              style={{ fontWeight: '500', color: '#6B7280' }}
                            >
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

                    <Text
                      style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}
                    >
                      {formatDateTime(
                        report.interviewDate,
                        report.interviewTime,
                      )}
                    </Text>

                    <View
                      style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}
                    >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: '#2563EB',
                          paddingVertical: 10,
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => setCurrentReport(report)}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>
                          Report
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          <ReportModal
            visible={!!currentReport?.feedback}
            onClose={() => {
              setCurrentReport(null);
              setIsViewDetails(false);
              setIsViewSkills(false);
            }}
            report={currentReport}
            isViewDetails={isViewDetails}
            setIsViewDetails={setIsViewDetails}
            isViewSkills={isViewSkills}
            setIsViewSkills={setIsViewSkills}
          />
        </ScrollView>
      </Layout>
    </>
  );
};

export default Reports;
