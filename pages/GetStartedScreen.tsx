import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require('../assets/images/bgGradient.png')}
        style={styles.bg}
        resizeMode="cover"
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
              <Text style={styles.subBrand}>Tagline</Text>
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
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9}>
            <Text style={styles.secondaryButtonText}>
              Already Have An Account ? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bg: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 24,
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
  },
  centerArea: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 28,
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
    width: '80%',
    textAlign: 'center',
    fontSize: 16,
    color: '#374151',
    marginTop: 28,
  },
  primaryButton: {
    width: '80%',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,1)',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '18%',
  },
});
