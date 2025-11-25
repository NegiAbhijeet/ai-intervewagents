import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function OthersProfile({ route }) {
  const { avatar, name, trophies, interviewCompleted, minutes, lastRole } =
    route.params;
  const { t } = useTranslation();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Section with Gradient */}
      <LinearGradient
        colors={['#E0EAFC', '#CFDEF3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          paddingVertical: 30,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        <View
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            marginBottom: 12,
          }}
        >
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={100} color="#9CA3AF" />
          )}
        </View>

        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1F2937' }}>
          {name}
        </Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
        >
          <Ionicons name="trophy" size={18} color="#FBBF24" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 6,
              color: '#374151',
            }}
          >
            {trophies ?? 0}
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View
        style={{
          marginTop: 24,
          borderRadius: 16,
          backgroundColor: '#fff',
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 6,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 12,
          }}
        >
          {t('reports.interviewSummary')}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#E0F2FE',
              paddingVertical: 16,
              borderRadius: 12,
              marginRight: 8,
            }}
          >
            <Ionicons name="chatbubbles-outline" size={22} color="#0284C7" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0369A1' }}>
              {interviewCompleted ?? 0}
            </Text>
            <Text style={{ color: '#0369A1', fontSize: 12 }}>Interviews</Text>
          </View>

          <View
            style={{
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#FEF9C3',
              paddingVertical: 16,
              borderRadius: 12,
              marginLeft: 8,
            }}
          >
            <Ionicons name="time-outline" size={22} color="#CA8A04" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#A16207' }}>
              {minutes ?? 0}
            </Text>
            <Text style={{ color: '#A16207', fontSize: 12 }}>Minutes</Text>
          </View>
        </View>

        {/* Last Interview Role */}
        <View style={{ marginTop: 8 }}>
          <Text
            style={{
              fontSize: 14,
              color: '#4B5563',
              fontWeight: '500',
              marginBottom: 6,
            }}
          >
            Position
          </Text>
          <View
            style={{
              backgroundColor: '#ECFDF5',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="briefcase-outline" size={20} color="#047857" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: '#065F46',
                fontWeight: '500',
              }}
            >
              {lastRole || 'No recent role'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
