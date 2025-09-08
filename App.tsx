import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabBar from './components/BottomBar';
import './global.css';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Reports from './pages/Reports';
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => <BottomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="index" component={Home} />
        <Tab.Screen name="interview" component={Interview} />
        <Tab.Screen name="reports" component={Reports} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
