// NotificationRow.tsx
import React from 'react';
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
import { API_URL } from './config';
import Toast from 'react-native-toast-message';
import fetchWithAuth from '../libs/fetchWithAuth';

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
const iconSize = 32

function NotificationRow({ item, timeLabel, expanded, onToggle, type = "normal", isRead = false, setIsLoading, uid, avatar, onRequestStatusChange }: Props) {
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  async function respondToRequest(status: 'accepted' | 'declined') {
    if (!uid || !item?.meeting_id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      })
      return
    }

    try {
      setIsLoading(true)

      await fetchWithAuth(`${API_URL}/connections/respond/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          request_id: item.meeting_id,
          status,
        }),
      })

      onRequestStatusChange(item.id, status)
    } catch (error) {
      console.log('Request response failed', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <TouchableOpacity
      style={[
        styles.item,
        isRead
          ? { backgroundColor: 'rgba(255, 255, 255, 0.7)' }
          : {}
      ]}
      activeOpacity={0.9}
      onPress={() => onToggle(item?.id || null)}
    >
      <View style={styles.iconWrap}>
        <Image
          source={
            type === "request" && avatar ? { uri: avatar }
              : (type === 'report'
                ? require('../assets/images/notiReportImage.png')
                : require('../assets/images/notiBellImage.png'))
          }
          resizeMode="cover"
          style={{ width: iconSize, height: iconSize, borderRadius: 9999 }}
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
        {type === 'request' && (
          <View style={styles.actionsRow}>
            {!item?.request_status && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => respondToRequest('accepted')}
                >
                  <Text style={styles.actionText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => respondToRequest('declined')}
                >
                  <Text style={styles.actionText}>Decline</Text>
                </TouchableOpacity>
              </>
            )}

            {item?.request_status && (
              <View
                style={[
                  styles.actionButton,
                  { backgroundColor: 'rgba(0,0,0,0.3)' },
                ]}
              >
                <Text style={styles.actionText}>
                  {item.request_status === 'accepted' ? 'Accepted' : 'Declined'}
                </Text>
              </View>
            )}
          </View>
        )}

      </View>

    </TouchableOpacity>
  );
}

function areEqual(prev: Props, next: Props) {
  return (
    prev.item.id === next.item.id &&
    prev.item.read === next.item.read &&
    prev.item.request_status === next.item.request_status &&
    prev.expanded === next.expanded &&
    prev.timeLabel === next.timeLabel
  )
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
    paddingTop: 4,
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
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: 120
  },

  acceptButton: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    marginRight: 8,
  },

  declineButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    transform: "translateY(-1px)"
  },

});
