import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { AppStateContext } from '../components/AppContext';
import { API_URL } from '../components/config';
import fetchWithAuth from '../libs/fetchWithAuth';

import Layout from './Layout';
import CustomHeader from '../components/customHeader';
import PaymentPopup from '../components/PaymentPopup';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@react-native-vector-icons/ionicons';

/* ================= skeleton ================= */

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

/* ================= main screen ================= */

export default function PricingPage() {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [myPlan, setMyPlan] = useState(null);

  useEffect(() => {
    console.log("++++++++++++++++++++++++++1")
    const controller = new AbortController();

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchWithAuth(`${API_URL}/api/plans`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to load plans');
        }

        const data = await res.json();
        const plansArray = Array.isArray(data)
          ? data
          : data.plans ?? data.data ?? [];

        const plan = plansArray.find(p => p.id === 2);
        console.log('My plan:', plan);
        setMyPlan(plan ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (myPlan?.prices?.length) {
      const active = myPlan.prices.find(p => p.is_active);
      setSelectedPrice(active);
    }
  }, [myPlan]);

  const onBuyPress = () => {
    if (!userProfile?.uid) {
      navigation.navigate('Login');
      return;
    }

    setSelectedPlan(myPlan);
    setPaymentModalVisible(true);
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
    <Layout>
      <CustomHeader title="Pricing" removePadding />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <Text style={styles.brandText}>AI Interview Agent</Text>
              <LinearGradient
                colors={['rgba(142, 69, 239, 1)', 'rgba(95, 91, 240, 1)']}
                style={styles.proBadge}
              >
                <Text style={styles.proText}>PRO</Text>
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.title}>
            Unlock Your Interview{'\n'}Success Potential
          </Text>

          <View style={styles.featureList}>
            <View style={styles.mascotWrapper}>
              <Image
                source={require('../assets/images/pricingPeng.png')}
                style={styles.mascot}
              />
            </View>


            {[
              {
                title: 'Practice Extended Training',
                desc: 'Unlimited monthly practice, no ums or ahs',
              },
              {
                title: 'Visibility Top of the Pile',
                desc: 'Skip the queue with a featured profile',
              },
              {
                title: 'Networking Unlimited Reach',
                desc: 'Connect with any professional freely',
              },
              {
                title: 'Smart Job Recommendations',
                desc: 'Find skill gaps blocking salary growth',
              },
              {
                title: 'Insights the Gap Report',
                desc: 'Get certified and prove technical skills',
              },
            ].map((item, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Text style={styles.check}>✓</Text>
                </View>

                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {selectedPrice && (
            <View style={styles.bottomCard}>
              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceText}>₹ {selectedPrice.price}</Text>
                </View>

                <View style={styles.durationBox}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedPrice.id}
                      onValueChange={value => {
                        const priceObj = myPlan.prices.find(p => p.id === value);
                        setSelectedPrice(priceObj);
                      }}
                      style={styles.hiddenPicker}
                      dropdownIconColor="transparent"
                    >
                      {myPlan.prices.map(item => (
                        <Picker.Item
                          key={item.id}
                          label={`${item.interval} MONTHS`}
                          value={item.id}
                        />
                      ))}
                    </Picker>

                    <View pointerEvents="none" style={styles.pickerOverlay}>
                      <Text style={styles.pickerText}>
                        {selectedPrice.interval} MONTHS
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        color="#fff"
                        style={styles.customArrow}
                      />

                    </View>
                  </View>

                </View>
              </View>

              <TouchableOpacity onPress={() => {
                setPaymentModalVisible(false);
                setSelectedPlan({
                  ...myPlan,
                  selectedPrice,
                });
                onBuyPress();
              }}>
                <Text style={styles.referralText}>Have a referral code?</Text>
              </TouchableOpacity>

              <View style={styles.subscribeWrap}>
                <TouchableOpacity
                  style={styles.bottomSubscribeBtn}
                  onPress={() => {
                    setPaymentModalVisible(false);
                    setSelectedPlan({
                      ...myPlan,
                      selectedPrice,
                    });
                    onBuyPress();
                  }}
                >
                  <Text style={styles.bottomSubscribeText}>Subscribe Now</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>

        {userProfile?.uid && paymentModalVisible && (
          <PaymentPopup
            visible={paymentModalVisible}
            selectedPlan={selectedPlan}
            uid={userProfile.uid}
            setUserProfile={setUserProfile}
            selecteMonths={selectedPrice?.interval}
            onClose={() => {
              setPaymentModalVisible(false);
              setSelectedPlan(null);
            }}
          />
        )}
      </ScrollView>
    </Layout>
  );
}

/* ================= styles ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  headerRow: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  mascotWrapper: {
    position: 'absolute',
    top: -108,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mascot: {
    height: 108,
  },
  featureList: {
    marginBottom: 24,
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 24,
    position: 'relative',
    marginTop: 128,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(142, 69, 239, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 3
  },
  check: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 14,
  },
  subscribeBtn: {
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  subscribeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featureTextWrap: {
    flex: 1,
    flexShrink: 1,
  },




  bottomCard: {
    marginBottom: 32,
    borderRadius: 20,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },



  priceText: {
    fontSize: 30,
    fontWeight: 700,
  },

  perText: {
    fontSize: 12,
    marginLeft: 4,
  },


  durationText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },

  dropdownIcon: {
    fontSize: 12,
  },

  referralText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 12,
    textDecorationLine: 'underline',
    color: "rgba(0, 0, 0, 0.5)"
  },

  subscribeWrap: {
    alignItems: 'center',
  },

  bottomSubscribeBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  bottomSubscribeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },



  durationBox: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    borderWidth: 1,
    borderColor: "rgba(60, 60, 60, 1)"
  },

  priceBox: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: "rgba(60, 60, 60, 1)",
    borderWidth: 1
  },




  pickerWrapper: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
  },

  hiddenPicker: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },

  pickerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pickerText: {
    fontSize: 14,
    fontWeight: 600,
    marginRight: 6,
    color: "white"
  },
  customArrow: {
    fontSize: 16,
  },









  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#e5e5e5',
    borderRadius: 20,
    padding: 20,
  },

  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 18,
    fontWeight: '700',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#f2f2f2',
    marginBottom: 20,
  },

  applyBtn: {
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },

  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

});
