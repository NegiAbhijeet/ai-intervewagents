import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  ScrollView,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';

export default function ImprovementsPoints({ visible, onClose, data = [] }) {
  const openLink = async url => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot open link',
          'The link cannot be opened on this device.',
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open the link.');
    }
  };

  const renderItem = (item, idx) => {
    const text = typeof item === 'string' ? item : item.step ?? '';
    const url = item.resource ?? null;

    return (
      <View
        key={idx}
        className="flex-row items-start py-3 border-b border-gray-200"
      >
        <View className="w-8 h-8 rounded-full bg-[#2e7d32] items-center justify-center mr-3 mt-1">
          <Text className="text-[14px] text-white font-bold">✓</Text>
        </View>

        <View className="flex-1">
          <Text className="text-[15px] text-[#111] mb-2">{text}</Text>

          {url ? (
            <Pressable
              onPress={() => openLink(url)}
              className="self-start rounded px-3 py-1 bg-white border border-gray-300"
            >
              <Text className="text-[13px]">Open resource</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

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
            Improvement steps
          </Text>

          <ScrollView
            className="mb-2"
            contentContainerStyle={{ paddingBottom: 6 }}
          >
            {!data || data.length === 0 ? (
              <Text className="text-[14px] text-[#666] py-2">
                No items found
              </Text>
            ) : (
              data.map((it, i) => renderItem(it, i))
            )}
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
