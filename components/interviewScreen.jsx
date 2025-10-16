import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  Easing,
  Modal,
  PermissionsAndroid,
  Platform,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';

import { Camera, useCameraDevices } from 'react-native-vision-camera'; // ✅ Camera
import useAudioPlayer from '../hooks/useAudioPlayer';
import useAudioRecorder from '../hooks/useAudioRecorder';
import useRealTime from '../hooks/useRealtime';
import Ionicons from '@react-native-vector-icons/ionicons';
import Timer from './timer';
import AIAgent from './AIAgent';
import { useNavigation } from '@react-navigation/native';
import { AppStateContext } from './AppContext';
import { JAVA_API_URL } from './config';

const CallUI = ({
  agentId,
  canId,
  meetingId,
  interviewType,
  adminId,
  interviewTime,

  candidateName,

  showInterviewScreen,
  setShowInterviewScreen,
}) => {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const initialStartRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cameraOn, setCameraOn] = useState(false); // ✅ Camera toggle state
  const [micOn, setMicOn] = useState(true); // ✅ Mic toggle state
  const navigation = useNavigation();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);

  const [interviewEnded, setInterviewEnded] = useState(false);
  const interviewDurationSeconds = Number(interviewTime);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  function handleInterviewCompletion() {
    setIsLoading(true);
    setInterviewEnded(true);
    stopAudioRecording();
    stopAudioPlayer();

    fetch(`${JAVA_API_URL}/api/meetings/update/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interviewDuration: elapsedSeconds }),
    })
      .catch(error => {
        console.error('Error updating meeting:', error);
      })
      .finally(() => {
        sendInterviewCompleted();
        setHasStarted(false);
        setShowInterviewScreen(false);
        setIsLoading(false);

        const isFreePlan = userProfile?.plan?.id === 1;

        setUserProfile(prev => ({
          ...prev,
          seconds_used: (prev?.seconds_used || 0) + elapsedSeconds,
        }));

        navigation.navigate('reports');
      });
  }

  const { startSession, addUserAudio, sendInterviewCompleted } = useRealTime({
    agentId,
    canId,
    meetingId,
    interviewType,
    adminId,
    interviewTime,
    onWebSocketOpen: () => {},
    onWebSocketClose: () => {},
    onWebSocketError: () => {},
    onReceivedError: () => {},
    onInterviewEndConfirmed: () => {
      handleInterviewCompletion();
    },
    onReceivedResponseAudioDelta: message => {
      if (message?.delta) {
        playAudio(message.delta);
      }
    },
    onReceivedInputAudioBufferSpeechStarted: () => {
      stopAudioPlayer();
    },
  });

  const {
    init: initAudioPlayer,
    play: playAudio,
    stop: stopAudioPlayer,
  } = useAudioPlayer();

  const { start: startAudioRecording, stop: stopAudioRecording } =
    useAudioRecorder({
      onAudioRecorded: addUserAudio,
    });

  const devices = useCameraDevices();

  const cameraDevice = devices.find(d => d.position === 'front');

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

  // Interview timer and wrap-up logic
  useEffect(() => {
    if (!hasStarted || interviewEnded || !interviewDurationSeconds) return;

    // Set real start time only once
    if (!initialStartRef.current) {
      initialStartRef.current = Date.now();
    }

    const skipSeconds = 3 * 60;
    const maxRestarts = Math.floor(
      (interviewDurationSeconds - 60) / skipSeconds,
    );
    let restartCount = 0;

    // Wrap-up control
    let wrapUpStartTime = null;
    let wrapUpTriggerCount = 0;
    const wrapUpMaxTriggers = 3; // Call wrap-up 4 times
    const wrapUpIntervalSeconds = 5;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor(
        (now - (initialStartRef.current || now)) / 1000,
      );
      const remaining = interviewDurationSeconds - elapsed;

      if (remaining <= 60) {
        if (!wrapUpStartTime) {
          console.log('Entering wrap-up phase: value:3');
          wrapUpStartTime = now;
          startSession('3');
          wrapUpTriggerCount = 1;
        } else {
          const wrapUpElapsed = Math.floor((now - wrapUpStartTime) / 1000);
          if (
            wrapUpTriggerCount < wrapUpMaxTriggers &&
            wrapUpElapsed >= wrapUpTriggerCount * wrapUpIntervalSeconds
          ) {
            console.log(`Wrap-up repeat #${wrapUpTriggerCount + 1}: value:3`);
            startSession('3');
            wrapUpTriggerCount++;
          }
        }
        return; // Don't allow restarts during wrap-up
      }

      if (
        elapsed > 0 &&
        elapsed % skipSeconds === 0 &&
        restartCount < maxRestarts
      ) {
        console.log(
          `Restarting at ${elapsed}s (restart #${restartCount + 1}) value:2`,
        );
        startSession('2');
        restartCount++;
      }
    }, 1000);

    const timeout = setTimeout(() => {
      console.log('Interview complete finalizing');
      handleInterviewCompletion();
    }, (interviewDurationSeconds + 20) * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hasStarted, interviewEnded, interviewDurationSeconds]);
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
      console.log('===11');
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
    if (!micOn) {
      startAudioRecording();
    } else {
      stopAudioRecording();
    }
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

        startSession('1');
        startAudioRecording();
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
      transparent={false}
      visible={showInterviewScreen}
      onRequestClose={() => setShowInterviewScreen(false)}
    >
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {hasStarted && (
          <>
            <Timer
              elapsedSeconds={elapsedSeconds}
              setElapsedSeconds={setElapsedSeconds}
              sessionDurationSeconds={interviewTime - 60}
              terminateSession={handleInterviewCompletion}
            />
            <AIAgent isAgentSpeaking={true} />
          </>
        )}

        {/* ✅ Main Area */}
        <View style={{ flex: 1, padding: hasStarted && cameraOn ? 0 : 20 }}>
          <View
            style={{
              flex: 1,
              borderRadius: hasStarted && cameraOn ? 0 : 16,
              overflow: 'hidden',
              backgroundColor: 'black',
            }}
          >
            {!hasStarted ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',

                  padding: 28,
                  backgroundColor: '#141414',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 26,
                    fontWeight: '700',
                    marginBottom: 20,
                  }}
                >
                  Interview Instructions
                </Text>

                <Text
                  style={{
                    color: '#e0e0e0',
                    fontSize: 16,
                    marginBottom: 10,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  1. Start the interview by saying Hello
                </Text>

                <Text
                  style={{
                    color: '#e0e0e0',
                    fontSize: 16,
                    marginBottom: 10,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  2. Sit in a quiet place without any background noise
                </Text>
                <Text
                  style={{
                    color: '#e0e0e0',
                    fontSize: 16,
                    marginBottom: 10,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  3. Ensure a stable internet connection for the best experience
                </Text>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 17,
                    fontWeight: '700',
                    marginBottom: 10,
                    textAlign: 'left',
                    width: '100%',
                    fontStyle: 'italic',
                  }}
                >
                  4. Sit in a quiet and well-lit place
                </Text>
              </View>
            ) : cameraOn && cameraDevice && hasCameraPermission ? (
              <Camera
                style={{
                  flex: 1,
                  borderRadius: 16,
                  overflow: 'hidden',
                  width: '100%',
                }}
                device={cameraDevice}
                isActive={cameraOn && showInterviewScreen}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 24,
                  backgroundColor: '#141414',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: 12,
                  }}
                >
                  Camera is Off
                </Text>
                <Text
                  style={{
                    color: '#ffecec',
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  Please turn on your camera.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ✅ Bottom Controls */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 30,
            paddingTop: 16,
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 16,
              alignItems: 'center',
            }}
          >
            {/* Camera Toggle */}
            <TouchableOpacity
              onPress={handleCameraToggle}
              style={{
                padding: 15,
                backgroundColor: cameraOn ? '#4caf50' : '#f44336',
                borderRadius: 50,
              }}
            >
              <Ionicons
                name={cameraOn ? 'videocam' : 'videocam-off'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            {/* Mic Toggle */}
            <TouchableOpacity
              onPress={handleMicToggle}
              style={{
                padding: 15,
                backgroundColor: micOn ? '#4caf50' : '#f44336',
                borderRadius: 50,
              }}
            >
              <Ionicons
                name={micOn ? 'mic' : 'mic-off'}
                size={24}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isLoading || isFetching}
              onPress={
                hasStarted ? handleInterviewCompletion : handleManualStart
              }
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: hasStarted ? '#d32f2f' : '#1976d2',
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isLoading || isFetching ? 0.6 : 1,
              }}
            >
              {isLoading || isFetching ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      marginLeft: 8,
                    }}
                  >
                    Please wait...
                  </Text>
                </View>
              ) : (
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {hasStarted ? 'End Interview' : 'Start Interview'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CallUI;
