import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './navigation/AppTabs';
import Profile from '../pages/Profile';
import AuthStack from './navigation/AuthStack';
import { AppStateContext } from './AppContext';
import Leaderboard from "../pages/leaderBoard"
const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { firebaseUser } = useContext(AppStateContext);

  if (!firebaseUser) return <AuthStack />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: true, title: 'Your Profile' }} // or false, if you want no header
      />
      <Stack.Screen
        name="leaderBoard"
        component={Leaderboard}
        options={{ headerShown: true, title: 'Leaderboard' }} // or false, if you want no header
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
