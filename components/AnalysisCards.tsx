// AnalysisCards.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GradientBorderView } from '@good-react-native/gradient-border';
import PlayButton from '../assets/images/playButton.svg';

export default function AnalysisCards({
  strengths = [],
  weaknesses = [],
  setShowImprovementPoints,
}) {
  const [openItem, setOpenItem] = useState(null); // 'strengths' | 'weaknesses' | null

  const open = key => setOpenItem(key);
  const close = () => setOpenItem(null);

  const renderCard = (key, title, subtitle) => (
    <Pressable
      onPress={() => open(key)}
      style={styles.cardWrapper}
      accessibilityRole="button"
    >
      <GradientBorderView
        gradientProps={{
          colors: ['rgba(203,104,195,1)', 'rgba(108,110,196,1)'],
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
        }}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 5,
          borderRadius: 16,
          height: "100%"
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.playRow}>
            <PlayButton />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </GradientBorderView>
    </Pressable>
  );

  const renderListItems = (items, type) => {
    if (!items || items.length === 0) {
      return <Text style={styles.emptyText}>No items found</Text>;
    }

    return items.map((it, idx) => {
      const text = typeof it === 'string' ? it : it.text ?? '';
      const icon = type === 'strengths' ? '✓' : '✕';
      const iconBgStyle =
        type === 'strengths' ? styles.iconBgStrength : styles.iconBgWeak;

      return (
        <View key={idx} style={styles.listRow}>
          <View style={[styles.iconWrap, iconBgStyle]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <Text style={styles.itemText}>{text}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderCard(
          'strengths',
          'Strengths',
          'Tap to view the analyzed strength.',
        )}
        {renderCard(
          'weaknesses',
          'Weaknesses',
          'Tap to view the analyzed weakness.',
        )}
      </View>

      <Modal
        visible={!!openItem}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.modalFull}>
          {/* backdrop first, absolute so it does not intercept touches for content above */}
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />

          {/* modal content rendered after backdrop so it sits on top and receives touches */}
          <View style={styles.center}>
            <PlayButton width={50} height={50} />
            <View style={styles.cardModal}>
              <Text
                style={[
                  styles.modalTitle,
                  openItem === 'strengths'
                    ? styles.strengthTitle
                    : styles.weakTitle,
                ]}
              >
                {openItem === 'strengths' ? 'Strength' : 'Weakness'}
              </Text>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {openItem === 'strengths' &&
                  renderListItems(strengths, 'strengths')}
                {openItem === 'weaknesses' &&
                  renderListItems(weaknesses, 'weaknesses')}
              </ScrollView>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Pressable
                  onPress={() => setShowImprovementPoints(true)}
                  style={styles.ctaWrap}
                >
                  <LinearGradient
                    colors={['rgba(85, 95, 238, 1)', 'rgba(140, 70, 239, 1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cta}
                  >
                    <Text style={styles.ctaText}>How to Improve</Text>
                  </LinearGradient>
                </Pressable>
              </View>
              <Pressable onPress={close} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', aspectRatio: 1, },
  cardContent: {
    paddingTop:"30%",
    borderRadius: 10,
    height: "100%",
    overflow: 'hidden',
    backgroundColor: 'rgba(58,55,55,0.25)',
    position: "relative",
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    position: "absolute",
    top: 0,
    right: 0,
    opacity: 0.3
  },
  cardText: { paddingHorizontal: 12, paddingBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#000' },
  cardSubtitle: { fontSize: 13, color: '#333', opacity: 0.9, marginTop: 6 },
  modalFull: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardModal: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '60%',
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    padding: 24,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(88, 94, 238, 1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  strengthTitle: { color: '#2e7d32' },
  weakTitle: { color: '#c62828' },
  scroll: { marginTop: 8 },
  scrollContent: { paddingBottom: 12 },
  emptyText: { fontSize: 14, color: '#666', paddingVertical: 8 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBgStrength: { backgroundColor: '#2e7d32' },
  iconBgWeak: { backgroundColor: '#c62828' },
  iconText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  itemText: { flex: 1, fontSize: 15, color: '#222' },
  ctaWrap: { marginTop: 12, borderRadius: 10, overflow: 'hidden' },
  cta: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: '#111' },
});
