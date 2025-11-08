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
} from 'react-native';
import { AppStateContext } from './AppContext';
import { API_URL, JAVA_API_URL } from './config';
import fetchWithAuth from '../libs/fetchWithAuth';
import Toast from 'react-native-toast-message';

export default function AvatarSelectionScreen() {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  console.log(userProfile);
  // build 14 avatar urls
  const avatars = useMemo(() => {
    const base =
      'https://docsightaistorageprod.blob.core.windows.net/avatar/avatar';
    return Array.from({ length: 20 }, (_, i) => `${base}${i + 1}.png`);
  }, []);

  const selectedAvatar = selectedIndex !== null ? avatars[selectedIndex] : null;

  const handleContinue = async () => {
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
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Choose your avatar</Text>
        <Text style={styles.subtitle}>Select one avatar to represent you</Text>
      </View>

      <View style={styles.previewContainer}>
        <View style={styles.previewWrapper}>
          {selectedAvatar ? (
            <Image
              source={{ uri: selectedAvatar }}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewPlaceholderText}>Preview</Text>
            </View>
          )}
        </View>
        <Text style={styles.previewLabel}>
          {selectedIndex !== null
            ? `Selected avatar #${selectedIndex + 1}`
            : 'No avatar selected'}
        </Text>
      </View>

      <FlatList
        data={avatars}
        renderItem={renderItem}
        keyExtractor={(_, idx) => String(idx)}
        numColumns={4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.gridContent,
          { alignItems: 'center', paddingHorizontal: 0 },
        ]}
      />

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
            <Text style={styles.buttonText}>Get started</Text>
          )}
        </TouchableOpacity>

        {/* <Text style={styles.footerNote}>
          You can change this later in profile settings
        </Text> */}
      </View>
    </View>
  );
}

// Calculate column gaps so squares fill exactly
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_HORIZONTAL_PADDING = 16;
const COLUMNS = 4;
const SIDE_MARGIN = 8;
const totalSideMargins = COLUMNS * SIDE_MARGIN * 2;
const available =
SCREEN_WIDTH - CONTAINER_HORIZONTAL_PADDING * 2 - totalSideMargins;
const CELL_SIZE = Math.floor(available / COLUMNS);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 20,
  },
  previewWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
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
    paddingBottom: 24,
  },

  avatarCell: {
    width: CELL_SIZE,
    height: CELL_SIZE + 16, // allow vertical padding for touch area and label space
    paddingVertical: 8,
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
    borderWidth: 3,
    borderColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: CELL_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Image fills the inner wrapper exactly
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // footer
  footer: {
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#4f46e5',
  },
  buttonDisabled: {
    backgroundColor: '#4f46e5',
    opacity: 0.6,
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
});
