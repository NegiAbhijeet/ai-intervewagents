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
import fetchWithAuth from '../libs/fetchWithAuth';
import { AppStateContext } from '../components/AppContext';
import { API_URL } from '../components/config';
import Ionicons from '@react-native-vector-icons/ionicons';
import TopBar from '../components/TopBar';
import Layout from './Layout';

function getInitials(name) {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

export default function Leaderboard() {
  const { userProfile } = useContext(AppStateContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRankDetails, setUserRankDetails] = useState(null);

  function getRatings() {
    setLoading(true);
    fetchWithAuth(`${API_URL}/get-users-rating/`)
      .then(res => res.json())
      .then(res => {
        const data = Array.isArray(res?.profiles) ? res.profiles : [];
        const filteredData = data.filter(user => Number(user?.rating) > 0);
        let sortedUsers = filteredData
          .slice()
          .sort((a, b) => Number(b.rating) - Number(a.rating))
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            image: user.user_photo_url || user.image || '',
            user_name:
              user.user_name || user.name || user.user_email || 'Unknown',
            user_email: user.user_email || '',
            rating: Number(user.rating) || 0,
          }));

        if (userProfile?.user_email) {
          const found = sortedUsers.find(
            u => u.user_email === userProfile.user_email,
          );
          if (found) {
            setUserRankDetails(found);
            if (found.rank > 3) {
              sortedUsers = sortedUsers.filter(
                u => u.user_email !== userProfile.user_email,
              );
            }
          } else {
            setUserRankDetails(null);
          }
        } else {
          setUserRankDetails(null);
        }

        setUsers(sortedUsers);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (userProfile?.uid) {
      getRatings();
    }
  }, [userProfile]);

  const onRefresh = () => {
    // Use the same getRatings function so state updates are consistent
    getRatings();
  };

  const topThreeUsers = users.slice(0, 3);
  const otherUsers = users.slice(3);

  const renderTopThree = () => (
    <View className="flex-row justify-center items-end gap-4 mb-12">
      {[topThreeUsers[1], topThreeUsers[0], topThreeUsers[2]].map((user, i) => {
        if (!user) return <View key={`top-${i}`} className="w-24 h-24" />;

        const actualIndex = [1, 0, 2][i];
        const isFirst = actualIndex === 0;
        const isSecond = actualIndex === 1;
        const isThird = actualIndex === 2;

        const fallbackBg = isFirst
          ? 'bg-yellow-200 text-yellow-900'
          : isSecond
          ? 'bg-gray-200 text-gray-800'
          : 'bg-amber-200 text-amber-800';

        const avatarSize = isFirst ? 16 : 16;

        const textColor = isFirst
          ? 'text-yellow-900'
          : isSecond
          ? 'text-gray-700'
          : 'text-amber-800';

        return (
          <TouchableOpacity
            key={user.rank}
            activeOpacity={0.8}
            className="items-center"
          >
            <View className="relative">
              <View className={`w-${avatarSize} h-${avatarSize} rounded-full`}>
                {user.image ? (
                  <Image
                    source={{ uri: user.image }}
                    className={`w-${avatarSize} h-${avatarSize} rounded-full`}
                  />
                ) : (
                  <View
                    className={`w-${avatarSize} h-${avatarSize} justify-center items-center ${fallbackBg} rounded-full`}
                  >
                    <Text className="text-2xl font-bold">
                      {getInitials(user.user_name)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="absolute top-0 right-0 p-2 bg-white rounded-full shadow">
                {isFirst ? (
                  <Ionicons name="trophy" size={24} color="#D4AF37" />
                ) : isSecond ? (
                  <Ionicons name="trophy-outline" size={20} color="#A0AEC0" />
                ) : (
                  <Ionicons name="trophy" size={20} color="#D97706" />
                )}
              </View>
            </View>

            <View className="mt-4 items-center">
              <Text
                className={`font-black ${textColor} ${
                  isFirst ? 'text-3xl' : 'text-xl'
                }`}
              >
                #{user.rank}
              </Text>

              {user.user_email === userProfile?.user_email ? (
                <View className={`px-3 py-1 rounded-full bg-purple-500`}>
                  <Text className="text-white font-bold">You</Text>
                </View>
              ) : (
                <Text
                  className={`font-bold ${textColor} text-base`}
                  numberOfLines={1}
                >
                  {user.user_name}
                </Text>
              )}

              <Text className={`font-black ${textColor} text-lg`}>
                {user.rating.toLocaleString()} pts
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderOtherUser = ({ item: user }) => (
    <View className="flex-row justify-between items-center py-3 px-4 border-b border-gray-200">
      <Text className="text-base">
        {user.rank === 1
          ? '🥇'
          : user.rank === 2
          ? '🥈'
          : user.rank === 3
          ? '🥉'
          : `#${user.rank}`}
      </Text>
      <View className="flex-row items-center gap-2 flex-1 px-4">
        <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
          {user.image ? (
            <Image
              source={{ uri: user.image }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <View className={`flex-1 justify-center items-center bg-gray-300`}>
              <Text className="font-bold">{getInitials(user.user_name)}</Text>
            </View>
          )}
        </View>
        <Text className="flex-1 text-base truncate" numberOfLines={1}>
          {user.user_name}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="star" size={16} color="#FBBF24" />
        <Text className="ml-1 text-base font-medium">{user.rating} pts</Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <>
      {loading && users.length === 0 ? (
        <View className="w-full justify-center items-center py-8">
          <ActivityIndicator size="large" />
          <Text className="mt-4">Loading leaderboard...</Text>
        </View>
      ) : (
        <>
          {renderTopThree()}

          {userRankDetails && (
            <View className="px-4 py-3 bg-purple-100 rounded-b-lg border-b border-purple-300 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-purple-600 font-bold">
                  #{userRankDetails.rank}
                </Text>
                <View className="flex-row items-center flex-1 gap-2 ml-3">
                  <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400">
                    {userRankDetails.image ? (
                      <Image
                        source={{ uri: userRankDetails.image }}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <View className="flex-1 justify-center items-center bg-purple-200">
                        <Text className="font-bold">
                          {getInitials(userRankDetails.user_name)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-semibold">You</Text>
                  {userRankDetails.rank <= 3 && (
                    <Text>
                      {userRankDetails.rank === 1
                        ? '🥇'
                        : userRankDetails.rank === 2
                        ? '🥈'
                        : '🥉'}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={18} color="#FBBF24" />
                  <Text className="ml-1 text-purple-600 font-extrabold">
                    {userRankDetails.rating.toLocaleString()} pts
                  </Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <TopBar />
      <Layout>
        <View className="py-5">
          <FlatList
            data={otherUsers}
            keyExtractor={item => item.rank.toString()}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<ListHeader />}
            renderItem={renderOtherUser}
            refreshing={loading}
            onRefresh={onRefresh}
          />
        </View>
      </Layout>
    </>
  );
}
