import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  SectionList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';

import NotificationRow, {
  NotificationItem,
} from '../components/NotificationRow';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppStateContext } from '../components/AppContext';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL, JAVA_API_URL } from '../components/config';
import Layout from './Layout';
import { useNavigation } from '@react-navigation/native';
import { Shadow } from 'react-native-shadow-2';
import CustomHeader from '../components/customHeader';

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
  const {
    userProfile,
    setUnreadNotification,
    notifications,
    setNotifications,
  } = useContext(AppStateContext);

  const navigation = useNavigation<any>();

  const shimmer = useRef(new Animated.Value(0)).current;
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'All' | 'Friend Requests' | 'Reports'>('All');
  const [isLoading, setIsLoading] = useState(false)
  // toggle expanded row
  const toggleExpnaded = (id: string | number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const showList = notifications !== null;

  async function fetchReadAll() {
    if (!userProfile?.uid) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/notifications/${userProfile.uid}/read_all/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      // update local state immediately so UI reflects the change
      if (Array.isArray(notifications)) {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
      }

      setUnreadNotification(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  }

  useEffect(() => {
    if (userProfile?.uid) {
      // do initial fetch of notifications list
      fetchNotifications();
    } else {
      // clear if no user
      setNotifications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.uid]);

  function fetchNotifications() {
    if (!userProfile?.uid) {
      setNotifications([]);
      return;
    }

    fetchWithAuth(`${API_URL}/notifications/${userProfile.uid}/?notification_from=app`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          setNotifications([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
      });
  }

  const onRefresh = () => {
    setLoading(true);
    fetchNotifications();
    setTimeout(() => setLoading(false), 600);
  };

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

  // Helper to normalize keys from backend
  const getMeetingId = (n: any) => n.meeting_id ?? null;
  const getCreatedAt = (n: any) => n.created_at ?? n.createdAt ?? new Date().toISOString();

  // filter notifications for the three tabs and group unread first
  const allNotifications = Array.isArray(notifications) ? notifications : [];

  const tabFiltered = allNotifications.filter(n => {
    if (selectedTab === 'All') return true;
    if (selectedTab === 'Reports') return !!getMeetingId(n);
    if (selectedTab === 'Friend Requests') {
      const title = (n.title ?? '').toString().toLowerCase();
      const message = (n.message ?? n.body ?? '').toString().toLowerCase();
      return title.includes('friend') || message.includes('friend');
    }
    return true;
  });

  const unreadItems = tabFiltered.filter(n => !n.read);
  const readItems = tabFiltered.filter(n => !!n.read);

  // If user wants unread at top, keep their relative order by created_at desc
  const sortByDateDesc = (a: any, b: any) => {
    const da = new Date(getCreatedAt(a)).getTime();
    const db = new Date(getCreatedAt(b)).getTime();
    return db - da;
  };

  unreadItems.sort(sortByDateDesc);
  readItems.sort(sortByDateDesc);

  // Section data for SectionList
  const sections = [];
  if (unreadItems.length > 0) {
    sections.push({ title: 'Unread', data: unreadItems });
  }
  if (readItems.length > 0) {
    sections.push({ title: 'Earlier', data: readItems });
  }

  const handlePressItem = async (item: any) => {
    const meetingId = getMeetingId(item)
    if (!meetingId) {
      toggleExpnaded(item.id) // corrected function name
      return
    }

    setIsLoading(true)
    let report: any = {}

    try {
      const url = `${JAVA_API_URL}/api/meetings/${meetingId}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const result = await res.json()
      report = result.data ?? {}
    } catch (err) {
      console.error('failed to fetch meeting', err)
    } finally {
      setIsLoading(false)
    }

    navigation.navigate('AppTabs', {
      screen: 'reports',
      params: { report },
    })
    setSelectedTab('Reports')
  }


  const renderItem = ({ item }: { item: NotificationItem }) => {
    const timeLabel = formatTimeAgo(getCreatedAt(item));
    const isRead = item?.read;
    return (
      <NotificationRow
        isRead={isRead}
        item={item}
        timeLabel={timeLabel}
        expanded={expandedId === item.id}
        onToggle={() => { handlePressItem(item) }}
        type={item?.meeting_id ? "report" : (item?.friend ? "friend" : "normal")}
      />
    );
  };

  const renderSectionHeader = ({ section }: any) => {
    if (section.title === "Unread") {
      return <View style={styles.header}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 4 }}>
          <View style={{ backgroundColor: "rgba(120, 20, 196, 1)", borderRadius: 9999, width: 8, height: 8 }}></View>
          <Text style={styles.sectionHeaderText}>
            {unreadCount} unread notifications
          </Text>
        </View>

        <TouchableOpacity onPress={fetchReadAll}>
          <Text style={styles.unreadMsg}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
    }
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  };

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

  const unreadCount = unreadItems.length;

  return (
    <Layout>
      <CustomHeader
        title="Notifications"
      />

      <View style={{ paddingTop: 16, paddingBottom: 48 }}>
        {isLoading && (
          <Modal transparent visible animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" style={styles.spinner} />
              </View>
            </View>
          </Modal>
        )}
        <View style={styles.tabRow}>

          {selectedTab === 'All' ? (
            <TouchableOpacity
              onPress={() => setSelectedTab('All')}
              style={[styles.tabItemActive]}
            >
              <Text style={[styles.tabTextActive]}>All</Text>
            </TouchableOpacity>
          ) : (
            <Shadow
              distance={4}
              startColor="rgba(0,0,0,0.1)"
              offset={[0, 2]}
              containerStyle={styles.shadowWrap}
            >
              <TouchableOpacity
                onPress={() => setSelectedTab('All')}
                style={styles.tabItemInactive}
              >
                <Text style={styles.tabText}>All</Text>
              </TouchableOpacity>
            </Shadow>
          )}

          {selectedTab === 'Friend Requests' ? (
            <TouchableOpacity
              onPress={() => setSelectedTab('Friend Requests')}
              style={[styles.tabItemActive]}
            >
              <Text style={styles.tabTextActive}>Friend Requests</Text>
            </TouchableOpacity>
          ) : (
            <Shadow
              distance={4}
              startColor="rgba(0,0,0,0.1)"
              offset={[0, 2]}
              containerStyle={styles.shadowWrap}
            >
              <TouchableOpacity
                onPress={() => setSelectedTab('Friend Requests')}
                style={styles.tabItemInactive}
              >
                <Text style={styles.tabText}>Friend Requests</Text>
              </TouchableOpacity>
            </Shadow>
          )}

          {selectedTab === 'Reports' ? (
            <TouchableOpacity
              onPress={() => setSelectedTab('Reports')}
              style={[styles.tabItemActive]}
            >
              <Text style={styles.tabTextActive}>Reports</Text>
            </TouchableOpacity>
          ) : (
            <Shadow
              distance={4}
              startColor="rgba(0,0,0,0.1)"
              offset={[0, 2]}
              containerStyle={styles.shadowWrap}
            >
              <TouchableOpacity
                onPress={() => setSelectedTab('Reports')}
                style={styles.tabItemInactive}
              >
                <Text style={styles.tabText}>Reports</Text>
              </TouchableOpacity>
            </Shadow>
          )}
        </View>

        {/* {unreadCount > 0 && (
          <View style={styles.header}>
            <View style={{ alignItems: "center", flexDirection: "row", gap: 4 }}>
              <View style={{ backgroundColor: "rgba(120, 20, 196, 1)", borderRadius: 9999, width: 8, height: 8 }}></View>
              <Text>
                {unreadCount} unread notifications
              </Text>
            </View>

            <TouchableOpacity onPress={fetchReadAll}>
              <Text style={styles.unreadMsg}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {!showList && <SkeletonLoader />}

        {showList && (
          <>
            {sections.length === 0 ? (
              <ListEmpty />
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item: any) => `${item.id}`}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={{
                  paddingBottom: 48,
                }}
                stickySectionHeadersEnabled={false}
                refreshing={loading}
                onRefresh={onRefresh}
                initialNumToRender={8}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  unreadMsg: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 1)',
    fontWeight: 500
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 20
  },
  shadowWrap: {
    borderRadius: 24
  },
  tabItemInactive: {
    backgroundColor: 'rgba(248, 246, 246, 1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24
  },
  tabItemActive: {
    backgroundColor: 'black',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 24
  },
  tabText: {
    color: '#6B6B6B'
  },
  tabTextActive: {
    color: 'white'
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
  sectionHeader: {
    // paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  }, modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinnerContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10
  },
  spinner: {
    transform: [{ scale: 1 }]
  }
});
