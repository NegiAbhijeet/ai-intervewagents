import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import { Camera } from 'react-native-vision-camera'; // ✅ Camera
import { useNavigation } from '@react-navigation/native';
import { AppStateContext } from './AppContext';
import Layout from '../pages/Layout';
import MainInterviewRoom from "./MainInterviewRoom"
import InterviewDetailsPage from "./interviewDetailsPage"

const CallUI = ({
  agentId,
  canId,
  meetingId,
  interviewTime,
  candidateName,
  showInterviewScreen,
  setShowInterviewScreen,
  skills,
  position,
}) => {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [hasStarted, setHasStarted] = useState(false);
  const elapsedSecondsRef = useRef(0);
  const [cameraOn, setCameraOn] = useState(false); // ✅ Camera toggle state
  const [micOn, setMicOn] = useState(true); // ✅ Mic toggle state
  const navigation = useNavigation();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [quitStep, setQuitStep] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  function handleInterviewCompletion() {
    setShowInterviewScreen(false);
    setUserProfile(prev => ({
      ...prev,
      seconds_used: (prev?.seconds_used || 0) + elapsedSecondsRef.current,
    }));

    navigation.navigate('reports', { meetingId });
  }
  async function halfHandleInterviewCompletion() {
    setIsLoading(true);
  }
  useEffect(() => {
    const requestPermissions = async () => {
      const micPermission = await requestMicrophonePermission();
      setHasMicPermission(micPermission);
      setMicOn(micPermission);
    };

    if (showInterviewScreen) {
      requestPermissions();
    }
  }, [showInterviewScreen]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone for the interview.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }

    // On iOS, permission is usually prompted when needed. Assume true for now.
    return true;
  };


  const handleCameraToggle = async () => {
    if (!hasCameraPermission) {
      const permission = await Camera.requestCameraPermission();
      const granted = permission === 'granted';
      setHasCameraPermission(granted);

      if (!granted) {
        Alert.alert(
          'Camera Permission Denied',
          'Please enable camera access from Settings to use this feature.',
        );
        return;
      }
    }

    setCameraOn(prev => !prev);
  };
  const handleMicToggle = async () => {
    if (!hasMicPermission) {
      const granted = await requestMicrophonePermission();
      setHasMicPermission(granted);
      if (!granted) {
        Alert.alert(
          'Microphone Permission Denied',
          'Please enable microphone access from Settings to use this feature.',
        );
        return;
      }
    }
    setMicOn(prev => !prev);
  };

  const handleManualStart = async () => {
    try {
      setIsFetching(true);

      const res = await fetch(
        'https://python.backend.aiinterviewagents.com/api/verify-meeting/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'azure',
            meetingId: meetingId,
            candidateId: canId,
            agentId: agentId,
            duration: interviewTime,
            role: 'candidate',
          }),
        },
      );

      if (!res.ok) {
        let errorMsg = 'Failed to connect. Please refresh or try again later.';
        try {
          const errorJson = await res.json();
          if (errorJson?.message) errorMsg = errorJson.message;
        } catch (e) {
          // keep default errorMsg if parsing fails
        }
        throw new Error(errorMsg);
      }

      try {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Microphone permission is required to start the interview.',
          );
          return;
        }

        setHasStarted(true);
      } catch (err) {
        console.error('Microphone/setup failed:', err);
        Alert.alert(
          'Error',
          'Microphone permission denied or error starting session.',
        );
        // optionally update UI error state too
        setError(err.message || 'Error starting audio session');
      }
    } catch (err) {
      console.error('Setup failed:', err);
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showInterviewScreen}
      onRequestClose={() => setShowInterviewScreen(false)}
    >
      <Layout gradientType='3' removePadding={hasStarted ? true : false}>

        {
          hasStarted ?
            <MainInterviewRoom
              meetingId={meetingId}
              interviewTime={interviewTime}
              cameraOn={cameraOn}
              setCameraOn={setCameraOn}
              hasStarted={hasStarted}
              handleInterviewCompletion={handleInterviewCompletion}
              quitStep={quitStep}
              setQuitStep={setQuitStep}
              halfHandleInterviewCompletion={halfHandleInterviewCompletion}
              uid={userProfile?.uid}
              candidateName={candidateName}
              position={position}
            />
            :
            <InterviewDetailsPage
              interviewTime={interviewTime}
              skills={skills}
              handleMicToggle={handleMicToggle}
              handleCameraToggle={handleCameraToggle}
              cameraOn={cameraOn}
              isFetching={isFetching}
              handleManualStart={handleManualStart}
              position={position}
              micOn={micOn}
            />
        }
      </Layout>
    </Modal>
  );
};

export default CallUI;