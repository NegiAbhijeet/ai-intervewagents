import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// SVG icons
import HomeIcon from '../assets/images/bottomBar/homeicon.svg'
import HomeIconColored from '../assets/images/bottomBar/homeicon-colored.svg'
import JobsIcon from '../assets/images/bottomBar/jobsicon.svg'
import JobsIconColored from '../assets/images/bottomBar/jobsicon-colored.svg'
import LeagueIcon from '../assets/images/bottomBar/leagueicon.svg'
import LeagueIconColored from '../assets/images/bottomBar/leagueicon-colored.svg'
import ReportsIcon from '../assets/images/bottomBar/reportsicon.svg'
import ReportsIconColored from '../assets/images/bottomBar/reportsicon-colored.svg'
import ProfileIcon from '../assets/images/bottomBar/profileicon.svg'
import ProfileIconColored from '../assets/images/bottomBar/profileicon-colored.svg'

const TABS = [
  { name: 'index', icon: HomeIcon, iconActive: HomeIconColored },
  { name: 'jobs', icon: JobsIcon, iconActive: JobsIconColored },
  { name: 'leaderBoard', icon: LeagueIcon, iconActive: LeagueIconColored },
  { name: 'reports', icon: ReportsIcon, iconActive: ReportsIconColored },
  { name: 'profile', icon: ProfileIcon, iconActive: ProfileIconColored },
]

const BottomTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets()
  const focusedRouteName = state.routes[state.index]?.name

  const onPressTab = (tabName, isFocused) => {
    const route = state.routes.find(r => r.name === tabName)
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
          const isFocused = focusedRouteName === tab.name
          const Icon = isFocused ? tab.iconActive : tab.icon

          return (
            <Pressable
              key={tab.name}
              onPress={() => onPressTab(tab.name, isFocused)}
              style={styles.tabButton}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              <Icon
                width={isFocused ? 28 : 22}
                height={isFocused ? 28 : 22}
              />
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
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'center',
    zIndex: 9999,
    // elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.00)",
    boxShadow: "0 3px 4px 0 rgba(0, 0, 0, 0.25)",
    // filter: "blur(10px)"
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
})

export default BottomTabBar
