import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import Gauge from '../simpleGuage';

const WINDOW_WIDTH = Dimensions.get('window').width;
const MAX_CARD = 340;

export default function CarouselCard({ setIsViewDetails }) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(WINDOW_WIDTH);

  const cards = [
    {
      title: 'Accountability Mindset',
      description:
        'Exhibits a proactive approach to challenges, ensuring tasks are seen through to completion.',
      value: 80,
      color: 'rgba(251, 146, 60, 1)', // orange
    },
    {
      title: 'Growth Mindset',
      description:
        'Embraces feedback and continuously works to improve skills and outcomes.',
      value: 90,
      color: 'rgba(34, 197, 94, 1)', // green
    },
    {
      title: 'Collaboration',
      description:
        'Works effectively with others, building trust and clear communication.',
      value: 75,
      color: 'rgba(59, 130, 246, 1)', // blue
    },
  ];

  const cardWidth = Math.min(MAX_CARD, Math.round(containerWidth * 0.86));
  const cardPadding = 6;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const scrollToIndex = nextIndex => {
    const i = clamp(nextIndex, 0, cards.length - 1);
    const offset = i * (cardWidth + cardPadding * 2);
    listRef.current?.scrollToOffset({ offset, animated: true });
    setIndex(i);
  };

  const onNext = () => scrollToIndex(index + 1);
  const onPrev = () => scrollToIndex(index - 1);

  const renderItem = ({ item }) => {
    const bgColor = item.color.replace('1)', '0.2)');
    return (
      <View style={{ width: cardWidth, paddingHorizontal: 0 }}>
        <View
          style={{
            minHeight: 170,
            width: '100%',
            backgroundColor: bgColor,
            borderRadius: 14,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: item.color,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>
              {item.description}
            </Text>
          </View>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 12,
            }}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
            onStartShouldSetResponderCapture={() => true}
          >
            <Gauge value={item.value} text={'Good'} strokeWidth={10} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 0,
      }}
    >
      <View style={{ width: cardWidth, alignItems: 'center' }}>
        <View style={{ width: cardWidth, justifyContent: 'center' }}>
          <FlatList
            ref={listRef}
            data={cards}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            getItemLayout={(_, i) => {
              const length = cardWidth + cardPadding * 2;
              return { length, offset: length * i, index: i };
            }}
            style={{ width: cardWidth }}
            contentContainerStyle={{ alignItems: 'center' }}
            decelerationRate="fast"
            onMomentumScrollEnd={ev => {
              const offsetX = ev.nativeEvent.contentOffset.x;
              const length = cardWidth + cardPadding * 2;
              const newIndex = clamp(
                Math.round(offsetX / length),
                0,
                cards.length - 1,
              );
              setIndex(newIndex);
            }}
            keyboardShouldPersistTaps="handled"
          />

          <TouchableOpacity
            onPress={onPrev}
            style={{
              position: 'absolute',
              left: -28,
              top: '50%',
              transform: [{ translateY: -18 }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('../../assets/images/leftArrow.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            style={{
              position: 'absolute',
              right: -28,
              top: '50%',
              transform: [{ translateY: -18 }],
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('../../assets/images/rightArrow.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Pressable
          onPress={() => setIsViewDetails(true)}
          className="rounded-full w-full py-2 flex items-center justify-center mt-3"
          style={{ backgroundColor: 'rgba(211, 127, 58, 1)' }}
        >
          <Text
            className="text-white py-2"
            style={{ fontSize: 20, fontWeight: 700 }}
          >
            See Detailed Report
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
