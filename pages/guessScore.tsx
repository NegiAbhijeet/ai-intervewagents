// GuessScoreModal.js
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
  TouchableOpacity,
  Platform
} from 'react-native'
import Layout from './Layout'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import PricingPopup from '../components/PricingPopup'
import { AppStateContext } from '../components/AppContext'

const { width: SCREEN_W } = Dimensions.get('window')
const PENG_WIDTH = Math.min(320, Math.round(SCREEN_W * 0.30))
const CLOUD_WIDTH = Math.min(320, Math.round(SCREEN_W * 0.70 * 0.85))

const GuessScoreModal = ({ visible = false, onRequestClose = () => { }, onSelectGuess = () => { }, interviewId = '' }) => {
  const { isNeedToShowAd } = useContext(AppStateContext)
  const [showPricingPopup, setShowPricingPopup] = useState(false)
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  // options etc...
  const options = ['0%-25%', '25%-50%', '50%-75%', '75%-100%']

  const handlePress = (option) => {
    // pass the option string and interviewId to caller
    onSelectGuess(option, interviewId)
  }
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        setShowPricingPopup(true);
      }, 0);
    }
  }, [visible])

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent={true}
    // statusBarTranslucent={true} // Android: allow modal to draw under status bar and then we add padding
    // presentationStyle="overFullScreen" // iOS: consistent overlay behavior
    >
      <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
        {
          showPricingPopup && isNeedToShowAd &&
          <PricingPopup
            visible={showPricingPopup}
            onClose={() => setShowPricingPopup(false)}
          />
        }
        <Layout gradientType="3">
          <View style={[styles.bg, { paddingTop: insets.top || (Platform.OS === 'android' ? 0 : 0) }]}>
            <View style={styles.wrapper}>
              <View style={styles.cloudWrap} pointerEvents="none">
                <ImageBackground
                  source={require('../assets/images/av-cloud.png')}
                  style={styles.cloud}
                  imageStyle={styles.cloudImage}
                >
                  <Text numberOfLines={2} style={styles.cloudText}>
                    Analyzing your Result till then try guessing your score
                  </Text>
                </ImageBackground>
              </View>

              <Image
                source={require('../assets/images/guessPeng.png')}
                style={styles.penguin}
                resizeMode="contain"
              />
            </View>

            <View style={styles.scoreBox}>
              <Image
                source={require('../assets/images/guessEllipse.png')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  transform: [{ translateY: '-50%' }],
                  width: 180,
                  height: '100%'
                }}
                resizeMode="contain"
              />
              <Text style={styles.scoreTitle}>Guess Your Interview Score?</Text>

              <View style={styles.options}>
                {options.map((opt) => (
                  <TouchableOpacity key={opt} onPress={() => handlePress(opt)}>
                    <Text style={styles.option}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.tipBox}>
              <Image
                source={require('../assets/images/tipImage.png')}
                style={{}}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>Pro Tip</Text>
                <Text style={styles.tipText}>
                  Practice makes perfect! Users who complete 3+ interviews see an average improvement of 23 points. Keep going!
                </Text>
              </View>
            </View>
          </View>
        </Layout>
      </SafeAreaView>
    </Modal>
  )
}

export default GuessScoreModal

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', justifyContent: 'center' },
  wrapper: { width: '85%', position: 'relative', height: 160, marginBottom: 22 },
  cloudWrap: { position: 'absolute', top: 0, left: PENG_WIDTH - PENG_WIDTH * 0.15, zIndex: 2, alignItems: 'center' },
  cloud: { width: CLOUD_WIDTH, alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingRight: 12, paddingLeft: 16, paddingBottom: 16 },
  cloudImage: { resizeMode: 'contain' },
  cloudText: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  penguin: { width: PENG_WIDTH, height: 142, zIndex: 1, marginTop: 20 },
  scoreBox: {
    width: '100%',
    backgroundColor: 'rgba(217, 217, 217, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingTop: 34,
    paddingBottom: 60,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(25255, 255, 255, 1)'
  },
  scoreTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  options: { gap: 12 },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 14,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6
  },
  tipBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
    borderRadius: 14,
    marginTop: 30,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0.65,
    flexDirection: 'row',
    gap: 10
  },
  tipTitle: { fontSize: 10, fontWeight: '700', marginBottom: 6 },
  tipText: { fontSize: 9, lineHeight: 18, color: 'rgba(75, 85, 99, 1)' }
})
