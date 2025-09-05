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
  StyleSheet,
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
const userToken =
  'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMjQ4ZjQyZjc0YWUwZjk0OTIwYWY5YTlhMDEzMTdlZjJkMzVmZTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQWJoaWplZXQgTmVnaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMR3Z0OV9Qd29qV2ZRUml6VDhOYW16UzIwNTlIdl9pRDlRZXQxTllxMWQ5Q21nR0ozMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9pbnRlcnZpZXdseS1haSIsImF1ZCI6ImludGVydmlld2x5LWFpIiwiYXV0aF90aW1lIjoxNzU2OTYxMDM2LCJ1c2VyX2lkIjoiaGlyTWp6amZSaVcwREd6UGFsNGx6T0NOMndnMiIsInN1YiI6Imhpck1qempmUmlXMERHelBhbDRsek9DTjJ3ZzIiLCJpYXQiOjE3NTcwNTAwMzksImV4cCI6MTc1NzA1MzYzOSwiZW1haWwiOiJhYmhpamVldG5lZ2kuYWJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTM1NDgyMzEyNDA4NzE4OTU4MjgiXSwiZW1haWwiOlsiYWJoaWplZXRuZWdpLmFiQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.fJe_0NJoPwwIA0GdoOVHVRQTAbjxOn2SWsaP3AIZvRzRNf5WN8KYIwIXZTAKOUUa-fr7gG9VA-coaCiw2bCWgeHtny9tiasrh-PwX-eDefqOFjHnZCv2Fsa8Rb24oRI49VXnpLFVAsCy0uSh0T71AtWA8oLAtQtBbRjp5s35tnaZAWScCPn9bWV34sgh4IpRhZaW5fBc-2p1Z-T_4O3IQj-ZijZJk9I94qUYBkn8NI3eCy5BV4HHHbuxly_R0Dtej8a9Ql41Jzv-GtIfjueZI_U4XJ212xiRkmLNGrVLFM_m78lW6AgIMNIChYrVbRQrtO_FlljjV_7zZAalX7QJjw';
const system_prompt = `You are an AI interview assistant conducting a technical interview for a Frontend Developer position.

Your role is to:
- Ask the candidate one question at a time.
- Wait for the response before moving on.
- Ask a mix of conceptual, practical, and experience-based questions.
- Cover topics including HTML, CSS, JavaScript (ES6+), React, performance optimization, accessibility, and testing.
- Ask follow-up questions based on the candidate's answers.
- Be professional, friendly, and concise.
- Provide encouragement but do not give hints or answers.

Start the interview by briefly introducing yourself and then proceed with the first question.`;
const my_greeting = `Hello! I'm your virtual interviewer for today. I'm here to ask you a few questions related to Frontend Development to better understand your skills and experience.

Please feel free to take a moment before answering. Let's begin when you're ready.`;

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
  const [systemPrompt, setSystemPrompt] = useState(null);
  const [voiceName, setVoiceName] = useState(null);
  const [showInterviewScreen, setShowInterviewScreen] = useState(false);
  const [greeting, setGreeting] = useState(
    "Hello and welcome! I'm here to listen, assist, and make your experience as smooth as possible. Take your time, and when you're ready, just start speaking — I'm all ears.",
  );
  const type = 'practice'; // Or derive dynamically if needed

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
    // try {
    //   const body = {
    //     position,
    //     experience: myCandidate?.experienceYears || 0,
    //     uid: uid,
    //   };
    //     console.log(body, "===",`${API_URL}/generate-skills/`)

    //   const response = await fetch(`${API_URL}/generate-skills/`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(body),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to fetch skills');
    //   }

    //   const data = await response.json();
    //   console.log(data, "====")
    //   const newSkills = data.skills || [];
    //   const limitedSkills = newSkills.slice(0, 10);
    //   setSkills(limitedSkills);
    // } catch (error) {
    //   console.error('Error fetching skills:', error);
    // } finally {
    //   setLoadingSkills(false);
    // }
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
    // debouncedFetch(value);
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
        role: 'frontend developer',
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
          Authorization: `Bearer ${userToken}`,
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
        const interviewTypeFromUrl = urlParams.get('interviewType');
        const interviewTime = urlParams.get('interviewTime');
        const body = {
          meetingId,
          candidateId: canId,
          agentId,
          duration: parseInt(interviewTime),
          role: '',
        };

        console.log(body, '==');
        setSystemPrompt(system_prompt);
        setGreeting(my_greeting);
        setShowInterviewScreen(true);
        const handleJoin = async () => {
          try {
            const res = await fetch(`${API_URL}/api/verify-meeting/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            if (!res.ok) {
              let errorMsg =
                'Failed to connect. Please refresh or try again later.';
              try {
                const errorJson = await res.json();
                if (errorJson?.message) errorMsg = errorJson.message;
              } catch (e) {}
              throw new Error(errorMsg);
            }

            const json = await res.json();
            console.log('json', json);
            const { system_prompt, voice_name, greeting } = json;
            setSystemPrompt(system_prompt);
            setGreeting(greeting);
            setVoiceName(voice_name);
            setShowInterviewScreen(true);
          } catch (err) {
            console.error('Setup failed:', err);
          }
        };

        // await handleJoin();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InterviewScreen
        systemPrompt={systemPrompt}
        greeting={greeting}
        voiceName={voiceName}
        showInterviewScreen={showInterviewScreen}
        setShowInterviewScreen={setShowInterviewScreen}
      />

      <Text style={styles.label}>
        <Icon name="zap" size={16} color="#10b981" /> Interview Type *
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#cbd5e1',
          borderRadius: 10,
          backgroundColor: '#fff',
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        <Picker
          selectedValue={interviewType}
          onValueChange={itemValue => setInterviewType(itemValue)}
          style={{
            color: '#334155',
            fontSize: 16,
          }}
        >
          <Picker.Item label="Select Type" value="" />
          {typeOptions.map((item, index) => (
            <Picker.Item key={index} label={item?.label} value={item?.value} />
          ))}
        </Picker>
      </View>

      {/* Position */}
      <Text style={styles.label}>
        <Icon name="user-check" size={16} color="#10b981" /> Position *
      </Text>
      <TextInput
        value={selectedPosition}
        onChangeText={handlePositionChange}
        placeholder="Type a position..."
        style={styles.input}
      />

      {/* Skills */}
      <Text style={styles.label}>
        <Icon name="code" size={16} color="#10b981" /> Add Skills *
      </Text>
      <View style={styles.row}>
        <TextInput
          value={currentSkill}
          onChangeText={setCurrentSkill}
          placeholder="e.g. JavaScript, React"
          style={[styles.input, { flex: 1 }]}
          onSubmitEditing={addSkill}
        />
        <TouchableOpacity style={styles.addButton} onPress={addSkill}>
          <Text style={{ color: 'white' }}>+</Text>
        </TouchableOpacity>
      </View>

      {loadingSkills ? (
        <ActivityIndicator color="#3b82f6" style={{ marginVertical: 10 }} />
      ) : (
        <View style={styles.skillContainer}>
          {skills.map(skill => (
            <View key={skill} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
              <TouchableOpacity onPress={() => removeSkill(skill)}>
                <Text style={{ color: 'white' }}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Duration */}
      <Text style={styles.label}>
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
        style={styles.input}
      />

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        style={[
          styles.submitButton,
          {
            backgroundColor: isLoading ? '#94a3b8' : '#6366f1',
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="play" size={18} color="#fff" />
            <Text style={styles.submitText}>Start Interview</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillBadge: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  skillText: {
    marginRight: 6,
    color: '#1e3a8a',
    fontSize: 12,
  },
  submitButton: {
    marginTop: 30,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
});
