// CandidatePricing.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AppStateContext } from '../components/AppContext';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../components/config';
import fetchWithAuth from '../libs/fetchWithAuth';
import { useIAP, ErrorCode } from 'react-native-iap';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

const formatPrice = p =>
  p === null || p === undefined ? 'Custom pricing' : `₹ ${p}`;

const defaultIconLetter = (name = '') => {
  const n = name.toString().trim().toUpperCase().slice(0, 1);
  return n || 'P';
};

// Simple skeleton row
function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSubtitle} />
      <View style={styles.skeletonPrice} />
      <View style={styles.skeletonFeatures} />
      <View style={styles.skeletonButton} />
    </View>
  );
}

// Minimal PaymentButton that calls the onPay function
function PaymentButton({ priceValue, onPay, text = 'Buy Now', disabled }) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onPay()}
      style={[styles.button, disabled && styles.buttonDisabled]}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>
        {text}
        {/* {priceValue ? `(${formatPrice(priceValue)})` : ''} */}
      </Text>
    </TouchableOpacity>
  );
}

export default function PricingPage() {
  const { userProfile, setUserProfile, language } = useContext(AppStateContext);
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false)
  const { t } = useTranslation();
  const {
    connected,
    requestPurchase,
    requestSubscription,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
        console.log(purchase)
        await completePurchase(purchase)
      } catch (err) {
        console.error('finishTransaction error', err);
      }
    },
    onPurchaseError: (err) => {
      if (err?.code !== ErrorCode.UserCancelled) {
        console.error('onPurchaseError', err);
      }
    },
  });
  async function completePurchase(purchase) {
    try {
      setIsFetching(true);
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
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error || 'Failed to create interview.';
        throw new Error(message);
      }

      const result = await response.json().catch(() => ({}));
      if (result?.user) {
        setUserProfile(result.user)
        navigation.navigate('AppTabs', { screen: 'profile' });
      }
    } catch (err) {
      console.error('Setup failed:', err);
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    const controller = new AbortController();

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(`${API_URL}/api/plans/?language_code=${language}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to load plans: ${res.status} ${text}`);
        }

        const data = await res.json();
        console.log('raw plans response:', data);

        // support array responses and wrapped responses like { plans: [...] } or { data: [...] }
        const plansArray = Array.isArray(data)
          ? data
          : data.plans ?? data.data ?? [];
        if (!Array.isArray(plansArray))
          throw new Error('Unexpected response shape: expected array of plans');

        const filtered = plansArray
          .filter(p => p && typeof p.id === 'number')
          .filter(p => p.id !== 6 && p.id !== 7)
          .filter(p => p.id === 1 || p.id === 2);

        const transformed = filtered.map(p => {
          const rawPrices =
            p.prices == null
              ? []
              : Array.isArray(p.prices)
                ? p.prices
                : [p.prices];

          const prices = rawPrices.map(pr => ({
            id: pr.id,
            interval: pr.interval,
            price: pr.price,
            features: pr.features ?? null,
            is_active: pr.is_active,
            total_seconds: pr.total_seconds ?? 0,
            free_seconds: pr.free_seconds ?? 0,
            max_sub_users: pr.max_sub_users ?? 0,
            plan: pr.plan ?? null,
          }));
          const myPrice = Array.isArray(p.prices)
            ? p.prices[0]
            : p.prices;
          return {
            id: p.id,
            name: myPrice.plan_name,
            description: myPrice.plan_name ?? p.plan_name,
            icon:
              typeof defaultIcon === 'function' ? defaultIcon(p.name) : null,
            prices,
            buttonText: myPrice?.button_text,
            max_sub_users: p.max_sub_users ?? 0,
          };
        });

        setPlans(transformed);
      } catch (err) {
        console.error('fetchPlans error:', err);
        setError(err.message ?? 'Unable to load plans.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    return () => controller.abort();
  }, []);

  const onBuyPress = async (plan) => {
    if (plan.id === 1 && userProfile?.uid) {
      navigation.navigate('Dashboard');
      return;
    }
    // if plan is demo id 5 open calendly link
    if (plan.id === 5) {
      Linking.openURL('https://calendly.com/saurabhdocsightai-com/30min');
      return;
    }
    if (!userProfile?.uid) {
      navigation.navigate('Login');
      return;
    }
    if (!connected) {
      Toast.show({ type: 'error', text1: 'Failed to process.' })
      return;
    }
    let productId = "starter_plan"
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
      console.error('request purchase/subscription error', e);
    }
  };

  const renderPlan = ({ item: plan }) => {
    const priceObj = plan.prices[0] || null;
    const displayPrice = formatPrice(priceObj?.price);
    const displayPeriodLabel = "/month"
    const features =
      typeof priceObj?.features === 'string'
        ? priceObj.features
          .split(',')
          .map(f => f.trim())
          .filter(Boolean)
        : [];

    const isCurrentPlan = userProfile?.plan?.id === plan?.id;

    return (
      <TouchableOpacity activeOpacity={0.95} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconLetter}>
              {defaultIconLetter(plan.name)}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDesc}>{plan.description}</Text>
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
              <Text style={styles.buttonText}>{t("currentPlan")}</Text>
            </View>
          ) : plan.id === 5 ? (
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://calendly.com/saurabhdocsightai-com/30min',
                )
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>{plan.buttonText}</Text>
            </TouchableOpacity>
          ) : plan.id === 1 ? (
            <TouchableOpacity
              onPress={() => {
                if (!userProfile?.uid) navigation.navigate('Login');
              }}
              style={[styles.button, styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>{plan.buttonText}</Text>
            </TouchableOpacity>
          ) : (
            <PaymentButton
              priceValue={priceObj?.price}
              text={plan.buttonText}
              onPay={() => onBuyPress(plan)}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
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
        keyExtractor={item => item.id.toString()}
        renderItem={renderPlan}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No candidate plans available</Text>
          </View>
        }
      />
    </View>
  );
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
