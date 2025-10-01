import Ionicons from "@react-native-vector-icons/ionicons"
import React from "react"
import { View, Text, TouchableOpacity } from "react-native"




export function DashboardHeader({
  title,
  description,
  actionLabel,
  extraText,
  isGradientText,
  actionIcon,
  onAction,
}) {
  return (
    <View className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center w-full">
      <View>
        <Text
          className={`text-2xl mb-1 font-bold tracking-tight ${
            isGradientText ? "text-transparent" : "text-gray-900"
          }`}
          accessible
          accessibilityRole="header"
        >
          {title}
        </Text>

        {description ? (
          <Text className="text-sm text-gray-500">
            {description}{" "}
            {extraText ? <Text className="text-gray-800">{extraText}</Text> : null}
          </Text>
        ) : null}
      </View>

      {actionLabel ? (
        <TouchableOpacity
          onPress={onAction}
          className="flex-row items-center px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600"
          accessibilityRole="button"
        >
          {actionIcon ?? <Ionicons name="add" size={16} color="white" />}
          <Text className="text-white font-medium">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

export default DashboardHeader
