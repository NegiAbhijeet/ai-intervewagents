// useAudioPlayer.ts (React Native)
import { Buffer } from "buffer";
import { useRef } from "react";

import { Player } from "../components/audio/player";

const SAMPLE_RATE = 24000;

export default function useAudioPlayer() {
  const audioPlayer = useRef<Player>();

  const reset = async () => {
    audioPlayer.current = new Player();
    await audioPlayer.current.init(SAMPLE_RATE);
  };

  const play = (base64Audio: string) => {
    const bytes = Buffer.from(base64Audio, "base64");
    const pcmData = new Int16Array(bytes.buffer);
    audioPlayer.current?.play(pcmData);
  };

  const stop = () => {
    audioPlayer.current?.stop();
  };

  return { reset, play, stop };
}
