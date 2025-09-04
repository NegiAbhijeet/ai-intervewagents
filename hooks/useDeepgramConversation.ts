// useDeepgramConversation.ts
import type { AgentLiveSchema } from '@/types/agent-live-schema';
import type {
  Message,
  UseConversationHook,
} from '@/types/use-conversation-hook';
import type { VoiceAgentController } from '@/types/voice-agent-controller';
import { useEffect, useRef } from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

const { CustomAudioRecorder, CustomAudioPlayer } = NativeModules;
const recorderEmitter = new NativeEventEmitter(CustomAudioRecorder);

export const AgentEvents = {
  SettingsApplied: 'SettingsApplied',
  ConversationText: 'ConversationText',
  UserStartedSpeaking: 'UserStartedSpeaking',
  AgentThinking: 'AgentThinking',
  AgentStartedSpeaking: 'AgentStartedSpeaking',
} as const;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  // @ts-ignore
  return global.btoa(binary);
};

type Props = {
  onBeforeStarting: () => void;
  onStarted: (vac: VoiceAgentController) => void;
  onAfterStarted: () => void;
  onError: (err: unknown) => void;
  onEnd: () => void;
  onMessage: (event: Message) => void;
  proxyUrl?: string; // ws://localhost:3000
};

const requestMicPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'This app needs microphone access to record audio.',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const useDeepgramConversation: UseConversationHook = ({
  onBeforeStarting,
  onStarted,
  onAfterStarted,
  onEnd,
  onError,
  onMessage,
  proxyUrl = 'ws://0.tcp.in.ngrok.io:16463',
}: Props): { startSession: () => void; stopSession: () => void } => {
  const ws = useRef<WebSocket | null>(null);
  const keepAlive = useRef<NodeJS.Timeout | null>(null);
  const subscription = useRef<null | { remove: () => void }>(null);

  const conversationContext = useRef<
    { role: 'user' | 'assistant'; content: string }[] | null
  >(null);
  const instructions = useRef<string | null>(null);

  const startSession = async () => {
    try {
      onBeforeStarting();

      const granted = await requestMicPermission();
      if (!granted) throw new Error('Microphone permission denied');

      ws.current = new WebSocket(proxyUrl);

      const settingsConfig = {
        audio: {
          input: { encoding: 'linear16', sample_rate: 24000 },
          output: {
            encoding: 'linear16',
            sample_rate: 24000,
            container: 'none',
          },
        },
        agent: {
          language: 'en',
          listen: {
            provider: {
              type: 'deepgram',
              model: 'nova-3',
              smart_format: false, // optional for Deepgram STT
            },
          },
          think: {
            provider: {
              type: 'open_ai',
              model: 'gpt-4o-mini',
              temperature: 0.7,
            },
            // prompt: "You are a helpful agent", // optional
          },
          speak: {
            provider: {
              type: 'deepgram',
              model: 'aura-2-thalia-en', // pick any Aura 2 voice you want
            },
          },
          // greeting: "Hi there", // optional
          // context: { messages: [...], replay: true } // if you need history
        },
      };

      const settingsMessage = JSON.stringify({
        type: 'Settings',
        ...settingsConfig,
      });

      ws.current.onopen = () => {
        ws.current?.send(settingsMessage);
      };

      ws.current.onmessage = (event: WebSocketMessageEvent) => {
        if (typeof event.data === 'string') {
          const msgObj = JSON.parse(event.data);
          const { type } = msgObj;

          switch (type) {
            case 'Welcome':
              break;

            case AgentEvents.SettingsApplied: {
              CustomAudioPlayer.startAudio();
              CustomAudioRecorder.startRecording();

              if (!subscription.current) {
                subscription.current = recorderEmitter.addListener(
                  'AudioChunk',
                  (evt: { data: number[] | Uint8Array }) => {
                    const byteArray = Array.isArray(evt.data)
                      ? new Uint8Array(evt.data)
                      : new Uint8Array(evt.data);
                    ws.current?.send(byteArray);
                  },
                );
              }

              if (!keepAlive.current) {
                keepAlive.current = setInterval(() => {
                  ws.current?.send(JSON.stringify({ type: 'KeepAlive' }));
                }, 5000);
              }
              break;
            }

            case AgentEvents.ConversationText: {
              const { role, content } = msgObj;
              onMessage({ role, content, timestamp: Date.now() });
              break;
            }

            case AgentEvents.UserStartedSpeaking:
            case AgentEvents.AgentThinking:
            case AgentEvents.AgentStartedSpeaking:
              break;

            case 'Error':
              console.error('Deepgram error:', msgObj.description, msgObj.code);
              break;

            default:
              break;
          }
          return;
        }

        if (event.data instanceof ArrayBuffer) {
          const base64 = arrayBufferToBase64(event.data);
          CustomAudioPlayer.playAudioChunk(base64);
        }
      };

      ws.current.onclose = event => {
        console.log('WebSocket closed:', event.code, event.reason);
      };

      ws.current.onerror = err => {
        console.error('WebSocket error:', err);
      };

      const vac: VoiceAgentController = {
        sendInitialIntructions: async (initialInstructions: string) => {
          instructions.current = initialInstructions;
        },
        setInitialConversationPhrases: async (
          phrases: { role: 'user' | 'assistant'; text: string }[],
        ) => {
          conversationContext.current = phrases.map(p => ({
            role: p.role,
            content: p.text,
          }));
        },
        makeAgentSay: async (_text: string) => {},
        startConversation: async () => {},
      };

      onStarted(vac);
    } catch (err) {
      console.error('Error starting session:', err);
      onError(err);
    } finally {
      onAfterStarted();
    }
  };

  const stopSession = async () => {
    try {
      subscription.current?.remove?.();
      subscription.current = null;

      try {
        CustomAudioRecorder.stopRecording();
      } catch {}
      try {
        CustomAudioPlayer.stopAudio();
      } catch {}

      if (keepAlive.current) {
        clearInterval(keepAlive.current);
        keepAlive.current = null;
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close(1000, 'Component unmounted');
      }
      ws.current = null;

      onEnd();
    } catch (err: any) {
      console.error('Error stopping session:', err);
      onError(err?.message || 'Error stopping session');
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return { startSession, stopSession };
};

export default useDeepgramConversation;
