import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'
import { SafeAreaView } from 'react-native-safe-area-context'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const NotLoadedHeight = 250

export default function Certificate({
  imageUrl,
  minScale = 1,
  maxScale = 4,
  thumbHeight = 400,
  parentWidth
}) {
  const [modalVisible, setModalVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadedThumb, setLoadedThumb] = useState(false)
  const [naturalWidth, setNaturalWidth] = useState(null)
  const [naturalHeight, setNaturalHeight] = useState(null)
  const SkeleonComp = () => {
    return <View style={{ width: parentWidth }}>
      <Image
        source={require("../assets/images/skeletonbg.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: NotLoadedHeight,
          borderRadius: 6
        }}
        resizeMode="cover"
      />

      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item
          width={parentWidth}
          height={NotLoadedHeight}
          borderRadius={6}
        />
      </SkeletonPlaceholder>
    </View>

  }

  // Run hooks unconditionally. Guard inside effect.
  useEffect(() => {
    if (!imageUrl) {
      setNaturalWidth(null)
      setNaturalHeight(null)
      return
    }

    let mounted = true
    Image.getSize(
      imageUrl,
      (w, h) => {
        if (!mounted) return
        setNaturalWidth(w)
        setNaturalHeight(h)
      },
      err => {
        if (!mounted) return
        console.warn('Image.getSize failed', err)
      }
    )

    return () => {
      mounted = false
    }
  }, [imageUrl])

  // assume container uses full screen width. adjust if your parent is narrower.
  const containerWidth = SCREEN_W

  // compute scaled height for that width while keeping aspect ratio
  const scaledNaturalHeight =
    naturalWidth && naturalHeight
      ? (naturalHeight / naturalWidth) * containerWidth
      : null

  // clamp the thumbnail height to a sensible maximum
  // here we use: min(scaled height, 60% of screen height, thumbHeight prop)
  const displayThumbHeight =
    scaledNaturalHeight != null
      ? Math.min(scaledNaturalHeight, SCREEN_H * 0.6, thumbHeight)
      : thumbHeight

  // for modal view clamp to screen height so it fits. keep aspect ratio.
  const modalImageHeight =
    scaledNaturalHeight != null
      ? Math.min(scaledNaturalHeight, SCREEN_H)
      : SCREEN_H

  if (!imageUrl) {
    return <View style={[styles.thumb, { height: NotLoadedHeight }]} />
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setLoaded(false)
          setModalVisible(true)
        }}
        style={[
          styles.thumb,
          { height: loadedThumb ? displayThumbHeight : NotLoadedHeight }
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.thumbImage,
            {
              opacity: loadedThumb ? 1 : 0,
              height: loadedThumb ? "100%" : 0
            }
          ]}
          resizeMode="contain"
          onLoadStart={() => setLoadedThumb(false)}
          onLoadEnd={() => {
            setTimeout(() => {
              setLoadedThumb(true);
            }, 1000);
          }}
        />

        {!loadedThumb && (
          <SkeleonComp />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="fullScreen"
      >
        <StatusBar hidden />
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
            accessibilityLabel="Close"
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          <View style={styles.zoomWrapper}>
            <ImageZoom
              cropWidth={SCREEN_W}
              cropHeight={SCREEN_H}
              imageWidth={SCREEN_W}
              imageHeight={modalImageHeight}
              minScale={minScale}
              maxScale={maxScale}
            >
              <Image
                source={{ uri: imageUrl }}
                style={[
                  styles.fullImage,
                  {
                    width: SCREEN_W,
                    height: modalImageHeight,
                    opacity: loaded ? 1 : 0,
                  },
                ]}
                resizeMode="contain"
                onLoadStart={() => setLoaded(false)}
                onLoadEnd={() => setLoaded(true)}
              />
            </ImageZoom>

            {!loaded && (
              <SkeleonComp />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  thumb: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
  zoomWrapper: {
    flex: 1,
    width: SCREEN_W,
    height: SCREEN_H,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  fullImage: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
