import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default function InterviewSummaryModal({
  visible,
  onClose,
  summaryText = '',
}) {
  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center p-5"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-[480px] bg-gray-100 rounded-xl p-4 max-h-[80%]"
          onPress={() => {}}
        >
          <Text className="text-[20px] font-extrabold mb-3 text-center text-[#2e7d32]">
            Interview Summary
          </Text>

          <ScrollView
            className="mb-2"
            contentContainerStyle={{ paddingBottom: 6 }}
          >
            <Text className="text-[15px] text-[#111] leading-6">
              {summaryText}
            </Text>
          </ScrollView>

          <Pressable
            onPress={onClose}
            className="absolute top-2 right-2 rounded-full bg-white p-2"
          >
            <Text className="text-[15px] text-[#111]">✕</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({});
