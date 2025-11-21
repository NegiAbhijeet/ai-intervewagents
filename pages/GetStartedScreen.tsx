import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStateContext } from '../components/AppContext';
import MainButton from '../components/mainButton';
import Layout from './Layout';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen() {
  const { setOnboardingComplete } = useContext(AppStateContext)
  const navigation = useNavigation();
  async function onFinish() {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      const check = await AsyncStorage.getItem('onboardingComplete');
      if (check === 'true') {
        setOnboardingComplete(true);
      } else {
        setOnboardingComplete(false);
      }
    } catch (e) {
      console.error('error setting onboardingComplete', e);
      setOnboardingComplete(false);
    }
  }
  return (
    <Layout>
      <View
        style={styles.bg}
      >
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Image
                source={require('../assets/images/logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.brand}>AI Interview Agents</Text>
              <Text style={styles.subBrand}>Your AI Interview Assistant</Text>
            </View>
          </View>
        </View>

        <View style={styles.centerArea}>
          <View style={styles.penguinWrap}>
            <Image
              source={require('../assets/images/GetStartedPeng.png')}
              style={styles.penguin}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.tagline}>
            I will help you crack your dream company’s interview with
            confidence.
          </Text>
        </View>

        <View style={styles.bottomSpacer}>
          <MainButton text={'Get Started'} onPress={() => navigation.navigate('Onboarding')} />
          <MainButton text={'Already Have An Account ? Login'} onPress={onFinish} outline={true} />
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: "100%",
    height: "100%",
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 18,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2545',
  },
  subBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -2,
    fontWeight: 400
  },
  centerArea: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    marginHorizontal: 'auto',
  },
  penguinWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  penguin: {
    width: 250,
    height: 300,
  },
  tagline: {
    width: '90%',
    textAlign: 'center',
    fontSize: 16,
    color: '#374151',
    marginTop: 30,
    lineHeight: 27.2
  },
  bottomSpacer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '18%',
  },
});
