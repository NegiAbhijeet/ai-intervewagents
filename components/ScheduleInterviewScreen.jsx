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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import debounce from 'lodash.debounce';
import { JAVA_API_URL, API_URL } from './config';
import InterviewScreen from './interviewScreen';
const typeOptions = [
  { label: 'Technical', value: 'Technical' },
  { label: 'Behavioral', value: 'Behavioral' },
];
const uid = 'hirMjzjfRiW0DGzPal4lzOCN2wg2';
const userEmail = 'abhijeetnegi.ab@gmail.com';

export default function ScheduleInterviewScreen() {
  const [interviewType, setInterviewType] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');
  const [skills, setSkills] = useState([]);
  const [duration, setDuration] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [myCandidate, setMyCandidate] = useState(null);
  const [showInterviewScreen, setShowInterviewScreen] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [interviewData, setInterviewData] = useState({
    agentId: null,
    canId: null,
    meetingId: null,
    interviewType: null,
    interviewTime: null,
  });

  const type = 'revise'; // Or derive dynamically if needed

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

  const fetchAgents = async () => {
    try {
      const planId = 1;
      const userId =
        planId === '1' || planId === 1 ? 'user2026' : 'deepgramuser2026';

      const res = await fetch(`${JAVA_API_URL}/api/agent/uid/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      if (data?.data) {
        setSelectedAgent(data?.data[0]?.agId || '');
        setAgents(data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const fetchCandidatedata = async () => {
    try {
      const response = await fetch(`${JAVA_API_URL}/api/candidates/uid/${uid}`);
      const data = await response.json();
      if (data?.data && data?.data.length > 0) {
        setMyCandidate(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch candidate:', error);
    }
  };

  useEffect(() => {
    fetchCandidatedata();
    fetchAgents();
  }, []);

  // ✅ Skill Suggestion Based on Position
  const fetchSkillsForPosition = async position => {
    setLoadingSkills(true);
    try {
      const body = {
        position,
        experience: myCandidate?.experienceYears || 0,
        uid: uid,
      };
      console.log(body, '===', `${API_URL}/generate-skills/`);

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
      console.log(data, '====');
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
    [myCandidate, uid],
  );

  const handlePositionChange = value => {
    setSelectedPosition(value);
    debouncedFetch(value);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const now = new Date();
      const { date, hour, minute } = extractMeetingDateTimeParts(now);

      const myAgent = agents.find(item => item?.agId === selectedAgent);

      const payload = {
        uid,
        hour,
        minute,
        date,
        duration: parseInt(duration) * 60,
        position: selectedPosition || '',
        role: 'candidate',
        candidateId: myCandidate?.canId || '',
        canEmail: userEmail || '',
        agentId: myAgent?.agId,
        interviewers: [myAgent?.name] || [],
        interviewType: interviewType || '',
        type,
        requiredSkills: skills,
        jobDescription: '',
        resumeText: myCandidate?.resumeText || '',
        experience: myCandidate?.experienceYears || 0,
      };

      console.log(payload);

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
      console.log('Meeting scheduled:', result);

      const meetingUrl = result?.meeting_url;

      if (meetingUrl) {
        const urlParams = new URLSearchParams(meetingUrl.split('?')[1]);

        const meetingId = urlParams.get('meetingId');
        const canId = urlParams.get('canId');
        const agentId = urlParams.get('agentId');
        const interviewType = urlParams.get('interviewType');
        const candidateName = urlParams.get('candidateName') || 'User';
        const interviewTime = urlParams.get('interviewTime');
        const payload = {
          agentId: agentId,
          canId: canId,
          meetingId: meetingId,
          interviewType: interviewType,
          interviewTime: interviewTime,
        };
        console.log(payload, '==');

        setInterviewData(payload);
        setCandidateName(candidateName);
        setShowInterviewScreen(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1">
      {showInterviewScreen && interviewData?.meetingId && (
        <InterviewScreen
          {...interviewData}
          candidateName={candidateName}
          adminId={uid}
          showInterviewScreen={showInterviewScreen}
          setShowInterviewScreen={setShowInterviewScreen}
        />
      )}

      <Text className="text-lg font-semibold text-slate-700 mt-4 mb-2">
        <Icon name="zap" size={18} color="#10b981" /> Interview Type *
      </Text>
      <View className="border border-slate-300 rounded-xl bg-white mb-3 px-1">
        <Picker
          selectedValue={interviewType}
          onValueChange={itemValue => setInterviewType(itemValue)}
          className="text-slate-700 text-xs h-8"
        >
          <Picker.Item label="Select Type" style={{fontSize:16}} value="" />
          {typeOptions.map((item, index) => (
            <Picker.Item key={index} label={item?.label} value={item?.value} />
          ))}
        </Picker>
      </View>

      <Text className="text-lg font-semibold text-slate-700 mt-4 mb-2">
        <Icon name="user-check" size={16} color="#10b981" /> Position *
      </Text>
      <TextInput
        value={selectedPosition}
        onChangeText={handlePositionChange}
        placeholder="Type a position..."
        className="h-16 bg-white rounded-xl border border-slate-300 px-3 text-lg"
      />

      <Text className="text-lg font-semibold text-slate-700 mt-4 mb-2">
        <Icon name="code" size={16} color="#10b981" /> Add Skills *
      </Text>
      <View className="flex-row items-center">
        <TextInput
          value={currentSkill}
          onChangeText={setCurrentSkill}
          placeholder="e.g. JavaScript, React"
          className="flex-1 h-16 bg-white rounded-xl border border-slate-300 px-3 text-lg"
          onSubmitEditing={addSkill}
        />
        <TouchableOpacity
          onPress={addSkill}
          className="ml-3 bg-blue-500 p-3 rounded-xl h-16 w-16 flex items-center justify-center"
        >
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      </View>

      {loadingSkills ? (
        <ActivityIndicator color="#3b82f6" className="my-3" />
      ) : (
        <View className="flex-row flex-wrap mt-3">
          {skills.map(skill => (
            <View
              key={skill}
              className="flex-row items-center bg-blue-100 px-3 py-2 rounded-full m-1"
            >
              <Text className="text-xs text-blue-900 mr-2">{skill}</Text>
              <TouchableOpacity onPress={() => removeSkill(skill)}>
                <Text className="text-white text-xs bg-red-500 rounded-full px-2">
                  X
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text className="text-lg font-semibold text-slate-700 mt-4 mb-2">
        <Icon name="clock" size={16} color="#10b981" /> Duration (in minutes) *
      </Text>
      <TextInput
        value={duration.toString()}
        onChangeText={val => {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num >= 1 && num <= 30) setDuration(num);
        }}
        keyboardType="numeric"
        placeholder="15 or 30"
        className="h-16 bg-white rounded-xl border border-slate-300 px-3 text-lg"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        className={`mt-8 h-13 rounded-xl flex-row items-center justify-center ${
          isLoading ? 'bg-slate-400' : 'bg-indigo-500'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="play" size={18} color="#fff" />
            <Text className="text-white font-semibold text-lg ml-2 py-4">
              Start Interview
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
