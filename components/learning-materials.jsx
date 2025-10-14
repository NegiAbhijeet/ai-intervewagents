import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  FlatList,
  ActivityIndicator,
} from 'react-native';

// JSX / TSX component using nativewind className utilities
export default function LearningMaterials({ jobData, materialLoading }) {
  const articles = useMemo(
    () => (Array.isArray(jobData?.articles) ? jobData.articles : []),
    [jobData],
  );
  const videos = useMemo(
    () => (Array.isArray(jobData?.videos) ? jobData.videos : []),
    [jobData],
  );

  const openLink = url => {
    if (!url) return;
    Linking.openURL(url).catch(err =>
      console.error('Failed to open link', err),
    );
  };

  const renderArticle = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => openLink(item?.link)}
        activeOpacity={0.8}
        className="mb-3"
      >
        <View className="flex-row items-start justify-between p-3 rounded-lg bg-white border border-gray-100">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-blue-700 mb-1">
              {item?.title}
            </Text>
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              {item?.snippet}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => openLink(item?.link)}
            activeOpacity={0.8}
            className="items-center justify-center p-2"
          >
            <Ionicons name="open-outline" size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVideo = ({ item, index }) => {
    return (
      <View className="mb-4 rounded-2xl overflow-hidden bg-white border border-gray-100">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openLink(item?.link)}
        >
          <Image
            source={
              item?.thumbnail
                ? { uri: item.thumbnail }
                : require('../assets/images/logo.png')
            }
            className="w-full h-40 bg-gray-200"
            resizeMode="cover"
            onError={e => console.warn('Image failed to load', e.nativeEvent)}
          />
        </TouchableOpacity>

        <View className="p-3">
          <Text className="font-semibold text-gray-900 mb-1" numberOfLines={2}>
            {item?.title}
          </Text>
          <Text className="text-sm text-gray-500 mb-2">{item?.channel}</Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{item?.duration}</Text>

            <TouchableOpacity
              onPress={() => openLink(item?.link)}
              activeOpacity={0.9}
              className="mt-2"
            >
              <View className="px-3 py-2 border rounded items-center border-gray-200">
                <View className="flex-row items-center">
                  <Ionicons name="play-outline" size={16} color="#374151" />
                  <Text className="ml-2 text-sm">Watch Video</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="pb-6">
      {/* Recommended Articles */}
      <View className="bg-white rounded-lg mb-4 overflow-hidden border border-gray-100">
        <View className="px-4 py-3 border-b border-gray-100 flex-row items-center">
          <Ionicons name="book-outline" size={18} color="#374151" />
          <Text className="ml-2 text-base font-medium text-gray-900">
            Recommended Articles
          </Text>
        </View>

        <View className="p-4">
          {materialLoading ? (
            <View>
              {[0, 1, 2].map(i => (
                <View key={i} className="mb-3">
                  <View className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <View className="h-2 bg-gray-200 rounded w-full mb-2" />
                  <View className="h-3 bg-gray-200 rounded w-1/3" />
                </View>
              ))}
            </View>
          ) : articles.length === 0 ? (
            <Text className="text-gray-500 italic">
              No related articles found
            </Text>
          ) : (
            <FlatList
              data={articles}
              renderItem={renderArticle}
              keyExtractor={(item, index) =>
                item?.id ? String(item.id) : String(index)
              }
              scrollEnabled={false}
              initialNumToRender={5}
              removeClippedSubviews
            />
          )}
        </View>
      </View>

      {/* YouTube Videos */}
      <View className="bg-white rounded-lg overflow-hidden border border-gray-100">
        <View className="px-4 py-3 border-b border-gray-100 flex-row items-center">
          <Ionicons name="videocam-outline" size={18} color="#374151" />
          <Text className="ml-2 text-base font-medium text-gray-900">
            YouTube Learning Videos
          </Text>
        </View>

        <View className="p-4">
          {materialLoading ? (
            <View>
              {[0, 1].map(i => (
                <View key={i} className="mb-3">
                  <View className="h-40 bg-gray-200 rounded mb-2" />
                  <View className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <View className="h-2 bg-gray-200 rounded w-1/2" />
                </View>
              ))}
            </View>
          ) : videos.length === 0 ? (
            <Text className="text-gray-500 italic">
              No related videos found
            </Text>
          ) : (
            <FlatList
              data={videos}
              renderItem={renderVideo}
              keyExtractor={(item, index) =>
                item?.id ? String(item.id) : String(index)
              }
              scrollEnabled={false}
              initialNumToRender={3}
              removeClippedSubviews
            />
          )}
        </View>
      </View>
    </View>
  );
}
