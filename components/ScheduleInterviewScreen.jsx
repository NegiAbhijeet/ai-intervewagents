// ScheduleInterviewScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import debounce from 'lodash.debounce';
import { JAVA_API_URL, API_URL } from './config';
import InterviewScreen from './interviewScreen';
import Ionicons from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import InterviewTypeDropdown from './InterviewTypeDropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const typeOptions = [
  { label: 'Technical', value: 'Technical' },
  { label: 'Behavioral', value: 'Behavioral' },
];

export default function ScheduleInterviewScreen({
  routePosition,
  userProfile,
  type,
  routeSkills,
}) {
  const insets = useSafeAreaInsets();
  const [interviewType, setInterviewType] = useState('Technical');
  const [selectedPosition, setSelectedPosition] = useState(routePosition || '');
  const [currentSkill, setCurrentSkill] = useState('');
  const [skills, setSkills] = useState(routeSkills || []);
  const [duration, setDuration] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [myCandidate, setMyCandidate] = useState(null);
  const [showInterviewScreen, setShowInterviewScreen] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [interviewData, setInterviewData] = useState({
    canId: null,
    meetingId: null,
    interviewType: null,
    interviewTime: null,
  });

  const practiceOrRevise = type || 'practice';

  const addSkill = () => {
    if (currentSkill) {
      let newSkills = currentSkill
        .split(',')
        .map(s => s.trim())
        .filter(s => s && !skills.includes(s));

      if (skills.length + newSkills.length > 10) {
        Alert.alert('Limit Reached', 'You can only add up to 10 skills.');
        return;
      }

      setSkills([...skills, ...newSkills]);
      setCurrentSkill('');
    }
  };

  const removeSkill = skill => {
    setSkills(skills.filter(s => s !== skill));
  };

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

  const fetchCandidatedata = async () => {
    try {
      const response = await fetch(
        `${JAVA_API_URL}/api/candidates/uid/${userProfile?.uid}`,
      );
      const data = await response.json();
      if (data?.data && data?.data.length > 0) {
        setMyCandidate(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch candidate:', error);
    }
  };

  useEffect(() => {
    if (userProfile?.uid) {
      fetchCandidatedata();
    }
  }, [userProfile]);

  // ✅ Skill Suggestion Based on Position
  const fetchSkillsForPosition = async position => {
    setLoadingSkills(true);
    try {
      const body = {
        position,
        experience: myCandidate?.experienceYears || 0,
        uid: userProfile?.uid,
      };

      const response = await fetch(`${API_URL}/generate-skills/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await response.json();
      const newSkills = data.skills || [];
      const limitedSkills = newSkills.slice(0, 10);
      setSkills(limitedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoadingSkills(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce(value => {
      if (value.trim().length > 0) {
        fetchSkillsForPosition(value.trim());
      }
    }, 500),
    [myCandidate, userProfile?.uid],
  );

  const handlePositionChange = value => {
    setSelectedPosition(value);
    debouncedFetch(value);
  };

  const handleSubmit = async () => {
    // ✅ Field Validation with Toast (field name only in `text1`)
    if (!interviewType) {
      Toast.show({
        type: 'error',
        text1: 'Interview Type',
        text2: 'Interview type is required.',
      });
      return;
    }

    if (!selectedPosition || typeof selectedPosition !== 'string') {
      Toast.show({
        type: 'error',
        text1: 'Position',
        text2: 'Valid position is required.',
      });
      return;
    }

    const parsedDuration = parseInt(duration);
    if (!parsedDuration || isNaN(parsedDuration) || parsedDuration <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Duration',
        text2: 'Duration must be a positive number.',
      });
      return;
    }

    if (!skills.length) {
      Toast.show({
        type: 'error',
        text1: 'Skills',
        text2: 'At least one skill is required.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const now = new Date();
      const { date, hour, minute } = extractMeetingDateTimeParts(now);

      const payload = {
        uid: userProfile?.uid,
        hour,
        minute,
        date,
        duration: parsedDuration * 60,
        position: selectedPosition.trim(),
        role: 'candidate',
        candidateId: myCandidate?.canId || '',
        canEmail: userProfile?.email || userProfile?.user_email || '',
        interviewType: interviewType || '',
        type: practiceOrRevise,
        requiredSkills: skills,
        jobDescription: '',
        resumeText: myCandidate?.resumeText || '',
        experience: myCandidate?.experienceYears || 0,
      };

      const response = await fetch(`${API_URL}/interview-agent/`, {
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
        setInterviewData({
          canId,
          meetingId,
          interviewType,
          interviewTime,
        });
        setCandidateName(candidateName);
        setShowInterviewScreen(true);

        Toast.show({
          type: 'success',
          text1: 'Interview Created',
          text2: 'Launching interview screen...',
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Something went wrong.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const isButtonDisabled = isLoading || loadingSkills;
  const buttonBgColor = isButtonDisabled ? 'bg-slate-400' : 'bg-blue-500';
  const maxDuration = 15;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          // reserve bottom space for safe area plus extra gap
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-semibold mb-4">Start Interview</Text>

        {showInterviewScreen &&
          interviewData?.meetingId &&
          interviewData?.canId &&
          interviewData?.interviewTime && (
            <InterviewScreen
              {...interviewData}
              candidateName={candidateName}
              adminId={userProfile?.uid}
              showInterviewScreen={showInterviewScreen}
              setShowInterviewScreen={setShowInterviewScreen}
            />
          )}

        <Text className="text-lg font-semibold text-slate-700 mb-2 gap-2">
          <View
            style={{
              transform: [{ translateY: 4 }],
            }}
          >
            <Ionicons name="layers-outline" size={18} color="black" />
          </View>{' '}
          Interview Type *
        </Text>
        <View className="border border-slate-300 rounded-xl bg-white px-1">
          <InterviewTypeDropdown
            interviewType={interviewType}
            setInterviewType={setInterviewType}
            typeOptions={typeOptions}
          />
        </View>

        <Text className="text-lg font-semibold text-slate-700 mt-4 mb-2">
          <View
            style={{
              transform: [{ translateY: 4 }],
            }}
          >
            <Ionicons
              name="briefcase-outline"
              size={18}
              color="black"
              className="mt-1"
            />
          </View>{' '}
          Position *
        </Text>
        <TextInput
          value={selectedPosition}
          onChangeText={handlePositionChange}
          placeholder="Type a position..."
          placeholderTextColor="#9CA3AF"
          className="h-16 bg-white rounded-xl border border-slate-300 px-3 text-lg text-black"
        />

        <Text className="text-lg font-semibold text-slate-700 mt-4 mb-2">
          <View
            style={{
              transform: [{ translateY: 4 }],
            }}
          >
            <Ionicons name="code-slash-outline" size={18} color="black" />
          </View>{' '}
          Add Skills *
        </Text>
        <View className="flex-row items-center">
          <TextInput
            value={currentSkill}
            onChangeText={setCurrentSkill}
            placeholder="e.g. JavaScript, React"
            placeholderTextColor="#9CA3AF"
            className="flex-1 h-16 bg-white rounded-xl border border-slate-300 px-3 text-lg text-black"
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity
            onPress={addSkill}
            className="ml-3 bg-gray-100 border border-slate-300 p-3 rounded-xl h-16 w-16 flex items-center justify-center"
          >
            <Ionicons name="add" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {loadingSkills ? (
          <ActivityIndicator color="#3b82f6" className="my-3" />
        ) : skills.length === 0 ? (
          <></>
        ) : (
          <View className="flex-row flex-wrap mt-3">
            {skills.map(skill => (
              <View
                key={skill}
                className="flex-row items-center bg-blue-100 px-3 py-2 rounded-full m-1"
              >
                <Text className="text-xs text-blue-900 mr-2">{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text className="text-lg font-semibold text-slate-700 mt-4 mb-2">
          <View
            style={{
              transform: [{ translateY: 4 }],
            }}
          >
            <Ionicons name="time-outline" size={18} color="black" />
          </View>{' '}
          Duration (in minutes, max {maxDuration}) *
        </Text>

        <TextInput
          value={duration.toString()}
          onChangeText={val => {
            const num = parseInt(val, 10);
            if (val === '') {
              setDuration('');
              return;
            }
            if (!isNaN(num)) {
              if (num >= 0 && num <= maxDuration) {
                setDuration(num);
              } else if (num > maxDuration) {
                setDuration(maxDuration);
              }
            }
          }}
          keyboardType="numeric"
          placeholder={`Enter duration (max ${maxDuration})`}
          placeholderTextColor="#9CA3AF"
          className="h-16 bg-white rounded-xl border border-slate-300 px-3 text-lg text-black"
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isButtonDisabled}
          className={`mt-8 h-16 rounded-xl flex-row items-center justify-center mb-16 ${buttonBgColor}`}
        >
          {isLoading ? (
            <>
              <Text className="text-white font-semibold text-lg py-4">
                Please wait...
              </Text>
              <ActivityIndicator color="#fff" className="ml-2" />
            </>
          ) : (
            <>
              <Ionicons name="play-circle-outline" size={22} color="#fff" />
              <Text className="text-white font-semibold text-lg py-4 ml-2">
                Start Interview
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
