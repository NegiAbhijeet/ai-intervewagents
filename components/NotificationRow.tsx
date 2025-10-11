// NotificationRow.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

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
  expanded: boolean;
  onToggle: () => void;
};

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function typeColor(type?: NotificationItem['type']) {
  switch (type) {
    case 'success':
      return '#16A34A'; // green
    case 'warning':
      return '#D97706'; // amber
    case 'error':
      return '#DC2626'; // red
    default:
      return '#2563EB'; // blue for info / default
  }
}

function NotificationRow({ item, timeLabel, expanded, onToggle }: Props) {
  // animate open/close for a smoother feel
  console.log(item);
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  const accent = typeColor(item.type);
  const iconName =
    item.type === 'success'
      ? 'checkmark-circle'
      : item.type === 'warning'
      ? 'alert-circle'
      : item.type === 'error'
      ? 'alert' // use a different icon for error
      : 'notifications';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onToggle(item?.id || null)}
      style={[
        styles.item,
        item.read ? styles.itemRead : styles.itemUnread,
        expanded
          ? {
              borderColor: fade('#93C5FD', 0.55),
              backgroundColor: fade('#60A5FA', 0.08),
            }
          : null,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          expanded ? { backgroundColor: fade(accent, 0.12) } : null,
        ]}
      >
        <Ionicons name={iconName} size={22} color={accent} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              { color: item.read ? '#111827' : '#0F172A' },
              { borderLeftWidth: 4, borderLeftColor: accent, paddingLeft: 8 },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>

        <Text
          style={[styles.message, expanded ? styles.messageExpanded : null]}
          numberOfLines={expanded ? undefined : 2}
        >
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// shallow compare id, read, expanded and timeLabel
function areEqual(prev: Props, next: Props) {
  return (
    prev.item.id === next.item.id &&
    prev.item.read === next.item.read &&
    prev.expanded === next.expanded &&
    prev.timeLabel === next.timeLabel
  );
}

export default React.memo(NotificationRow, areEqual);

// small helper to return rgba-ish background from hex and opacity
function fade(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-start',
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  itemRead: { backgroundColor: '#FFFFFF' },
  itemUnread: { backgroundColor: '#FEFEFF' },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
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
  title: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: '#6B7280' },
  message: { marginTop: 6, fontSize: 13, color: '#374151' },
  messageExpanded: { color: '#111827' },
});
