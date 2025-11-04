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

type IncomingReport = {
  [key: string]: any;
};

type CardItem = {
  id: string;
  title: string;
  subtitle: string;
  score: number | null;
};

export default function ReportCards({
  interviewType,
  report,
  setIsViewSkills,
  setIsViewDetails,
}: {
  interviewType?: 'Technical' | string;
  report?: IncomingReport;
}) {
  // keys to show for each interview type
  const technicalKeys = React.useMemo(
    () => [
      'Technical_Expertise',
      'Problem_Solving',
      'Decision_Judgment',
      'Debugging_Mindset',
    ],
    [],
  );

  const nonTechnicalKeys = React.useMemo(
    () => [
      'Accountability_Mindset',
      'Team_Collaboration',
      'Problem_Solving',
      'Growth_Mindset',
      'Conflict_Resolution',
      'Outcome_Focus',
    ],
    [],
  );

  const selectedKeys = React.useMemo(
    () => (interviewType === 'Technical' ? technicalKeys : nonTechnicalKeys),
    [interviewType, technicalKeys, nonTechnicalKeys],
  );

  // get a readable title from a key like "Technical_Expertise" -> "Technical Expertise"
  const humanize = (key: string) =>
    (key || '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(s => (s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s))
      .join(' ');

  // robust extractor: looks in multiple shapes (top-level, nested technical_skills, etc.)
  const getFieldData = React.useCallback(
    (key: string) => {
      const fallback = {
        value: null as number | null,
        description: 'Not enough data',
      };

      if (!report || typeof report !== 'object') return fallback;

      // exact match at top-level
      const top = report[key];
      if (top && typeof top === 'object') {
        const value = top.score ?? top.value ?? top.percentage ?? null;
        const description = top.description ?? top.note ?? top.details ?? null;
        return {
          value:
            value !== undefined && value !== null ? Number(value) || 0 : null,
          description: description ?? fallback.description,
        };
      }

      // check common nested containers
      if (report.technical_skills && report.technical_skills[key]) {
        const v =
          report.technical_skills[key].score ??
          report.technical_skills[key].value ??
          null;
        const d =
          report.technical_skills[key].description ?? fallback.description;
        return {
          value: v !== null && v !== undefined ? Number(v) || 0 : null,
          description: d,
        };
      }

      if (report.meta && report.meta[key]) {
        const v = report.meta[key].score ?? report.meta[key].value ?? null;
        const d = report.meta[key].description ?? fallback.description;
        return {
          value: v !== null && v !== undefined ? Number(v) || 0 : null,
          description: d,
        };
      }

      // case-insensitive match
      const keys = Object.keys(report);
      const matched = keys.find(k => k.toLowerCase() === key.toLowerCase());
      if (matched && typeof report[matched] === 'object') {
        const v = report[matched].score ?? report[matched].value ?? null;
        const d = report[matched].description ?? fallback.description;
        return {
          value: v !== null && v !== undefined ? Number(v) || 0 : null,
          description: d,
        };
      }

      // fallback: try to find numeric value anywhere under the key name
      for (const k of keys) {
        if (k.toLowerCase().includes(key.toLowerCase().replace(/_/g, ''))) {
          const candidate = report[k];
          if (candidate && typeof candidate === 'object') {
            const v = candidate.score ?? candidate.value ?? null;
            const d = candidate.description ?? fallback.description;
            return {
              value: v !== null && v !== undefined ? Number(v) || 0 : null,
              description: d,
            };
          }
        }
      }

      return fallback;
    },
    [report],
  );

  // build normalized list from selected keys
  const normalized: CardItem[] = React.useMemo(() => {
    return selectedKeys.map((k, i) => {
      const data = getFieldData(k);
      return {
        id: `${k}-${i}`,
        title: humanize(k),
        subtitle: data.description ?? '',
        score: data.value !== null ? clamp(Number(data.value), 0, 100) : null,
      };
    });
  }, [selectedKeys, getFieldData]);

  function clamp(n: number, min: number, max: number) {
    if (Number.isNaN(n)) return min;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 32 }}>
      <View style={{ gap: 12 }}>
        {normalized.map((s, i) => {
          const color = colorVariants[i % colorVariants.length];
          const gaugeValue = s.score ?? 0;

          return (
            <Pressable
              key={s.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: color.border,
                backgroundColor: color.bg,
              }}
              android_ripple={{ color: '#eee' }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: color.border,
                    }}
                  >
                    <Ionicons name="chevron-forward" size={12} color="white" />
                  </View>

                  <Text
                    style={{
                      color: '#0f172a',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    {s.title}
                  </Text>
                </View>

                <Text
                  style={{
                    color: '#64748b',
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: '500',
                  }}
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
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#eef2ff',
            alignItems: 'center',
          }}
          onPress={() => {
            setIsViewDetails(false);
            setIsViewSkills(true);
          }}
        >
          <Text style={{ color: '#3730a3', fontWeight: '600' }}>
            Detailed Skill Analysis
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
