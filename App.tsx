import useDeepgramConversation from './hooks/useDeepgramConversation';
import React, { useRef, useState } from 'react';
import {
  NativeModules,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { CustomAudioRecorder, CustomAudioPlayer } = NativeModules;

// Type for a chat message
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
};

const VoiceComponent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const { startSession, stopSession } = useDeepgramConversation({
    onBeforeStarting: () => console.log('Starting session...'),
    onStarted: vac => {
      console.log('Session started');
      vac.startConversation();
      setIsRecording(true);
    },

    onEnd: () => {
      console.log('Session ended');
      setIsRecording(false);
    },

    onError: err => {
      console.error('Error:', err);
      setIsRecording(false);
    },

    onAfterStarted: () => console.log('Session after started'),

    onMessage: message => {
      setMessages(prev => [
        ...prev,
        {
          role: message.role,
          content: message.content,
          timestamp: message.timestamp ?? Date.now(),
        },
      ]);
    },
    CustomAudioRecorder,
    CustomAudioPlayer,
  });

  const onToggle = async () => {
    try {
      if (!isRecording) {
        await startSession();
      } else {
        await stopSession();
      }
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.assistantRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={styles.roleLabel}>{isUser ? 'You' : 'Assistant'}</Text>
          <Text style={styles.content}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>Transcript</Text>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${item.timestamp ?? index}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
        />

        <View pointerEvents="box-none" style={styles.fabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggle}
            style={[styles.fab, isRecording ? styles.fabActive : null]}
          >
            <Text style={styles.fabText}>{isRecording ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VoiceComponent;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F3F5F7',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 120,
  },
  messageRow: {
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({
      android: { elevation: 2 },
    }),
  },
  userBubble: {
    backgroundColor: '#2E5BFF',
  },
  assistantBubble: {
    backgroundColor: '#1C2536',
  },
  roleLabel: {
    fontSize: 11,
    color: '#C9D2E1',
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    color: '#F3F5F7',
    lineHeight: 20,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E5BFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    height: 56,
    minWidth: 140,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    ...Platform.select({
      android: { elevation: 6 },
    }),
  },
  fabActive: {
    backgroundColor: '#EF4444',
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});
