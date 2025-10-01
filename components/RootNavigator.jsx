import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './navigation/AppTabs';
import AuthStack from './navigation/AuthStack';
import { AppStateContext } from './AppContext';
import Leaderboard from '../pages/leaderBoard';
import GetStartedScreen from './GetStartedScreen';
import JobDetailPage from '../pages/JobDetailPage';
import ReportDetailScreen from '../pages/ReportDetail';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { firebaseUser, userProfile } = useContext(AppStateContext);

  if (!firebaseUser) return <AuthStack />;

  if (firebaseUser && userProfile && !userProfile.role) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTabs" component={AppTabs} />

      <Stack.Screen
        name="jobDetails"
        component={JobDetailPage}
        options={{ headerShown: true, title: 'Job Details' }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ headerShown: true, title: 'Report Details' }}
      />
      <Stack.Screen
        name="leaderBoard"
        component={Leaderboard}
        options={{ headerShown: true, title: 'Leaderboard' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
