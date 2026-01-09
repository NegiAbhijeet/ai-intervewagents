import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import fetchWithAuth from '../libs/fetchWithAuth';
import { AppStateContext } from '../components/AppContext';
import { API_URL } from '../components/config';
import TopBar from '../components/TopBar';
import Layout from './Layout';
import LinearGradient from 'react-native-linear-gradient';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import FirstIcon from '../assets/images/first.png';
import SecondIcon from '../assets/images/second.png';
import ThirdIcon from '../assets/images/third.png';

const USERSIZEPERPAGE = 50
const EmptyState = ({ message }) => {
  return (
    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
};

const LeaderboardSkeleton = () => {
  return (
    <SkeletonPlaceholder borderRadius={16}>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        justifyContent="space-between"
        marginTop={24}
        marginHorizontal={20}
      >
        <SkeletonPlaceholder.Item width={70} height={70} borderRadius={35} />
        <SkeletonPlaceholder.Item width={90} height={90} borderRadius={45} />
        <SkeletonPlaceholder.Item width={70} height={70} borderRadius={35} />
      </SkeletonPlaceholder.Item>

      {/* List container */}
      <SkeletonPlaceholder.Item
        marginTop={24}
        marginHorizontal={8}
        padding={16}
        borderRadius={22}
      >
        {[...Array(6)].map((_, index) => (
          <SkeletonPlaceholder.Item
            key={index}
            flexDirection="row"
            alignItems="center"
            marginBottom={16}
          >
            <SkeletonPlaceholder.Item width={24} height={16} />
            <SkeletonPlaceholder.Item
              width={40}
              height={40}
              borderRadius={20}
              marginLeft={12}
            />
            <SkeletonPlaceholder.Item flex={1} marginLeft={12}>
              <SkeletonPlaceholder.Item height={14} width="60%" />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item height={14} width={50} />
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

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

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [activeTab, setActiveTab] = useState('global');

  const [refreshing, setRefreshing] = useState(false);
  const [userRankDetails, setUserRankDetails] = useState(null);
  const getRatings = async (pageNumber = 1, refresh = false, pageSwitch = false) => {
    if (loading || loadingMore) return;

    refresh ? setLoading(true) : setLoadingMore(true);
    setLoadMoreError(false);

    const industry = userProfile?.industry?.trim().replace(/\s+/g, '_');

    const url =
      activeTab === 'friends'
        ? `${API_URL}/connections/?uid=${userProfile?.uid}&page=${pageNumber}`
        : `${API_URL}/get-users-rating/?uid=${userProfile?.uid}&industry=${industry}&page=${pageNumber}`;

    try {
      const res = await fetchWithAuth(url);
      const json = await res.json();

      const rawData = Array.isArray(json?.profiles) ? json.profiles : [];
      const offset = pageNumber === 1 ? 0 : users.length;

      const formattedUsers = rawData
        .map((u, i) => ({
          ...u,
          rank: offset + i + 1,
          rating: Number(u.rating) || 0,
          user_name: u.user_name || u.name || u.user_email || 'Unknown',
          avatar: u.avatar || u.user_photo_url || ''
        }));

      setUsers(prev =>
        pageNumber === 1 ? formattedUsers : [...prev, ...formattedUsers]
      );

      setPage(pageNumber);
      setHasMore(formattedUsers.length > 0);
      // if (!userRankDetails || pageSwitch) {
      const me = json?.current_user
      const formattedUser = {
        ...me?.details,
        rank: me?.position || 0,
      }
      setUserRankDetails(formattedUser || null);
      // }
    } catch (e) {
      console.error(e);
      setLoadMoreError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  const getRankIcon = (rank) => {
    if (rank === 1) return FirstIcon;
    if (rank === 2) return SecondIcon;
    if (rank === 3) return ThirdIcon;
    return null;
  };

  const isTopThree = (rank) => rank === 1 || rank === 2 || rank === 3;

  useEffect(() => {
    if (userProfile?.uid) {
      setUsers([]);
      setPage(1);
      setHasMore(true);
      getRatings(1, true, true);
    }
  }, [activeTab]);

  useEffect(() => {
    if (userProfile?.uid) getRatings(1, true);
  }, [userProfile]);

  const onRefresh = () => {
    setHasMore(true);
    getRatings(1, true);
  };
  const loadMore = () => {
    if (users.length < USERSIZEPERPAGE) return;
    if (!hasMore) return;
    if (loadingMore) return;

    getRatings(page + 1);
  };



  const restUsers = users
  const renderItem = ({ item }) => {
    const isMe = item.user_email === userProfile?.user_email;
    const topThree = isTopThree(item.rank);

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
              myUid: userProfile?.uid,
              userUid: item?.uid
            });
          }
        }}
        style={{ backgroundColor: topThree ? "rgba(37, 73, 150, 0.08)" : isMe ? "rgba(219, 234, 254, 1)" : "", borderColor: topThree ? "rgba(255, 255, 255, 0.40)" : "rgba(0, 0, 0, 0.11)" }}
        className={`flex-row items-center px-4 py-4 border-b`}
      >
        {/* Rank / Icon */}
        <View className="w-8 items-center mr-1">
          {getRankIcon(item.rank) ? (
            <Image
              source={getRankIcon(item.rank)}
              style={{ width: 22, height: 22, resizeMode: 'contain' }}
            />
          ) : (
            <Text className="font-bold text-gray-600">
              {item.rank}
            </Text>
          )}
        </View>

        {/* Avatar + Name */}
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 items-center justify-center">
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} className="w-full h-full" />
            ) : (
              <Text className="font-bold">
                {getInitials(item.user_name)}
              </Text>
            )}
          </View>

          <Text
            className={`ml-3 font-semibold flex-1`}
            numberOfLines={1}
          >
            {item.user_name}
          </Text>
        </View>

        {/* Rating */}
        <View className="flex-row items-center">
          <Text className={`font-bold mr-1`}>
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
        <View style={{ flex: 1 }}>
          {/* Tabs */}
          <View
            className="mt-4 mb-2 px-2 py-2 flex-row mx-1"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 1)',
              borderRadius: 22,
              boxShadow: "0 9.013px 13.52px -2.704px rgba(0, 0, 0, 0.10), 0 3.605px 5.408px -3.605px rgba(0, 0, 0, 0.10)"
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('global')}
              className="flex-1"
              activeOpacity={0.8}
            >
              {activeTab === 'global' ? (
                <LinearGradient
                  colors={['rgba(120, 20, 196, 1)', 'rgba(12, 78, 190, 1)']}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text className="font-semibold text-white">Global</Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    borderRadius: 16,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text className="font-semibold text-gray-600">Global</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('friends')}
              className="flex-1"
              activeOpacity={0.8}
            >
              {activeTab === 'friends' ? (
                <LinearGradient
                  colors={['rgba(120, 20, 196, 1)', 'rgba(12, 78, 190, 1)']}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text className="font-semibold text-white">
                    Friends Circle
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    borderRadius: 16,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text className="font-semibold text-gray-600">
                    Friends Circle
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Scrollable list container */}
          <View
            style={{
              flex: 1,
              marginTop: 20,
              marginBottom: 90,
              // backgroundColor: 'rgba(255, 255, 255, 0.5)',
              // borderRadius: 22,
              overflow: "hidden"
            }}
          >
            {userRankDetails && !loading && (
              <TouchableOpacity
                disabled
                // activeOpacity={0.7}
                onPress={() => {
                }}
                className={`flex-row items-center px-4 py-4 border-b border-gray-200 bg-black absolute bottom-0 left-0 right-0`}
                style={{ zIndex: 111 }}
              >
                <Text className="w-8 font-bold text-white">
                  {userRankDetails.rank}
                </Text>

                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 items-center justify-center">
                    {userRankDetails?.avatar ? (
                      <Image
                        source={{ uri: userRankDetails.avatar }}
                        className="w-full h-full"
                      />
                    ) : (
                      <Text className="font-bold">
                        {getInitials(userRankDetails.user_name)}
                      </Text>
                    )}
                  </View>

                  <Text
                    className="ml-3 font-semibold flex-1 text-white"
                    numberOfLines={1}
                  >
                    {t('leaderboard.you')}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="font-bold mr-1 text-white">
                    {userRankDetails.rating.toLocaleString()}
                  </Text>
                  <Ionicons name="trophy" size={14} color="#FBBF24" />
                </View>
              </TouchableOpacity>
            )}
            {loading && users.length === 0 ? (
              <LeaderboardSkeleton />
            ) : (
              <FlatList
                data={restUsers}
                keyExtractor={i => `${i.uid}-${i.rank}`}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 120,
                  // paddingTop: 16,
                  flexGrow: 1
                }}
                ListEmptyComponent={
                  !loading && (
                    <EmptyState
                      message={
                        activeTab === 'friends'
                          ? 'No friends.'
                          : 'No users found yet.'
                      }
                    />
                  )
                }
                ListFooterComponent={
                  loadingMore ? (
                    <ActivityIndicator style={{ paddingVertical: 20 }} />
                  ) : loadMoreError ? (
                    <TouchableOpacity
                      style={{ paddingVertical: 20, alignItems: 'center' }}
                      onPress={() => getRatings(page + 1)}
                    >
                      <Text>Tap to retry</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      </Layout>
    </>
  );

}