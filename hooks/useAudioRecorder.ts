// useAudioRecorder.ts (React Native)
import { useRef } from "react";
import { Buffer } from "buffer";
import { Recorder } from "../components/audio/recorder"; // your JS wrapper around PCMRecorderModule

const BUFFER_SIZE = 4800; // number of Int16 samples per chunk

type Parameters = {
  onAudioRecorded: (base64: string) => void;
};

export default function useAudioRecorder({ onAudioRecorded }: Parameters) {
  const audioRecorder = useRef<Recorder>();
  let buffer = new Int16Array(0);

  // Append new PCM16 samples to the buffer
  const appendToBuffer = (newData: Int16Array) => {
    const newBuffer = new Int16Array(buffer.length + newData.length);
    newBuffer.set(buffer);
    newBuffer.set(newData, buffer.length);
    buffer = newBuffer;
  };

  // Called whenever native PCMRecorder emits new Int16Array samples
  const handleAudioData = (data: Int16Array) => {
    appendToBuffer(data);

    while (buffer.length >= BUFFER_SIZE) {
      const toSend = buffer.slice(0, BUFFER_SIZE);
      buffer = buffer.slice(BUFFER_SIZE);

      // Convert Int16Array → Uint8Array → Base64
      const uint8Buffer = new Uint8Array(toSend.buffer);
      const base64 = Buffer.from(uint8Buffer).toString("base64");

      // Send to WebSocket handler (Azure Realtime API)
      onAudioRecorded(base64);
    }
  };

  const start = async () => {
    if (!audioRecorder.current) {
      audioRecorder.current = new Recorder(handleAudioData);
    }
    await audioRecorder.current.start(24000); // Azure expects 24kHz
  };

  const stop = async () => {
    await audioRecorder.current?.stop();
  };

  return { start, stop };
}