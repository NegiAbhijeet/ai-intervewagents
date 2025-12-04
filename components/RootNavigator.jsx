import React, { useContext, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTabs from './navigation/AppTabs';
import AvatarSelectionScreen from './AvatarSelectionScreen';
import JobDetailPage from '../pages/JobDetailPage';
import ReportDetailScreen from '../pages/ReportDetail';
import NotificationsPage from '../pages/NotificationsDrawer';
import OthersProfile from '../pages/othersProfile';
import PricingPage from '../pages/pricing';
import { AppStateContext } from './AppContext';
import GetStartedScreen from '../pages/GetStartedScreen';
import OnboardingCarousel from '../pages/onboarding';
import LoginScreen from '../pages/loginPage';
import SignupScreen from "../pages/signup";
import IndustryRoleScreen from '../pages/IndustryRoleScreen';
import ForgotPasswordScreen from '../pages/forgotPwd';
import LanguageSelectionScreen from '../pages/languageSelect';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);



const RootNavigator = () => {
  const {
    firebaseUser,
    userProfile,
    onboardingComplete,
    setOnboardingComplete,
    langSelected,
    setLangSelected
  } = useContext(AppStateContext);

  const [checkingLanguage, setCheckingLanguage] = useState(true);

  useEffect(() => {
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
    // only call if onboardingComplete not set yet
    if (!onboardingComplete) readOnboarding();

    return () => {
      mounted = false;
    };
  }, [onboardingComplete, setOnboardingComplete]);

  useEffect(() => {
    let mounted = true;
    const checkLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem('user-language');
        if (!mounted) return;
        setLangSelected(!!saved);
      } catch (e) {
        if (!mounted) return;
        setLangSelected(false);
      } finally {
        if (mounted) setCheckingLanguage(false);
      }
    };
    checkLanguage();
    return () => {
      mounted = false;
    };
  }, []);

  // while checking storage, render nothing (or a lightweight loader if you prefer)
  if (checkingLanguage) return null;

  // Show LanguageSelection only if language not chosen yet.
  // We want the language screen to appear once at app first run.
  if (!langSelected) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="LanguageSelection"
          component={LanguageSelectionScreen}
          options={{ headerShown: false }}
        />
        {/* After language selection, navigation.goBack() in LanguageSelectionScreen will return here
            and the RootNavigator will re-evaluate storage and proceed to normal flow. */}
      </Stack.Navigator>
    );
  }

  // If onboarding not completed, show onboarding flow
  if (!onboardingComplete) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingCarousel} />
      </Stack.Navigator>
    );
  }

  // If user is logged in and has a profile with a role, show the main app tabs
  if (
    firebaseUser &&
    userProfile &&
    userProfile.role &&
    userProfile.position &&
    userProfile.industry
  ) {
    return (
      <Stack.Navigator screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0
        }
      }}>
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
  if (firebaseUser && userProfile && (
    !userProfile?.role ||
    !userProfile?.position ||
    !userProfile?.industry
  )) {
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
