import Ionicons from '@react-native-vector-icons/ionicons'
import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

type Props = {
  total: number
  completed: number
  pending: number
}

export default function StatusBoxes({
  total,
  completed,
  pending,
}: Props) {
  const { t } = useTranslation()

  const items = [
    { key: 'total', label: t('status.total'), value: total },
    { key: 'completed', label: t('status.completed'), value: completed },
    { key: 'pending', label: t('status.pending'), value: pending },
  ]

  return (
    <View className="flex-row items-center justify-center" style={{ gap: 24 }}>
      {items.map((it, idx) => (
        <View
          key={it.key}
          className="items-center bg-white"
          style={styles.box}
        >
          {
            idx === 0 ? (
              <View
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 1)',
                  padding: 10,
                  borderRadius: 9999
                }}
              >
                <Ionicons name="clipboard" size={14} color="white" />
              </View>
            ) : idx === 1 ? (
              <View
                style={{
                  backgroundColor: 'rgba(66, 198, 133, 1)',
                  padding: 10,
                  borderRadius: 9999
                }}
              >
                <Ionicons name="checkmark-circle" size={14} color="white" />
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: 'rgba(255, 170, 84, 1)',
                  padding: 10,
                  borderRadius: 9999
                }}
              >
                <Ionicons name="time" size={14} color="white" />
              </View>
            )
          }

          <Text className="text-lg font-semibold" style={styles.number}>
            {it.value}
          </Text>
          <Text className="text-xs" style={styles.label}>
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    width: 88,
    height: 100,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    gap: 1
  },
  icon: {
    width: 28,
    height: 28,
  },
  number: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700'
  },
  label: {
    color: 'rgba(111, 122, 138, 1)',
  },
})
