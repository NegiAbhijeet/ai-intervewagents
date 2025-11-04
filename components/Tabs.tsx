import { View, Text, Pressable, Image } from 'react-native';
import React, { useState } from 'react';

export default function Tabs() {
  const [activeTab, setActiveTab] = useState('report');

  return (
    <View className="items-center justify-center w-[80%] relative  mx-auto">
      <Image
        source={require('../assets/images/penguine.png')}
        resizeMode="contain"
        style={{ height: 120 }}
      />
      <View className="flex-row items-center justify-center w-full relative border-2 border-white rounded-2xl overflow-hidden">
        <Pressable
          onPress={() => setActiveTab('report')}
          className={` py-3 w-1/2 
          ${activeTab === 'report' ? 'bg-white ' : 'bg-gray-200 '}
        `}
        >
          <Text
            className={`text-base font-semibold  text-center 
            ${activeTab === 'report' ? 'text-black' : 'text-gray-500'}
          `}
          >
            Report Analysis
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('transcript')}
          className={` py-3 w-1/2 
          ${activeTab === 'transcript' ? 'bg-white ' : 'bg-gray-200 '}
        `}
        >
          <Text
            className={`text-base font-medium  text-center 
            ${activeTab === 'transcript' ? 'text-black' : 'text-gray-500'}
          `}
          >
            Transcript
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
