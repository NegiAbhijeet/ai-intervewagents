// CandidatePricing.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { AppStateContext } from '../components/AppContext';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../components/config';
import PaymentPopup from '../components/PaymentPopup';
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
        {text} {priceValue ? `(${formatPrice(priceValue)})` : ''}
      </Text>
    </TouchableOpacity>
  );
}

export default function PricingPage() {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billingSelected, setBillingSelected] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/plans`, {
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

          return {
            id: p.id,
            name: p.name,
            description: p.description ?? p.name,
            icon:
              typeof defaultIcon === 'function' ? defaultIcon(p.name) : null,
            prices,
            buttonText:
              p.id === 1
                ? 'Start Free'
                : p.id === 5
                ? 'Book a Demo'
                : 'Buy Now',
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

  const handlePerPlanToggle = planId => {
    setBillingSelected(prev => {
      const current = prev[planId] === 'yearly' ? 'monthly' : 'yearly';
      return { ...prev, [planId]: current };
    });
  };

  const effectiveBillingFor = plan => {
    const selected = billingSelected[plan.id];
    if (selected && plan.prices.some(pr => pr.interval === selected))
      return selected;
    if (plan.prices.some(pr => pr.interval === 'monthly')) return 'monthly';
    if (plan.prices.some(pr => pr.interval === 'yearly')) return 'yearly';
    return plan.prices[0]?.interval || 'monthly';
  };

  const onBuyPress = (plan, priceObj, billing) => {
    // if plan id 1 and user exists, go to dashboard
    if (plan.id === 1 && userProfile?.uid) {
      navigation.navigate('Dashboard');
      return;
    }
    // if plan is demo id 5 open calendly link
    if (plan.id === 5) {
      Linking.openURL('https://calendly.com/saurabhdocsightai-com/30min');
      return;
    }
    // if not logged in send to login
    if (!userProfile?.uid) {
      navigation.navigate('Login');
      return;
    }
    // otherwise open payment modal
    setSelectedPlan({
      ...plan,
      selectedPrice: priceObj,
      selectedBilling: billing,
    });
    setPaymentModalVisible(true);
  };

  const renderPlan = ({ item: plan }) => {
    const effectiveBilling = effectiveBillingFor(plan);
    const priceObj =
      plan.prices.find(pr => pr.interval === effectiveBilling) ||
      plan.prices.find(pr => pr.interval === 'monthly') ||
      plan.prices[0] ||
      null;
    const displayPrice = formatPrice(priceObj?.price);
    const displayPeriodLabel =
      effectiveBilling === 'monthly' ? '/month' : '/year';
    const features =
      typeof priceObj?.features === 'string'
        ? priceObj.features
            .split(',')
            .map(f => f.trim())
            .filter(Boolean)
        : [];

    const hasMonthly = plan.prices.some(pr => pr.interval === 'monthly');
    const hasYearly = plan.prices.some(pr => pr.interval === 'yearly');
    const showToggle = hasMonthly && hasYearly;

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

        {showToggle && (
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => handlePerPlanToggle(plan.id)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                Billing:{' '}
                {billingSelected[plan.id] === 'yearly' ? 'Yearly' : 'Monthly'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
              <Text style={styles.buttonText}>Current Plan</Text>
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
              onPay={() => onBuyPress(plan, priceObj, effectiveBilling)}
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
      {userProfile?.uid && (
        <PaymentPopup
          visible={paymentModalVisible}
          selectedPlan={selectedPlan}
          onClose={() => {
            setPaymentModalVisible(false);
            setSelectedPlan(null);
          }}
          uid={userProfile?.uid}
          setUserProfile={setUserProfile}
        />
      )}
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
});
