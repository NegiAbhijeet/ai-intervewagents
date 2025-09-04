import useDeepgramConversation from "./hooks/useDeepgramConversation";
import React, { useEffect, useState } from "react";
import { NativeModules, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { CustomAudioRecorder, CustomAudioPlayer } = NativeModules;
console.log(CustomAudioRecorder, CustomAudioPlayer, "===")
const VoiceComponent = () => {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; timestamp?: number }[]
  >([]);

  const { startSession, stopSession } = useDeepgramConversation({
    onBeforeStarting: () => console.log("Starting session..."),
    onStarted: (vac) => {
      console.log("Session started");
      vac.startConversation();
    },
    onAfterStarted: () => console.log("Session after started"),
    onError: (err) => console.error("Error:", err),
    onEnd: () => console.log("Session ended"),
    onMessage: (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    },
    CustomAudioRecorder, CustomAudioPlayer
  });

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={startSession}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopSession}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.messages}>
        {messages.map((message, index) => (
          <View key={index} style={styles.messageRow}>
            <Text style={styles.role}>{message.role}:</Text>
            <Text style={styles.content}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default VoiceComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  messages: {
    flex: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  role: {
    fontWeight: "bold",
    marginRight: 4,
  },
  content: {
    flexShrink: 1,
  },
});
