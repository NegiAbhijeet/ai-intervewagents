import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signOut } from 'firebase/auth';
import { AppStateContext } from '../components/AppContext';
import { auth } from '../libs/firebase';
import {
  API_URL,
  PRIVACY_POILCY_URL,
  TERMS_OF_USE_URL,
} from '../components/config';
import Layout from './Layout';
import fetchUserDetails from '../libs/fetchUser';
import { RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const {
    userProfile,
    totalMinutes,
    usedMinutes,
    firebaseUser,
    setUserProfile,
  } = useContext(AppStateContext);
  const navigation = useNavigation();
  const activeUsedMinutes = usedMinutes;

  const [loading, setLoading] = useState(false);
  async function fetchDetails() {
    try {
      if (user?.uid) {
        profile = await fetchUserDetails(userProfile?.uid);
      }
    } catch (err) {
      console.log('Error fetching user details:', err);
    }

    if (profile) {
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
  }
  const onRefresh = () => {
    fetchDetails();
  };
  const initials =
    firebaseUser?.displayName
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || '';

  const logout = async () => {
    try {
      setLoading(true);

      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await signOut(auth);

      setUserProfile(null);

      console.log('[Logout] User successfully logged out');
    } catch (err) {
      console.error('Error signing out:', err);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await fetch(
                `${API_URL}/profile/${userProfile.uid}/delete/`,
                { method: 'DELETE' },
              );

              if (res.ok) {
                console.log('[Delete] Account deleted successfully');
                await logout();
              } else {
                throw new Error('Delete request failed');
              }
            } catch (err) {
              console.error('[Delete Error]', err);
              Alert.alert('Error', 'Failed to delete account.');
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      {/* <TopBar /> */}
      <Layout>
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="py-5"
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        >
          <View className="gap-6 pb-10">
            {/* Profile Card */}
            <View className="bg-white rounded-xl shadow-md p-4">
              <View className="items-center py-2">
                {userProfile?.avatar ? (
                  <View className="w-32 h-32 rounded-full border-4 border-gray-600 overflow-hidden">
                    <Image
                      source={{ uri: userProfile?.avatar }}
                      className="w-full h-full rounded-full"
                    />
                  </View>
                ) : (
                  <View className="w-32 h-32 rounded-full bg-indigo-100 justify-center items-center border-4 border-gray-600">
                    <Text className="text-indigo-600 text-4xl">{initials}</Text>
                  </View>
                )}
                <Text className="font-bold text-lg mt-2">
                  {firebaseUser?.displayName}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {firebaseUser?.email}
                </Text>
              </View>
            </View>

            {/* Personal Info */}
            <View className="bg-white rounded-xl shadow-lg p-4 gap-6">
              <View>
                <Text className="text-xl font-semibold text-gray-900">
                  Personal Information
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Update your personal details and public profile.
                </Text>
              </View>

              <View className="gap-4">
                {/* First Name */}
                <View>
                  <Text className="text-sm text-gray-700 mb-1">First Name</Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                    value={firebaseUser?.displayName?.split(' ')[0] || ''}
                    editable={false}
                  />
                </View>

                {/* Last Name */}
                <View>
                  <Text className="text-sm text-gray-700 mb-1">Last Name</Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                    value={
                      firebaseUser?.displayName
                        ?.split(' ')
                        .slice(1)
                        .join(' ') || ''
                    }
                    editable={false}
                  />
                </View>

                {/* Email */}
                <View>
                  <Text className="text-sm text-gray-700 mb-1">Email</Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                    value={firebaseUser?.email || ''}
                    editable={false}
                  />
                </View>
              </View>

              {/* Bio */}
              {userProfile?.bio && (
                <View>
                  <Text className="text-sm text-gray-700 mb-1">Bio</Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base min-h-[100px]"
                    value={userProfile.bio}
                    multiline
                    editable={false}
                  />
                </View>
              )}

              {/* Minutes Info */}
              <View className="flex-row justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-sm text-gray-700 mb-1">
                    Total Minutes
                  </Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                    value={String(totalMinutes)}
                    editable={false}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-700 mb-1">
                    Used Minutes
                  </Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                    value={String(activeUsedMinutes)}
                    editable={false}
                  />
                </View>
              </View>

              {/* Sessions Info */}
              {/* <View className="flex-row justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-sm text-gray-700 mb-1">
                    Total Sessions
                  </Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                    value={String(userProfile?.plan?.max_sessions || 0)}
                    editable={false}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-700 mb-1">
                    Attended Sessions
                  </Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                    value={String(userProfile?.sessions_used || 0)}
                    editable={false}
                  />
                </View>
              </View> */}
            </View>

            {/* Subscription */}
            <View className="bg-white rounded-xl shadow-md p-4 gap-4">
              <View>
                <Text className="text-lg font-bold">Subscription</Text>
                <Text className="text-sm text-gray-500">
                  Your current plan and billing information.
                </Text>
              </View>
              <View className="bg-indigo-50 rounded-lg p-4">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-medium text-indigo-800">
                      {userProfile?.plan?.name || 'Free'} Plan
                    </Text>
                  </View>
                  <View className="bg-indigo-100 px-2 py-1 rounded-full">
                    <Text className="text-xs text-indigo-800">Active</Text>
                  </View>
                </View>

                <Text className="text-sm text-gray-600 mt-2">
                  <Text className="font-bold">{activeUsedMinutes}</Text>
                  <Text> of </Text>
                  <Text className="font-bold">{totalMinutes}</Text> minutes used
                </Text>

                <View className="mt-2 h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
                  <View
                    className="h-full bg-indigo-600"
                    style={{
                      width: `${Math.max(
                        5,
                        (activeUsedMinutes / totalMinutes) * 100,
                      )}%`,
                    }}
                  />
                </View>

                <Text className="text-xs text-gray-500 text-center mt-2">
                  {activeUsedMinutes > totalMinutes
                    ? 0
                    : totalMinutes - activeUsedMinutes}{' '}
                  minutes left
                </Text>
              </View>
              {userProfile?.plan.id == 1 ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('pricing')}
                  activeOpacity={0.8}
                  className="bg-blue-500 p-3 items-center rounded-lg"
                >
                  <Text className="text-white font-bold">Upgrade to Pro</Text>
                </TouchableOpacity>
              ) : (
                <View
                  className="p-3 items-center rounded-lg border"
                  style={{
                    backgroundColor: '#E5E7EB',
                    borderColor: '#D1D5DB',
                    opacity: 0.8,
                  }}
                >
                  <Text className="font-bold" style={{ color: '#6B7280' }}>
                    Pro Plan Active
                  </Text>
                </View>
              )}
            </View>

            {/* Links Section */}
            <View className="items-center">
              <Text className="text-sm text-gray-600">
                By using this app, you agree to our
                <Text
                  className="text-blue-600"
                  onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
                >
                  {' '}
                  Terms of Service{' '}
                </Text>
                <Text> and </Text>
                <Text
                  className="text-blue-600"
                  onPress={() => Linking.openURL(PRIVACY_POILCY_URL)}
                >
                  {' '}
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* Danger Zone */}
            <View className="bg-white rounded-xl shadow-md p-4">
              <Text className="text-lg font-bold">Danger Zone</Text>
              <Text className="text-sm text-gray-500 mb-2">
                Irreversible account actions.
              </Text>
              <Text className="font-medium">Delete Account</Text>
              <Text className="text-sm text-gray-600 mb-2">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </Text>
              <TouchableOpacity
                className="bg-red-600 rounded-lg p-3 items-center"
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </>
  );
}
