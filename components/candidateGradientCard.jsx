import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function TemplateCard({
  title,
  description,
  IconComponent,
  FooterComponent,
  source,
  interviewType,
  duration,
  onPress,
}) {
  return (
    <View
      onPress={onPress}
      activeOpacity={0.9}
      className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden shadow-lg"
    >
      {/* top gradient bar */}
      <View className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* header */}
      <View className="p-4 pt-6">
        {interviewType ? (
          <View className="bg-gradient-to-r from-green-600 to-green-500 rounded-full px-2 py-1 w-fit self-start mb-2">
            <Text className="text-white text-xs">{interviewType}</Text>
          </View>
        ) : null}

        <View className="flex-row items-start justify-between gap-3">
          <View style={{ flex: 1 }}>
            <Text className="font-semibold text-gray-800 text-base">
              {title}
            </Text>
          </View>

          {IconComponent ? (
            <View style={{ marginLeft: 8 }}>
              {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent />}
            </View>
          ) : null}
        </View>
      </View>

      {/* content */}
      <View className="px-4 pb-4">
        {source ? (
          <Text className="text-green-600 mb-2 font-semibold text-xs">
            {source}
          </Text>
        ) : null}

        <Text
          className="text-gray-600 text-xs leading-5"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {description}
        </Text>

        {typeof duration === 'number' ? (
          <View className="flex-row items-center mt-3">
            <Ionicons name="stopwatch-outline" size={14} color="#16a34a" />
            <Text className="text-green-600 text-xs ml-1">
              {Math.floor(duration / 60)} Minutes
            </Text>
          </View>
        ) : null}
      </View>

      {/* footer */}
      {FooterComponent ? (
        <View className="px-4 pb-4 pt-0 border-t border-gray-100">
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="bg-blue-500 rounded-lg py-3"
          >
            <Text className="text-center text-white text-sm font-medium">
              View Details
            </Text>
          </TouchableOpacity>
          <FooterComponent />
        </View>
      ) : null}
    </View>
  );
}
