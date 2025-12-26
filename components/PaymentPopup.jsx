import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Keyboard,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay'; // install react-native-razorpay
import { useNavigation } from '@react-navigation/native';
import fetchWithAuth from '../libs/fetchWithAuth';
import { API_URL } from './config';
import fetchUserDetails from '../libs/fetchUser';
import Toast from 'react-native-toast-message';

export default function PaymentPopup({
  selectedPlan,
  onClose,
  uid,
  visible,
  setUserProfile,
  selecteMonths
}) {
  const navigation = useNavigation();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isRedeemLoading, setIsRedeemLoading] = useState(false);
  // discount and amounts
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // interval state: this will hold the selected interval string from price.interval
  const [selectedInterval, setSelectedInterval] = useState(null);

  // build billing options from selectedPlan.prices
  const billingOptions = (selectedPlan?.prices || [])
    .filter(p => p) // drop falsy
    .map(p => {
      // keep interval as-is (monthly/yearly or numeric string)
      const label =
        p.interval === 'yearly' || p.interval === '12' || p.interval === 12
          ? '1Y'
          : p.interval === 'monthly' || p.interval === '1' || p.interval === 1
            ? '1M'
            : `${String(p.interval)}M`;
      return {
        id: p.id,
        interval: String(p.interval),
        price: Number(p.price ?? 0),
        label,
        raw: p,
      };
    });

  // Set initial selected interval and reset coupon state when plan changes
  useEffect(() => {
    // reset coupon and discount state
    setAppliedCoupon('');
    setDiscountAmount(0);
    setDiscountPercentage(0);
    setCouponCode('');
    // select first available interval if present
    if (billingOptions.length > 0) {
      // choose monthly if available, else first
      const monthly = billingOptions.find(
        b => b.interval === 'monthly' || b.interval === '1',
      );
      setSelectedInterval(
        prev =>
          prev ?? (monthly ? monthly.interval : billingOptions[0].interval),
      );
      // set final amount to base of selected
      const base = (monthly ? monthly.price : billingOptions[0].price) || 0;
      setFinalAmount(Number(base.toFixed(2)));
    } else {
      setSelectedInterval(null);
      setFinalAmount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan]); // only when selectedPlan changes
  useEffect(() => {
    if (selecteMonths) {
      setSelectedInterval(String(selecteMonths));
    }
  }, [selecteMonths]);
  // compute base amount for currently selected interval
  const baseAmount = (() => {
    if (!selectedPlan || !selectedInterval) return 0;
    const found =
      (selectedPlan.prices || []).find(
        pr => String(pr.interval) === String(selectedInterval),
      ) ||
      selectedPlan.prices?.[0] ||
      null;
    return Number(found?.price ?? 0);
  })();

  // keep final amount in sync if base or discounts change
  useEffect(() => {
    const computedDiscountAmount =
      discountAmount ||
      Math.round((baseAmount * (discountPercentage || 0)) / 100);
    const computedFinal = Math.max(0, baseAmount - computedDiscountAmount);
    setFinalAmount(Number(computedFinal.toFixed(2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseAmount, discountPercentage, discountAmount]);

  const handleRedeem = async () => {
    if (!couponCode.trim()) return;
    Keyboard.dismiss();
    setIsRedeemLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/coupons/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          planId: selectedPlan?.id,
          planInterval: String(selectedInterval ?? 'monthly'),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to verify coupon');
      }
      const data = await res.json();
      setDiscountPercentage(Number(data?.discount_percentage || 0));
      setFinalAmount(Number((data?.payable_amount ?? baseAmount).toFixed(2)));
      setDiscountAmount(Number(data?.discount_amount ?? 0));
      setAppliedCoupon(couponCode.trim().toUpperCase());
      setCouponCode('');
    } catch (err) {
      console.error('Error verifying coupon', err);
      Alert.alert('Coupon error', err.message || 'Unable to verify coupon');
    } finally {
      setIsRedeemLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setDiscountPercentage(0);
    setDiscountAmount(0);
    setFinalAmount(Number(baseAmount.toFixed(2)));
  };

  const refreshUserProfile = async () => {
    try {
      setIsUpdating(true);
      const profile = await fetchUserDetails(uid);
      setUserProfile(profile);
    } catch (err) {
      console.log('Error fetching user details:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const startPayment = async () => {
    if (!selectedPlan) return;
    if (!uid) {
      Alert.alert('Error', 'Something went wrong, please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        planId: selectedPlan.id,
        uid,
        planInterval: String(selectedInterval ?? '1'),
        couponCode: appliedCoupon || '',
      };

      const res = await fetchWithAuth(`${API_URL}/create-order/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // parse once and handle non-JSON responses
      let body;
      try {
        body = await res.json();
      } catch (err) {
        const text = await res.text().catch(() => '');
        console.error('create-order: non-json response', text);
        throw new Error('Invalid server response from create-order');
      }

      if (!res.ok) {
        console.error('create-order failed', res.status, body);
        throw new Error(
          body?.error || body?.message || 'Failed to create order',
        );
      }

      const { order_id, amount: amount_paise, currency, key_id } = body;

      // get public key fallback: config or server endpoint
      let publicKey =
        key_id || global?.RAZORPAY_KEY || process?.env?.RAZORPAY_KEY;
      if (!publicKey) {
        try {
          const keyRes = await fetchWithAuth(`${API_URL}/razorpay-key/`);
          if (keyRes.ok) {
            const keyBody = await keyRes.json();
            publicKey = keyBody?.key_id || keyBody?.publicKey;
          } else {
            console.warn('razorpay-key endpoint returned', keyRes.status);
          }
        } catch (e) {
          console.warn('failed to fetch razorpay key fallback', e);
        }
      }

      if (!publicKey) {
        throw new Error(
          'Payment key missing. Contact support or check backend.',
        );
      }

      if (!order_id || !amount_paise) {
        console.error('Invalid create-order response', body);
        throw new Error('Invalid order data from server');
      }

      const amountNumber = Number(amount_paise);
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        throw new Error('Invalid payment amount');
      }

      const options = {
        key: publicKey,
        amount: amountNumber,
        currency: currency || 'INR',
        name: 'AI Interview Agents',
        description: 'Order payment',
        order_id: order_id,
      };

      console.log('Razorpay options', options);

      RazorpayCheckout.open(options)
        .then(async response => {
          try {
            const verifyRes = await fetchWithAuth(
              `${API_URL}/verify-payment/`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...response, uid }),
              },
            );

            let verifyBody;
            try {
              verifyBody = await verifyRes.json();
            } catch {
              const txt = await verifyRes.text().catch(() => '');
              console.error('verify-payment non-json', txt);
              throw new Error('Invalid verification response');
            }

            if (verifyRes.ok) {
              Toast.show({ type: 'success', text1: 'Payment successful' });
              onClose && onClose();
              await refreshUserProfile();
              navigation.navigate('AppTabs', {
                screen: 'profile',
              })
            } else {
              console.error(
                'verify-payment failed',
                verifyRes.status,
                verifyBody,
              );
              Alert.alert(
                'Error',
                verifyBody?.error || 'Payment verification failed',
              );
            }
          } catch (err) {
            console.error('verify error', err);
            Alert.alert('Error', err.message || 'Verification request failed');
          }
        })
        .catch(err => {
          console.error('payment failed', err);
          Alert.alert('Payment failed', 'Please try again');
        });
    } catch (err) {
      console.error('startPayment error', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      {isUpdating && (
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            flex: 1,
            position: 'absolute',
            inset: 0,
            zIndex: 11,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Payment</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close popup"
            >
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Secure checkout with optional savings
          </Text>

          {/* Interval selection */}
          {billingOptions.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 18,
                flexWrap: 'nowrap',
                gap: 8,
              }}
            >
              {billingOptions.map(opt => {
                const active =
                  String(opt.interval) === String(selectedInterval);
                return (
                  <TouchableOpacity
                    key={`${opt.id}-${opt.interval}`}
                    onPress={() => {
                      if (active) return;
                      setAppliedCoupon('');
                      setDiscountAmount(0);
                      setDiscountPercentage(0);
                      setCouponCode('');
                      setSelectedInterval(opt.interval);
                      setFinalAmount(Number((opt.price || 0).toFixed(2)));
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: active ? '#4338CA' : '#E6E6E6',
                      backgroundColor: active ? '#4338CA' : '#F8FAFF',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: active ? '#fff' : '#0f172a',
                        fontWeight: '700',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.couponRow}>
            <TextInput
              value={couponCode}
              onChangeText={t => setCouponCode(t)}
              placeholder="Enter code (eg SAVE20)"
              placeholderTextColor={"gray"}
              style={styles.input}
              editable={!appliedCoupon}
              returnKeyType="done"
              onSubmitEditing={handleRedeem}
            />
            <TouchableOpacity
              onPress={handleRedeem}
              disabled={
                !couponCode.trim() || isRedeemLoading || !!appliedCoupon
              }
              style={[
                styles.applyButton,
                (isRedeemLoading || !!appliedCoupon) && styles.disabled,
              ]}
            >
              {isRedeemLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.applyText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>

          {appliedCoupon && (
            <View style={styles.couponApplied}>
              <View>
                <Text style={styles.couponAppliedLabel}>Coupon Applied</Text>
                <Text style={styles.couponCode}>{appliedCoupon}</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{Number(baseAmount).toFixed(2)}
              </Text>
            </View>

            {appliedCoupon && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.discountLabel}>
                    Discount ({Number(discountPercentage).toFixed(2)}%)
                  </Text>
                  <Text style={styles.discountValue}>
                    -₹{Number(discountAmount).toFixed(2)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <View style={styles.totalRight}>
                <Text style={styles.youPay}>You pay</Text>
                <Text style={styles.totalValue}>
                  ₹{Number(finalAmount).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={startPayment}
            disabled={loading}
            style={[styles.payButton, loading && styles.disabled]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payText}>Pay Now</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your payment is secure and encrypted
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: '700' },
  close: { color: '#6b7280', fontWeight: '600' },
  subtitle: { color: '#6b7280', marginBottom: 12 },

  couponRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#fff',
  },
  applyButton: {
    backgroundColor: '#4338ca',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  applyText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },

  couponApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  couponAppliedLabel: { color: '#065f46', fontSize: 12, fontWeight: '600' },
  couponCode: { color: '#064e3b', fontWeight: '700' },
  remove: { color: '#065f46', fontWeight: '700' },

  summary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6eef8',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: { color: '#475569', fontWeight: '600' },
  summaryValue: { color: '#0f172a', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#e6e6e6', marginVertical: 6 },
  discountLabel: { color: '#059669', fontWeight: '700' },
  discountValue: { color: '#059669', fontWeight: '800' },

  totalRow: { paddingTop: 6 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalRight: { alignItems: 'flex-end' },
  youPay: { fontSize: 12, color: '#6b7280' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#111827' },

  payButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  payText: { color: '#fff', fontWeight: '800' },

  footer: { alignItems: 'center', paddingVertical: 4 },
  footerText: { color: '#6b7280', fontSize: 12 },
});
