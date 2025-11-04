import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import Gauge from './simpleGuage';
import Ionicons from '@react-native-vector-icons/ionicons';

const colorVariants = [
  { bg: 'rgba(211, 127, 58, 0.3)', border: 'rgba(211, 127, 58, 1)' }, // orange
  { bg: 'rgba(179, 102, 147, 0.3)', border: 'rgba(179, 102, 147, 1)' }, // violet/pink
  { bg: 'rgba(43, 129, 143, 0.3)', border: 'rgba(43, 129, 143, 1)' }, // teal blue
  { bg: 'rgba(122, 63, 191, 0.3)', border: 'rgba(122, 63, 191, 1)' }, // purple
  { bg: 'rgba(54, 109, 238, 0.3)', border: 'rgba(54, 109, 238, 1)' }, // blue
  { bg: 'rgba(81, 194, 211, 0.3)', border: 'rgba(81, 194, 211, 1)' }, // cyan/light teal
];

type IncomingSkillObject = {
  [key: string]: { score: number | null; description?: string | null };
};

type SkillItem = {
  id: string;
  title: string;
  subtitle: string;
  score: number | null;
};

export default function SkillCards({
  skills,
  setIsViewSkills,
  setIsViewDetails,
}: {
  skills?: SkillItem[] | IncomingSkillObject;
}) {
  // normalize input
  const normalized: SkillItem[] = React.useMemo(() => {
    if (!skills) return [];

    if (Array.isArray(skills)) {
      // ensure each item has required fields and a stable id
      return skills.map((s, i) => ({
        id: (s as any).id?.toString() ?? `${(s as any).title ?? 'skill'}-${i}`,
        title: (s as any).title ?? `Skill ${i + 1}`,
        subtitle: (s as any).subtitle ?? (s as any).description ?? '',
        score: (s as any).score ?? null,
      }));
    }

    // incoming is an object map
    const obj = skills as IncomingSkillObject;
    return Object.entries(obj).map(([key, value], i) => ({
      id: `${key}-${i}`,
      // convert underscores to spaces and keep capitalization
      title: key.replace(/_/g, ' '),
      subtitle: value.description ?? '',
      score: value.score ?? null,
    }));
  }, [skills]);

  return (
    <ScrollView contentContainerStyle={{ padding: 32 }}>
      <View className="gap-3">
        {normalized.map((s, i) => {
          const color = colorVariants[i % colorVariants.length];
          // gauge expects a number; pass 0 when score is null but show description below
          const gaugeValue = s.score ? (s.score / 10) * 100 : 0;

          return (
            <Pressable
              key={s.id}
              className={`flex-row items-center p-4 rounded-2xl`}
              style={{
                borderWidth: 1,
                borderColor: color.border,
                backgroundColor: color.bg,
              }}
              android_ripple={{ color: '#eee' }}
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-6 h-6 rounded-full justify-center items-center "
                    style={{ backgroundColor: color.border }}
                  >
                    <Ionicons name="chevron-forward" size={12} color="white" />
                  </View>

                  <Text
                    className="text-slate-800"
                    style={{ fontSize: 16, fontWeight: '700' }}
                  >
                    {s.title}
                  </Text>
                </View>

                <Text
                  className="text-slate-500 mt-1"
                  style={{ fontSize: 12, fontWeight: '500' }}
                >
                  {s.subtitle || 'Not enough data'}
                </Text>
              </View>

              <View style={{ marginLeft: 12 }}>
                <Gauge
                  value={gaugeValue}
                  size={75}
                  text={
                    gaugeValue <= 30
                      ? 'Poor'
                      : gaugeValue <= 70
                      ? 'Good'
                      : 'Excellent'
                  }
                  color={
                    gaugeValue <= 30
                      ? 'rgba(239, 68, 68, 1)'
                      : gaugeValue <= 70
                      ? 'rgba(234, 179, 8, 1)'
                      : 'rgba(34, 197, 94, 1)'
                  }
                />
              </View>
            </Pressable>
          );
        })}

        <Pressable
          className="mt-6 p-3 rounded-xl bg-indigo-50 items-center"
          onPress={() => {
            setIsViewSkills(false);
            setIsViewDetails(true);
          }}
        >
          <Text
            className="text-base text-indigo-700"
            style={{ fontWeight: '600' }}
          >
            See Full Report
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
