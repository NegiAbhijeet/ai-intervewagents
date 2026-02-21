import { Buffer } from 'buffer';
import { useRef, useEffect } from 'react';
import { Player } from '../components/audio/player';

const SAMPLE_RATE = 16000;

function decodePCM(input: string | ArrayBuffer): Int16Array {
  const bytes =
    typeof input === 'string'
      ? Buffer.from(input, 'base64')
      : Buffer.from(input);

  return new Int16Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.length / 2
  );
}

export default function useAudioPlayer() {
  const playerRef = useRef<Player | null>(null);
  const initializedRef = useRef(false);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const playQueueRef = useRef<Promise<void>>(Promise.resolve());

  const init = async () => {
    if (initializedRef.current && playerRef.current) return;
    if (initPromiseRef.current) return initPromiseRef.current;

    const initPromise = (async () => {
      const player = new Player();
      await player.init(16000);

      playerRef.current = player;
      initializedRef.current = true;
    })();

    initPromiseRef.current = initPromise;
    try {
      await initPromise;
    } finally {
      initPromiseRef.current = null;
    }
  };

  const play = async (
    audio: string | ArrayBuffer,
    opts?: { onEnd?: () => void }
  ) => {
    if (!audio) return;
    if (typeof audio === 'string' && audio.length < 10) return;
    if (audio instanceof ArrayBuffer && audio.byteLength < 2) return;

    playQueueRef.current = playQueueRef.current.then(async () => {
      await init();

      const pcm = decodePCM(audio);
      if (pcm.length === 0) return;

      await playerRef.current!.play(pcm);

      const durationMs = (pcm.length / SAMPLE_RATE) * 1000;
      if (opts?.onEnd) {
        setTimeout(opts.onEnd, durationMs);
      }
    }).catch((err) => {
      console.error('[useAudioPlayer] queue playback failed', err);
    });
    await playQueueRef.current;
  };

  // 🚨 stop ONLY when interview ends
  const stop = async () => {
    if (!initializedRef.current) return;

    await playerRef.current?.stop();
    playerRef.current = null;
    initializedRef.current = false;
    initPromiseRef.current = null;
    playQueueRef.current = Promise.resolve();
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { init, play, stop };
}
