import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type NotificationItem = {
  id: number | string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
  created_at: string;
};

type Props = {
  item: NotificationItem;
  timeLabel: string;
};

function NotificationRow({ item, timeLabel }: Props) {
  const containerStyle = item.read ? styles.itemRead : styles.itemUnread;
  const iconName =
    item.type === 'success'
      ? 'checkmark-circle'
      : item.type === 'warning'
      ? 'alert-circle'
      : 'notifications';

  return (
    <View style={[styles.item, containerStyle]}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={20} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </View>
  );
}

// shallow compare id and read only. add fields here if needed
function areEqual(prev: Props, next: Props) {
  return (
    prev.item.id === next.item.id &&
    prev.item.read === next.item.read &&
    prev.timeLabel === next.timeLabel
  );
}

export default React.memo(NotificationRow, areEqual);

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemRead: { backgroundColor: '#FFFFFF' },
  itemUnread: { backgroundColor: '#F9FAFB' },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  content: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: '#6B7280' },
  message: { marginTop: 4, fontSize: 13, color: '#374151' },
});
