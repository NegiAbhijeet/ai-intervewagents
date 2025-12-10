// CandidatePricing.js
import React, { useEffect, useState, useContext, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { AppStateContext } from '../components/AppContext'
import { useNavigation } from '@react-navigation/native'
import { API_URL } from '../components/config'
import fetchWithAuth from '../libs/fetchWithAuth'
import { useIAP, ErrorCode } from 'react-native-iap'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

const defaultIconLetter = (name = '') => {
  const n = name.toString().trim().toUpperCase().slice(0, 1)
  return n || 'P'
}

const formatFallbackPrice = p =>
  p === null || p === undefined ? 'Custom pricing' : `₹ ${p}`

function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSubtitle} />
      <View style={styles.skeletonPrice} />
      <View style={styles.skeletonFeatures} />
      <View style={styles.skeletonButton} />
    </View>
  )
}

function PaymentButton({ onPay, text = 'Buy Now', disabled }) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onPay()}
      style={[styles.button, disabled && styles.buttonDisabled]}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  )
}

export default function PricingPage({ skus = ['starter_plan', "test_plan"] }) {
  const { userProfile, setUserProfile, language } = useContext(AppStateContext)
  const navigation = useNavigation()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const { t } = useTranslation()
  const fetchedRef = useRef(false)
  const {
    connected,
    subscriptions,
    fetchProducts,
    requestPurchase,
    requestSubscription,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async purchase => {
      try {
        await finishTransaction({ purchase, isConsumable: false })
        await completePurchase(purchase)
      } catch (err) {
        console.error('finishTransaction error', err)
      }
    },
    onPurchaseError: err => {
      if (err?.code !== ErrorCode.UserCancelled) {
        console.error('onPurchaseError', err)
        Toast.show({ type: 'error', text1: 'Purchase failed' })
      }
    },
  })

  async function completePurchase(purchase) {
    try {
      setIsFetching(true)
      const payload = {
        "uid": userProfile?.uid,
        "productId": purchase?.productId,
        "purchaseToken": purchase?.purchaseToken,
        "packageNameAndroid": purchase?.packageNameAndroid,
        "transactionId": purchase?.id
      }

      const response = await fetchWithAuth(`${API_URL}/mobile-subscription-update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json()
        const message = errorData?.error || 'Failed to create interview.';
        throw new Error(message);
      }

      const result = await response.json()
      if (result?.user) {
        setUserProfile(result.user)
        navigation.navigate('AppTabs', { screen: 'profile' })
        Toast.show({ type: 'success', text1: 'Purchase successful' })
      }
    } catch (err) {
      console.error('completePurchase error:', err)
      Alert.alert('Purchase error', err.message || 'Unable to complete purchase')
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const loadApiPlans = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchWithAuth(`${API_URL}/mobile-plans/?language_code=${language}`)
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Failed to load plans: ${res.status} ${text}`)
        }
        const data = await res.json()
        const apiPlans = Array.isArray(data) ? data : []
        if (!mounted) return
        setPlans(apiPlans)         // UI uses `plans`
      } catch (err) {
        console.error('fetchPlans error:', err)
        if (mounted) setError(err.message ?? 'Unable to load plans')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (language) {
      loadApiPlans()
    }

    return () => { mounted = false }
  }, [language])



  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        // wait briefly for connection if not yet connected
        let attempts = 0
        while (!connected && attempts < 20) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(resolve => setTimeout(resolve, 300))
          attempts += 1
        }

        if (!connected) {
          throw new Error('In-app billing not connected')
        }

        // avoid duplicate fetch
        if (fetchedRef.current) {
          return
        }

        const uniqueSkus = Array.from(new Set((skus || []).filter(Boolean)))
        if (uniqueSkus.length === 0) {
          throw new Error('No SKUs provided')
        }

        try {
          await fetchProducts({ skus: uniqueSkus, type: 'subs' })
        } catch (e) {
          // ignore
          // console.warn('fetchProducts subs failed', e)
        }

        // mark fetched so we do not re-run
        fetchedRef.current = true

        // give the hook a moment to populate products
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => setTimeout(resolve, 600))
      } catch (err) {
        if (!mounted) return
        setError(err.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [connected, skus])

  const onBuyPress = async plan => {
    if (!userProfile?.uid) {
      navigation.navigate('Login')
      return
    }
    if (!connected) {
      Toast.show({ type: 'error', text1: 'Failed to process' })
      return
    }
    const productId = plan?.play_store_product_id
    if (!productId) {
      Alert.alert('Product error', 'Product not configured for this plan')
      return
    }

    try {
      if (typeof requestSubscription === 'function') {
        if (Platform.OS === 'android') {
          await requestSubscription({ request: { android: { skus: [productId] }, ios: { sku: productId } } });
        } else {
          await requestSubscription({ request: { ios: { sku: productId } } });
        }
      } else {
        await requestPurchase({ request: { android: { skus: [productId] }, ios: { sku: productId } } });
      }
    } catch (e) {
      console.error('request purchase/subscription error', e)
      if (e?.code !== ErrorCode.UserCancelled) {
        Toast.show({ type: 'error', text1: 'Purchase request failed' })
      }
    }
  }

  const finalList = Array.isArray(subscriptions) && subscriptions.length > 0 ? subscriptions : []

  const renderPlan = ({ item: plan }) => {
    if (finalList.length === 0) return <></>
    const findPlan = finalList.find((i) => i.id === plan.play_store_product_id)
    const priceObj = plan.prices || null
    const displayPrice =
      plan.play_store_product_id === 'free'
        ? 0
        : findPlan?.displayPrice ??
        (findPlan?.price !== undefined
          ? formatFallbackPrice(priceObj.price)
          : 'Contact us')
    const displayName = plan?.prices?.plan_name
    const displayButtonText = plan?.prices?.button_text
    const displayPeriodLabel = '/month'
    const features =
      typeof priceObj?.features === 'string'
        ? priceObj.features
          .split(',')
          .map(f => f.trim())
          .filter(Boolean)
        : []

    const isCurrentPlan = userProfile?.plan?.id === plan?.id

    return (
      <TouchableOpacity activeOpacity={0.95} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconLetter}>{defaultIconLetter(displayName)}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.planName}>{displayName}</Text>
            <Text style={styles.planDesc}>{displayName}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLarge}>{displayPrice}</Text>
          <Text style={styles.pricePeriod}>{displayPeriodLabel}</Text>
        </View>

        <View style={styles.features}>
          {features.length === 0 ? (
            <Text style={styles.noFeaturesText}>No features listed</Text>
          ) : (
            features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.cardFooter}>
          {isCurrentPlan ? (
            <View style={[styles.button, styles.disabledPrimary]}>
              <Text style={styles.buttonText}>{t('currentPlan') ?? 'Current plan'}</Text>
            </View>
          ) : plan.id === 1 ? (
            <TouchableOpacity
              onPress={() => {
                if (!userProfile?.uid) navigation.navigate('Login')
              }}
              style={[styles.button, styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>{plan.buttonText}</Text>
            </TouchableOpacity>
          ) : (
            <PaymentButton
              priceValue={priceObj?.price}
              text={displayButtonText}
              onPay={() => onBuyPress(plan)}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {isFetching && (
        <Modal transparent visible animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" style={styles.spinner} />
            </View>
          </View>
        </Modal>
      )}

      <FlatList
        data={plans}
        keyExtractor={item => String(item.id)}
        renderItem={renderPlan}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No candidate plans available</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7FA',
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7F7FA',
  },
  listContainer: {
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    marginBottom: 12,
  },
  skeletonCard: {
    width: '100%',
    minHeight: 220,
    justifyContent: 'space-between',
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: '#E6E6E6',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#E6E6E6',
    borderRadius: 6,
    width: '60%',
    marginBottom: 12,
  },
  skeletonPrice: {
    height: 28,
    backgroundColor: '#E6E6E6',
    borderRadius: 6,
    width: '40%',
    marginBottom: 16,
  },
  skeletonFeatures: {
    height: 80,
    backgroundColor: '#E6E6E6',
    borderRadius: 6,
    marginBottom: 16,
  },
  skeletonButton: { height: 44, backgroundColor: '#E6E6E6', borderRadius: 10 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconLetter: { color: '#fff', fontWeight: '700', fontSize: 20 },
  headerText: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  planDesc: { fontSize: 13, color: '#475569', marginTop: 2 },

  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  priceLarge: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  pricePeriod: { marginLeft: 8, color: '#6B7280', fontSize: 14 },

  toggleRow: { alignItems: 'flex-start', marginBottom: 10 },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
  },
  toggleText: { color: '#3730A3', fontWeight: '600' },

  features: { marginTop: 8, marginBottom: 14 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: { marginRight: 8, color: '#10B981', fontSize: 14 },
  featureText: { color: '#334155', flex: 1 },
  noFeaturesText: { color: '#9CA3AF' },

  cardFooter: { marginTop: 8 },
  button: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontWeight: '700' },

  disabledPrimary: { backgroundColor: '#94a3b8' },

  errorText: { color: '#B91C1C' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#475569' },

  // modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  modalPlanName: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  modalPrice: { fontSize: 16, color: '#374151', marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonPrimary: { backgroundColor: '#0f172a' },
  modalButtonText: { color: '#0f172a', fontWeight: '700' },
  modalButtonTextPrimary: { color: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinnerContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10
  },
  spinner: {
    transform: [{ scale: 1 }]
  }
});
