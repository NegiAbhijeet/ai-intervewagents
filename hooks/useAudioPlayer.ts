import { Buffer } from 'buffer';
import { useRef, useEffect } from 'react';
import { Player } from '../components/audio/player';

function decodeBase64PCM(base64: string): Int16Array {
  const bytes = Buffer.from(base64, 'base64');
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.length / 2);
}

export default function useAudioPlayer() {
  const audioPlayer = useRef<Player | null>(null);
  const queue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const processQueue = async () => {
    if (isPlaying.current || queue.current.length === 0 || !audioPlayer.current) {
      return;
    }

    isPlaying.current = true;

    const nextChunk = queue.current.shift();
    if (!nextChunk || nextChunk.length < 10) {
      isPlaying.current = false;
      return;
    }

    try {
      await audioPlayer.current.play(nextChunk);
    } catch (err) {
      console.error('[useAudioPlayer] Error playing chunk:', err);
    }

    isPlaying.current = false;

    // Process the next one
    requestAnimationFrame(processQueue); // non-blocking loop
  };

  const play = async (base64Audio: string) => {
    if (!base64Audio || base64Audio.length < 10) {
      console.warn('[useAudioPlayer] Invalid base64 audio string');
      return;
    }

    if (!audioPlayer.current) {
      const instance = new Player();
      await instance.init();
      audioPlayer.current = instance;
    }

    const pcmData = decodeBase64PCM(base64Audio);

    queue.current.push(pcmData);
    requestAnimationFrame(processQueue);
  };

  const stop = () => {
    queue.current = [];
    isPlaying.current = false;
    audioPlayer.current?.stop();
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { play, stop };
}
