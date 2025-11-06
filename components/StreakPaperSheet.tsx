import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Modal,
  Pressable,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SHEET_WIDTH = Math.min(420, width - 24);
const SHEET_HEIGHT = Math.min(360, height * 0.6);

export default function PaperSheetModal({
  title = 'Start Your Journey!',
  subtitle = 'Complete a 15min Interview to get started',
  xpSteps = [35, 50, 100, 120],
  visible = false,
  onRequestClose = () => {},
  onStart = () => {},
  showTrigger = false, // if true renders the invisible touch area that opens modal
  onOpenRequest = () => {},
}) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 240,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  // Optional invisible trigger for quick demos
  const Trigger = () => (
    <Pressable
      accessibilityLabel="open sheet"
      onPress={onOpenRequest}
      style={styles.trigger}
    >
      <View />
    </Pressable>
  );

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {showTrigger ? <Trigger /> : null}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onRequestClose}
      >
        <View style={styles.modalHost}>
          <Animated.View style={[styles.backdrop, { opacity }]} />

          <Animated.View
            style={[styles.sheetWrapper, { transform: [{ translateY }] }]}
            pointerEvents="box-none"
          >
            <View style={styles.sheet}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={require('../assets/images/Group.png')}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>

              <View style={styles.progressRow}>
                <View style={styles.flameIcon}>
                  <Text style={styles.flameText}>🔥</Text>
                </View>
                <View style={styles.stepsRow}>
                  {xpSteps.map((n, i) => (
                    <View key={i} style={styles.stepItem}>
                      <View style={styles.stepDot} />
                      <Text style={styles.stepLabel}>{n} XP</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  onStart();
                  onRequestClose();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>LET'S START THE INTERVIEW</Text>
              </TouchableOpacity>

              <Pressable style={styles.closeArea} onPress={onRequestClose} />
            </View>
          </Animated.View>

          {/* catch taps outside sheet to close modal */}
          <Pressable style={styles.outsidePress} onPress={onRequestClose} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  trigger: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    height: 56,
    backgroundColor: 'transparent',
  },
  modalHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrapper: {
    alignSelf: 'center',
    width: SHEET_WIDTH,
    height: SHEET_HEIGHT,
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  sheet: {
    borderRadius: 20,
    paddingTop: 36,
    paddingHorizontal: 20,
    paddingBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
    height: SHEET_HEIGHT,
  },
  avatarWrapper: {
    position: 'absolute',
    top: -100,
    borderRadius: 12,
    // overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: 100,
  },
  cropOverlay: {
    position: 'absolute',
    left: 6,
    top: 6,
    right: 6,
    bottom: 6,
    borderRadius: 8,
  },
  dimensionsBadge: {
    position: 'absolute',
    top: 94,
    backgroundColor: '#1e90ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dimText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    marginTop: 48,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressRow: {
    marginTop: 18,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameIcon: {
    width: 54,
    height: 54,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#f3c667',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  flameText: {
    fontSize: 22,
  },
  stepsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  button: {
    marginTop: 18,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  outsidePress: {
    height: 20,
  },
  closeArea: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 36,
    height: 36,
  },
});

/*
Usage

Parent controls visibility. Example:

import React, { useState } from 'react'
import { SafeAreaView, Button } from 'react-native'
import PaperSheetModal from './PaperSheetModal'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Button title="Open modal" onPress={() => setOpen(true)} />

      <PaperSheetModal
        visible={open}
        onRequestClose={() => setOpen(false)}
        avatar={{ uri: 'https://placekitten.com/200/200' }}
        onStart={() => console.log('start interview')}
      />
    </SafeAreaView>
  )
}

Notes
- The component now uses React Native Modal so it behaves like a true modal.
- Parent controls visible prop and handles closing with onRequestClose.
- I can add drag to dismiss or integrate react-native-reanimated if you want smoother native animations.
*/
