import React, { useContext, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTabs from './navigation/AppTabs';
// import AuthStack from './navigation/AuthStack';
import AvatarSelectionScreen from './AvatarSelectionScreen';
import JobDetailPage from '../pages/JobDetailPage';
import ReportDetailScreen from '../pages/ReportDetail';
import NotificationsPage from '../pages/NotificationsDrawer';
import ProfileScreen from '../pages/Profile';
import OthersProfile from '../pages/othersProfile';
import PricingPage from '../pages/pricing';
import { AppStateContext } from './AppContext';
import GetStartedScreen from '../pages/GetStartedScreen';
import OnboardingCarousel from '../pages/onboarding';
import LoginScreen from '../pages/test/loginPage';
import IndustryRoleScreen from '../pages/IndustryRoleScreen';
const Stack = createNativeStackNavigator();
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};
const OnboardingStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="GetStarted"
  >
    <Stack.Screen name="GetStarted" component={GetStartedScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingCarousel} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const {
    firebaseUser,
    userProfile,
    onboardingComplete,
    setOnboardingComplete,
  } = useContext(AppStateContext);

  useEffect(() => {
    if (onboardingComplete) return;
    let mounted = true;
    const readOnboarding = async () => {
      try {
        const val = await AsyncStorage.getItem('onboardingComplete');
        if (!mounted) return;
        if (val) {
          setOnboardingComplete(true);
        } else {
          setOnboardingComplete(false);
        }
      } catch (e) {
        if (!mounted) return;
        setOnboardingComplete(false);
      }
    };
    readOnboarding();
    return () => {
      mounted = false;
    };
  }, [onboardingComplete]);

  // If onboarding not completed, show the onboarding flow (GetStarted -> Onboarding)
  if (!onboardingComplete) {
    return <OnboardingStack />;
  }

  // If user is logged in and has a profile with a role, show the main app tabs
  if (firebaseUser && userProfile && userProfile.role) {
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

  // If user is logged in but has no role yet or avatar, show onboarding avatar selection
  if (firebaseUser && userProfile && !userProfile.role) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ChooseRole" component={IndustryRoleScreen} />
        <Stack.Screen
          name="AvatarSelection"
          component={AvatarSelectionScreen}
        />
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
