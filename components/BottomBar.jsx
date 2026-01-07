import Ionicons from '@react-native-vector-icons/ionicons'
import React from 'react'
import { View, Pressable, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TABS = [
  { id: 'index', name: 'Index', icon: 'home-outline' },
  { id: 'jobs', name: 'Jobs', icon: 'briefcase-outline' },
  { id: 'leaderBoard', name: 'LeaderBoard', icon: 'trophy-outline' },
  { id: 'reports', name: 'Reports', icon: 'stats-chart-outline' },
  { id: 'profile', name: 'Profile', icon: 'person-outline' },
]

const BottomTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets()
  const focusedRouteName = state.routes[state.index]?.name

  const onPressTab = (tabName, isFocused) => {
    const route = state.routes.find(r => r.id === tabName)
    const targetKey = route ? route.key : state.routes[state.index].key

    const event = navigation.emit({
      type: 'tabPress',
      target: targetKey,
      canPreventDefault: true,
    })

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(tabName)
    }
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.innerRow}>
        {TABS.map(tab => {
          const isFocused = focusedRouteName === tab.id

          return (
            <Pressable
              key={tab.id}
              onPress={() => onPressTab(tab.id, isFocused)}
              style={styles.tabButton}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              {/* <View style={{ height: 40, justifyContent: 'flex-end' }}> */}
                <Ionicons
                  name={isFocused ? tab.icon.replace('-outline', '') : tab.icon}
                  size={26}
                  color={isFocused ? '#6D28D9' : '#6B7280'}
                />
              {/* </View> */}
              <Text
                style={[
                  styles.label,
                  isFocused && styles.labelActive,
                ]}
              >
                {tab.name}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    justifyContent: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '7.5%',
    width: '100%',
  },

  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 10,
    marginTop: 4,
    color: '#6B7280',
  },

  labelActive: {
    color: '#6D28D9',
  },
})

export default BottomTabBar
