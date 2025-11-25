import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  Text,
  View,
  ScrollView,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';

export default function ImprovementsPoints({ visible, onClose, data = [] }) {
  const { t } = useTranslation()

  const openLink = async url => {
    try {
      const safeUrl =
        typeof url === 'string' && !/^https?:\/\//i.test(url)
          ? `https://${url}`
          : url
      const supported = await Linking.canOpenURL(safeUrl)
      if (supported) {
        await Linking.openURL(safeUrl)
      } else {
        Alert.alert(
          t('improvements.cannotOpenLinkTitle'),
          t('improvements.cannotOpenLinkMsg'),
        )
      }
    } catch (err) {
      Alert.alert(t('improvements.errorTitle'), t('improvements.errorMsg'))
    }
  }

  const renderItem = (item, idx) => {
    const text = typeof item === 'string' ? item : item.step ?? ''
    const url = item.resource ?? null

    return (
      <View key={idx} style={styles.row}>
        <View style={styles.bullet}>
          <Text style={styles.bulletText}>✓</Text>
        </View>

        <View style={styles.flex1}>
          <Text style={styles.itemText}>{text}</Text>

          {url ? (
            <Pressable
              onPress={() => openLink(url)}
              style={styles.resourceButton}
            >
              <Text style={styles.resourceText}>{t('improvements.openResource')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.full}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>{t('improvements.title')}</Text>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {!data || data.length === 0 ? (
                <Text style={styles.empty}>{t('improvements.empty')}</Text>
              ) : (
                data.map((it, i) => renderItem(it, i))
              )}
              <View style={{ height: 8 }} />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
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
    padding: 12,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2e7d32',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 15, color: '#111' },
  scroll: { marginTop: 8 },
  scrollContent: { paddingBottom: 12 },
  empty: { fontSize: 14, color: '#666', paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  bulletText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  flex1: { flex: 1 },
  itemText: { fontSize: 15, color: '#111', marginBottom: 8 },
  resourceButton: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  resourceText: { fontSize: 13 },
});
