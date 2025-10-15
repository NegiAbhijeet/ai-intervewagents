import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
const { width } = Dimensions.get('window');

function findLeagueIndexByTrophies(data, trophies) {
  for (let i = 0; i < data.length; i++) {
    const { min, max } = data[i];
    if (trophies >= min && trophies <= max) return i;
  }
  if (trophies < data[0].min) return 0;
  return data.length - 1;
}

export default function LeagueCarousel({
  data = [],
  userTrophies = 0,
  itemWidth = Math.round(width * 0.22),
}) {
  const userLeagueIndex = findLeagueIndexByTrophies(data, userTrophies);

  function renderItem({ item, index }) {
    const isUnlocked = index <= userLeagueIndex;
    const isCurrent = index === userLeagueIndex;
    const size = isCurrent ? 96 : 72;
    const fontWeight = isCurrent ? '700' : isUnlocked ? '600' : '400';
    const labelColor = isUnlocked ? '#111' : '#8b8b8b';

    return (
      <TouchableOpacity
        activeOpacity={isUnlocked ? 0.8 : 1}
        disabled={!isUnlocked}
        style={[styles.itemWrap, { width: itemWidth }]}
      >
        <View style={styles.imageWrap}>
          <Image
            source={item.image}
            resizeMode="contain"
            style={[
              { width: size, height: size },
              isUnlocked ? {} : { opacity: 0.85 },
            ]}
          />

          {!isUnlocked && (
            <>
              <LinearGradient
                colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.28)']}
                style={[
                  styles.lockOverlay,
                  { width: size, height: size, borderRadius: 12 },
                ]}
              />
              <View
                style={[
                  styles.lockIconWrap,
                  {
                    top: size / 2,
                    left: size / 2,
                    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
                  },
                ]}
              >
                <Ionicons name="lock-closed" size={16} color="#fff" />
              </View>
            </>
          )}

          {isCurrent && (
            <View style={styles.currentGlow} pointerEvents="none" />
          )}
        </View>

        <Text
          numberOfLines={1}
          style={[styles.nameText, { color: labelColor, fontWeight }]}
        >
          {item.name}
        </Text>

        <Text style={styles.rangeText}>
          {item.min} - {item.max}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent}
        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingLeft: 20,
  },
  flatListContent: {
    alignItems: 'center',
    paddingRight: 20,
  },
  itemWrap: {
    alignItems: 'center',
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
  },
  lockIconWrap: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currentGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.07)',
    top: -8,
    shadowColor: '#ffd700',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  nameText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  rangeText: {
    fontSize: 11,
    color: '#9b9b9b',
    marginTop: 4,
  },
  statusText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#222',
  },
});
