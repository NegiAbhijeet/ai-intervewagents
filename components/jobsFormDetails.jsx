import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import fetchWithAuth from '../libs/fetchWithAuth';
import { JAVA_API_URL } from './config';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from './dashboard-header';

export default function JobsFormDetails({
  uid,
  canId,
  fetchJobs,
  setJobs,
  setOpenPopup,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ experience: '', position: '' });

  const validate = () => {
    if (!formData.position.trim()) {
      Alert.alert('Validation', 'Please enter a position');
      return false;
    }
    const years = parseInt(formData.experience || '0', 10);
    if (isNaN(years) || years < 0) {
      Alert.alert('Validation', 'Please enter valid years of experience');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async () => {
    if (!uid || !canId) return;
    if (!validate()) return;

    try {
      setIsLoading(true);
      const payload = {
        experienceYears: formData.experience,
        position: formData.position,
      };

      const patchRes = await fetchWithAuth(
        `${JAVA_API_URL}/api/candidates/update/${canId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!patchRes.ok) {
        console.error('There was a problem saving your profile.');
        Alert.alert('Error', 'There was a problem saving your profile');
        return;
      }

      const body = {
        uid,
        role: formData.position,
        experience_years: formData.experience,
      };

      setOpenPopup(false);
      const jobs = await fetchJobs(body);
      setJobs(jobs);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Unable to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center"
      >
        <View className="flex-col gap-4 w-full">
          <DashboardHeader
            title="Professional Details"
            description="Share a brief summary of your role and experience"
            extraText="(Upcoming job update in 12 hours)"
          />

          <View className="w-full max-w-xl rounded-xl overflow-hidden bg-white shadow-md">
            <View className="p-4 py-6 bg-white">
              <View className="mb-5">
                <Text className="text-base font-semibold text-gray-900">
                  Position
                </Text>
                <View className="mt-2 relative">
                  <TextInput
                    value={formData.position}
                    onChangeText={text =>
                      setFormData({ ...formData, position: text })
                    }
                    placeholder="Software Engineer"
                    accessibilityLabel="Position"
                    className="h-12 border border-gray-200 rounded-lg px-4 pr-24 bg-white text-base"
                    returnKeyType="done"
                  />
                  <Text className="absolute right-3 top-3 text-sm text-black/60">
                    e.g. Software Engineer
                  </Text>
                </View>
                <Text className="mt-2 text-sm text-gray-500">
                  This helps match job titles to your profile
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-base font-semibold text-gray-900">
                  Years of Experience
                </Text>
                <View className="mt-2 relative">
                  <TextInput
                    value={formData.experience}
                    onChangeText={text =>
                      setFormData({
                        ...formData,
                        experience: text.replace(/[^0-9]/g, ''),
                      })
                    }
                    placeholder="5"
                    keyboardType="numeric"
                    accessibilityLabel="Years of experience"
                    className="h-12 border border-gray-200 rounded-lg px-4 pr-20 bg-white text-base"
                    maxLength={2}
                    returnKeyType="done"
                  />
                  <Text className="absolute right-3 top-3 text-sm text-black/60">
                    years
                  </Text>
                </View>
                <Text className="mt-2 text-sm text-gray-500">
                  Enter whole years only
                </Text>
              </View>

              <View className="mt-3">
                <TouchableOpacity
                  onPress={handleFormSubmit}
                  disabled={isLoading}
                  accessibilityRole="button"
                  className={`h-12 rounded-lg items-center justify-center bg-blue-600 ${
                    isLoading ? 'opacity-60' : ''
                  }`}
                >
                  {isLoading ? (
                    <View className="flex-row items-center space-x-2">
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="text-white text-lg font-medium">
                        Please wait...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-lg font-medium">
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
