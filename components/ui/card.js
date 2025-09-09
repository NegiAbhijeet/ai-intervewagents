import React from "react";
import { View, Text } from "react-native";

// Main Card Container
export const Card = ({ children, className }) => {
  return <View className={`bg-white rounded-xl border border-gray-200 shadow p-0 overflow-hidden ${className || ""}`}>{children}</View>;
};

// Card Header
export const CardHeader = ({ children, className }) => {
  return <View className={`bg-gray-50 border-b border-gray-200 p-4 ${className || ""}`}>{children}</View>;
};

// Card Content
export const CardContent = ({ children, className }) => {
  return <View className={`p-4 ${className || ""}`}>{children}</View>;
};

// Card Title
export const CardTitle = ({ children, className }) => {
  return <Text className={`text-gray-900 font-semibold text-base ${className || ""}`}>{children}</Text>;
};

// Card Description
export const CardDescription = ({ children, className }) => {
  return <Text className={`text-gray-500 text-sm mt-1 ${className || ""}`}>{children}</Text>;
};
