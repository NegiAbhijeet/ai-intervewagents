import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function Transcript({
  transcript = [],
  initialLines = 10,
  showMoreText = 'Show more',
  showLessText = 'Show less',
}) {
  const [expanded, setExpanded] = React.useState(false);
  const { t } = useTranslation();
  const normalized = React.useMemo(() => {
    return (transcript || []).map((t, i) => {
      if (typeof t === 'string') {
        return { id: String(i), speaker: '', text: t };
      }
      const speaker = t.user;
      const text = t.user || t.assistant || '';
      return { id: t.id ?? `${i}`, speaker, text };
    });
  }, [transcript]);

  const visible = expanded ? normalized : normalized.slice(0, initialLines);
  const showToggle = normalized.length > initialLines;

  return (
    <View style={styles.container}>
      {visible.map(item => (
        <View key={item.id} style={item.speaker ? {} : { marginBottom: 10 }}>
          <Text
            style={
              {
                fontSize: 14,
                color: '#111827',
                lineHeight: 20,
              }
            }
            accessibilityRole="text"
          >
            <Text
              style={{
                fontSize: 14,
                color: '#111827',
                lineHeight: 20,
                fontWeight: '700',
              }}
            >
              {item.speaker ? t('chat.user') : t('chat.nova')}{': '}
            </Text>

            {item.text || 'Not enough data'}
          </Text>
          <View style={styles.separator} />
        </View>
      ))}

      {showToggle ? (
        <Pressable
          onPress={() => setExpanded(prev => !prev)}
          accessibilityRole="button"
          style={styles.toggleContainer}
        >
          <Text style={styles.toggleText}>
            {expanded ? showLessText : showMoreText}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  separator: {
    height: 8,
  },
  toggleContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  toggleText: {
    textDecorationLine: 'underline',
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});
