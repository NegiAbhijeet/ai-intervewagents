import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { AppStateContext } from '../components/AppContext';
import { API_URL } from '../components/config';
import fetchWithAuth from '../libs/fetchWithAuth';

import CustomHeader from '../components/customHeader';
import PaymentPopup from '../components/PaymentPopup';
import BackgroundGradient1 from '../components/backgroundGradient1';

/* ---------------- Plan Card ---------------- */
function PlanCard({ plan, isActive, onSelect }) {
  const price = plan.prices;
  return (
    <Pressable
      onPress={() => onSelect(plan)}
      style={[
        styles.planWrapper,
        {
          borderWidth: isActive ? 2 : 2,
          borderColor: isActive ? '#5B21B6' : '#8D4FE5',
          opacity: isActive ? 1 : 0.6,
        },
      ]}
    >
      {
        isActive &&
        <View
          style={{
            position: 'absolute',
            top: -14,
            left: 80,
            transform: [{ translateX: -50 }],
            backgroundColor: '#8D4FE5',
            paddingHorizontal: 20,
            paddingVertical: 4,
            borderRadius: 100,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {plan.name} Plan
          </Text>
        </View>
      }
      <Text style={styles.planPrice}>Rs {price.price}</Text>
      <Text style={styles.planTitle}>{price.features}</Text>
      <Text style={styles.planMeta}>Just Rs 20 per Interview</Text>
    </Pressable>
  );
}


/* ---------------- Screen ---------------- */

export default function PricingPage() {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const navigation = useNavigation();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const res = await fetchWithAuth(
        `${API_URL}/api/plans/?language_code=en&platform=app&interval=1`
      );
      const data = await res.json();
      const finalPlans = data.sort((a, b) => b.id - a.id)
      console.log(finalPlans)
      setPlans(finalPlans.filter(p => p.id !== 1));
      setSelectedPlan(finalPlans[0])
    };
    fetchPlans();
  }, []);

  const creditcount = Math.floor((selectedPlan?.prices?.total_seconds ?? 0) / (15 * 60));

  return (
    <View className={`flex-1 bg-white`}>
      <View className={`px-[5%]`}>
        <CustomHeader title="Pricing" removePadding />
      </View>
      <BackgroundGradient1 />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.container}>

          {/* Top Row */}
          <View style={styles.topRow}>
            <Image
              source={require('../assets/images/pro-peng.png')}
              style={styles.penguin}
            />
          </View>

          {/* Headline */}
          <Text style={styles.title}>
            One Weak Interview should not{'\n'}cost you your Job
          </Text>

          <Text style={styles.subtitle}>Practice Now</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <LinearGradient
              colors={['rgba(1, 172, 249, 0.60)', 'rgba(160, 0, 215, 0.70)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Image
                source={require('../assets/images/rounded-check.png')}
                resizeMode="contain"
                style={{ width: 25, height: 25, marginBottom: 4 }}
              />
              <Text style={styles.statTitle}><Text style={{ fontWeight: 800, fontSize: 20, }}>4000+{" "}</Text>candiadtes prepeared </Text>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(1, 172, 249, 0.60)', 'rgba(160, 0, 215, 0.70)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Image
                source={require('../assets/images/rounded-check.png')}
                resizeMode="contain"
                style={{ width: 25, height: 25, marginBottom: 4 }}
              />
              <Text style={styles.statTitle}>Available in <Text style={{ fontWeight: 800, fontSize: 20 }}>7{" "}</Text> different langauge</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Section */}
      <View style={styles.stickyFooter}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Interview Agents</Text>
          <LinearGradient
            colors={['#8E45EF', '#5F5BF0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proPill}
          >
            <Text style={styles.proPillText}>PRO</Text>

          </LinearGradient>
        </View>

        {/* Plans */}
        <View style={styles.plansRow}>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={selectedPlan?.id === plan.id}
              onSelect={p => {
                if (!userProfile?.uid) {
                  navigation.navigate('Login');
                  return;
                }
                setSelectedPlan(p);
              }}
            />
          ))}
        </View>


        {/* CTA */}
        <TouchableOpacity
          onPress={() => {
            if (!selectedPlan) return; // optional: prevent opening without selection
            setPaymentModalVisible(true);
          }}
        >
          <LinearGradient
            colors={['#1D94ED', '#8741F2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >

            <Text style={styles.ctaText}>Get Credits for {creditcount} Interviews</Text>

          </LinearGradient>
        </TouchableOpacity>
      </View>

      {paymentModalVisible && selectedPlan && (
        <PaymentPopup
          visible={paymentModalVisible}
          selectedPlan={selectedPlan}
          uid={userProfile.uid}
          setUserProfile={setUserProfile}
          onClose={() => {
            setPaymentModalVisible(false);
          }}
        />
      )}
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },

  penguin: {
    width: 300,
    height: 180,
    resizeMode: "contain",
  },

  practiceChip: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },

  practiceText: {
    fontWeight: '700',
    fontSize: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: 500,
    textAlign: 'center',
    marginTop: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 6,
  },
  statsWrapper: {
    width: '100%',
    overflow: 'hidden',
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 10,
    paddingHorizontal: 20
  },

  statCard: {
    width: "50%",
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    padding: 16
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: "center"
  },

  statTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  proPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },

  proPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },

  plansRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 32,
  },

  planWrapper: {
    width: 160,
    backgroundColor: '#E1D8F3',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    borderColor: "#8D4FE5",
    position: "relative"
  },

  planTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#5A2C78"
  },

  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 6,
  },

  planMeta: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    fontWeight: 500,
    marginTop: 4
  },

  planBuy: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
  },

  planBuyText: {
    color: '#fff',
    fontWeight: '700',
  },

  ctaButton: {
    marginTop: 28,
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  stickyFooter: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
    backgroundColor: "white",
    borderColor: "#9CA3AF",
    borderWidth: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});
