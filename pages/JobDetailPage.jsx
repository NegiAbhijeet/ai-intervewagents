// JobDetailPage.native.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL, JAVA_API_URL } from '../components/config';
import LearningMaterials from '../components/learning-materials';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppStateContext } from '../components/AppContext';
import CustomHeader from '../components/customHeader';

export default function JobDetailPage() {
  const { setJobs } = useContext(AppStateContext);
  const navigation = useNavigation();
  const route = useRoute();
  // expecting route.params?.id
  const id = route?.params?.jobId;

  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [isExpand, setIsExpand] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [loader, setLoader] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJobData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAuth(`${API_URL}/job-details/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        const data = res?.jobDetails;
        setIsApplied(Boolean(data?.applied));
        setStatus(data?.status || null);
        setJobData(data);
        setIsLoading(false);

        const hasNoArticles =
          !data?.articles ||
          (Array.isArray(data.articles) && data.articles.length === 0);
        const hasTitle = Boolean(data?.title);

        if (hasNoArticles && hasTitle) {
          setMaterialLoading(true);
          try {
            const response2 = await fetchWithAuth(`${API_URL}/get-study-material/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobId: id,
                title: data.title,
                description: data.snippet,
              }),
            });

            const data2 = await response2.json();
            const finalResult = data2?.data;

            setJobData(prev => ({
              ...prev,
              articles: finalResult?.articles || [],
              videos: finalResult?.videos || [],
            }));
          } catch (postError) {
            console.error('Error calling study material API:', postError);
          } finally {
            setMaterialLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching job data:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  if (isLoading) {
    return (
      <View className="min-h-screen flex-1 items-center justify-center">
        <View className="flex-row items-center gap-3">
          <ActivityIndicator size="large" />
          <Text className="text-gray-600">Fetching details...</Text>
        </View>
      </View>
    );
  }

  if (!jobData) {
    return (
      <View className="min-h-screen flex-1 items-center justify-center">
        <Text className="text-gray-500">No job details found.</Text>
      </View>
    );
  }

  const makeApply = async link => {
    try {
      setLoader('apply');
      const response = await fetchWithAuth(
        `${JAVA_API_URL}/api/jobs/update/job/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applied: true }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      if (link) {
        setIsApplied(true);
        Linking.openURL(link).catch(err =>
          console.error('Failed to open link', err),
        );
      }
    } catch (error) {
      console.error('Error applying for job:', error);
    } finally {
      setLoader(null);
    }
  };

  const jobToggle = async () => {
    try {
      setLoader('save');
      const response = await fetchWithAuth(
        `${JAVA_API_URL}/api/jobs/update/job/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: status ? '' : 'saved' }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      setStatus(status ? null : 'saved');
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.job_id === id ? { ...job, status: status ? '' : 'saved' } : job,
        ),
      );
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setLoader(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4">
      <CustomHeader
        removePadding={true}
        title="Job Details"
      />
      {/* Header */}
      <View className="mb-6 py-6">
        <View className="rounded-lg shadow-lg bg-white overflow-hidden">
          <View className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <View className="flex-row items-start justify-between">
              <View style={{ flex: 1 }}>
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-xl font-bold text-gray-900 flex-1 mr-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {jobData.title}
                  </Text>

                  <Image
                    source={
                      /^https?:\/\//.test(jobData.favicon)
                        ? { uri: jobData.favicon }
                        : require('../assets/images/logo.png')
                    }
                    style={{ width: 32, height: 32, borderRadius: 6 }}
                  />
                </View>

                <View className="flex-row items-center mt-3 flex-wrap gap-4">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color="#374151"
                    />
                    <Text
                      className="text-sm text-gray-600 ml-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {jobData.source}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons
                      name="briefcase-outline"
                      size={16}
                      color="#374151"
                    />
                    <Text
                      className="text-sm text-gray-600 ml-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {jobData.job_type}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#374151" />
                    <Text
                      className="text-sm text-gray-600 ml-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {jobData.date_posted}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mt-3">
                  <Ionicons name="location-outline" size={16} color="#374151" />
                  <Text
                    className="text-sm text-gray-600 ml-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {jobData.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Job Description */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          <Text className="text-xl font-bold text-gray-900 ml-3">
            Job Description
          </Text>
        </View>

        <View className="bg-white rounded-lg shadow-md p-4">
          <Text
            className="text-gray-700 leading-relaxed"
            numberOfLines={isExpand ? undefined : 3}
            ellipsizeMode="tail"
          >
            {jobData.snippet}
          </Text>

          {!isExpand && (
            <TouchableOpacity onPress={() => setIsExpand(true)}>
              <Text className="text-blue-700 mt-2">Show more...</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="book-outline" size={20} color="#16a34a" />
          <Text className="text-xl font-bold text-gray-900 ml-3">
            Learning Materials
          </Text>
        </View>
        <LearningMaterials
          jobData={jobData}
          materialLoading={materialLoading}
        />
      </View>
      {/* Apply Section */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="send-outline" size={20} color="#f97316" />
          <Text className="text-xl font-bold text-gray-900 ml-3">
            Ready to Apply?
          </Text>
        </View>

        <View className="bg-white rounded-lg shadow-lg border border-green-200 overflow-hidden">
          <View className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <Text className="text-lg text-green-800 font-semibold">
              Complete Your Application
            </Text>
          </View>

          <View className="p-4 space-y-4">
            <Text className="text-gray-700">
              You are all set. Review the job requirements, complete learning
              materials, and customize your resume.
            </Text>

            <View className="bg-blue-50 p-3 rounded-lg">
              <Text className="font-semibold text-blue-900 mb-2">
                Application Checklist:
              </Text>

              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color="#10b981"
                  />
                  <Text className="ml-2 text-blue-800 text-sm">
                    Review job requirements and responsibilities
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color="#10b981"
                  />
                  <Text className="ml-2 text-blue-800 text-sm">
                    Complete relevant learning materials
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color="#10b981"
                  />
                  <Text className="ml-2 text-blue-800 text-sm">
                    Customize and optimize your resume
                  </Text>
                </View>
              </View>
            </View>

            <View className="py-4">
              <View className="items-center w-full">
                <View className="mb-3 w-full">
                  <Text className="text-xl font-semibold text-black text-center">
                    Get Ready for Your Interview.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AppTabs', {
                      screen: 'interview',
                      params: {
                        position: jobData.title || '',
                        skills: jobData?.skills || [],
                      },
                    })
                  }
                  className="bg-blue-600 px-6 py-3 rounded items-center justify-center w-full"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold text-base">
                    Start Interview
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              {/* Make both action buttons share the row 50 50 */}
              <View className="flex-1">
                {isApplied ? (
                  <TouchableOpacity
                    disabled
                    className="bg-green-600 py-3 rounded items-center justify-center w-full"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="send-outline" size={18} color="#fff" />
                      <Text className="text-white ml-2">Already Applied</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => makeApply(jobData?.link)}
                    disabled={Boolean(loader)}
                    className="bg-green-600 py-3 rounded items-center justify-center w-full"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="send-outline" size={18} color="#fff" />
                      {loader === 'apply' ? (
                        <ActivityIndicator style={{ marginLeft: 8 }} />
                      ) : (
                        <Text className="text-white ml-2">Apply</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-1">
                {status ? (
                  <TouchableOpacity
                    onPress={jobToggle}
                    disabled={Boolean(loader)}
                    className="bg-red-600 py-3 rounded items-center justify-center w-full"
                  >
                    <View className="flex-row items-center justify-center">
                      {loader === 'save' ? (
                        <ActivityIndicator />
                      ) : (
                        <>
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#fff"
                          />
                          <Text className="text-white ml-2">Remove</Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={jobToggle}
                    disabled={Boolean(loader)}
                    className="bg-blue-800 py-3 rounded items-center justify-center w-full"
                  >
                    <View className="flex-row items-center justify-center">
                      {loader === 'save' ? (
                        <ActivityIndicator />
                      ) : (
                        <>
                          <Ionicons
                            name="save-outline"
                            size={18}
                            color="#fff"
                          />
                          <Text className="text-white ml-2">Save</Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
      <View className="w-full h-10"></View>
    </ScrollView>
  );
}
