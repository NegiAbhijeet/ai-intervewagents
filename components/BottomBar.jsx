import React from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';

const TABS = [
  { name: 'index', label: 'Home', iconName: 'home-outline' },
  { name: 'jobs', label: 'Jobs', iconName: 'briefcase-outline' },
  { name: 'interview', label: 'Interview', iconName: 'mic-outline', isCenter: true },
  { name: 'reports', label: 'Reports', iconName: 'document-text-outline' },
  { name: 'leaderBoard', label: 'League', iconName: 'trophy-outline' },
];

const BottomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: insets.bottom + 8,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 80 : 70,
      }}
    >
      {TABS.map(tab => {
        const focusedRoute = state.routes[state.index];
        const isFocused = focusedRoute?.name === tab.name;

        const onPress = () => {
          const route = state.routes.find(r => r.name === tab.name);
          const targetKey = route ? route.key : state.routes[state.index].key;

          const event = navigation.emit({
            type: 'tabPress',
            target: targetKey,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        const iconColor = isFocused ? '#3B82F6' : '#9CA3AF';

        // Remove '-outline' for focused tab
        const iconName = isFocused
          ? tab.iconName.replace('-outline', '')
          : tab.iconName;

        if (tab.isCenter) {
          return (
            <View
              key={tab.name}
              style={{
                width: 80,
                alignItems: 'center',
                marginTop: -30,
              }}
            >
              <Pressable
                onPress={onPress}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  overflow: 'hidden',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}
              >
                <LinearGradient
                  colors={['#B3E5FC', '#3B82F6']}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 32,
                  }}
                >
                  <Ionicons name={isFocused ? 'mic' : 'mic-outline'} size={30} color="#fff" />
                </LinearGradient>
              </Pressable>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: isFocused ? '#3B82F6' : '#9CA3AF',
                  fontWeight: isFocused ? '600' : '400',
                }}
              >
                {tab.label}
              </Text>
            </View>
          );
        }

        return (
          <Pressable
            key={tab.name}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={iconName} size={24} color={iconColor} />
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                color: iconColor,
                fontWeight: isFocused ? '600' : '400',
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default BottomTabBar;
