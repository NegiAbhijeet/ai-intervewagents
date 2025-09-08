import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  Easing,
  Modal,
  PermissionsAndroid,
  Platform,
  View,
} from 'react-native';

// Import custom hooks (assumed to be properly typed)
import useAudioPlayer from '../hooks/useAudioPlayer';
import useAudioRecorder from '../hooks/useAudioRecorder';
import useRealTime from '../hooks/useRealtime';
// Define props interface

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
  const initialStartRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const interviewDurationSeconds = Number(interviewTime);
  function handleInterviewCompletion() {
    stopAudioRecording();
    stopAudioPlayer();
    setIsRecording(false);
    setHasStarted(false);
    setShowInterviewScreen(false);
  }
  const { startSession, addUserAudio, muteAgent, unmuteAgent } = useRealTime({
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
    onInterviewEndConfirmed: () => {},
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

  // ✅ New: Request microphone permission
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
    if (!hasStarted || !isRecording || !interviewDurationSeconds) return;

    initialStartRef.current = Date.now();

    const skipSeconds = 4 * 60;
    const maxRestarts = Math.floor(
      (interviewDurationSeconds - 60) / skipSeconds,
    );
    let restartCount = 0;

    let wrapUpStartTime = null;
    let wrapUpTriggerCount = 0;
    const wrapUpMaxTriggers = 4;
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
        return;
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

    const timeout = setTimeout(
      () => {
        console.log('Interview complete finalizing');
      },
      (interviewDurationSeconds + 40) * 1000,
    );

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hasStarted, isRecording, interviewDurationSeconds]);

  const handleManualStart = async () => {
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
      setIsRecording(true);
      setHasStarted(true);
    } catch (err) {
      Alert.alert(
        'Error',
        'Microphone permission denied or error starting session.',
      );
    }
  };
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showInterviewScreen}
      onRequestClose={() => setShowInterviewScreen(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          justifyContent: 'space-between',
          padding: 20,
        }}
      >
        {/* Animated Listening UI */}
        {isRecording && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: '#e0f7fa',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: scaleAnim }],
                opacity: 0.8,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#00bcd4',
                }}
              />
            </Animated.View>
            <View style={{ marginTop: 20 }}>
              <Button title="Listening..." disabled />
            </View>
          </View>
        )}

        {!hasStarted && (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Button title="Start Interview" onPress={handleManualStart} />
          </View>
        )}

        {/* End Button at Bottom */}
        {hasStarted && (
          <View style={{ paddingBottom: 30 }}>
            <Button
              title="End Interview"
              color="red"
              onPress={handleInterviewCompletion}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default CallUI;
