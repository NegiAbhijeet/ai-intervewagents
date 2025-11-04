import React from 'react';
import { View } from 'react-native';
import Svg, { G, Circle, Text } from 'react-native-svg';

export default function Gauge({
  size = 75,
  strokeWidth = 8,
  value = 0,
  color = '#2F9B3A',
  bgColor = '#daf0db',
  dotSize = 6,
  text = '',
}) {
  const pct = Math.max(0, Math.min(100, value));

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const filled = (pct / 100) * circumference;
  const empty = circumference - filled;

  const angleDeg = (pct / 100) * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = center + radius * Math.cos(angleRad);
  const dotY = center + radius * Math.sin(angleRad);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size}>
        <G rotation={0} originX={center} originY={center}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${empty}`}
            transform={`rotate(-90 ${center} ${center})`}
          />

          {pct > 0 && (
            <Circle cx={dotX} cy={dotY} r={dotSize / 2} fill={color} />
          )}

          <Text
            x={center}
            y={center + 5}
            textAnchor="middle"
            fontSize={size * 0.15}
            fill="#333"
            fontWeight="bold"
          >
            {text?.length > 9 ? text.slice(0, 7) : text}
          </Text>
        </G>
      </Svg>
    </View>
  );
}
