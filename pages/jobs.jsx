// JobsPage.native.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DashboardHeader from '../components/dashboard-header'; // ensure RN-compatible
import fetchWithAuth from '../libs/fetchWithAuth';
import TemplateCard from '../components/candidateGradientCard'; // ensure RN-compatible
import JobsFormDetails from '../components/jobsFormDetails'; // ensure RN-compatible
import Ionicons from '@react-native-vector-icons/ionicons';
import { API_URL, JAVA_API_URL } from '../components/config';
import { AppStateContext } from '../components/AppContext';
import TopBar from '../components/TopBar';
import Layout from './Layout';
import { RefreshControl } from 'react-native-gesture-handler';

export default function JobsPage() {
  const navigation = useNavigation();
  const {
    userProfile,
    setUserProfile,
    jobsFetched,
    setJobsFetched,
    jobs,
    setJobs,
  } = useContext(AppStateContext);

  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Finding jobs');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchCandidate = async uid => {
    try {
      const response = await fetchWithAuth(
        `${JAVA_API_URL}/api/candidates/uid/${uid}`,
      );
      const result = await response.json();
      if (Array.isArray(result?.data) && result.data.length > 0) {
        setCandidate(result.data[0]);
        return result.data[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching candidate:', err);
      return null;
    }
  };

  const fetchJobs = async (body, isRefreshingCall = false) => {
    try {
      setLoading(true);
      if (isRefreshingCall) {
        setIsRefreshing(true);
      }
      const res = await fetchWithAuth(`${API_URL}/job-search/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const jobResult = await res.json();
      setUserProfile(prev => ({
        ...prev,
        jobs_updated_on: new Date().toISOString(),
      }));
      return jobResult?.data?.jobs || [];
    } catch (err) {
      console.error('Error fetching jobs:', err);
      return [];
    } finally {
      setLoading(false);
      if (isRefreshingCall) {
        setIsRefreshing(false);
      }
    }
  };

  const handleFetch = async () => {
    if (!userProfile?.uid) return;
    try {
      setLoading(true);
      const cand = await fetchCandidate(userProfile.uid);
      if (cand?.position && cand?.experienceYears) {
        const body = {
          uid: userProfile.uid,
          role: cand.position,
          experience_years: cand.experienceYears,
        };
        const fetched = await fetchJobs(body);

        console.log(fetched, '===');
        setJobs(fetched);
        setJobsFetched(true);
      } else {
        setOpenPopup(true);
        return;
      }
    } finally {
      setLoading(false);
    }
  };
  async function handleRefresh() {
    try {
      const body = {
        uid: userProfile.uid,
        role: candidate.position,
        experience_years: candidate.experienceYears,
      };
      const fetched = await fetchJobs(body, true);
      setJobs(fetched);
      setJobsFetched(true);
    } catch (err) {
      console.log('Error on job fetch', err);
    }
  }
  useEffect(() => {
    if (userProfile?.uid && !jobsFetched) {
      handleFetch();
    }
  }, []);

  useEffect(() => {
    if (loading) {
      setLoaderText('Finding jobs...');
      const timer = setTimeout(() => {
        setLoaderText('We’re warming up your job feed...');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const uniqueLocations = useMemo(() => {
    const locations = jobs.map(job => job.location).filter(Boolean);
    return Array.from(new Set(locations));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];
    if (jobTypeFilter) {
      filtered = filtered.filter(job =>
        String(job.job_type || '')
          .toLowerCase()
          .includes(String(jobTypeFilter || '').toLowerCase()),
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(
        job =>
          String(job.location || '').toLowerCase() ===
          String(locationFilter || '').toLowerCase(),
      );
    }
    if (showSavedOnly) {
      filtered = filtered.filter(
        job => String(job.status || '').toLowerCase() === 'saved',
      );
    }
    return filtered;
  }, [jobs, jobTypeFilter, locationFilter, showSavedOnly]);

  const renderJob = ({ item: job }) => {
    return (
      <TemplateCard
        onPress={() => navigation.navigate('jobDetails', { jobId: job.job_id })}
        title={job.title}
        description={job.snippet}
        source={job.location}
        IconComponent={() => (
          <View className="p-2 rounded-lg bg-blue-50">
            <Image
              source={
                job.favicon && /^https?:\/\//.test(job.favicon)
                  ? { uri: job.favicon }
                  : require('../assets/images/logo.png')
              }
              style={{
                width: 28,
                height: 28,
                resizeMode: 'contain',
                borderRadius: 6,
              }}
            />
          </View>
        )}
        FooterComponent={() => (
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            {job.date_posted && (
              <Text className="text-xs text-gray-400">{job.date_posted}</Text>
            )}
            <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <Text className="text-white text-sm">View</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </View>
          </View>
        )}
      />
    );
  };

  // if (!openPopup) {
  //   return (
  //     <JobsFormDetails
  //       uid={userProfile?.uid}
  //       canId={candidate?.canId}
  //       fetchJobs={fetchJobs}
  //       setJobs={setJobs}
  //       setOpenPopup={setOpenPopup}
  //     />
  //   );
  // }

  return (
    <>
      <TopBar />
      <Layout>
        {openPopup ? (
          <ScrollView showsVerticalScrollIndicator={false} className="py-5">
            <View className="flex-1 items-center justify-center w-full">
              <JobsFormDetails
                uid={userProfile?.uid}
                canId={candidate?.canId}
                fetchJobs={fetchJobs}
                setJobs={setJobs}
                setOpenPopup={setOpenPopup}
              />
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="py-5"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {/* Header */}
            <View className="flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <DashboardHeader
                title={`Recommended Jobs (${filteredJobs?.length || 0})`}
                description={`Here, is job recommendation for you for the role of ${
                  candidate?.position || '_'
                }.`}
                extraText="(Upcoming job update in 12 hours)"
              />

              <TouchableOpacity
                onPress={() => setShowSavedOnly(prev => !prev)}
                className="flex-row items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg w-full sm:w-auto"
              >
                <Text className="text-lg">
                  {showSavedOnly ? 'All Jobs' : 'Saved Jobs'}
                </Text>
                <View className="ml-2" style={{ width: 18, height: 18 }}>
                  <Ionicons
                    name={showSavedOnly ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color="#000000"
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <View className="space-y-6 sm:space-y-8 mt-4">
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <View className="h-12 border border-gray-300 rounded-lg overflow-hidden justify-center px-3 bg-white text-black">
                    <Picker
                      mode="dropdown"
                      selectedValue={jobTypeFilter}
                      onValueChange={val => setJobTypeFilter(val)}
                      style={{
                        width: '100%',
                        paddingVertical: 6,
                        color: '#000',
                      }}
                      itemStyle={{ fontSize: 15, text: 'black' }}
                    >
                      <Picker.Item label="All Types" value="" />
                      <Picker.Item label="Full Time" value="full" />
                      <Picker.Item label="Hybrid" value="hybrid" />
                      <Picker.Item label="Remote" value="remote" />
                    </Picker>
                  </View>
                </View>

                <View className="flex-1">
                  <View className="h-12 border border-gray-300 rounded-lg overflow-hidden justify-center px-3 bg-white text-black">
                    <Picker
                      mode="dropdown"
                      selectedValue={locationFilter}
                      onValueChange={val => setLocationFilter(val)}
                      style={{
                        width: '100%',
                        paddingVertical: 6,
                        color: '#000',
                      }}
                      itemStyle={{ fontSize: 15, text: 'black' }}
                    >
                      <Picker.Item label="All Locations" value="" />
                      {uniqueLocations.map((loc, idx) => (
                        <Picker.Item key={idx} label={loc} value={loc} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Job List */}
              <View className="mt-4">
                {loading ? (
                  <View className="w-full items-center justify-center py-16">
                    <View className="flex-row items-center gap-3">
                      <ActivityIndicator size="large" />
                      <Text className="text-sm text-gray-600 font-medium">
                        {loaderText}
                      </Text>
                    </View>
                  </View>
                ) : (
                  filteredJobs.map((job, index) => (
                    <View key={job.job_id || index} className="mb-3">
                      {renderJob({ item: job })}
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </Layout>
    </>
  );
}
