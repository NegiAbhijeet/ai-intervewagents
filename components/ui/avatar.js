import React from "react";
import { View, Text, Image } from "react-native";

// Main Avatar container
export const Avatar = ({ size = 40, className, children }) => {
  return (
    <View
      className={`overflow-hidden justify-center items-center bg-gray-300 rounded-full ${className || ""}`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {children}
    </View>
  );
};

// Avatar Image
export const AvatarImage = ({ uri, size = 40, className }) => {
  return (
    <Image
      source={{ uri }}
      className={`w-full h-full ${className || ""}`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
    />
  );
};

// Avatar Fallback (e.g., initials)
export const AvatarFallback = ({ children, size = 40, className, textClassName }) => {
  return (
    <View
      className={`justify-center items-center bg-gray-200 rounded-full ${className || ""}`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className={`font-bold text-gray-700 ${textClassName || ""}`} style={{ fontSize: size / 2.5 }}>
        {children}
      </Text>
    </View>
  );
};
