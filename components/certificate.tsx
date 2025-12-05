import React from 'react'
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDecay,
} from 'react-native-reanimated'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

export default function Certificate({ imageUrl, minScale = 1, maxScale = 4 }) {
  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  // start values used during gestures
  const startScale = useSharedValue(1)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)

  const loaded = useSharedValue(0) 

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

  // PAN
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value
      startY.value = translateY.value
    })
    .onUpdate(e => {
      translateX.value = startX.value + e.translationX
      translateY.value = startY.value + e.translationY
    })
    .onEnd(e => {
      translateX.value = withDecay({ velocity: e.velocityX })
      translateY.value = withDecay({ velocity: e.velocityY })
    })

  // PINCH
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value
      startX.value = translateX.value
      startY.value = translateY.value
    })
    .onUpdate(e => {
      const focalX = e.focalX ?? SCREEN_W / 2
      const focalY = e.focalY ?? SCREEN_H / 2

      const newScale = clamp(startScale.value * e.scale, minScale, maxScale)

      const scaleFactor = newScale / startScale.value
      translateX.value = startX.value + (1 - scaleFactor) * (focalX - SCREEN_W / 2)
      translateY.value = startY.value + (1 - scaleFactor) * (focalY - SCREEN_H / 2)

      scale.value = newScale
    })
    .onEnd(() => {
      scale.value = withTiming(clamp(scale.value, minScale, maxScale), { duration: 150 })
    })

  // DOUBLE TAP
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(e => {
      const tapX = e.x ?? e.absoluteX ?? SCREEN_W / 2
      const tapY = e.y ?? e.absoluteY ?? SCREEN_H / 2

      if (scale.value > 1.05) {
        scale.value = withTiming(1, { duration: 200 })
        translateX.value = withTiming(0, { duration: 200 })
        translateY.value = withTiming(0, { duration: 200 })
      } else {
        const targetScale = clamp(2, minScale, maxScale)
        const dx = (SCREEN_W / 2 - tapX) * (targetScale - 1)
        const dy = (SCREEN_H / 2 - tapY) * (targetScale - 1)

        scale.value = withTiming(targetScale, { duration: 200 })
        translateX.value = withTiming(dx, { duration: 200 })
        translateY.value = withTiming(dy, { duration: 200 })
      }
    })

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, doubleTapGesture)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(loaded.value, { duration: 200 }),
  }))

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={styles.container}>
        {/* placeholder layer visible while loading */}
        <View style={styles.placeholder} pointerEvents="none">
          <ActivityIndicator size="small" />
        </View>

        {imageUrl && (
          <Animated.Image
            source={{ uri: imageUrl }}
            resizeMode="contain"
            onLoadStart={() => {
              loaded.value = 0
            }}
            onLoadEnd={() => {
              loaded.value = 1
            }}
            style={[styles.image, animatedStyle, fadeStyle]}
          />
        )}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#f2f2f2', // neutral background instead of white
    borderRadius: 12,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
})
