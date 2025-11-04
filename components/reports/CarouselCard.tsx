import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import Gauge from '../simpleGuage';
import AnalysisCards from '../AnalysisCards';

const WINDOW_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_MARGIN = 20;

export default function CarouselCard({
  setIsViewDetails,
  interviewType,
  report,
  setShowImprovementPoints,
}) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(WINDOW_WIDTH);

  // keys selection logic you specified
  const technicalKeys = [
    'Technical_Expertise',
    'Problem_Solving',
    'Decision_Judgment',
    'Debugging_Mindset',
  ];

  const nonTechnicalKeys = [
    'Accountability_Mindset',
    'Team_Collaboration',
    'Problem_Solving',
    'Growth_Mindset',
    'Conflict_Resolution',
    'Outcome_Focus',
  ];

  const selectedKeys =
    interviewType === 'Technical' ? technicalKeys : nonTechnicalKeys;

  // color palette for cards, cycles if there are more keys than colors
  const palette = [
    'rgba(251, 146, 60, 1)',
    'rgba(34, 197, 94, 1)',
    'rgba(59, 130, 246, 1)',
    'rgba(168, 85, 247, 1)',
    'rgba(244, 63, 94, 1)',
    'rgba(14, 165, 233, 1)',
  ];

  // helper to create a readable title from keys
  const humanize = key =>
    (key || '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(s => (s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s))
      .join(' ');

  // Try to extract value and description for a key from the report safely.
  // We look in multiple places to be resilient to report shape differences.
  const getFieldData = key => {
    const fallback = { value: 0, description: 'Not enough data' };

    if (!report) return fallback;

    // direct top-level object
    const top = report[key];
    if (top && typeof top === 'object') {
      const value = top.score ?? top.value ?? top.percentage ?? null;
      const description = top.description ?? top.note ?? top.details ?? null;
      if (value !== null && value !== undefined) {
        return {
          value: Number(value) || 0,
          description: description || fallback.description,
        };
      }
      if (description) return { value: 0, description };
    }

    // sometimes skills are nested under a section like technical_skills
    if (report.technical_skills && report.technical_skills[key]) {
      const v =
        report.technical_skills[key].score ??
        report.technical_skills[key].value;
      const d = report.technical_skills[key].description;
      return { value: Number(v) || 0, description: d || fallback.description };
    }

    // fallback: try to find a similar key case-insensitive
    const keys = Object.keys(report || {});
    const matched = keys.find(k => k.toLowerCase() === key.toLowerCase());
    if (matched && typeof report[matched] === 'object') {
      const v = report[matched].score ?? report[matched].value ?? 0;
      const d = report[matched].description ?? fallback.description;
      return { value: Number(v) || 0, description: d };
    }

    // nothing found
    return fallback;
  };

  // Build cards array from selectedKeys
  const cards = selectedKeys.map((k, i) => {
    const data = getFieldData(k);
    const color = palette[i % palette.length];
    return {
      key: k,
      title: humanize(k),
      description: data.description,
      value: clampNumber(data.value, 0, 100),
      color,
    };
  });

  // card width so one card fills viewport (no peek)
  const cardWidth = Math.max(0, containerWidth - HORIZONTAL_MARGIN * 2);
  const snapInterval = containerWidth;

  function clampNumber(n, min, max) {
    const num = Number(n);
    if (Number.isNaN(num)) return min;
    if (num < min) return min;
    if (num > max) return max;
    return num;
  }

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const scrollToIndex = nextIndex => {
    const i = clamp(nextIndex, 0, cards.length - 1);
    const offset = i * snapInterval;
    listRef.current?.scrollToOffset({ offset, animated: true });
    setIndex(i);
  };

  const onNext = () => scrollToIndex(index + 1);
  const onPrev = () => scrollToIndex(index - 1);

  useEffect(() => {
    // keep visible card in view on container width changes
    const offset = index * snapInterval;
    listRef.current?.scrollToOffset({ offset, animated: false });
  }, [containerWidth]);

  const renderItem = ({ item }) => {
    const percentage = item.value ? (item.value / 10) * 100 : 0;
    const bgColor = item.color.replace('1)', '0.12)');
    return (
      <View style={{ width: containerWidth, alignItems: 'center' }}>
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              backgroundColor: bgColor,
              borderColor: item.color,
            },
          ]}
        >
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <Text style={styles.title} className="line-clamp-1">
              {item.title}
            </Text>
            <Text style={styles.description} className="line-clamp-2">
              {item.description}
            </Text>
          </View>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 12,
            }}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
            onStartShouldSetResponderCapture={() => true}
          >
            <Gauge
              value={percentage}
              strokeWidth={8}
              size={75}
              text={
                percentage <= 30
                  ? 'Poor'
                  : percentage <= 70
                  ? 'Good'
                  : 'Excellent'
              }
              color={
                percentage <= 30
                  ? 'rgba(239, 68, 68, 1)'
                  : percentage <= 70
                  ? 'rgba(234, 179, 8, 1)'
                  : 'rgba(34, 197, 94, 1)'
              }
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <View
        style={styles.wrapper}
        onLayout={ev => {
          const w = Math.round(ev.nativeEvent.layout.width) || WINDOW_WIDTH;
          setContainerWidth(w);
        }}
      >
        <FlatList
          ref={listRef}
          data={cards}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          snapToAlignment="start"
          pagingEnabled={false}
          onMomentumScrollEnd={ev => {
            const offsetX = ev.nativeEvent.contentOffset.x;
            const newIndex = clamp(
              Math.round(offsetX / snapInterval),
              0,
              cards.length - 1,
            );
            setIndex(newIndex);
          }}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          getItemLayout={(_, i) => {
            const length = snapInterval;
            return { length, offset: length * i, index: i };
          }}
          style={{ width: containerWidth }}
          keyboardShouldPersistTaps="handled"
        />

        <TouchableOpacity
          onPress={onPrev}
          activeOpacity={0.8}
          style={[styles.arrowButton, { left: -10 }]}
          accessibilityLabel="Previous card"
        >
          <Image
            source={require('../../assets/images/leftArrow.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.8}
          style={[styles.arrowButton, { right: -10 }]}
          accessibilityLabel="Next card"
        >
          <Image
            source={require('../../assets/images/rightArrow.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <Pressable
        onPress={() => setIsViewDetails(true)}
        style={[
          styles.detailsButton,
          {
            width: Math.min(cardWidth, containerWidth - 40),
            marginHorizontal: 'auto',
          },
        ]}
      >
        <Text style={styles.detailsText}>See Detailed Report</Text>
      </Pressable>
      <View
        style={{ width: cardWidth, marginTop: 24, marginHorizontal: 'auto' }}
      >
        <AnalysisCards
          setShowImprovementPoints={setShowImprovementPoints}
          strengths={Array.isArray(report?.strengths) ? report?.strengths : []}
          weaknesses={
            Array.isArray(report?.weaknesses) ? report?.weaknesses : []
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
    position: 'relative',
  },
  card: {
    minHeight: 150,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    marginHorizontal: HORIZONTAL_MARGIN,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: '#374151',
    marginTop: 6,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    zIndex: 10,
    transform: 'translateY(-25%)',
  },
  detailsButton: {
    marginTop: 12,
    backgroundColor: 'rgba(211, 127, 58, 1)',
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    
  },
});
