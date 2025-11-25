import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  Text,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default function InterviewSummaryModal({
  visible,
  onClose,
  summaryText = '',
}) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* parent uses box-none so children can decide pointer handling */}
      <View style={styles.container} pointerEvents="box-none">
        {/* backdrop fills screen and closes modal on press */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* actual modal content rendered after the backdrop so it sits on top */}
        {/* give it pointerEvents="auto" explicitly to be clear */}
        <View style={styles.center} pointerEvents="auto">
          <View style={styles.card}>
            <Text style={styles.title}>{t('reports.interviewSummary')}</Text>


            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="always"
            >
              {/* long text for testing */}
              <Text style={styles.bodyText}>{summaryText || ''}</Text>
            </ScrollView>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2e7d32',
  },
  scroll: { marginTop: 8 },
  scrollContent: { paddingBottom: 12 },
  bodyText: { fontSize: 15, lineHeight: 24, color: '#111' },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: '#111' },
});
