import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { FlashList } from '@shopify/flash-list';
import NotificationRow, { NotificationItem } from './NotificationRow';
import Ionicons from '@react-native-vector-icons/ionicons';

type Props = {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  setUnreadNotification?: (n: number) => void;
};

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

export default function NotificationsDrawer({
  visible,
  onClose,
  notifications,
  setUnreadNotification,
}: Props) {
  const modalizeRef = useRef<Modalize>(null);
  const [mountedList, setMountedList] = useState(false);

  // shimmer animation for skeleton
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  // compute unread count efficiently
  const unreadCount = useMemo(() => {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    if (typeof setUnreadNotification === 'function') {
      setUnreadNotification(unreadCount);
    }
  }, [unreadCount, setUnreadNotification]);

  // open modal with small frame deferral to ensure smooth animation
  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let to: number | null = null;

    if (visible) {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          to = setTimeout(() => {
            modalizeRef.current?.open();
          }, 8) as unknown as number;
        });
      });
    } else {
      setMountedList(false);
      modalizeRef.current?.close();
    }

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (to) clearTimeout(to);
    };
  }, [visible]);

  const handleOpened = useCallback(() => {
    requestAnimationFrame(() => setMountedList(true));
  }, []);

  const handleClosed = useCallback(() => {
    setMountedList(false);
    onClose();
  }, [onClose]);

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
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={46} />
        <Text style={styles.emptyText}>No notifications</Text>
      </View>
    );
  }, []);

  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const modalHeightValue = Math.round(SCREEN_HEIGHT * 0.95);
  // skeleton shimmer translation
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  // skeleton placeholder component
  const SkeletonLoader = () => {
    const skeletonItems = Array.from({ length: 16 }).map((_, i) => (
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
    <Modalize
      ref={modalizeRef}
      modalStyle={styles.container}
      handleStyle={styles.handle}
      adjustToContentHeight={false}
      modalHeight={modalHeightValue}
      onClosed={handleClosed}
      onOpened={handleOpened}
      withHandle
      // <-- Disable pan gesture so inner list scrolls without closing the sheet
      panGestureEnabled={false}
      keyboardAvoidingBehavior="height"
      scrollViewProps={{
        showsVerticalScrollIndicator: false,
        persistentScrollbar: false,
        overScrollMode: 'never',
        // allow nested scrolling for Android
        nestedScrollEnabled: true,
        // ensure taps inside list are handled
        keyboardShouldPersistTaps: 'handled',
      }}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              Recent activity and alerts
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => modalizeRef.current?.close()}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={20} />
        </TouchableOpacity>
      </View>

      {!mountedList && <SkeletonLoader />}

      {mountedList && (
        <FlashList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={ITEM_HEIGHT}
          getItemType={() => 0}
          getItemLayout={getItemLayout}
          contentContainerStyle={{ paddingBottom: 48 }}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          nestedScrollEnabled={true} // <-- explicit
        />
      )}
    </Modalize>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    marginRight: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  headerSubtitle: { fontSize: 12, color: '#6B7280' },
  closeBtn: { padding: 8, borderRadius: 999 },

  handle: {
    backgroundColor: '#E5E7EB',
    width: 56,
    height: 6,
    borderRadius: 6,
  },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 13, color: '#6B7280', marginTop: 12 },

  // skeleton styles
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
});
