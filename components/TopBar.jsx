import React, { useContext, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppStateContext } from './AppContext';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from './config';
import LinearGradient from 'react-native-linear-gradient';

const TopBar = () => {
  const {
    userProfile,
    unreadNotification,
    notifications,
    setNotifications,
    setUnreadNotification,
    leaderboardRank,
  } = useContext(AppStateContext);
  const navigation = useNavigation();
  const unreadCount = useMemo(() => {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    if (typeof setUnreadNotification === 'function') {
      setUnreadNotification(unreadCount);
    }
  }, [unreadCount, setUnreadNotification]);
  function fetchNotifications() {
    fetchWithAuth(
      `${API_URL}/notifications/${userProfile.uid}/?notification_from=app`,
    )
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
  useEffect(() => {
    if (userProfile?.uid) {
      fetchNotifications();
    }
  }, [userProfile?.uid, unreadNotification]);

  // read badge value from context if provided
  const unreadBadge =
    typeof unreadNotification === 'number' ? unreadNotification : 0;

  return (
    <View className="flex-row justify-between items-center px-[5%] py-2 bg-white">
      <TouchableOpacity
        onPress={() => navigation.navigate('AppTabs', {
          screen: 'index',
        })}
        className="flex-row items-center gap-2"
      >
        <Image
          source={require('../assets/images/logo.png')}
          className="w-9 h-9 rounded-full"
        />
        <Text className="font-semibold text-xl">AIIA</Text>
      </TouchableOpacity>

      <View className="flex-row items-center gap-2">
        {
          userProfile?.plan?.id == 1 &&

          <TouchableOpacity
            onPress={() => navigation.navigate('pricing')}
            className=""
          >
            <LinearGradient
              colors={['rgba(131, 102, 6, 1))', 'rgba(233, 181, 11, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 9999,
                justifyContent: 'center',
                alignItems: 'center',
                // borderWidth: 2,
                borderColor: "rgba(233, 181, 11, 0.3)",
              }}
            >
              {/* <Text style={{ color: "#fff", fontSize: 8, fontWeight: 600, lineHeight:8 }}>JOIN</Text> */}
              <Text style={{ paddingVertical: 8, paddingHorizontal: 14, color: "#fff", fontSize: 10, fontWeight: 800, }}>UPGRADE</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
        <TouchableOpacity
          onPress={() => navigation.navigate('AppTabs', {
            screen: 'leaderBoard',
          })}
          className="flex-row items-center gap-2"
        >
          <View
            className="flex-row items-center justify-center gap-1 border border-[#EEF0F4] rounded-full px-3 py-1"
            style={{ overflow: 'hidden', boxShadow: "0 3.839px 5.759px -0.96px rgba(0, 0, 0, 0.10), 0 1.92px 3.839px -1.92px rgba(0, 0, 0, 0.10)" }}
          >
            {/* <Image
              source={require('../assets/images/flame.png')}
              className="w-5 h-5"
              resizeMode="contain"
            /> */}
            <Image
              source={require("../assets/images/fire.png")}
              style={{ width: 18, height: 18 }}
            />
            {/* <Ionicons name="trophy" size={14} color="#FBBF24" /> */}
            <Text className="text-base font-semibold">
              {Math.max(1, leaderboardRank)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity
          onPress={() => {
            // setIsNotificationDrawerOn(true);
            navigation.navigate('notifications');
          }}
          accessibilityLabel="Notifications"
          className="relative border border-[#EEF0F4] rounded-full"
          style={{ paddingHorizontal: 6, paddingVertical: 6, boxShadow: "0 3.839px 5.759px -0.96px rgba(0, 0, 0, 0.10), 0 1.92px 3.839px -1.92px rgba(0, 0, 0, 0.10)" }}
        >
          <Ionicons name="notifications-outline" size={22} color="#111827" />
          {unreadBadge > 0 && (
            <View
              className="absolute -top-1 -right-1 rounded-full items-center justify-center"
              style={{
                minWidth: 18,
                height: 18,
                paddingHorizontal: 4,
                backgroundColor: '#ef4444',
              }}
            >
              <Text className="text-[10px] text-white font-semibold">
                {unreadBadge > 99 ? '99+' : `${unreadBadge}`}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TopBar;
