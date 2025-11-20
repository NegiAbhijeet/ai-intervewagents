import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabBar from '../BottomBar';
import Home from '../../pages/Home';
import Interview from '../../pages/Interview';
import Reports from '../../pages/Reports';
import JobsPage from '../../pages/jobs';
import Leaderboard from '../../pages/leaderBoard';
import HomePage from '../../pages/HomePage';
import ProfileScreen from '../../pages/Profile';

const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'shift' }}
      backBehavior="history"
    >
      <Tab.Screen name="index" component={HomePage} />
      <Tab.Screen name="jobs" component={JobsPage} />
      <Tab.Screen name="interview" component={Interview} />
      <Tab.Screen name="reports" component={Reports} />
      <Tab.Screen name="leaderBoard" component={Leaderboard} />
      <Tab.Screen name="profile" component={ProfileScreen} />
      {/* Profile removed from tab navigator */}
    </Tab.Navigator>
  );
};

export default AppTabs;
