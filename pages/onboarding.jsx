// OnboardingCarousel.js
import React, { useContext, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import {
  Extrapolation,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppStateContext } from '../components/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const data = [
  {
    heading: 'Practice Realistic Interviews',
    desc: 'Experience truly human AI interviews tailored for your goals. Get recruiter-style insights powered by advanced analytics to refine every response.',
    img: require('../assets/images/onboarding/2.png'),
  },
  {
    heading: 'Overcome Interview Nerves',
    desc: 'Strengthen weaknesses with personalized AI feedback. Build lasting confidence and learn to structure clear, compelling answers through guided practice.',
    img: require('../assets/images/onboarding/3.png'),
  },
  // {
  //   heading: 'Boost Your Chances of Success',
  //   desc: 'Tackle realistic, role-based interview challenges. Connect with peers, track progress, and earn rewards with streaks, badges, and certificates.',
  //   img: require('../assets/images/onboarding/3.png'),
  // },
];

const PAGE_WIDTH = SCREEN_WIDTH;
const CAROUSEL_HEIGHT = SCREEN_HEIGHT * 0.7;

export default function OnboardingCarousel() {
  const { setOnboardingComplete } = useContext(AppStateContext);

  const ref = useRef(null);
  const progress = useSharedValue(0);
  const [index, setIndex] = useState(0);
  async function onFinish() {
    try {
      console.log('setting onboardingComplete', '==================');
      await AsyncStorage.setItem('onboardingComplete', 'true');
      // read back to verify
      const check = await AsyncStorage.getItem('onboardingComplete');
      console.log('after set, read back', check, '==================');
      if (check === 'true') {
        setOnboardingComplete(true);
      } else {
        // write failed to persist
        setOnboardingComplete(false);
      }
    } catch (e) {
      console.error('error setting onboardingComplete', e);
      setOnboardingComplete(false);
    }
  }

  const goNext = () => {
    const next = Math.min(index + 1, data.length - 1);
    setIndex(next);
    try {
      ref.current?.scrollTo({ index: next, animated: true });
    } catch (e) {
      try {
        ref.current?.scrollTo(next);
      } catch (err) {
        // ignore
      }
    }
    if (index === data.length - 1) onFinish();
    setIndex(next);
  };

  const onPressPagination = targetIndex => {
    // use scrollTo with count difference to jump to nearest index
    try {
      ref.current?.scrollTo({
        count: targetIndex - progress.value,
        animated: true,
      });
    } catch (e) {
      // fallback to direct index if available
      try {
        ref.current?.scrollTo(targetIndex);
      } catch (err) { }
    }
    setIndex(targetIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/bgGradient.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.carouselWrapper}>
        {/* <View style={{ width: '80%', margin: 'auto' }}>
          <TouchableOpacity
            style={styles.skip}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View> */}

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Carousel
            ref={ref}
            width={PAGE_WIDTH}
            height={CAROUSEL_HEIGHT}
            data={data}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <View style={{ width: '100%' }}>
                  <Image
                    source={item.img}
                    style={styles.topImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.heading}>{item.heading}</Text>
                  <Text style={styles.paragraph}>{item.desc}</Text>
                </View>
              </View>
            )}
            loop={false}
            autoPlay={false}
            onProgressChange={progress}
            onSnapToItem={i => setIndex(i)}
          />
          {/* Pagination: active dot is rectangular */}
          <View style={styles.paginationOuter}>
            <Pagination.Custom
              progress={progress}
              data={data.map(() => ({ color: '#000' }))}
              size={8}
              dotStyle={{
                width: 10,
                height: 2,
                borderRadius: 8,
                backgroundColor: 'rgba(102, 102, 102, 1)',
              }}
              activeDotStyle={{
                width: 22,
                height: 2,
                borderRadius: 10,
                backgroundColor: '#000',
              }}
              containerStyle={{
                gap: 6,
                alignItems: 'center',
                justifyContent: 'center',
                height: 16,
              }}
              horizontal
              onPress={onPressPagination}
              customReanimatedStyle={(progress, index, length) => {
                let val = Math.abs(progress - index);
                if (index === 0 && progress > length - 1) {
                  val = Math.abs(progress - length);
                }
                return {
                  opacity: interpolate(
                    val,
                    [0, 1],
                    [1, 0.4],
                    Extrapolation.CLAMP,
                  ),
                  transform: [
                    {
                      scale: interpolate(
                        val,
                        [0, 1],
                        [1, 0.9],
                        Extrapolation.CLAMP,
                      ),
                    },
                  ],
                };
              }}
              renderItem={item => (
                <View
                  style={{
                    backgroundColor: item.color,
                    flex: 1,
                    borderRadius: 50,
                  }}
                />
              )}
            />
          </View>
        </View>
        <View style={{ height: 30 }} />

        <View style={styles.bottom}>
          <Pressable onPress={goNext} style={styles.button}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>

          <View style={styles.bottomBlackLine} />
        </View>

        <View style={{ height: 40 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: '100%',
  },
  skip: { alignSelf: 'flex-end', marginTop: 20 },
  skipText: {
    color: '#111',
    fontSize: 14,
    fontWeight: 700,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    width: PAGE_WIDTH,
    margin: 'auto',
  },
  slide: {
    height: "100%",
    width: PAGE_WIDTH * 0.85,
    alignItems: 'center',
    marginHorizontal: 'auto',
    justifyContent: "space-around"
  },
  topImage: {
    width: '100%',
    height: 361,
    objectFit: 'contain',
  },
  textBlock: {
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    alignSelf: 'center',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 16,
    color: 'rgba(51, 51, 51, 1)',
    textAlign: 'center',
  },
  paginationOuter: {
    // alignItems: 'center',
    // backgroundColor: 'red',
    marginTop:30
  },
  paginationContainer: {
    gap: 10,
  },
  bottom: { width: '85%', marginHorizontal: 'auto' },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '170%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBlackLine: {
    marginTop: 36,
    height: 5,
    width: 135,
    backgroundColor: 'rgba(17, 17, 17, 1)',
    alignSelf: 'center',
  },
});
