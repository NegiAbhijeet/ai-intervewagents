// src/components/ActionButton.tsx
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type Props = {
  label: string
  description: string
  buttonText: string
  color?: 'blue' | 'green'
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
}

const ActionButton = ({ label, description, buttonText, color = 'blue' }: Props) => {
  return (
    <View className="mb-4 p-4 rounded-xl bg-gray-100">
      <Text className="text-md font-semibold mb-1">{label}</Text>
      <Text className="text-sm text-gray-600 mb-3">{description}</Text>
      <TouchableOpacity className={`py-2 px-4 rounded-md ${colorMap[color]}`}>
        <Text className="text-white text-center font-semibold">{buttonText}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ActionButton
