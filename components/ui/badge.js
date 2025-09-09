import React from "react";
import { View, Text } from "react-native";

export const Badge = ({ children, variant = "default", className, textClassName }) => {
  let containerClasses = "";
  let textClasses = "";

  switch (variant) {
    case "secondary":
      containerClasses = "bg-sky-100 border-transparent";
      textClasses = "text-sky-800";
      break;
    case "destructive":
      containerClasses = "bg-red-100 border-transparent";
      textClasses = "text-red-700";
      break;
    case "outline":
      containerClasses = "bg-transparent border border-gray-300";
      textClasses = "text-gray-900";
      break;
    default:
      containerClasses = "bg-blue-100 border-transparent";
      textClasses = "text-blue-700";
  }

  return (
    <View
      className={`px-2.5 py-0.5 rounded-full self-start ${containerClasses} ${className || ""}`}
    >
      <Text className={`text-xs font-semibold ${textClasses} ${textClassName || ""}`}>
        {children}
      </Text>
    </View>
  );
};
