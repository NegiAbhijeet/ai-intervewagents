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

const Spinner = () => <ActivityIndicator size="small" />;

export default function JobsFormDetails({
  uid,
  canId,
  fetchJobs,
  setJobs,
  setOpenPopup,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ experience: '', position: '' });

  const handleFormSubmit = async () => {
    if (!uid || !canId) return;
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 items-center justify-center px-4"
    >
      <View className="w-full max-w-lg">
        <View className="rounded-lg overflow-hidden shadow-2xl">
          <View className="p-6 bg-gradient-to-r from-sky-500 to-indigo-600">
            <Text className="text-2xl font-semibold text-white">
              Professional Details
            </Text>
            <Text className="text-sm text-white opacity-90 mt-1">
              Share a brief summary of your role and experience
            </Text>
          </View>

          <View className="p-6 bg-white">
            <View className="space-y-5">
              <View>
                <Text className="text-sm font-medium">Position</Text>
                <View className="mt-2 relative">
                  <TextInput
                    value={formData.position}
                    onChangeText={text =>
                      setFormData({ ...formData, position: text })
                    }
                    placeholder="Software Engineer"
                    accessibilityLabel="Position"
                    className="h-12 border border-gray-200 rounded px-3"
                  />
                  <Text className="absolute right-3 top-3 text-xs opacity-70">
                    e.g. Software Engineer
                  </Text>
                </View>
                <Text className="mt-2 text-xs text-gray-500">
                  This helps match job titles to your profile
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium">Years of Experience</Text>
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
                    className="h-12 border border-gray-200 rounded px-3"
                    maxLength={2}
                  />
                  <Text className="absolute right-3 top-3 text-xs opacity-70">
                    years
                  </Text>
                </View>
                <Text className="mt-2 text-xs text-gray-500">
                  Enter whole years only
                </Text>
              </View>

              <View>
                <TouchableOpacity
                  onPress={handleFormSubmit}
                  disabled={isLoading}
                  accessibilityRole="button"
                  className="w-full h-12 rounded items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-3">
                      <Spinner />
                      <Text className="text-white ml-3">Saving</Text>
                    </View>
                  ) : (
                    <Text className="text-white font-medium">Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
