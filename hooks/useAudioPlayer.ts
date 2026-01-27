import { Buffer } from 'buffer';
import { useRef, useEffect } from 'react';
import { Player } from '../components/audio/player';

const SAMPLE_RATE = 16000;

function decodeBase64PCM(base64: string): Int16Array {
  const bytes = Buffer.from(base64, 'base64');
  return new Int16Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.length / 2
  );
}

export default function useAudioPlayer() {
  const playerRef = useRef<Player | null>(null);
  const initializedRef = useRef(false);

  const init = async () => {
    if (initializedRef.current) return;

    const player = new Player();
    await player.init(16000);

    playerRef.current = player;
    initializedRef.current = true;
  };

  const play = async (
    base64Audio: string,
    opts?: { onEnd?: () => void }
  ) => {
    if (!base64Audio || base64Audio.length < 10) return;

    await init();

    const pcm = decodeBase64PCM(base64Audio);

    await playerRef.current!.play(pcm);

    const durationMs = (pcm.length / SAMPLE_RATE) * 1000;

    if (opts?.onEnd) {
      setTimeout(opts.onEnd, durationMs);
    }
  };

  // 🚨 stop ONLY when interview ends
  const stop = async () => {
    if (!initializedRef.current) return;

    await playerRef.current?.stop();
    playerRef.current = null;
    initializedRef.current = false;
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { init, play, stop };
}

