import React, { useContext, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions
} from 'react-native';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import {
  Extrapolation,
  interpolate,
  useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppStateContext } from '../components/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import CarouselImage1 from '../assets/images/onboarding/1.svg';
import CarouselImage2 from '../assets/images/onboarding/2.svg';
import BackgroundGradient2 from '../components/backgroundGradient2';
import MainButton from '../components/mainButton';

const AutoSvg = ({ Svg }) => (
  <View style={{ width: '100%', height: 320, justifyContent: 'center', alignItems: 'center' }}>
    <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
  </View>
);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PAGE_WIDTH = SCREEN_WIDTH;
const CAROUSEL_HEIGHT = SCREEN_HEIGHT < 800 ? SCREEN_HEIGHT * 0.75 : SCREEN_HEIGHT * 0.75;

export default function OnboardingCarousel() {
  const { t } = useTranslation();
  const { setOnboardingComplete } = useContext(AppStateContext);

  const ref = useRef(null);
  const progress = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const data = [
    {
      heading: t('onboarding.slide1.heading'),
      bullets: [
        t('onboarding.slide1.bullets.0'),
        t('onboarding.slide1.bullets.1'),
        t('onboarding.slide1.bullets.2')
      ],
      img: <AutoSvg Svg={CarouselImage1} />
    },
    {
      heading: t('onboarding.slide2.heading'),
      bullets: [
        t('onboarding.slide2.bullets.0'),
        t('onboarding.slide2.bullets.1'),
        t('onboarding.slide2.bullets.2')
      ],
      img: <AutoSvg Svg={CarouselImage2} />
    }
  ];

  async function onFinish() {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      const check = await AsyncStorage.getItem('onboardingComplete');
      if (check === 'true') setOnboardingComplete(true);
      else setOnboardingComplete(false);
    } catch (e) {
      setOnboardingComplete(false);
    }
  }

  const goNext = () => {
    const next = Math.min(index + 1, data.length - 1);
    setIndex(next);

    try {
      ref.current?.scrollTo({ index: next, animated: true });
    } catch {
      try {
        ref.current?.scrollTo(next);
      } catch { }
    }

    if (index === data.length - 1) onFinish();
    setIndex(next);
  };

  const onPressPagination = targetIndex => {
    try {
      ref.current?.scrollTo({ count: targetIndex - progress.value, animated: true });
    } catch {
      try {
        ref.current?.scrollTo(targetIndex);
      } catch { }
    }
    setIndex(targetIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundGradient2 />

      <View style={styles.carouselWrapper}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Carousel
            ref={ref}
            width={PAGE_WIDTH}
            height={CAROUSEL_HEIGHT}
            data={data}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                {item.img}
                <View style={styles.textBlock}>
                  <Text style={styles.heading}>{item.heading}</Text>

                  <View style={styles.bulletContainer}>
                    {item.bullets.map((line, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{line}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
            loop={false}
            autoPlay={false}
            onProgressChange={progress}
            onSnapToItem={i => setIndex(i)}
          />

          <View style={styles.paginationOuter}>
            <Pagination.Custom
              progress={progress}
              data={data.map(() => ({ color: '#000' }))}
              size={8}
              dotStyle={{
                width: 10,
                height: 2,
                borderRadius: 8,
                backgroundColor: 'rgba(102, 102, 102, 1)'
              }}
              activeDotStyle={{
                width: 22,
                height: 2,
                borderRadius: 10,
                backgroundColor: '#000'
              }}
              containerStyle={{
                gap: 6,
                alignItems: 'center',
                justifyContent: 'center',
                height: 16
              }}
              horizontal
              onPress={onPressPagination}
              customReanimatedStyle={(progress, index, length) => {
                let val = Math.abs(progress - index);
                if (index === 0 && progress > length - 1) val = Math.abs(progress - length);
                return {
                  opacity: interpolate(val, [0, 1], [1, 0.4], Extrapolation.CLAMP),
                  transform: [
                    { scale: interpolate(val, [0, 1], [1, 0.9], Extrapolation.CLAMP) }
                  ]
                };
              }}
              renderItem={item => (
                <View style={{ backgroundColor: item.color, flex: 1, borderRadius: 50 }} />
              )}
            />
          </View>
        </View>

        <View style={{ height: 30 }} />

        <View style={styles.bottom}>
          <MainButton text={t('onboarding.next')} onPress={goNext} />
        </View>

        <View style={{ height: 40 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  carouselWrapper: { flex: 1, justifyContent: 'space-between', width: PAGE_WIDTH, margin: 'auto' },
  slide: { height: '100%', width: PAGE_WIDTH * 0.85, marginHorizontal: 'auto', justifyContent: 'center' },
  heading: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 12, alignSelf: 'left' },
  bulletContainer: { marginTop: 8, width: '90%' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 50, backgroundColor: '#000', marginTop: 5, marginRight: 10 },
  bulletText: { fontSize: 15, color: 'rgba(51, 51, 51, 1)', flexShrink: 1, textAlign: 'left', lineHeight: 20 },
  paginationOuter: {},
  bottom: { width: '85%', marginHorizontal: 'auto' },
  button: { backgroundColor: 'rgba(0, 0, 0, 1)', paddingVertical: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600', lineHeight: 27 },
});