import React from 'react';
import { View, Text, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const toastConfig = {
  error: ({ text1, text2 }) => (
    <View
      style={{
        backgroundColor: '#fee2e2',
        borderLeftWidth: 5,
        borderLeftColor: '#ef4444',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: width - 32, // full width with 16px side margin
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 16, // ↓ slightly reduced
          fontWeight: '600',
          color: '#b91c1c',
          marginBottom: text2 ? 4 : 0,
        }}
      >
        {text1}
      </Text>
      {text2 ? (
        <Text style={{ fontSize: 14, color: '#7f1d1d' }}>{text2}</Text>
      ) : null}
    </View>
  ),
};

export default toastConfig;
