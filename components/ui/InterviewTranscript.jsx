import React, { useEffect, useRef } from "react";
import { ScrollView, View, Text } from "react-native";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export function InterviewTranscript({ messages, interviewerName, candidateName }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <ScrollView
      ref={scrollRef}
      className="h-[calc(100vh-220px)] px-4 py-2"
    >
      <View className="flex flex-col gap-4 pr-4">
        {Array.isArray(messages) &&
          messages.map((message, index) => {
            const isUser = message.hasOwnProperty("user");
            const senderName = isUser ? candidateName : interviewerName;
            const text = isUser ? message.user : message.assistant;
            const initials = senderName
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <View key={index} className="flex-row gap-3 items-start">
                <Avatar className="h-8 w-8 justify-center items-center">
                  {!isUser && (
                    <AvatarImage
                      source={{ uri: "https://yourdomain.com/logo.png" }} // Replace with real logo
                      alt={senderName}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium">{senderName}</Text>
                  </View>
                  <Text className="text-sm text-gray-800">{text}</Text>
                </View>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
}
