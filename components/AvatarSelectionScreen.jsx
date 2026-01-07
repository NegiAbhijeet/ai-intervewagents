// AvatarSelectionScreen.tsx
import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TextInput,
  ImageBackground,
} from 'react-native';
import { AppStateContext } from './AppContext';
import { API_URL, JAVA_API_URL } from './config';
import fetchWithAuth from '../libs/fetchWithAuth';
import Toast from 'react-native-toast-message';
import BackgroundGradient2 from './backgroundGradient2';
import { useTranslation } from 'react-i18next';
import LANGUAGES from '../libs/languages';
import fetchUserDetails from '../libs/fetchUser';
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_HORIZONTAL_PADDING = 0; // total horizontal padding inside screenWrap
const COLUMNS = 3;
const GAP = 12;
const { width: SCREEN_W } = Dimensions.get('window')

// compute the container width that holds the grid (screenWrap uses 85% width)
const CONTAINER_WIDTH = Math.floor(SCREEN_WIDTH * 0.85) - CONTAINER_HORIZONTAL_PADDING * 2;

// compute cell size so COLUMNS cells + gaps fit exactly inside container
const CELL_SIZE = Math.floor((CONTAINER_WIDTH - GAP * (COLUMNS - 1)) / COLUMNS);

export default function AvatarSelectionScreen({ route }) {

  const {
    selectedIndustry = "",
    selectedRole = "",
    selectedLevel = "",
    selectedSkills = ""
  } = route?.params || {};
  const [step, setStep] = useState(1);

  const { userProfile, setUserProfile, setFirstInterviewObject, language, myCandidate, setMyCandidate } = useContext(AppStateContext);
  const { t } = useTranslation();
  const [userName, setUserName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const avatars = useMemo(() => {
    const base =
      'https://docsightaistorageprod.blob.core.windows.net/avatar/avatar0';
    return Array.from({ length: 6 }, (_, i) => `${base}${i + 1}.png`);
  }, []);

  const selectedAvatar = selectedIndex !== null ? avatars[selectedIndex] : null;

  const handleCandidateUpdate = async () => {
    try {
      const parts = (userName || '').trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      const skillsPayload = (
        Array.isArray(selectedSkills)
          ? selectedSkills
          : selectedSkills
            ? [selectedSkills]
            : []
      ).slice(0, 5);

      const payload = {
        uid,
        canId,
        firstName: firstName,
        lastName: lastName,
        industry: selectedIndustry,
        position: selectedRole,
        skills: skillsPayload,
        level: selectedLevel,
        avatar: selectedAvatar
      };
      setIsLoading(true);
      const response = await fetchWithAuth(`${API_URL}/candidate/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error || 'Failed to update candidate.';
        throw new Error(message);
      }
      const updatedProfile = await response.json().catch(() => ({}));
      const newUserProfile = updatedProfile || {}
      if (newUserProfile?.canId) {
        console.log('Updated candidate profile:', newUserProfile);
        setMyCandidate(newUserProfile);
        const profile = fetchUserDetails(newUserProfile?.uid)
        setUserProfile(profile)
      }
    } catch (error) {
      console.log('handleCandidateUpdate error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleContinue = async () => {
    try {
      if (step === 1 && userName) {
        setStep(2);
        return;
      }
      if (step === 2 && !selectedAvatar) {
        return;
      }

      if (myCandidate?.canId) {
        await handleCandidateUpdate();
        return
      }

      const parts = (userName || '').trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

      // Ensure skills is an array
      const skillsPayload = (
        Array.isArray(selectedSkills)
          ? selectedSkills
          : selectedSkills
            ? [selectedSkills]
            : []
      ).slice(0, 5);

      const myLanguage = LANGUAGES.find((item) => item?.code === language)

      const payload = {
        uid: userProfile?.uid,
        requiredSkills: skillsPayload,
        experience: selectedLevel,
        role: 'candidate',
        industry: selectedIndustry,
        position: selectedRole,
        avatar: selectedAvatar,
        first_name: firstName,
        last_name: lastName,
        language: myLanguage?.label_en || "English"
      };

      setIsLoading(true);

      const response = await fetchWithAuth(`${API_URL}/candidate/save/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error || 'Failed to create interview.';
        throw new Error(message);
      }

      const result = await response.json().catch(() => ({}));

      setUserProfile({
        ...userProfile,
        role: 'candidate',
        avatar: selectedAvatar,
        full_name: userName,
        industry: selectedIndustry,
        position: selectedRole
      });
    } catch (error) {
      console.log('handleContinue error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || (step === 1 ? !userName : !selectedAvatar)

  const renderItem = ({ item, index }) => {
    const isSelected = selectedIndex === index;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelectedIndex(index)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        style={styles.avatarCell}
      >
        <View style={[styles.avatarOuter, isSelected && styles.avatarOuterSelected]}>
          <Image
            source={{ uri: item }}
            resizeMode="cover"
            accessibilityLabel={`Avatar ${index + 1}`}
            style={styles.avatarImage}
          />
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <BackgroundGradient2 />
      <View style={styles.previewContainer}>
        <View style={[styles.wrapper]}>
          <View style={styles.cloudWrap} pointerEvents="none">
            <ImageBackground
              source={require('../assets/images/av-cloud.png')}
              style={styles.cloud}
              imageStyle={styles.cloudImage}
            >
              <Text numberOfLines={2} style={styles.cloudText}>
                {t('nova.beforeBegin')}
              </Text>


            </ImageBackground>
          </View>

          <Image
            source={require('../assets/images/av-penguin.png')}
            style={styles.penguin}
            resizeMode="contain"
          />
        </View>

        <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 4, marginBottom: 30 }}>
          <View
            style={{
              width: step === 1 ? 25 : 10,
              height: 2,
              backgroundColor: step === 1 ? "black" : "rgba(102, 102, 102, 1)"
            }}
          />
          <View
            style={{
              width: step === 1 ? 10 : 25,
              height: 2,
              backgroundColor: step === 1 ? "rgba(102, 102, 102, 1)" : "black"
            }}
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {step === 1 ? t('avatar.step1Title') : t('avatar.step2Title')}
          </Text>
        </View>
      </View>

      <View style={styles.screenWrap}>
        {step === 1 ? (
          <View style={{ width: '100%', marginHorizontal: 'auto' }}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('avatar.fullNameLabel')}</Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder={t('avatar.namePlaceholder')}
                keyboardType="default"
                style={styles.input}
                placeholderTextColor="rgba(139, 71, 239, 0.4)"
                maxLength={15}
                editable={!isLoading}
              />
            </View>
          </View>
        ) : (
          <View>
            <FlatList
              data={avatars}
              renderItem={renderItem}
              keyExtractor={(_, idx) => String(idx)}
              numColumns={COLUMNS}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{
                justifyContent: 'space-between',
              }}
            />
          </View>
        )}

        <TouchableOpacity
          activeOpacity={isDisabled ? 1 : 0.9}
          onPress={handleContinue}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
          style={[
            styles.button,
            isDisabled ? styles.buttonDisabled : styles.buttonEnabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 1 ? t('avatar.nextButton') : t('avatar.startButton')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const PENG_WIDTH = Math.min(320, Math.round(SCREEN_W * 0.25))
const CLOUD_WIDTH = Math.min(320, Math.round(SCREEN_W * 0.85 * 0.80))
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  headerContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  // preview
  previewContainer: {
    alignItems: 'center',
    marginBottom: 36
  },
  previewWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    marginVertical: 40
  },
  previewImage: {
    width: '85%',
  }
  ,
  previewPlaceholderText: {
    color: '#4f46e5',
  },
  previewLabel: {
    fontSize: 14,
    color: '#475569',
    marginTop: 12,
  },
  screenWrap: {
    flex: 1,
    width: '85%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },

  avatarCell: {
    width: CELL_SIZE,
    // keep touch target slightly taller than image for easier taps
    height: CELL_SIZE + 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarOuter: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'white',
  },

  avatarOuterSelected: {
    borderWidth: 4,
    borderColor: 'rgba(139, 72, 239, 1)',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // footer
  footer: { marginTop: 36 },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '170%', marginTop: 48
  },
  buttonEnabled: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748b',
    marginTop: 12,
  },
  field: {
    width: '100%',
  },
  label: {
    color: 'rgba(139, 71, 239, 1)',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(139, 71, 239, 1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  wrapper: {
    marginTop: 20,
    width: '85%',
    position: 'relative',
    height: 170
  },
  cloudWrap: {
    position: 'absolute',
    top: 0,
    left: PENG_WIDTH - PENG_WIDTH * 0.3,
    zIndex: 2,
    alignItems: 'center',
  },
  cloud: {
    width: CLOUD_WIDTH,
    alignItems: 'center',
    // height: 100,
    justifyContent: 'center',
    paddingTop: 12, paddingRight: 12, paddingLeft: 16, paddingBottom: 16
  },
  cloudImage: {
    resizeMode: 'contain',
  },
  cloudText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12
  },
  penguin: {
    width: PENG_WIDTH,
    height: 100,
    zIndex: 1,
    marginTop: 45
  },
  tagline: {
    width: '90%',
    textAlign: 'center',
    fontSize: 16,
    color: '#374151',
    marginTop: 30,
    lineHeight: 27.2
  },
  bottomSpacer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '18%',
  },
});
