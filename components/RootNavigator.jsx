import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './navigation/AppTabs';
import AuthStack from './navigation/AuthStack';
import AvatarSelectionScreen from "./AvatarSelectionScreen"
import JobDetailPage from '../pages/JobDetailPage';
import ReportDetailScreen from '../pages/ReportDetail';
import NotificationsPage from '../pages/NotificationsDrawer';
import ProfileScreen from '../pages/Profile';
import OthersProfile from '../pages/othersProfile';
import PricingPage from "../pages/pricing"
import { AppStateContext } from './AppContext';
const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { firebaseUser, userProfile } = useContext(AppStateContext);

  // If user is logged in and has a profile with a role, show the main app tabs
  if (firebaseUser && userProfile && userProfile.role && userProfile?.avatar) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AppTabs" component={AppTabs} />
        <Stack.Screen
          name="notifications"
          component={NotificationsPage}
          options={{ headerShown: true, title: 'Notifications' }}
        />
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
          name="profile"
          component={ProfileScreen}
          options={{ headerShown: true, title: 'Profile' }}
        />
        <Stack.Screen
          name="pricing"
          component={PricingPage}
          options={{ headerShown: true, title: 'Pricing' }}
        />
        <Stack.Screen
          name="othersProfile"
          component={OthersProfile}
          options={{ headerShown: true, title: 'Profile' }}
        />
      </Stack.Navigator>
    );
  }

  // If user is logged in but has no role yet, show onboarding / get started
  if (
    firebaseUser &&
    userProfile &&
    (!userProfile.role || !userProfile?.avatar)
  ) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AvatarSelection" component={AvatarSelectionScreen} />
      </Stack.Navigator>
    );
  }

  // Default: not authenticated. show auth stack
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
