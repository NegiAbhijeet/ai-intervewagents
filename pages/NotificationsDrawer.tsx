import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  FlatList,
} from 'react-native';

import NotificationRow, {
  NotificationItem,
} from '../components/NotificationRow';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppStateContext } from '../components/AppContext';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from '../components/config';
import Layout from './Layout';

const ITEM_HEIGHT = 84;
const SCREEN_WIDTH = Dimensions.get('window').width;

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function NotificationsPage() {
  const { userProfile, setUnreadNotification, notifications } =
    useContext(AppStateContext);
  const shimmer = useRef(new Animated.Value(0)).current;

  const showList = notifications !== null;

  function fetchReadAll() {
    fetchWithAuth(`${API_URL}/notifications/${userProfile?.uid}/read_all/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setUnreadNotification(0);
      })
      .catch(err => {
        console.error('Failed to fetch notifications:', err);
      });
  }

  useEffect(() => {
    if (userProfile?.uid) {
      fetchReadAll();
    }
  }, [userProfile?.uid]);

  // shimmer animation while loading
  useEffect(() => {
    if (!showList) {
      const anim = Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      shimmer.setValue(0);
      anim.start();
      return () => anim.stop();
    }
  }, [showList, shimmer]);

  const keyExtractor = useCallback(
    (item: NotificationItem) => `${item.id}`,
    [],
  );

  const renderItem = useCallback(({ item }: { item: NotificationItem }) => {
    const timeLabel = formatTimeAgo(item.created_at);
    return <NotificationRow item={item} timeLabel={timeLabel} />;
  }, []);

  const getItemLayout = useCallback(
    (_data: NotificationItem[] | null, index: number) => {
      return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
    },
    [],
  );

  const ListEmpty = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={46} />
        <Text style={styles.emptyText}>No notifications</Text>
      </View>
    );
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const SkeletonLoader = () => {
    const skeletonItems = Array.from({ length: 8 }).map((_, i) => (
      <View key={i} style={styles.skeletonRow}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTextBlock}>
          <View style={styles.skeletonLineShort} />
          <View style={styles.skeletonLineLong} />
        </View>
      </View>
    ));

    return (
      <View style={{ overflow: 'hidden' }}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX }],
            },
          ]}
        />
        {skeletonItems}
      </View>
    );
  };

  return (
    <Layout>
      <View style={styles.header}>
        <View style={{ flexDirection: 'column' }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Recent activity and alerts</Text>
        </View>
      </View>

      {!showList && <SkeletonLoader />}

      {showList && Array.isArray(notifications) && (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? 36 : 24,
          }}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDF2F7',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
  },
  clearButton: {
    paddingHorizontal: 2,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  skeletonTextBlock: {
    flex: 1,
  },
  skeletonLineShort: {
    width: '60%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 6,
  },
  skeletonLineLong: {
    width: '85%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: SCREEN_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.4)',
    opacity: 0.4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
});
