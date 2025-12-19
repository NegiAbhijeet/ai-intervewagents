import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  RefreshControl,
  Image,
  Pressable,
} from 'react-native';
import Layout from './Layout';
import { AppStateContext } from '../components/AppContext';
import { JAVA_API_URL } from '../components/config';
import fetchWithAuth from '../libs/fetchWithAuth';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Ionicons from '@react-native-vector-icons/ionicons';
import TopBar from '../components/TopBar';
import ReportModal from '../components/reportModal';
import BackgroundGradient2 from '../components/backgroundGradient2';
import StatusBoxes from '../components/ReportsStatusBoxes';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import GuessScoreModal from './guessScore';
import AfterGuessModal from './afterGuess';
import SharePage from './sharePage';
import StreakProgress from '../components/streakProgress';
const Reports = ({ route }) => {
  const { t } = useTranslation();
  const { userProfile, showDailyStreak, setShowDailyStreak, leaderboardRank, setFirstInterviewObject, language, myCandidate } = useContext(AppStateContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [isViewDetails, setIsViewDetails] = useState(false);
  const [isViewSkills, setIsViewSkills] = useState(false);
  const [rowTotalMeetings, setRowTotalMeetings] = useState(0)
  const [pendingReports, setPendindReports] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all');
  const [guessStage, setGuessStage] = useState(null)
  // small animated rotation for the refresh icon when active
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [meetingId, setMeetingId] = useState(route.params?.meetingId ?? '');
  const [guessRange, setGuessRange] = useState(null)
  const [serverScore, setServerScore] = useState(null)

  useEffect(() => {
    if (route.params?.meetingId) {
      setMeetingId(route.params?.meetingId)
      setGuessStage(1)
    } else if (route.params?.report) {
      setCurrentReport(route.params?.report)
    }
  }, [route.params]);


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
        `${JAVA_API_URL}/api/meetings/uid/${userProfile.uid}`
      );
      const data = await response.json();

      const items = Array.isArray(data?.data) ? data.data : [];
      setRowTotalMeetings(items.length);

      // only completed meetings
      const completedMeetings = items.filter(item => item.status === 'Completed');

      // completed that have feedback
      const completedWithFeedback = completedMeetings.filter(item => !!item.feedback);

      // pending reports = completed - completedWithFeedback
      const pendingReportsLen = Math.max(0, completedMeetings.length - completedWithFeedback.length);
      setPendindReports(pendingReportsLen);

      // attach a numeric timestamp for reliable sorting, then sort once
      const withTimestamps = completedMeetings.map(item => {
        const datePart = item.interviewDate ?? '';
        const timePart = item.interviewTime ?? '00:00';
        const iso = `${datePart}T${timePart}`;
        const ts = Date.parse(iso);
        return { item, ts: isNaN(ts) ? 0 : ts };
      });

      withTimestamps.sort((a, b) => b.ts - a.ts);

      const sortedMeetings = withTimestamps.map(({ item }) => item);
      setMeetings(sortedMeetings);
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
    // const dateTime = new Date(`${dateStr}T${timeStr}`);
    // return dateTime.toLocaleString('en-US', {
    //   month: 'short',
    //   day: 'numeric',
    //   year: 'numeric',
    //   hour: 'numeric',
    //   minute: '2-digit',
    //   hour12: true,
    // });
    const dateTime = new Date(`${dateStr}`);
    return dateTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

    if (seconds > 0 && seconds < 60) {
      return `${seconds} sec`;
    }

    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const filteredMeetings = meetings.filter(report => {
    if (activeFilter === 'all') return true;
    const t = (report.type || '').toLowerCase();
    if (activeFilter === 'mock') return t === 'practice';
    if (activeFilter === 'trainer') return t === 'revise';
    return true;
  });

  const onSelectGuess = (guessRange) => {
    setGuessRange(guessRange)
    setGuessStage(2)
  }
  return (
    <>
      <TopBar />
      <Layout>
        {
          showDailyStreak && <StreakProgress currentDay={Math.max(1, leaderboardRank)} setShowDailyStreak={setShowDailyStreak} />
        }
        <BackgroundGradient2 />
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="py-5"
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {
            guessStage === 1 ?
              <GuessScoreModal visible={true} onRequestClose={() => setGuessStage(null)} onSelectGuess={onSelectGuess} />
              : (
                guessStage === 2 ? <AfterGuessModal
                  visible={true}
                  onRequestClose={() => setGuessStage(null)}
                  onNext={() => {
                    setGuessStage(3)
                  }}
                  serverScore={serverScore}
                  setServerScore={setServerScore}
                  guessedRange={guessRange}
                  interviewId={meetingId}
                /> :
                  (guessStage === 3 ? <SharePage
                    visible={true}
                    onRequestClose={() => setGuessStage(null)}
                    meetingId={meetingId}
                    score={serverScore}
                  />
                    : <></>))
          }

          <View style={{ width: "100%" }}>
            <StatusBoxes
              total={rowTotalMeetings}
              completed={meetings.length}
              pending={pendingReports}
            />
          </View>

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

          {/* Empty state */}
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
                marginTop: 40
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
                {t('reports.empty.title')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#555',
                  textAlign: 'center',
                  lineHeight: 22,
                }}
              >
                {t('reports.empty.subtitle')}
              </Text>
            </View>
          )}

          {/* Content list */}
          {!loading && meetings.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, alignSelf: "center", marginTop: 40, marginBottom: 15 }}>
                {[
                  { key: 'all', label: t('reports.filters.all') },
                  { key: 'mock', label: t('reports.filters.mock') },
                  { key: 'trainer', label: t('reports.filters.trainer') },
                ].map(btn => {
                  const isActive = activeFilter === btn.key;

                  const Button = (
                    <Pressable
                      key={btn.key}
                      onPress={() => setActiveFilter(btn.key)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                        backgroundColor: 'rgba(243, 244, 246, 1)',
                        justifyContent: 'center',
                        alignItems: 'center', borderRadius: 9999
                      }}
                    >
                      <Text style={{ color: 'rgba(55, 65, 81, 1)', fontWeight: '500', fontSize: 14 }}>
                        {btn.label}
                      </Text>
                    </Pressable>
                  );

                  if (!isActive) return Button;

                  return (
                    <LinearGradient
                      key={btn.key}
                      colors={['rgba(8, 77, 197, 1)', 'rgba(123, 18, 196, 1)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: 9999,
                        padding: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-end'
                      }}
                    >
                      <Pressable
                        onPress={() => setActiveFilter(btn.key)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 20,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: isActive ? '#ffffff' : '#111827', fontWeight: '600', fontSize: 14 }}>
                          {btn.label}
                        </Text>
                      </Pressable>
                    </LinearGradient>
                  );
                })}
              </View>

              {filteredMeetings.map(report => {
                const percentage = report?.feedback?.averagePercentage || 0;
                return (
                  <View
                    key={report.meetingId}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      padding: 20,
                      marginBottom: 12,
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: 'rgba(243, 244, 246, 1)',
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        flex: 1,
                        marginRight: 8,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 8,
                          borderRadius: 999,
                          backgroundColor: 'rgba(219, 234, 254, 1)',
                        }}>
                          <Image
                            source={require('../assets/images/code.png')}
                            style={{ width: 20, height: 20, resizeMode: 'contain' }}
                          />
                        </View>

                        <Text
                          style={{
                            fontWeight: '700',
                            fontSize: 16,
                            flexShrink: 1,
                            flexGrow: 0,
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {report.position}
                        </Text>
                      </View>

                      <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor:
                          percentage >= 85
                            ? 'rgba(220, 252, 231, 1)'
                            : percentage >= 70
                              ? 'rgba(255, 237, 213, 1)'
                              : '#FEE2E2',
                        flexShrink: 0,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color:
                            percentage >= 85
                              ? 'rgba(52, 199, 89, 1)'
                              : percentage >= 70
                                ? 'rgba(255, 149, 0, 1)'
                                : 'red',
                        }}>
                          {report?.feedback ? `${percentage}%` : t('reports.pending')}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontWeight: '500', fontSize: 14, color: 'rgba(75, 85, 99, 1)', marginTop: 8 }}>
                      {t(`types.${report?.interviewType.toLowerCase()}`)} {t('reports.interview')}
                    </Text>


                    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="time-outline" size={14} color="rgba(75, 85, 99, 1)" />
                        <Text style={{ fontWeight: '500', color: '#6B7280', fontSize: 14 }}>
                          {formatDuration(report.interviewDuration)}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="calendar-outline" size={14} color="rgba(75, 85, 99, 1)" />
                        <Text style={{ color: 'rgba(75, 85, 99, 1)', fontSize: 14 }}>
                          {formatDateTime(report.interviewDate)}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="calendar-outline" size={14} color="rgba(75, 85, 99, 1)" />
                        <Text style={{ color: 'rgba(75, 85, 99, 1)', fontSize: 14 }}>
                          {t(`types.${report?.type?.toLowerCase() || 'unknown'}`)}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: report?.feedback ? "rgba(0,0,0)" : "rgba(0,0,0,0.3)",
                          paddingVertical: 14,
                          borderRadius: 16,
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                        disabled={!report?.feedback}
                        onPress={() => report?.feedback && setCurrentReport(report)}
                      >
                        <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                          {t('reports.viewReport')}
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
            setFirstInterviewObject={setFirstInterviewObject}
            userProfile={userProfile}
            language={language}
            myCandidate={myCandidate}
          />
        </ScrollView>
      </Layout>
    </>
  );
};

export default Reports;
