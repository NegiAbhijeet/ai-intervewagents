import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/bgGradient.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <View style={[styles.logo]}>
            <View style={styles.logoInner}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <View style={[styles.textContainer, { opacity: 1 }]}>
          <Text style={styles.title}>{t('brand')}</Text>
          <Text style={styles.subtitle}>{t('splash.tagline')}</Text>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  logoImage: {
    width: 114,
    height: 114,
  },

  content: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  logo: {},
  logoInner: {},
  logoIcon: {
    fontSize: 24,
    color: 'white',
  },
  textContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: 'black',
  },
  subtitle: {
    lineHeight: 23,
    marginTop: 2,
    fontSize: 16,
    color: 'rgba(51, 51, 51, 1)',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: 500,
  },
});

export default SplashScreen;
