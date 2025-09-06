import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  View,
} from 'react-native';

// Import custom hooks (assumed to be properly typed)
import useAudioPlayer from './hooks/useAudioPlayer';
import useAudioRecorder from './hooks/useAudioRecorder';
import useRealTime from './hooks/useRealtime';
// Define props interface


interface CallUIProps {
  agentId: string;
  canId: string;
  meetingId: string;
  interviewType: string;
  adminId: string;
  interviewTime: string; // Should be a string representing seconds (e.g., "300")
}

const CallUI: React.FC<CallUIProps> = ({
  agentId,
  canId,
  meetingId,
  interviewType,
  adminId,
  interviewTime,
}) => {
  const initialStartRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [autostartFailed, setAutostartFailed] = useState<boolean>(false);

  const interviewDurationSeconds = Number(interviewTime);

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
    onReceivedResponseAudioDelta: (message: { delta: ArrayBuffer }) => {
      console.log(message?.delta, isRecording, "isRecording===");
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
  const requestMicrophonePermission = async (): Promise<boolean> => {
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

    let wrapUpStartTime: number | null = null;
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

    const timeout = setTimeout(() => {
      console.log('Interview complete finalizing');
    }, (interviewDurationSeconds + 40) * 1000);

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
      setAutostartFailed(false);
    } catch (err) {
      Alert.alert(
        'Error',
        'Microphone permission denied or error starting session.',
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
    >
      <Button title="Start Interview" onPress={handleManualStart} />
    </View>
  );
};

export default CallUI;
