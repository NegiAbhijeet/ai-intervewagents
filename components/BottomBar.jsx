import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

// SVG imports (assumes react-native-svg + svg transformer configured)
import HomeIcon from '../assets/images/bottomBar/homeicon.svg';
import HomeIconColored from '../assets/images/bottomBar/homeicon-colored.svg';
import JobsIcon from '../assets/images/bottomBar/jobsicon.svg';
import JobsIconColored from '../assets/images/bottomBar/jobsicon-colored.svg';
import LeagueIcon from '../assets/images/bottomBar/leagueicon.svg';
import LeagueIconColored from '../assets/images/bottomBar/leagueicon-colored.svg';
import ReportsIcon from '../assets/images/bottomBar/reportsicon.svg';
import ReportsIconColored from '../assets/images/bottomBar/reportsicon-colored.svg';
import ProfileIcon from '../assets/images/bottomBar/profileicon.svg';
import ProfileIconColored from '../assets/images/bottomBar/profileicon-colored.svg';

const TABS = [
  { name: 'index', label: 'Home', icon: HomeIcon, iconActive: HomeIconColored },
  { name: 'jobs', label: 'Jobs', icon: JobsIcon, iconActive: JobsIconColored },
  { name: 'leaderBoard', label: 'League', icon: LeagueIcon, iconActive: LeagueIconColored },
  { name: 'reports', label: 'Reports', icon: ReportsIcon, iconActive: ReportsIconColored },
  { name: 'profile', label: 'Profile', icon: ProfileIcon, iconActive: ProfileIconColored },
];

const BottomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const containerBottom = insets.bottom + 12;
  const focusedRouteName = state.routes[state.index]?.name;

  const onPressTab = (tabName, isFocused) => {
    const route = state.routes.find(r => r.name === tabName);
    const targetKey = route ? route.key : state.routes[state.index].key;
    const event = navigation.emit({ type: 'tabPress', target: targetKey, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(tabName);
  };

  return (
    <View style={[styles.wrapper, { bottom: containerBottom }]}>
      <View style={styles.backdrop}>
        <BlurView
          style={styles.blurContainer}
          blurType="light"
          blurAmount={6}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.12)"
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.innerRow}>
            {TABS.map(tab => {
              const isFocused = focusedRouteName === tab.name;
              const IconComponent = isFocused ? tab.iconActive : tab.icon;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => onPressTab(tab.name, isFocused)}
                  style={styles.tabButton}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isFocused }}
                >
                  {/* Render SVG component with sizes aligned to previous Image sizes */}
                  <IconComponent width={isFocused ? 40 : 30} height={isFocused ? 40 : 30} />
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: "4.5%",
    right: "4.5%", marginBottom: 20,
    alignSelf: 'center',
    height: 68,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  backdrop: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    width: '100%',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  iconAcitve: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  }
});

export default BottomTabBar;
