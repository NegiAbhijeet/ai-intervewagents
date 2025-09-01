// useRealTime.ts (React Native)

import { useEffect, useRef } from "react";
import {
    BroadcastTimer,
    ExtensionMiddleTierToolResponse,
    InputAudioBufferAppendCommand,
    InputAudioBufferClearCommand,
    InterviewCompletedCommand,
    MeetingEndByAgent,
    Message,
    ResponseAudioDelta,
    ResponseAudioTranscriptDelta,
    ResponseDone,
    ResponseInputAudioTranscriptionCompleted,
    SessionUpdateCommand,
} from "./types";

type Parameters = {
  useDirectAoaiApi?: boolean;
  aoaiEndpointOverride?: string;
  aoaiApiKeyOverride?: string;
  aoaiModelOverride?: string;

  enableInputAudioTranscription?: boolean;
  onWebSocketOpen?: () => void;
  onWebSocketClose?: () => void;
  onWebSocketError?: (event: Event) => void;
  onWebSocketMessage?: (event: MessageEvent<any>) => void;
  onBroadcastTimer?: (message: BroadcastTimer) => void;

  onReceivedResponseAudioDelta?: (message: ResponseAudioDelta) => void;
  onReceivedInputAudioBufferSpeechStarted?: (message: Message) => void;
  onReceivedResponseDone?: (message: ResponseDone) => void;
  onMicState?: (message: Message) => void;

  onInterviewEndConfirmed?: (message: MeetingEndByAgent) => void;
  onReceivedExtensionMiddleTierToolResponse?: (
    message: ExtensionMiddleTierToolResponse
  ) => void;
  onReceivedResponseAudioTranscriptDelta?: (
    message: ResponseAudioTranscriptDelta
  ) => void;
  onReceivedInputAudioTranscriptionCompleted?: (
    message: ResponseInputAudioTranscriptionCompleted
  ) => void;
  onReceivedError?: (message: Message) => void;

  meetingId: string;
};

export default function useRealTime({
  useDirectAoaiApi,
  aoaiEndpointOverride,
  aoaiApiKeyOverride,
  aoaiModelOverride,
  enableInputAudioTranscription,
  onWebSocketOpen,
  onWebSocketClose,
  onWebSocketError,
  onWebSocketMessage,
  onReceivedResponseDone,
  onMicState,
  onInterviewEndConfirmed,
  onReceivedResponseAudioDelta,
  onReceivedResponseAudioTranscriptDelta,
  onReceivedInputAudioBufferSpeechStarted,
  onReceivedExtensionMiddleTierToolResponse,
  onReceivedInputAudioTranscriptionCompleted,
  onReceivedError,
  onBroadcastTimer,
  meetingId ="asdasdf",
}: Parameters) {
  const wsRef = useRef<WebSocket | null>(null);

  const wsEndpoint = `ws://openai.aiinterviewagents.com/realtime?meetingId=asdsadf`;

  useEffect(() => {
    const ws = new WebSocket(wsEndpoint);

    ws.onopen = () => {
      onWebSocketOpen?.();
    };

    ws.onclose = () => {
      onWebSocketClose?.();
      // auto-reconnect
      setTimeout(() => {
        wsRef.current = new WebSocket(wsEndpoint);
      }, 1000);
    };

    ws.onerror = (event) => {
      onWebSocketError?.(event as unknown as Event);
    };

    ws.onmessage = (event) => {
      onWebSocketMessage?.(event);
      onMessageReceived(event);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [wsEndpoint]);

  const sendJsonMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  const startSession = (value: string) => {
    const command: SessionUpdateCommand = {
      type: "session.update",
      session: {
        turn_detection: {
          type: "server_vad",
          payload: {
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 400,
            value,
          },
        },
      },
    };

    if (enableInputAudioTranscription) {
      command.session.input_audio_transcription = {
        model: "whisper-1",
      };
    }

    sendJsonMessage(command);
  };

  const sendInterviewCompleted = () => {
    const command: InterviewCompletedCommand = {
      type: "interview.completed",
      meetingId: meetingId,
    };
    sendJsonMessage(command);
  };

  const addUserAudio = (base64Audio: string) => {
    const command: InputAudioBufferAppendCommand = {
      type: "input_audio_buffer.append",
      audio: base64Audio,
    };
    sendJsonMessage(command);
  };

  const muteAgent = () => {
    const command = {
      type: "mute.agent",
      meetingId,
    };
    sendJsonMessage(command);
  };

  const unmuteAgent = () => {
    const command = {
      type: "unmute.agent",
      meetingId,
    };
    sendJsonMessage(command);
  };

  const inputAudioBufferClear = () => {
    const command: InputAudioBufferClearCommand = {
      type: "input_audio_buffer.clear",
    };
    sendJsonMessage(command);
  };

  const sendBroadcastTimer = (startTime: string) => {
    const command = {
      type: "broadcasttimer",
      startTime,
    };
    sendJsonMessage(command);
  };

  const onMessageReceived = (event: MessageEvent<any>) => {
    let message: Message;
    try {
      message = JSON.parse(event.data);
    } catch (e) {
      console.error("Failed to parse JSON message:", e);
      throw e;
    }
    switch (message.type) {
      case "broadcasttimer":
        onBroadcastTimer?.(message as BroadcastTimer);
        break;
      case "interview.end.confirmed":
        onInterviewEndConfirmed?.(message as MeetingEndByAgent);
        break;
      case "mute.agent":
      case "unmute.agent":
        onMicState?.(message);
        break;
      case "response.done":
        onReceivedResponseDone?.(message as ResponseDone);
        break;
      case "response.audio.delta":
        onReceivedResponseAudioDelta?.(message as ResponseAudioDelta);
        break;
      case "response.audio_transcript.delta":
        onReceivedResponseAudioTranscriptDelta?.(
          message as ResponseAudioTranscriptDelta
        );
        break;
      case "input_audio_buffer.speech_started":
        onReceivedInputAudioBufferSpeechStarted?.(message);
        break;
      case "conversation.item.input_audio_transcription.completed":
        onReceivedInputAudioTranscriptionCompleted?.(
          message as ResponseInputAudioTranscriptionCompleted
        );
        break;
      case "extension.middle_tier_tool_response":
        onReceivedExtensionMiddleTierToolResponse?.(
          message as ExtensionMiddleTierToolResponse
        );
        break;
      case "error":
        onReceivedError?.(message);
        break;
    }
  };

  return {
    startSession,
    addUserAudio,
    inputAudioBufferClear,
    sendInterviewCompleted,
    muteAgent,
    unmuteAgent,
    sendBroadcastTimer,
  };
}
