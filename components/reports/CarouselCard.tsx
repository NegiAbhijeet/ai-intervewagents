import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Pressable,
} from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import Gauge from '../simpleGuage'
import AnalysisCards from '../AnalysisCards'
import { useTranslation } from 'react-i18next'

const WINDOW_WIDTH = Math.round(Dimensions.get('window').width)
const HORIZONTAL_MARGIN = 20

export default function CarouselCard({
  setIsViewDetails,
  interviewType,
  report,
  setShowImprovementPoints,
}) {
  const { t } = useTranslation()
  const carouselRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(WINDOW_WIDTH || 360)
  const [activeIndex, setActiveIndex] = useState(0)
  // put these near your other hooks
  const lastActiveRef = useRef(activeIndex)

  // when you update state, also update the ref
  const setActive = idx => {
    if (lastActiveRef.current === idx) return
    lastActiveRef.current = idx
    setActiveIndex(idx)
  }
  const technicalKeys = [
    'Technical_Expertise',
    'Problem_Solving',
    'Decision_Judgment',
    'Debugging_Mindset',
  ]
  const nonTechnicalKeys = [
    'Accountability_Mindset',
    'Team_Collaboration',
    'Problem_Solving',
    'Growth_Mindset',
    'Conflict_Resolution',
    'Outcome_Focus',
  ]
  const selectedKeys =
    interviewType === 'Technical' ? technicalKeys : nonTechnicalKeys

  const palette = [
    'rgba(211, 127, 58, 1)',
    'rgba(179, 102, 147, 1)',
    'rgba(43, 129, 143, 1)',
    'rgba(122, 63, 191, 1)',
    'rgba(54, 109, 238, 1)',
    'rgba(81, 194, 211, 1)',
  ]

  const humanize = key =>
    (key || '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(s => (s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s))
      .join(' ')

  const getFieldData = key => {
    const fallback = { value: 0, description: t('carousel.notEnoughData') }
    if (!report) return fallback
    const top = report[key]
    if (top && typeof top === 'object') {
      const value = top.score ?? top.value ?? top.percentage ?? null
      const description = top.description ?? top.note ?? top.details ?? null
      if (value !== null && value !== undefined) {
        return {
          value: Number(value) || 0,
          description: description || fallback.description,
        }
      }
      if (description) return { value: 0, description }
    }
    if (report.technical_skills && report.technical_skills[key]) {
      const v =
        report.technical_skills[key].score ?? report.technical_skills[key].value
      const d = report.technical_skills[key].description
      return { value: Number(v) || 0, description: d || fallback.description }
    }
    const keys = Object.keys(report || {})
    const matched = keys.find(k => k.toLowerCase() === key.toLowerCase())
    if (matched && typeof report[matched] === 'object') {
      const v = report[matched].score ?? report[matched].value ?? 0
      const d = report[matched].description ?? fallback.description
      return { value: Number(v) || 0, description: d }
    }
    return fallback
  }

  function clampNumber(n, min, max) {
    const num = Number(n)
    if (Number.isNaN(num)) return min
    if (num < min) return min
    if (num > max) return max
    return num
  }

  const cards = selectedKeys.map((k, i) => {
    const data = getFieldData(k)
    const color = palette[i % palette.length]
    return {
      key: k,
      title: t(`skills.${k}`),
      description: data.description,
      value: clampNumber(data.value, 0, 100),
      color,
    }
  })

  const safeContainerWidth =
    typeof containerWidth === 'number' && containerWidth > 0
      ? containerWidth
      : WINDOW_WIDTH
  const cardWidth = Math.max(0, safeContainerWidth - HORIZONTAL_MARGIN * 2)

  if (!Array.isArray(cards) || cards.length === 0) return null

  // defensive image sources. require will throw only at build time if not present
  const leftArrow = require('../../assets/images/leftArrow.png')
  const rightArrow = require('../../assets/images/rightArrow.png')

  return (
    <View className="w-full">
      <View
        className="items-center justify-center relative w-full"
        style={{ height: 160 }}
        onLayout={ev => {
          const w = Math.round(ev.nativeEvent.layout.width) || WINDOW_WIDTH
          setContainerWidth(w)
        }}
      >
        <Carousel
          height={160}
          ref={carouselRef}
          loop
          width={safeContainerWidth}
          autoPlay
          autoPlayInterval={2000}
          data={cards}
          onSnapToItem={index => setActiveIndex(index)}
          onProgressChange={(offsetProgress, absoluteProgress) => {
            if (absoluteProgress == null || Number.isNaN(absoluteProgress))
              return

            const total = cards.length
            const progress = Math.max(-1e9, Math.min(1e9, absoluteProgress))
            const base = Math.floor(progress)
            const frac = progress - base

            const lowerThreshold = 0.35
            const upperThreshold = 0.65

            let targetRelative
            if (frac <= lowerThreshold) {
              targetRelative = 0
            } else if (frac >= upperThreshold) {
              targetRelative = 1
            } else {
              return
            }

            let tentative = base + targetRelative
            const wrapped = ((tentative % total) + total) % total

            setActive(wrapped)
          }}
          renderItem={({ item: cardItem }) => {
            if (!cardItem) return null

            const percentage = cardItem.value ? (cardItem.value / 10) * 100 : 0
            const bgColor =
              cardItem.color && cardItem.color.replace
                ? cardItem.color.replace('1)', '0.12)')
                : 'rgba(0,0,0,0.05)'

            return (
              <View style={{ width: safeContainerWidth }} className="items-center">
                <View
                  className="min-h-[160px] flex-row items-center border mx-5"
                  style={{
                    paddingHorizontal: 21,
                    borderRadius: 20,
                    width: cardWidth,
                    backgroundColor: bgColor,
                    borderColor: cardItem.color || 'rgba(0,0,0,0.06)',
                  }}
                >
                  <View className="flex-1 justify-between">
                    <Text
                      className="text-[16px]"
                      numberOfLines={1}
                      style={{ color: 'rgba(58, 61, 63, 1)', fontWeight: 700 }}
                    >
                      {cardItem.title}
                    </Text>
                    <Text
                      className="text-[12px] mt-1.5"
                      numberOfLines={3}
                      style={{ color: 'rgba(58, 61, 63, 1)', fontWeight: 500 }}
                    >
                      {cardItem.description}
                    </Text>
                  </View>

                  <View className="justify-center items-center ml-3">
                    <Gauge
                      value={percentage}
                      strokeWidth={8}
                      size={75}
                      text={
                        percentage <= 30
                          ? t('carousel.poor')
                          : percentage <= 70
                            ? t('carousel.good')
                            : t('carousel.excellent')
                      }
                      bgColor="rgba(51, 138, 14, 0.4)"
                      color={
                        percentage <= 30
                          ? 'rgba(239, 68, 68, 1)'
                          : percentage <= 70
                            ? 'rgba(234, 179, 8, 1)'
                            : 'rgba(51, 138, 14, 1)'
                      }
                    />
                  </View>
                </View>
              </View>
            )
          }}
        />

        <TouchableOpacity
          onPress={() =>
            carouselRef.current &&
            typeof carouselRef.current.prev === 'function' &&
            carouselRef.current.prev()
          }
          activeOpacity={0.8}
          className="absolute items-center justify-center p-2 z-10 -left-2 "
          style={{
            zIndex: 111,
            top: '50%',
            transform: [{ translateY: -22 }],
          }}
        >
          <Image
            source={leftArrow}
            resizeMode="contain"
            style={{ width: 16, height: 44 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            carouselRef.current &&
            typeof carouselRef.current.next === 'function' &&
            carouselRef.current.next()
          }
          activeOpacity={0.8}
          className="absolute items-center justify-center p-2 z-10 -right-2 "
          style={{
            zIndex: 111,
            top: '50%',
            transform: [{ translateY: -22 }],
          }}
        >
          <Image
            source={rightArrow}
            resizeMode="contain"
            style={{ width: 16, height: 44 }}
          />
        </TouchableOpacity>
      </View>

      <Pressable
        onPress={() => setIsViewDetails(true)}
        className="mt-3 rounded-full py-4 items-center justify-center mx-4"
        style={{
          width: Math.min(cardWidth, safeContainerWidth - 40),
          alignSelf: 'center',
          backgroundColor: cards[activeIndex]?.color || 'rgba(59,130,246,1)',
        }}
      >
        <Text className="text-white text-[20px] font-extrabold">
          {t('carousel.seeDetailedReport')}
        </Text>
      </Pressable>

      <View className="mt-6" style={{ width: cardWidth, alignSelf: 'center' }}>
        <AnalysisCards
          setShowImprovementPoints={setShowImprovementPoints}
          strengths={Array.isArray(report?.strengths) ? report?.strengths : []}
          weaknesses={
            Array.isArray(report?.weaknesses) ? report?.weaknesses : []
          }
        />
      </View>
    </View>
  )
}
