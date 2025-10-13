import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabBar from '../BottomBar';
import Home from '../../pages/Home';
import Interview from '../../pages/Interview';
import Reports from '../../pages/Reports';
import JobsPage from '../../pages/jobs';
import Leaderboard from '../../pages/leaderBoard';

const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="index" component={Home} />
      <Tab.Screen name="jobs" component={JobsPage} />
      <Tab.Screen name="interview" component={Interview} />
      <Tab.Screen name="reports" component={Reports} />
      <Tab.Screen name="leaderBoard" component={Leaderboard} />

      {/* Profile removed from tab navigator */}
    </Tab.Navigator>
  );
};

export default AppTabs;
