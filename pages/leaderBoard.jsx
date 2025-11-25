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
import LeagueCarousel from '../components/LeagueCarousel';
import { LEAGUES } from '../libs/leagueData';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

function getInitials(name) {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const { userProfile } = useContext(AppStateContext);
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRankDetails, setUserRankDetails] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch, filter, sort and add rank index
  function getRatings(isRefreshingCall = false) {
    setLoading(true);
    if (isRefreshingCall) {
      setIsRefreshing(true);
    }
    fetchWithAuth(`${API_URL}/get-users-rating/?uid=${userProfile?.uid}`)
      .then(res => res.json())
      .then(res => {
        const data = Array.isArray(res?.profiles) ? res.profiles : [];
        const filteredData = data.filter(u => Number(u?.rating) > 0);
        const sortedUsers = filteredData
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
            avatar: user?.avatar
          }));

        if (userProfile?.user_email) {
          const found = sortedUsers.find(
            u => u.user_email === userProfile.user_email,
          );
          if (found) {
            setUserRankDetails(found);
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
        if (isRefreshingCall) {
          setIsRefreshing(false);
        }
      });
  }

  useEffect(() => {
    if (userProfile?.uid) {
      getRatings();
    }
  }, [userProfile]);

  const onRefresh = () => {
    getRatings(true);
  };
  const rating = userRankDetails?.rating ?? 0;

  const currentLeague =
    LEAGUES.find(l => rating >= l.min && rating <= l.max) || LEAGUES[0];

  const renderUserItem = ({ item: user }) => {
    const isCurrentUser = user.user_email === userProfile?.user_email;

    const trophyIcon =
      user.rank === 1 ? (
        <Ionicons name="trophy" size={20} color="#D4AF37" />
      ) : user.rank === 2 ? (
        <Ionicons name="trophy" size={18} color="#A0AEC0" />
      ) : user.rank === 3 ? (
        <Ionicons name="trophy" size={18} color="#D97706" />
      ) : null;

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (!isCurrentUser) {
              const minutesUsed = user?.seconds_used
                ? Math.floor(user.seconds_used / 60)
                : 0;
              navigation.navigate('othersProfile', {
                avatar: user?.user_photo_url || null,
                name: user?.user_name || 'Unknown User',
                trophies: user?.rating ?? 0,
                interviewCompleted: user?.total_interviews ?? 0,
                minutes: minutesUsed,
                lastRole: user?.last_interview_role || 'No recent role',
              });
            }
          }}
          className={`flex-row justify-between items-center py-3 px-4 border-b border-gray-200 ${isCurrentUser ? 'bg-blue-200' : ''
            }`}
        >
          <Text className="w-10 text-base font-bold">
            {trophyIcon ? null : `#${user.rank}`}
            {trophyIcon}
          </Text>

          <View className="flex-row items-center gap-3 flex-1 px-2">
            <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
              {user?.avatar ? (
                <Image
                  source={{ uri: user?.avatar }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <View className="flex-1 justify-center items-center bg-gray-300">
                  <Text className="font-bold">
                    {getInitials(user.user_name)}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold" numberOfLines={1}>
                {isCurrentUser ? t('leaderboard.you') : user.user_name}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Text className="ml-2 text-base font-extrabold">
              {user.rating.toLocaleString()}{' '}
            </Text>
            <Ionicons name="trophy" size={16} color="#FBBF24" />
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const ListHeader = () => (
    <>
      {loading && users.length === 0 ? (
        <View className="w-full justify-center items-center py-8">
          <ActivityIndicator size="large" />
          <Text className="mt-4">{t('leaderboard.loading')}</Text>
        </View>
      ) : (
        <></>
      )}
    </>
  );

  return (
    <>
      <TopBar />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ backgroundColor: 'white' }}>
          <LeagueCarousel data={LEAGUES} userTrophies={rating} />

          <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontWeight: '700', fontSize: 20 }}>
                {t(currentLeague.name, { defaultValue: currentLeague.name })} {t('leaderboard.league')}
              </Text>

              <View className="flex-row items-center gap-2 bg-gray-800 rounded-full py-1 px-3">
                <Text style={{ fontSize: 16, color: 'white' }}>{rating}</Text>
                <Ionicons name="trophy" size={16} color="#FBBF24" />
              </View>
            </View>

            <Text style={{ fontSize: 14, color: '#4B5563', marginTop: 6 }}>
              {t('leaderboard.description')}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: '#000',
              width: '100%',
              marginTop: 16,
              marginBottom: 4,
              height: 1,
            }}
          />

          <View style={{ paddingHorizontal: 20 }}>
            <FlatList
              data={users}
              keyExtractor={item => `${item.user_email}-${item.rank}`}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={<ListHeader />}
              renderItem={renderUserItem}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
