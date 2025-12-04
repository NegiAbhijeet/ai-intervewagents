// NotificationRow.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useCallback, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import { AppStateContext } from './AppContext';

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
const iconSize = 30

function NotificationRow({ item, timeLabel, expanded, onToggle, type = "normal" }: Props) {
  const { userProfile } = useContext(AppStateContext)

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);



  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onToggle(item?.id || null)}
      style={[
        styles.item,
      ]}
    >
      <View style={styles.iconWrap}>
        <Image
          source={
            type === 'friend' && userProfile?.avatar ? { uri: userProfile.avatar }
              : (type === 'report'
                ? require('../assets/images/notiReportImage.png')
                : require('../assets/images/notiBellImage.png'))
          }
          resizeMode="cover"
          style={{ width: iconSize, height: iconSize }}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              { color: item.read ? '#111827' : '#0F172A' },
            ]}
            numberOfLines={expanded ? undefined : 1}
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

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 12,
    borderWidth: 0.63,
    borderColor: 'rgba(120, 20, 196, 0.6)',
    alignItems: 'flex-start',
    marginBottom: 6,
    backgroundColor: 'rgba(120, 20, 196, 0.1)',
  },

  iconWrap: {
    width: iconSize,
    height: iconSize,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingTop: 4
  },
  content: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: '#6B7280' },
  message: { marginTop: 6, fontSize: 13, color: 'rgba(75, 85, 99, 1)' },
  messageExpanded: { color: '#111827' },
});
