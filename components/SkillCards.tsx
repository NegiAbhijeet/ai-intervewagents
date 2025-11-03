import React from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'

import Gauge from './simpleGuage'
import Ionicons from '@react-native-vector-icons/ionicons'

const colorVariants = [
  { bg: 'bg-orange-100', border: 'border-orange-500' },
  { bg: 'bg-violet-100', border: 'border-violet-500' },
  { bg: 'bg-cyan-100', border: 'border-cyan-500' },
  { bg: 'bg-purple-100', border: 'border-purple-500' },
  { bg: 'bg-blue-100', border: 'border-blue-500' },
  { bg: 'bg-teal-100', border: 'border-teal-500' },
]

type IncomingSkillObject = {
  [key: string]: { score: number | null; description?: string | null }
}

type SkillItem = {
  id: string
  title: string
  subtitle: string
  score: number | null
}


export default function SkillCards({ skills }: { skills?: SkillItem[] | IncomingSkillObject }) {
  // normalize input
  const normalized: SkillItem[] = React.useMemo(() => {
    if (!skills) return []

    if (Array.isArray(skills)) {
      // ensure each item has required fields and a stable id
      return skills.map((s, i) => ({
        id: (s as any).id?.toString() ?? `${(s as any).title ?? 'skill'}-${i}`,
        title: (s as any).title ?? `Skill ${i + 1}`,
        subtitle: (s as any).subtitle ?? ((s as any).description ?? ''),
        score: (s as any).score ?? null,
      }))
    }

    // incoming is an object map
    const obj = skills as IncomingSkillObject
    return Object.entries(obj).map(([key, value], i) => ({
      id: `${key}-${i}`,
      // convert underscores to spaces and keep capitalization
      title: key.replace(/_/g, ' '),
      subtitle: value.description ?? '',
      score: value.score ?? null,
    }))
  }, [skills])

  return (
    <ScrollView contentContainerStyle={{ padding: 32 }}>
      <View className="gap-4">
        {normalized.map((s, i) => {
          const color = colorVariants[i % colorVariants.length]
          // gauge expects a number; pass 0 when score is null but show description below
          const gaugeValue = s.score ?? 0

          return (
            <Pressable
              key={s.id}
              className={`flex-row items-center p-4 rounded-2xl border ${color.bg} ${color.border}`}
              android_ripple={{ color: '#eee' }}
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded-full justify-center items-center bg-indigo-500">
                    <Ionicons name="chevron-forward" size={12} color="white" />
                  </View>

                  <Text className="text-slate-800" style={{ fontSize: 16, fontWeight: '700' }}>
                    {s.title}
                  </Text>
                </View>

                <Text className="text-slate-500 mt-1" style={{ fontSize: 12, fontWeight: '500' }}>
                  {s.subtitle || 'Not enough data'}
                </Text>
              </View>

              <View className="ml-4">
                <Gauge value={gaugeValue} size={75} />
              </View>
            </Pressable>
          )
        })}

        <Pressable className="mt-6 p-3 rounded-xl bg-indigo-50 items-center">
          <Text className="text-base text-indigo-700" style={{ fontWeight: '600' }}>
            Detailed Skill Analysis
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
