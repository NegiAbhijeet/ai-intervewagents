// src/components/SessionItem.tsx
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  title: string
  date: string
  score: string
}

const SessionItem = ({ title, date, score }: Props) => {
  return (
    <View className="flex-row justify-between items-center p-4 bg-gray-50 rounded-lg">
      <View>
        <Text className="font-semibold">{title}</Text>
        <Text className="text-xs text-gray-500">{date}</Text>
      </View>
      <Text className="font-bold text-blue-500">{score}</Text>
    </View>
  )
}

export default SessionItem
