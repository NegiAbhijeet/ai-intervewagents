import React from 'react'
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native'

export default function Certificate({
  meetingReport
}) {

  const windowWidth = Dimensions.get('window').width * 0.85
  // keep some margin around, but cap max width for larger phones/tablets
  const containerWidth = windowWidth
  const containerHeight = Math.round(containerWidth * 0.67)

  // scale helper based on design width 900
  const scale = (v) => Math.max(1, Math.round((v * containerWidth) / 900))
  const name = meetingReport?.candidateDetails?.firstName + meetingReport?.candidateDetails?.lastName
  const role = meetingReport?.position
  const score = meetingReport?.feedback ? meetingReport?.feedback?.averagePercentage : 0
  const styles = makeStyles({ containerWidth, containerHeight, scale })

  return (
    <View style={styles.outer}>
      <ImageBackground
        source={require('../assets/images/certContainer.png')}
        style={[styles.bg, { width: containerWidth, height: containerHeight }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.inner}>
          <Text style={styles.header}>CERTIFICATE</Text>

          {/* ribbon image centered under header */}
          <Image
            source={require('../assets/images/ribbon.png')}
            style={styles.ribbonImage}
            resizeMode="contain"
          />
          <Text style={styles.ribbonText}>OF ACHIEVEMENT</Text>

          <Text style={styles.presented}>presented to :</Text>

          <Text style={styles.name}>{name}</Text>

          {/* decorative underline like in image */}
          <View style={styles.nameUnderline} />

          <Text style={styles.note}>
            for successfully completing the Interview Showcasing proficiency in Technical Domain.
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Role :</Text>
              <Text style={styles.metaValue}>{role}</Text>
            </View>

            <View style={[styles.metaItem, styles.metaRight]}>
              <Text style={styles.metaLabel}>Score :</Text>
              <Text style={styles.metaValue}>{score}</Text>
            </View>
          </View>

          <View style={styles.issuerRow}>
            <View>
              <Text style={styles.issued}>Issued By</Text>
              <Text style={styles.issuer}>AI Interview Agents</Text>
            </View>

            {/* placeholder for signature on right */}
            <View style={styles.signatureWrap}>
              <Text style={styles.signature}>Co-founder, AI Interview Agents</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}

function makeStyles({ containerWidth, containerHeight, scale }) {
  return StyleSheet.create({
    outer: {
      alignItems: 'center',
      padding: scale(12),
    },
    bg: {
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: scale(8),
    },
    imageStyle: {
      borderRadius: scale(8),
    },
    inner: {
      width: '86%',
      alignItems: 'center',
      paddingTop: scale(22),
      paddingBottom: scale(14),
    },
    header: {
      fontSize: scale(44),
      letterSpacing: scale(6),
      fontWeight: '700',
      color: '#4a217e',
    },
    // ribbon image sits just below header and is responsive
    ribbonImage: {
      width: Math.min(containerWidth * 0.42, scale(380)),
      height: scale(40),
      marginTop: scale(6),
    },
    ribbonText: {
      position: 'absolute',
      marginTop: scale(68),
      fontSize: scale(12),
      color: '#fff',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: scale(2),
      backgroundColor: 'transparent',
      // center by width of container
      alignSelf: 'center',
    },
    presented: {
      marginTop: scale(36),
      fontSize: scale(12),
      color: '#4b3283',
      fontWeight: '600',
    },
    name: {
      marginTop: scale(6),
      fontSize: scale(36),
      fontWeight: '800',
      color: '#0b0b0b',
      textAlign: 'center',
    },
    nameUnderline: {
      marginTop: scale(10),
      width: '70%',
      height: Math.max(2, Math.round(scale(6) / 6)),
      backgroundColor: '#2d49b2',
      opacity: 0.95,
    },
    note: {
      marginTop: scale(12),
      textAlign: 'center',
      fontSize: scale(12),
      color: '#3b2a6b',
      lineHeight: scale(20),
      width: '84%',
    },
    metaRow: {
      marginTop: scale(18),
      width: '92%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: scale(12),
      alignItems: 'center',
    },
    metaItem: {
      alignItems: 'flex-start',
    },
    metaRight: {
      alignItems: 'flex-end',
    },
    metaLabel: {
      fontSize: scale(10),
      color: '#4b3a86',
      fontWeight: '600',
    },
    metaValue: {
      marginTop: scale(6),
      fontSize: scale(12),
      fontWeight: '800',
      color: '#20143a',
    },
    issuerRow: {
      marginTop: scale(18),
      width: '92%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: scale(8),
    },
    issued: {
      fontSize: scale(12),
      color: '#333',
      fontWeight: '600',
    },
    issuer: {
      marginTop: scale(4),
      fontSize: scale(14),
      fontWeight: '800',
      color: '#000',
    },
    signatureWrap: {
      alignItems: 'flex-end',
      width: '48%',
    },
    signature: {
      fontSize: scale(10),
      color: '#5a4d6b',
    },
  })
}
