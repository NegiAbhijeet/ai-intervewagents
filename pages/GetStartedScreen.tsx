import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStateContext } from '../components/AppContext';
import MainButton from '../components/mainButton';
import Layout from './Layout';
import { useTranslation } from 'react-i18next';
const { width: SCREEN_W } = Dimensions.get('window')
export default function GetStartedScreen() {
  const { setOnboardingComplete } = useContext(AppStateContext)
  const navigation = useNavigation();
  const { t } = useTranslation();
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
              <Text style={styles.brand}>{t('brand')}</Text>
              <Text style={styles.subBrand}>{t('getStarted.subBrand')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.centerArea}>
          <View style={[styles.wrapper]}>
            <View style={styles.cloudWrap} pointerEvents="none">
              <ImageBackground
                source={require('../assets/images/cloud.png')}
                style={styles.cloud}
                imageStyle={styles.cloudImage}
              >
                <Text numberOfLines={2} style={styles.cloudText}>
                  {t('nova.greeting')}
                </Text>

              </ImageBackground>
            </View>

            <Image
              source={require('../assets/images/3d-penguin.png')}
              style={styles.penguin}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.tagline}>
            {t('getStarted.tagline')}
          </Text>
        </View>

        <View style={styles.bottomSpacer}>
          <MainButton
            text={t('getStarted.ctaStart')}
            onPress={() => navigation.navigate('Onboarding')}
          />
          <MainButton
            text={t('getStarted.ctaLogin')}
            onPress={onFinish}
            outline
          />

        </View>
      </View>
    </Layout>
  );
}
const PENG_WIDTH = Math.min(320, Math.round(SCREEN_W * 0.7))
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
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    paddingVertical: 24,
  },
  cloudWrap: {
    position: 'absolute',
    top: 8,
    right: 20,
    zIndex: 2,
    alignItems: 'center',
  },
  cloud: {
    width: 124,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  cloudImage: {
    resizeMode: 'contain',
  },
  cloudText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12
  },
  penguin: {
    width: PENG_WIDTH,
    height: PENG_WIDTH,
    zIndex: 1,
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
