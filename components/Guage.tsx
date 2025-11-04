// ArcGauge.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ArcGauge({
  // if size is passed it becomes the max allowed diameter
  size: maxSize = 360,
  // Inner arc (main gauge)
  inner = {
    strokeWidth: 50,
    gradient: {
      id: 'innerGrad',
      stops: [
        { offset: '0%', stopColor: 'rgba(54, 109, 238, 1)' },
        { offset: '100%', stopColor: 'rgba(148, 66, 239, 1)' },
      ],
    },
    backgroundColor: '#D9D9D9',
  },
  // Outer thin static arc
  outer = {
    enabled: true,
    strokeWidth: 6,
    gradient: {
      id: 'outerGrad',
      stops: [
        { offset: '0%', stopColor: '#808080' },
        { offset: '100%', stopColor: '#000' },
      ],
    },
    backgroundColor: '#BBBBBB',
  },
  percentage = 50,
  startAngle = 0,
  sweepAngle = 180,
  duration = 800,
  gap = 10,
  // horizontal padding to leave from screen edges when computing size
  horizontalPadding = 16,
}) {
  const { width: windowWidth } = useWindowDimensions();

  // compute usable width from device width and padding, then clamp to maxSize
  const usableWidth = Math.max(windowWidth - horizontalPadding * 2, 0);
  const size = Math.min(usableWidth, maxSize);

  // radii are calculated from the full diameter `size` so the geometry stays consistent
  const outerRadius = (size - outer.strokeWidth) / 2;
  const innerRadius =
    outerRadius - outer.strokeWidth / 2 - gap - inner.strokeWidth / 2;

  const circumferenceOuter = 2 * Math.PI * outerRadius;
  const circumferenceInner = 2 * Math.PI * innerRadius;
  const arcLengthOuter = (sweepAngle / 360) * circumferenceOuter;
  const arcLengthInner = (sweepAngle / 360) * circumferenceInner;

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percentage,
      duration,
      useNativeDriver: false, // safer for SVG strokeDashoffset
    }).start();
  }, [percentage, duration, anim]);

  const strokeDashoffsetInner = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [arcLengthInner, 0],
  });

  // center of the full circle (based on original size)
  const cx = size / 2;
  const cy = size / 2;
  // rotate so the arc starts at startAngle
  const rotation = startAngle + 180;

  // prevent stroke clipping by adding padding equal to the thicker stroke
  const strokePad = Math.max(inner.strokeWidth, outer.strokeWidth);
  // show only the top half: shrink SVG height and add padding so strokes are not clipped
  const svgHeight = size / 2;

  // label vertical offset scale so it looks right on different sizes
  const labelPaddingBottom = Math.round(size * 0.12);

  return (
    <View style={[styles.wrapper, { width: size, height: svgHeight }]}>
      <Svg width={size} height={svgHeight}>
        <Defs>
          <LinearGradient
            id={outer.gradient.id}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            {outer.gradient.stops.map((s, i) => (
              <Stop key={i} offset={s.offset} stopColor={s.stopColor} />
            ))}
          </LinearGradient>

          <LinearGradient
            id={inner.gradient.id}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            {inner.gradient.stops.map((s, i) => (
              <Stop key={i} offset={s.offset} stopColor={s.stopColor} />
            ))}
          </LinearGradient>
        </Defs>

        {/* Outer thin static arc (full 100% of the semicircle) */}
        {outer.enabled && (
          <Circle
            cx={cx}
            cy={cy}
            r={outerRadius}
            stroke={`url(#${outer.gradient.id})`}
            strokeWidth={outer.strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLengthOuter} ${circumferenceOuter}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        )}

        {/* Inner background arc */}
        <Circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          stroke={inner.backgroundColor}
          strokeWidth={inner.strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcLengthInner} ${circumferenceInner}`}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />

        {/* Inner animated arc */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={innerRadius}
          stroke={`url(#${inner.gradient.id})`}
          strokeWidth={inner.strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcLengthInner} ${circumferenceInner}`}
          strokeDashoffset={strokeDashoffsetInner}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
      </Svg>

      {/* Centered label over the semicircle */}
      <View
        style={[
          styles.labelContainer,
          { width: size, height: svgHeight, paddingBottom: labelPaddingBottom },
        ]}
      >
        <View style={{ alignItems: 'center', transform: 'translateY(70px)' }}>
          <Text style={{ fontSize: Math.round(size * 0.05) }}>Score</Text>
          <Text
            style={[styles.valueText, { fontSize: Math.round(size * 0.12) }]}
          >
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontWeight: '600',
  },
});
