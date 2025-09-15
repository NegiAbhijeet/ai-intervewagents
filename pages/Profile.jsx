'use client';

import React, { useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppStateContext } from '../components/AppContext';

export default function ProfileScreen() {
  const { userProfile, totalMinutes, usedMinutes, firebaseUser } =
    useContext(AppStateContext);

  const initials =
    firebaseUser?.displayName
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || '';

  return (
    <ScrollView className="py-4">
      {/* Profile Tabs */}
      <View className="gap-6 px-4 pb-10">
        <View className="bg-white rounded-xl shadow-md p-4">
          <View className="items-center py-2">
            {firebaseUser?.photoURL ? (
              <Image
                source={{ uri: firebaseUser.photoURL }}
                className="w-32 h-32 rounded-full"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-indigo-100 justify-center items-center">
                <Text className="text-indigo-600 text-4xl">{initials}</Text>
              </View>
            )}
            <Text className="font-bold text-lg mt-2">
              {firebaseUser?.displayName}
            </Text>
            <Text className="text-gray-500 text-sm">{firebaseUser?.email}</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View className="bg-white rounded-xl shadow-lg p-6 gap-6">
          {/* Header */}
          <View>
            <Text className="text-xl font-semibold text-gray-900">
              Personal Information
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Update your personal details and public profile.
            </Text>
          </View>

          {/* Name Fields */}
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
                  firebaseUser?.displayName?.split(' ').slice(1).join(' ') || ''
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

          {/* Bio (optional) */}
          {userProfile?.bio && (
            <View>
              <Text className="text-sm text-gray-700 mb-1">Bio</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base min-h-[100px]"
                value={userProfile.bio}
                multiline
              />
            </View>
          )}

          {/* Minutes Info */}
          <View className="flex-row justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-700 mb-1">Total Minutes</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                value={String(totalMinutes)}
                editable={false}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-700 mb-1">Used Minutes</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-base"
                value={String(usedMinutes)}
                editable={false}
              />
            </View>
          </View>

          {/* Sessions Info */}
          <View className="flex-row justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-700 mb-1">Total Sessions</Text>
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
          </View>
        </View>

        {/* Subscription */}
        <View className="bg-white rounded-xl shadow-md p-4">
          <Text className="text-lg font-bold">Subscription</Text>
          <Text className="text-sm text-gray-500 mb-4">
            Your current plan and billing information.
          </Text>

          <View className="bg-indigo-50 rounded-lg p-4 mb-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-medium text-indigo-800">Free Plan</Text>
                <Text className="text-xs text-indigo-600">Basic features</Text>
              </View>
              <View className="bg-indigo-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-indigo-800">Active</Text>
              </View>
            </View>

            <Text className="text-sm text-gray-600 mt-2">
              <Text className="font-bold">{usedMinutes}</Text> of{' '}
              <Text className="font-bold">{totalMinutes}</Text> minutes used
            </Text>

            <View className="mt-2 h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
              <View
                className="h-full bg-indigo-600"
                style={{
                  width: `${Math.max(5, (usedMinutes / totalMinutes) * 100)}%`,
                }}
              />
            </View>

            <Text className="text-xs text-gray-500 text-center mt-2">
              {totalMinutes - usedMinutes} minutes left
            </Text>
          </View>

          <TouchableOpacity className="bg-blue-500 p-3 items-center rounded-xl">
            <Text className="text-white font-bold">Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="bg-white rounded-xl shadow-md p-4">
          <Text className="text-lg font-bold mb-2">Danger Zone</Text>
          <Text className="text-sm text-gray-500 mb-4">
            Irreversible account actions.
          </Text>
          <Text className="font-medium mb-1">Delete Account</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </Text>
          <TouchableOpacity className="bg-red-600 rounded-xl p-3 items-center">
            <Text className="text-white font-bold">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
