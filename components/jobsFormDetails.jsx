import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native'
import fetchWithAuth from '../libs/fetchWithAuth'
import { JAVA_API_URL } from './config'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function JobsFormDetails({
  uid,
  canId,
  fetchJobs,
  setJobs,
  setOpenPopup,
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ experience: '', position: '' })

  const validate = () => {
    if (!formData.position.trim()) {
      Alert.alert('Validation', 'Please enter a position')
      return false
    }
    const years = parseInt(formData.experience || '0', 10)
    if (isNaN(years) || years < 0) {
      Alert.alert('Validation', 'Please enter valid years of experience')
      return false
    }
    return true
  }

  const handleFormSubmit = async () => {
    if (!uid || !canId) return
    if (!validate()) return

    try {
      setIsLoading(true)
      const payload = {
        experienceYears: formData.experience,
        position: formData.position,
      }

      const patchRes = await fetchWithAuth(
        `${JAVA_API_URL}/api/candidates/update/${canId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!patchRes.ok) {
        console.error('There was a problem saving your profile.')
        Alert.alert('Error', 'There was a problem saving your profile')
        return
      }

      const body = {
        uid,
        role: formData.position,
        experience_years: formData.experience,
      }

      setOpenPopup(false)
      const jobs = await fetchJobs(body)
      setJobs(jobs)
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert('Error', 'Unable to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Professional Details</Text>
            <Text style={styles.subtitle}>Share a brief summary of your role and experience</Text>
          </View>

          <View style={styles.body}>
            <View style={styles.field}>
              <Text style={styles.label}>Position</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={formData.position}
                  onChangeText={text =>
                    setFormData({ ...formData, position: text })
                  }
                  placeholder="Software Engineer"
                  accessibilityLabel="Position"
                  style={styles.input}
                  returnKeyType="done"
                />
                <Text style={styles.helper}>e.g. Software Engineer</Text>
              </View>
              <Text style={styles.hint}>This helps match job titles to your profile</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Years of Experience</Text>
              <View style={styles.inputContainer}>
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
                  style={styles.input}
                  maxLength={2}
                  returnKeyType="done"
                />
                <Text style={styles.helper}>years</Text>
              </View>
              <Text style={styles.hint}>Enter whole years only</Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleFormSubmit}
                disabled={isLoading}
                accessibilityRole="button"
                style={[
                  styles.button,
                  isLoading ? styles.buttonDisabled : undefined,
                ]}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Saving</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  header: {
    padding: 20,
    backgroundColor: '#dedede',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#000',
  },
  body: {
    padding: 20,
    backgroundColor: '#fff',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  inputContainer: {
    marginTop: 8,
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 80,
    backgroundColor: '#fff',
  },
  helper: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    marginTop: 6,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
})
