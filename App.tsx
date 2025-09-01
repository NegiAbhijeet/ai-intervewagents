// CallUI.tsx (React Native, Android)
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, PermissionsAndroid, Platform, View } from 'react-native';

import useAudioPlayer from './hooks/useAudioPlayer';
import useAudioRecorder from './hooks/useAudioRecorder';
import useRealTime from './hooks/useRealtime';

function CallUI() {
  const initialStartRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [autostartFailed, setAutostartFailed] = useState(false);
const meetingId="asdfasdf"
  const interviewDurationSeconds = Number(20000);
  const {
    reset: resetAudioPlayer,
    play: playAudio,
    stop: stopAudioPlayer,
  } = useAudioPlayer();
  const { startSession, addUserAudio, muteAgent, unmuteAgent } = useRealTime({
    meetingId,
    onWebSocketOpen: () => {},
    onWebSocketClose: () => {},
    onWebSocketError: () => {},
    onReceivedError: () => {},
    onReceivedResponseAudioDelta: message => {
 console.log(message.delta, "===");
      playAudio(message.delta);     
    },
    onReceivedInputAudioBufferSpeechStarted: () => {
      stopAudioPlayer();
    },
    onInterviewEndConfirmed: () => {},
  });


  const { start: startAudioRecording, stop: stopAudioRecording } =
    useAudioRecorder({ onAudioRecorded: addUserAudio });

  // Check/request mic permission (Android only)
  const requestMicPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone for realtime audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Mic permission request error', err);
      return false;
    }
  };

  // Interview timer + wrap-up
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

  // Auto-start
  useEffect(() => {
    const tryAutoStart = async () => {
      const micOk = await requestMicPermission();
      if (!micOk) {
        console.warn('Mic permission denied');
        setAutostartFailed(true);
        return;
      }
      try {
        resetAudioPlayer();
        startSession('1');
         
         startAudioRecording();
        setIsRecording(true);
        setHasStarted(true);
      } catch (err) {
        console.warn('Auto-start failed', err);
        setAutostartFailed(true);
      }
    };
    tryAutoStart();
  }, []);

  const handleManualStart = async () => {
    const micOk = await requestMicPermission();
    if (!micOk) {
      Alert.alert('Permission denied', 'Microphone access is required.');
      return;
    }
    try {resetAudioPlayer();
      startSession('1');

       startAudioRecording();
      setIsRecording(true);
      setHasStarted(true);
      setAutostartFailed(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to start audio session.');
    }
  };

  if (!hasStarted && autostartFailed) {
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
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Interview Running..." onPress={handleManualStart} />
    </View>
  );
}

export default CallUI;
