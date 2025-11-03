// AnalysisCards.js
import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GradientBorderView } from '@good-react-native/gradient-border';
export default function AnalysisCards({ strengths = [], weaknesses = [] }) {
  const [openItem, setOpenItem] = useState(null); // 'strengths' | 'weaknesses' | null

  const open = key => setOpenItem(key);
  const close = () => setOpenItem(null);

  const renderCard = (key, title, subtitle) => (
    <GradientBorderView
      className="w-[48%]"
      gradientProps={{
        colors: ['rgba(203,104,195,1)', 'rgba(108,110,196,1)'],
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1},
      }}
      style={{
        backgroundColor: 'transparent',
        borderWidth: 6,
        borderRadius: 16,
      }}
    >
      <Pressable
        onPress={() => open(key)}
        accessibilityRole="button"
        className="r bg-[rgba(58,55,55,0.25)] overflow-hidden"
      >
        <View className="flex-row items-center justify-end w-full">
          <Image
            source={require('../assets/images/playButton.png')}
            resizeMode="contain"
          />
        </View>

        <View className="px-3 pb-3">
          <Text className="text-[16px] font-extrabold text-black">{title}</Text>
          <Text className="text-[13px] text-[#333] opacity-80 mt-1.5">
            {subtitle}
          </Text>
        </View>
      </Pressable>
    </GradientBorderView>
  );

  const renderListItems = (items, type) => {
    if (!items || items.length === 0) {
      return (
        <Text className="text-[14px] text-[#666] py-2">No items found</Text>
      );
    }

    return items.map((it, idx) => {
      const text = typeof it === 'string' ? it : it.text ?? '';
      const icon = type === 'strengths' ? '✓' : '✕';
      const iconBg = type === 'strengths' ? 'bg-[#2e7d32]' : 'bg-[#c62828]';

      return (
        <View
          key={idx}
          className="flex-row items-center py-2.5 border-b border-gray-200"
        >
          <View
            className={`w-8 h-8 rounded-full ${iconBg} items-center justify-center mr-3`}
          >
            <Text className="text-[16px] text-white font-bold text-center">
              {icon}
            </Text>
          </View>
          <Text className="flex-1 text-[15px] text-[#222]">{text}</Text>
        </View>
      );
    });
  };

  return (
    <View className="w-full">
      <View className="flex-row justify-between">
        {renderCard(
          'strengths',
          'Strengths',
          'Tap to view the analyzed strength points',
        )}
        {renderCard(
          'weaknesses',
          'Weaknesses',
          'Tap to view the analyzed weakness points',
        )}
      </View>

      <Modal
        visible={!!openItem}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center p-5"
          onPress={close}
        >
          <Pressable
            className="w-full max-w-[480px] bg-gray-200 rounded-xl p-4 max-h-[80%]"
            onPress={() => {}}
          >
            <Text
              className={`text-[20px] font-extrabold mb-3 text-center ${
                openItem === 'strengths' ? 'text-[#2e7d32]' : 'text-[#c62828]'
              }`}
            >
              {openItem === 'strengths' ? 'Strength Points' : 'Weakness Points'}
            </Text>

            <ScrollView
              className="mb-2"
              contentContainerStyle={{ paddingBottom: 6 }}
            >
              {openItem === 'strengths' &&
                renderListItems(strengths, 'strengths')}
              {openItem === 'weaknesses' &&
                renderListItems(weaknesses, 'weaknesses')}
            </ScrollView>

            <Pressable
              onPress={close}
              className="rounded-lg overflow-hidden mt-4"
            >
              <LinearGradient
                colors={['rgba(85, 95, 238, 1)', 'rgba(140, 70, 239, 1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 items-center justify-center rounded-lg"
              >
                <Text className="text-white text-[16px] font-semibold text-center">
                  How to Improve
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={close}
              className="absolute top-2 right-2 rounded-full bg-white p-2"
            >
              <Text className="text-[15px] text-[#111]">✕</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
