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
} from 'react-native';
import { AppStateContext } from './AppContext';
import { API_URL, JAVA_API_URL } from './config';
import fetchWithAuth from '../libs/fetchWithAuth';
import Toast from 'react-native-toast-message';

export default function AvatarSelectionScreen({ route }) {
  const { selectedIndustry, selectedRole, selectedLevel } = route.params;
  const [step, setStep] = useState(1);

  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [userName, setUserName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  console.log(userProfile);
  // build 14 avatar urls
  const avatars = useMemo(() => {
    const base =
      'https://docsightaistorageprod.blob.core.windows.net/avatar/avatar';
    return Array.from({ length: 6 }, (_, i) => `${base}${i + 1}.png`);
  }, []);

  const selectedAvatar = selectedIndex !== null ? avatars[selectedIndex] : null;

  const handleContinue = async () => {
    if (step === 1 && selectedAvatar) {
      setStep(2);
      return;
    }
    console.log(
      selectedIndustry,
      selectedRole,
      selectedLevel,
      selectedAvatar,
      userName,
    );
    return;
    if (!userProfile?.uid) {
      console.error('Missing userProfile.uid', userProfile);
      Toast.show({
        type: 'error',
        text1: 'User',
        text2: 'Invalid User.',
      });
      return;
    }
    if (!selectedAvatar) {
      console.error('Missing avatar');
      Toast.show({
        type: 'error',
        text1: 'Select Avatar',
        text2: 'Please choose an avatar.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetchWithAuth(
        `${API_URL}/profiles/${userProfile?.uid}/update-role/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'candidate', url: selectedAvatar }),
        },
      );

      if (res.status === 200) {
        const body = {
          uid: userProfile.uid,
          firstName: userProfile?.first_name,
          lastName: userProfile?.last_name,
          email: userProfile?.email,
        };
        const candidateRes = await fetchWithAuth(
          `${JAVA_API_URL}/api/candidates/save`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        );

        if (candidateRes.status === 200) {
          setUserProfile({
            ...userProfile,
            role: 'candidate',
            avatar: selectedAvatar,
          });
        } else {
          console.error(
            'Failed to save candidate. Status:',
            candidateRes.status,
          );
        }
      }
    } catch (error) {
      console.error('Error during handleContinue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render each grid item. wrapper uses aspectRatio to ensure square equal to column width.
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
        <View
          style={[
            styles.avatarOuter, // outer aligns the circle and provides optional shadow
            isSelected ? styles.avatarOuterSelected : null,
          ]}
        >
          <View style={styles.avatarInner}>
            <Image
              source={{ uri: item }}
              resizeMode="cover"
              accessibilityLabel={`Avatar ${index + 1}`}
              style={styles.avatarImage}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <View style={styles.previewWrapper}>
          <Image
            source={require('../assets/images/talkingPenguine.png')}
            style={styles.previewImage}
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {step === 1 ? 'Choose your avatar' : 'What should I call you?'}
          </Text>
        </View>
      </View>
      <View style={styles.screenWrap}>
        {step === 1 ? (
          <View>
            <FlatList
              data={avatars}
              renderItem={renderItem}
              keyExtractor={(_, idx) => String(idx)}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.gridContent,
                { alignItems: 'center', paddingHorizontal: 0 },
              ]}
            />
          </View>
        ) : (
          <View style={{ width: '100%', marginHorizontal: 'auto' }}>
            <View style={styles.field}>
              <Text style={styles.label}>Your Full Name</Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter name"
                keyboardType="default"
                style={styles.input}
                placeholderTextColor="rgba(139, 71, 239, 0.4)"
                maxLength={15}
                editable={!isLoading}
              />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleContinue}
            disabled={isLoading || !selectedAvatar}
            accessibilityRole="button"
            style={[
              styles.button,
              isLoading || !selectedAvatar
                ? styles.buttonDisabled
                : styles.buttonEnabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Calculate column gaps so squares fill exactly
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_HORIZONTAL_PADDING = 16;
const COLUMNS = 3;
const SIDE_MARGIN = 8;
const totalSideMargins = COLUMNS * SIDE_MARGIN * 2;
const available =
  SCREEN_WIDTH - CONTAINER_HORIZONTAL_PADDING * 2 - totalSideMargins;
// const CELL_SIZE = Math.floor(available / COLUMNS);
const CELL_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 32,
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
    marginBottom: 36,
  },
  previewWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: { marginBottom: 40 },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
  },
  previewPlaceholderText: {
    color: '#4f46e5',
  },
  previewLabel: {
    fontSize: 14,
    color: '#475569',
    marginTop: 12,
  },

  // grid
  gridContent: {
    paddingBottom: 48,
  },

  avatarCell: {
    width: CELL_SIZE,
    height: CELL_SIZE + 16, // allow vertical padding for touch area and label space
    // paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIDE_MARGIN,
  },

  // Outer wrapper controls shadow and selected border. No inner padding
  avatarOuter: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Selected variant: thicker border and shadow. still no extra padding
  avatarOuterSelected: {
    borderWidth: 5,
    borderColor: 'rgba(139, 72, 239, 1)',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarInner: {
    borderRadius: CELL_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Image fills the inner wrapper exactly
  avatarImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },

  // footer
  footer: { marginTop: 36 },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '170%',
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
  screenWrap: {
    flex: 1,
    width: '85%',
    marginHorizontal: 'auto',
    justifyContent: 'flex-start',
  },
});
