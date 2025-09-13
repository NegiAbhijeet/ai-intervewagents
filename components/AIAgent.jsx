import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AIAgent = ({ isAgentSpeaking = true }) => {
  const scaleAnim = useRef(new Animated.Value(isAgentSpeaking ? 1.1 : 1.0)).current;
  const pingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isAgentSpeaking ? 1.1 : 1.0,
      useNativeDriver: true,
    }).start();
  }, [isAgentSpeaking]);

  useEffect(() => {
    if (isAgentSpeaking) {
      Animated.loop(
        Animated.timing(pingAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ).start();
    } else {
      pingAnim.stopAnimation();
    }
  }, [isAgentSpeaking]);

  const pingScale = pingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const pingOpacity = pingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.agentContainer,
          isAgentSpeaking ? styles.activeBorder : styles.inactiveBorder,
        ]}
      >
        {/* Background Glow */}
        <View style={styles.backgroundGlow} />

        {/* Center Animated Circle */}
        <View style={styles.centered}>
          <Animated.View
            style={[
              styles.iconWrapper,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={['#60a5fa', '#a78bfa']}
              style={styles.gradientCircle}
            >
              <Text style={styles.iconText}>🤖</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Ping Circle */}
        {isAgentSpeaking && (
          <Animated.View
            style={[
              styles.pingCircle,
              {
                transform: [{ scale: pingScale }],
                opacity: pingOpacity,
              },
            ]}
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AI InterviewAgent</Text>
          {isAgentSpeaking && (
            <View style={styles.voiceBars}>
              <View style={styles.voiceBar(4)} />
              <View style={styles.voiceBar(6)} />
              <View style={styles.voiceBar(5)} />
            </View>
          )}
        </View>

        {/* Top-left badge */}
        <View style={styles.topLeftBadge}>
          <Text style={styles.badgeText}>AI</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 100,
  },
  agentContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: 120,
    height: 120,
    backgroundColor: '#1e293b', // slate-900
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  activeBorder: {
    borderColor: '#4ade80', // green-400
  },
  inactiveBorder: {
    borderColor: '#475569', // slate-600
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 64, 175, 0.1)', // from-blue-900/20
  },
  centered: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  gradientCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 28,
    color: '#fff',
  },
  pingCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  voiceBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  voiceBar: (height) => ({
    width: 2,
    height,
    backgroundColor: '#4ade80',
    borderRadius: 1,
    marginHorizontal: 1,
  }),
  topLeftBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AIAgent;
