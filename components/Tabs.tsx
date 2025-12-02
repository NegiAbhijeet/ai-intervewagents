import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Tabs({ activeTab, setActiveTab }) {
  const { t } = useTranslation()

  return (
    <View className="items-center justify-center w-[80%] relative mx-auto">
      <Image
        source={require('../assets/images/penguin.png')}
        resizeMode="contain"
        style={{ height: 120 }}
      />

      <View className="flex-row items-center justify-center w-full relative border-2 border-white rounded-2xl overflow-hidden">
        <Pressable
          onPress={() => setActiveTab('details')}
          className={`py-3 w-1/2 
            ${activeTab === 'details' ? 'bg-white' : 'bg-gray-200'}
          `}
        >
          <Text
            className={`text-base font-semibold text-center 
              ${activeTab === 'details' ? 'text-black' : 'text-gray-500'}
            `}
          >
            {t('tabs.reportAnalysis')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('transcript')}
          className={`py-3 w-1/2 
            ${activeTab === 'transcript' ? 'bg-white' : 'bg-gray-200'}
          `}
        >
          <Text
            className={`text-base font-medium text-center 
              ${activeTab === 'transcript' ? 'text-black' : 'text-gray-500'}
            `}
          >
            {t('tabs.transcript')}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
