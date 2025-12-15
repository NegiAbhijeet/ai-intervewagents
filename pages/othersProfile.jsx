import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import CustomHeader from '../components/customHeader';
import Layout from './Layout';
import getLevelData from '../libs/getLevelData';
import { AppStateContext } from '../components/AppContext';
function getInitials(name = '') {
  const words = name.trim().split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
// get avatar, name, role, level, trophies, totalInterviews, bestScore, minutes
export default function OthersProfile({ route }) {
  const { language } = useContext(AppStateContext)
  const [routeData, setRouteData] = useState(null)

  useEffect(() => {
    if (route?.params?.name) {
      setRouteData(route.params)
    }
  }, [route.params.name])
  const LEVELS = useMemo(() => getLevelData(language) || {}, [language])
  const findLevel = (level) => {
    const x = LEVELS.find(
      (item) => String(item?.value) === String(level)
    )
    return x?.label || "Entry"
  }
  return (
    <Layout>
      <CustomHeader title="Profile" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            marginTop: 12,
            borderRadius: 24,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          {/* Avatar */}
          <View style={{ position: 'relative', }}>
            <View style={{ position: 'relative', height: 140 }}>
              <ImageBackground
                source={require('../assets/images/Margin-1.png')}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 56,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: "9999",
                  transform: [{ translateY: -25 }]
                }}
              >
                {routeData?.avatar ? (
                  <Image
                    source={{ uri: routeData?.avatar }}
                    style={{ width: 100, height: 100, borderRadius: 52, zIndex: -1, marginTop: 4, marginRight: 4 }}
                  />
                ) : (
                  <View className="rounded-full overflow-hidden bg-gray-300 items-center justify-center" style={{ width: 100, height: 100, zIndex: -1, marginTop: 4, marginRight: 4 }}>
                    <Text className="font-bold" style={{ fontSize: 28 }}>
                      {getInitials(routeData?.name)}
                    </Text>
                  </View>
                )}
              </ImageBackground>
            </View>

          </View>

          <Text
            style={{
              marginTop: 12,
              fontSize: 25,
              fontWeight: '700',
              color: 'rgba(60, 60, 60, 1)',
            }}
          >
            {routeData?.name}
          </Text>

          {/* Role */}
          <Text
            style={{
              fontWeight: 400,
              marginTop: 2,
              fontSize: 16,
              color: 'rgba(75, 85, 99, 1)',
            }}
          >
            {routeData?.role}
          </Text>

          {/* Badges */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderColor: "rgba(60, 60, 60, 1)",
                borderWidth: 1,
                borderRadius: 9999
              }}
            >
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#92400E',
                }}
              >
                {findLevel(routeData?.level)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderColor: "rgba(60, 60, 60, 1)",
                borderWidth: 1,
                borderRadius: 9999
              }}
            >
              <Ionicons name="trophy" size={14} color="#6B7280" />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                {routeData?.trophies} pts
              </Text>
            </View>
          </View>

          {/* Add Friend */}
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: '#000',
              paddingHorizontal: 30,
              paddingVertical: 12,
              borderRadius: 24,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text
              style={{
                marginLeft: 8,
                color: '#fff',
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              Add Friend
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 24,
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 1)"
            }}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#4F46E5"
            />
            <Text
              style={{
                marginTop: 6,
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
                textAlign: "center"
              }}
            >
              {routeData?.totalInterviews}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: "center" }}>
              Total Interviews Attempted
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 1)"
            }}
          >
            <Ionicons
              name="stats-chart-outline"
              size={22}
              color="#0891B2"
            />
            <Text
              style={{
                marginTop: 6,
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
              }}
            >
              {routeData?.bestScore}%
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Best Score
            </Text>
            <Text style={{ fontSize: 11, color: '#F97316', marginTop: 2 }}>
              {routeData?.streak} days streak
            </Text>
          </View>
        </View>
      </ScrollView>
    </Layout >
  );
}
