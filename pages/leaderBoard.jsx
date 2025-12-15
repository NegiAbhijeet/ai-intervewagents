'use client';

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import fetchWithAuth from '../libs/fetchWithAuth';
import { AppStateContext } from '../components/AppContext';
import { API_URL } from '../components/config';
import TopBar from '../components/TopBar';
import Layout from './Layout';

function getInitials(name = '') {
  const words = name.trim().split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
function getFirstName(name = '') {
  return name.split(' ')[0];
}

const getBgColor = rank => {
  if (rank === 1) return 'rgba(244, 197, 66, 1)';
  if (rank === 2) return 'rgba(191, 199, 213, 1)';
  if (rank === 3) return 'rgba(211, 154, 85, 1)';
  return 'transparent';
};


export default function Leaderboard() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { userProfile } = useContext(AppStateContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRankDetails, setUserRankDetails] = useState(null);
  const getRatings = async (refresh = false) => {
    setLoading(true);
    const industry = userProfile?.industry
      ?.trim()
      .replace(/\s+/g, '_');

    if (refresh) setRefreshing(true);
    console.log(`${API_URL}/get-users-rating/?uid=${userProfile?.uid}&industry=${industry}&page=1`, "===")
    try {
      const res = await fetchWithAuth(
        `${API_URL}/get-users-rating/?uid=${userProfile?.uid}&industry=${userProfile?.industry}&page=1`,
      );
      const json = await res.json();

      const data = Array.isArray(json?.profiles) ? json.profiles : [];

      const sorted = data
        .filter(u => Number(u?.rating) > 0)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .map((u, i) => ({
          ...u,
          rank: i + 1,
          rating: Number(u.rating) || 0,
          user_name:
            u.user_name || u.name || u.user_email || 'Unknown',
          avatar: u.avatar || u.user_photo_url || '',
        }));

      setUsers(sorted);

      const me = sorted.find(
        u => u.user_email === userProfile?.user_email,
      );
      setUserRankDetails(me || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userProfile?.uid) getRatings();
  }, [userProfile]);

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);


  const TopUser = ({ user, size }) => {
    return (
      <View style={{ width: '30%' }}>
        <View
          style={{
            width: '100%',
            borderRadius: 20,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
          }}
          className="items-center bg-white pt-3 pb-4"
        >

          <View
            style={{
              width: size === 90 ? '70%' : '60%',
              aspectRatio: 1,
              borderColor: user.rank === 1 ? "transparent" : getBgColor(user.rank)
            }}
            className="rounded-full border-2 border-yellow-400 items-center justify-center bg-white"
          >
            {user.rank === 1 && <Image
              source={require("../assets/images/crown.png")}
              style={{ width: 22, height: 22, position: "absolute", zIndex: 999, top: -11 }}
            />}
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-full h-full rounded-full"
              />
            ) : (
              <Text className="font-bold">
                {getInitials(user.user_name)}
              </Text>
            )}

            <View
              className={`absolute ${user.rank === 1 ? "bottom-2" : "-top-2"} -right-2 w-6 h-6 rounded-full items-center justify-center`}
              style={{
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.5)",
                backgroundColor: getBgColor(user.rank)
              }}
            >
              <Text className="text-xs font-bold text-white">
                {user.rank}
              </Text>
            </View>
          </View>

          <Text
            className="mt-2 font-semibold text-center w-full"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getFirstName(user.user_name)}
          </Text>

          <View className="flex-row items-center mt-1">
            <Ionicons name="trophy" size={14} color="#FBBF24" />
            <Text className="ml-1 font-bold">
              {user.rating.toLocaleString()}
            </Text>
          </View>
        </View>

      </View>


    );
  };


  const renderItem = ({ item }) => {
    const isMe = item.user_email === userProfile?.user_email;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (!isMe) {
            navigation.navigate('othersProfile', {
              avatar: item.avatar,
              name: item.user_name,
              role: item.last_interview_role || 'No recent role',
              level: item?.experience || 1,
              trophies: item.rating,
              totalInterviews: item.total_interviews ?? 0,
              bestScore: item?.best_avg_percentage || 0,
              streak: item?.streak || 1,
              minutes: Math.floor((item.seconds_used || 0) / 60),
            });
          }
        }}
        className={`flex-row items-center px-4 py-3 border-b border-gray-200 ${isMe ? 'bg-blue-100' : ''
          }`}
      >
        <Text className="w-8 font-bold text-gray-600">
          {item.rank}
        </Text>

        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 items-center justify-center">
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                className="w-full h-full"
              />
            ) : (
              <Text className="font-bold">
                {getInitials(item.user_name)}
              </Text>
            )}
          </View>

          <Text
            className="ml-3 font-semibold flex-1"
            numberOfLines={1}
          >
            {isMe ? t('leaderboard.you') : item.user_name}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="font-bold mr-1">
            {item.rating.toLocaleString()}
          </Text>
          <Ionicons name="trophy" size={14} color="#FBBF24" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TopBar />
      <Layout>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getRatings(true)}
            />
          }
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {loading && users.length === 0 ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              {topThree.length === 3 && (
                <View className="flex-row justify-between items-end px-2 mt-6">
                  <TopUser user={topThree[1]} size={70} />
                  <TopUser user={topThree[0]} size={90} />
                  <TopUser user={topThree[2]} size={70} />
                </View>
              )}

              <View style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 22,
                marginTop: 24,
              }}>
                <View className="px-4 pt-4">
                  <FlatList
                    data={restUsers}
                    keyExtractor={i => `${i.user_email}-${i.rank}`}
                    renderItem={renderItem}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* {userRankDetails && (
          <View className="absolute bottom-0 left-0 right-0 bg-black flex-row items-center px-4 py-3">
            <Text className="text-white font-bold w-10">
              {userRankDetails.rank}
            </Text>

            <Text className="text-white font-semibold flex-1">
              {userRankDetails.user_name}
            </Text>

            <View className="flex-row items-center">
              <Text className="text-white font-bold mr-1">
                {userRankDetails.rating}
              </Text>
              <Ionicons name="trophy" size={16} color="#FBBF24" />
            </View>
          </View>
        )} */}
      </Layout>
    </>

  );
}