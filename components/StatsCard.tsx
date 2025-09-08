// src/components/StatsCard.tsx
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  label: string
  value: string
  color?: 'green' | 'purple' | 'yellow'
}

const bgColorMap = {
  green: 'bg-green-100',
  purple: 'bg-purple-100',
  yellow: 'bg-yellow-100',
  default: 'bg-blue-100',
}

const StatsCard = ({ label, value, color = 'default' }: Props) => {
  return (
    <View className={`w-[48%] rounded-xl p-4 mb-3 ${bgColorMap[color] || bgColorMap.default}`}>
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="text-xl font-semibold">{value}</Text>
    </View>
  )
}

export default StatsCard
