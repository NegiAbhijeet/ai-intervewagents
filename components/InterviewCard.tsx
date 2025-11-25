import React from 'react';
import { View, Text } from 'react-native';
import Gauge from './simpleGuage';
import { useTranslation } from 'react-i18next';

export default function InterviewCard({
  title = 'Name of Interview',
  duration,
  total = 1800, // default 30 minutes in seconds
  interviewType = 'mock',
}) {
  const { t } = useTranslation();
  // Safely parse both numbers and strings
  const parsedDuration = Number(duration);
  const parsedTotal = Number(total);

  const hasValidData =
    !isNaN(parsedDuration) && !isNaN(parsedTotal) && parsedTotal > 0;

  // Convert seconds to minutes (rounded down)
  const durationMinutes = hasValidData ? Math.floor(parsedDuration / 60) : 0;
  const totalMinutes = hasValidData ? Math.floor(parsedTotal / 60) : 0;

  const displayTime = hasValidData
    ? `${durationMinutes}/${totalMinutes}`
    : 'No Data';

  // Gauge shows proportional progress
  const gaugeValue = hasValidData ? (durationMinutes / totalMinutes) * 100 : 0;

  return (
    <View className="flex-row items-center justify-center w-full m-auto rounded-lg h-[50px] gap-4">
      {/* Left half: duration/total and gauge */}
      <View
        className=" flex-row items-center justify-between rounded-lg h-full overflow-hidden"
        style={{ backgroundColor: ' rgba(245, 245, 245, 0.9)', width: 125, padding: 2 }}
      >
        <View className="flex-1 justify-center items-center w-1/2">
          <Text
            className={`text-sm font-semibold ${hasValidData ? 'text-gray-800' : 'text-gray-400'
              }`}
          >
            {displayTime}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            {t('minutes')}
          </Text>
        </View>

        <View
          className="h-full items-center justify-center w-1/2"
          style={{
            backgroundColor: 'rgba(234, 105, 0, 0.3)',
            borderRadius: 6,
          }}
        >
          {/* Pass a normalized gauge value (0–100%) */}
          <Gauge
            value={gaugeValue}
            size={40}
            color="rgba(211, 127, 58, 1)"
            bgColor="rgba(0, 0, 0, 0.1)"
            strokeWidth={5}
          />
        </View>
      </View>

      {/* Right half: title and interview type */}
      <View
        className=" justify-center items-center rounded-lg h-full px-4"
        style={{ backgroundColor: ' rgba(245, 245, 245, 0.9)', width: 125 }}
      >
        <Text
          numberOfLines={1}
          className={`font-semibold ${title ? 'text-gray-900' : 'text-gray-400'
            }`}
          style={{ fontSize: 10 }}
        >
          {title || 'No Title'}
        </Text>

        <View
          className="px-2 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(1, 187, 251, 0.3)',
            borderWidth: 1,
            borderColor: 'rgba(1, 187, 251, 0.4)',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: 'rgba(14, 126, 165, 1)',
            }}
          >
            # {t(`types.${interviewType.toLowerCase() || 'unknown'}`)}
          </Text>
        </View>
      </View>
    </View>
  );
}
