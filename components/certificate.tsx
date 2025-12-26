import React, { useState } from 'react'
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

const CERT_WIDTH = 1530
const CERT_HEIGHT = 1024
const CERT_RATIO = CERT_HEIGHT / CERT_WIDTH

export default function Certificate({
  imageUrl,
  minScale = 1,
  maxScale = 4,
  parentWidth
}) {
  const [modalVisible, setModalVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadedThumb, setLoadedThumb] = useState(false)

  const containerWidth = parentWidth || SCREEN_W
  const calculatedHeight = containerWidth * CERT_RATIO
  const modalImageHeight = SCREEN_W * CERT_RATIO

  const SkeleonComp = () => {
    return (
      <View style={{ width: containerWidth }}>
        <Image
          source={require("../assets/images/skeletonbg.png")}
          style={{
            position: "absolute",
            width: "100%",
            height: calculatedHeight,
            borderRadius: 6
          }}
          resizeMode="cover"
        />

        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item
            width={containerWidth}
            height={calculatedHeight}
            borderRadius={6}
          />
        </SkeletonPlaceholder>
      </View>
    )
  }

  if (!imageUrl) {
    return <View style={[styles.thumb, { height: calculatedHeight }]} />
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
          { height: calculatedHeight }
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
              setLoadedThumb(true)
            }, 1000)
          }}
        />

        {!loadedThumb && <SkeleonComp />}
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
                    opacity: loaded ? 1 : 0
                  }
                ]}
                resizeMode="contain"
                onLoadStart={() => setLoaded(false)}
                onLoadEnd={() => setLoaded(true)}
              />
            </ImageZoom>

            {!loaded && <SkeleonComp />}
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
})
