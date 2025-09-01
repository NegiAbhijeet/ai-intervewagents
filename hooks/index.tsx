// CallUI.tsx (React Native)
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, View } from "react-native";

import useAudioPlayer from "@/hooks/useAudioPlayer";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import useRealTime from "@/hooks/useRealtime";
// import AIAgentParticipant from "./AIAgentParticipant";

function CallUI({ agentId, canId, meetingId, interviewType, adminId, interviewTime }: {
  agentId: string;
  canId: string;
  meetingId: string;
  interviewType: string;
  adminId: string;
  interviewTime: string;
}) {
  const initialStartRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [autostartFailed, setAutostartFailed] = useState(false);

  const interviewDurationSeconds = Number(interviewTime);

  const {
    startSession,
    addUserAudio,
    muteAgent,
    unmuteAgent,
  } = useRealTime({
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
    onReceivedResponseAudioDelta: (message) => {
      if (isRecording) playAudio(message.delta);
    },
    onReceivedInputAudioBufferSpeechStarted: () => {
      stopAudioPlayer();
    },
    onInterviewEndConfirmed: () => {},
  });

  const { reset: resetAudioPlayer, play: playAudio, stop: stopAudioPlayer } = useAudioPlayer();
  const { start: startAudioRecording, stop: stopAudioRecording } = useAudioRecorder({
    onAudioRecorded: addUserAudio,
  });

  // Interview timer and wrap-up logic
  useEffect(() => {
    if (!hasStarted || !isRecording || !interviewDurationSeconds) return;

    initialStartRef.current = Date.now();

    const skipSeconds = 4 * 60;
    const maxRestarts = Math.floor((interviewDurationSeconds - 60) / skipSeconds);
    let restartCount = 0;

    let wrapUpStartTime: number | null = null;
    let wrapUpTriggerCount = 0;
    const wrapUpMaxTriggers = 4;
    const wrapUpIntervalSeconds = 5;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (initialStartRef.current || now)) / 1000);
      const remaining = interviewDurationSeconds - elapsed;

      if (remaining <= 60) {
        if (!wrapUpStartTime) {
          console.log("Entering wrap-up phase: value:3");
          wrapUpStartTime = now;
          startSession("3");
          wrapUpTriggerCount = 1;
        } else {
          const wrapUpElapsed = Math.floor((now - wrapUpStartTime) / 1000);
          if (wrapUpTriggerCount < wrapUpMaxTriggers &&
              wrapUpElapsed >= wrapUpTriggerCount * wrapUpIntervalSeconds) {
            console.log(`Wrap-up repeat #${wrapUpTriggerCount + 1}: value:3`);
            startSession("3");
            wrapUpTriggerCount++;
          }
        }
        return;
      }

      if (elapsed > 0 && elapsed % skipSeconds === 0 && restartCount < maxRestarts) {
        console.log(`Restarting at ${elapsed}s (restart #${restartCount + 1}) value:2`);
        startSession("2");
        restartCount++;
      }
    }, 1000);

    const timeout = setTimeout(() => {
      console.log("Interview complete finalizing");
    }, (interviewDurationSeconds + 40) * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hasStarted, isRecording, interviewDurationSeconds]);

  // Auto-start attempt
  useEffect(() => {
    const tryAutoStart = async () => {
      try {
        startSession("1");
         startAudioRecording();
         resetAudioPlayer();
        setIsRecording(true);
        setHasStarted(true);
      } catch (err) {
        console.warn("Auto-start blocked, waiting for user interaction.");
        setAutostartFailed(true);
      }
    };
    tryAutoStart();
  }, []);

  const handleManualStart = async () => {
    try {
      console.log(1)
      resetAudioPlayer();
      startSession("1");
       startAudioRecording();
       
      setIsRecording(true);
      setHasStarted(true);
      setAutostartFailed(false);
      console.log(2)
    } catch (err) {
      Alert.alert("Error", "Microphone permission denied or error starting session.");
    }
  };

  if (!hasStarted && autostartFailed) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
        <Button title="Start Interview" onPress={handleManualStart} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* <AIAgentParticipant
        agentMuted={false}
        speakerOn={true}
        setSpeakerOn={() => {}}
        muteAgent={muteAgent}
        unmuteAgent={unmuteAgent}
        isHR={false}
      /> */}
    </View>
  );
}

export default CallUI;
