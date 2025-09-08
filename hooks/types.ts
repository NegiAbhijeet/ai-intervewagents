export type GroundingFile = {
    id: string;
    name: string;
    content: string;
};

export type HistoryItem = {
    id: string;
    transcript: string;
    groundingFiles: GroundingFile[];
};

// Define a proper type for VAD payload
export type TurnDetectionPayload = {
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;

    agentId: string;
    canId: string;
    meetingId: string;
    interviewType: string;
    adminId: string;
    interviewTime: string;
    value:string;
};

export type SessionUpdateCommand = {
    type: "session.update";
    session: {
        turn_detection?: {
            type: "server_vad" | "none";
            payload?: TurnDetectionPayload;
        };
        input_audio_transcription?: {
            model: "whisper-1";
        };
    };
};

export type InputAudioBufferAppendCommand = {
    type: "input_audio_buffer.append";
    audio: string;
};

export type InputAudioBufferClearCommand = {
    type: "input_audio_buffer.clear";
};

export type Message = {
    type: string;
};

// export type TimerStatusMessage = {
//     type: "timer.status";
//     start_time: string;
//     elapsed_seconds: number;
// };

export type MeetingEndByAgent = {
    type: "interview.end.confirmed";
    meetingId: string;
    message: string;
};


export type ResponseAudioDelta = {
    type: "response.audio.delta";
    delta: string;
};

export type ResponseAudioTranscriptDelta = {
    type: "response.audio_transcript.delta";
    delta: string;
};

export type ResponseInputAudioTranscriptionCompleted = {
    type: "conversation.item.input_audio_transcription.completed";
    event_id: string;
    item_id: string;
    content_index: number;
    transcript: string;
};

export type ResponseDone = {
    type: "response.done";
    event_id: string;
    response: {
        id: string;
        output: { id: string; content?: { transcript: string; type: string }[] }[];
    };
};

export type ExtensionMiddleTierToolResponse = {
    type: "extension.middle_tier_tool.response";
    previous_item_id: string;
    tool_name: string;
    tool_result: string; // JSON string that needs to be parsed into ToolResult
};

export type ToolResult = {
    sources: { chunk_id: string; title: string; chunk: string }[];
};

export type InterviewCompletedCommand = {
    type: "interview.completed";
    meetingId: string;
};


export type MuteAgentCommand = {
    type: "mute.agent";
    meetingId: string;
};

export type UnmuteAgentCommand = {
    type: "unmute.agent";
    meetingId: string;
};
export type BroadcastTimer = {
  type: "broadcasttimer";
  startTime: string;
  meetingId: string;
};
