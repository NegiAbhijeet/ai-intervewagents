// LearningMaterials.native.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  // Linking,
  ScrollView,
  Linking,
} from 'react-native';

export function LearningMaterials({ jobData, materialLoading }) {
  const { articles = [], videos = [] } = jobData || {};

  const openLink = url => {
    if (!url) return;
    Linking.openURL(url).catch(err =>
      console.error('Failed to open link', err),
    );
  };

  const PlaceholderLine = ({ width = '3/4' }) => (
    <View
      className={`h-3 bg-gray-200 rounded ${
        width === 'full' ? 'w-full' : width === '2/3' ? 'w-2/3' : 'w-3/4'
      }`}
    />
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 24 }}
      className="space-y-6"
    >
      {/* Recommended Articles */}
      <View className="bg-white rounded-lg shadow-md overflow-hidden">
        <View className="px-4 py-3 border-b border-gray-100 flex-row items-center">
          <Ionicons name="book-outline" size={18} color="#374151" />
          <Text className="ml-2 text-base font-medium text-gray-900">
            Recommended Articles
          </Text>
        </View>

        <View className="p-4">
          {materialLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                className="flex-row items-start justify-between p-3 border rounded-lg mb-3 bg-white"
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <PlaceholderLine width="2/3" />
                  <View className="h-2" />
                  <PlaceholderLine width="full" />
                  <View className="h-3" />
                  <View className="flex-row items-center gap-3">
                    <View className="h-6 w-20 bg-gray-200 rounded" />
                    <View className="h-6 w-24 bg-gray-200 rounded" />
                  </View>
                </View>
                <View className="h-8 w-8 bg-gray-200 rounded" />
              </View>
            ))
          ) : articles.length === 0 ? (
            <Text className="text-gray-500 italic">
              No related articles found
            </Text>
          ) : (
            articles.map((article, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openLink(article?.link)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start justify-between p-3 border rounded-lg mb-3 bg-white">
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text className="font-semibold mb-1 text-blue-700">
                      {article.title}
                    </Text>
                    <Text
                      className="text-sm text-gray-600 mb-2"
                      numberOfLines={2}
                    >
                      {article.snippet}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => openLink(article?.link)}
                    className="items-center justify-center p-2"
                  >
                    <Ionicons name="open-outline" size={18} color="#2563eb" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* YouTube Videos */}
      <View className="bg-white rounded-lg shadow-md overflow-hidden">
        <View className="px-4 py-3 border-b border-gray-100 flex-row items-center">
          <Ionicons name="videocam-outline" size={18} color="#374151" />
          <Text className="ml-2 text-base font-medium text-gray-900">
            YouTube Learning Videos
          </Text>
        </View>

        <View className="p-4">
          {materialLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <View
                key={i}
                className="border rounded-lg overflow-hidden mb-4 bg-white"
              >
                <View className="w-full h-40 bg-gray-200" />
                <View className="p-3">
                  <PlaceholderLine width="2/3" />
                  <View className="h-2" />
                  <PlaceholderLine width="1/2" />
                  <View className="h-2" />
                  <PlaceholderLine width="1/3" />
                </View>
              </View>
            ))
          ) : videos.length === 0 ? (
            <Text className="text-gray-500 italic">
              No related videos found
            </Text>
          ) : (
            videos.map((video, index) => (
              <View
                key={index}
                className="group border rounded-2xl overflow-hidden shadow-sm mb-4 bg-white"
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => openLink(video?.link)}
                >
                  <Image
                    source={
                      video.thumbnail
                        ? { uri: video.thumbnail }
                        : require('../assets/images/logo.png')
                    }
                    style={{ width: '100%', height: 160 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <View className="p-3 flex flex-col">
                  <View style={{ flex: 1 }}>
                    <Text
                      className="font-semibold text-gray-900 mb-1"
                      numberOfLines={2}
                    >
                      {video.title}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-2">
                      {video.channel}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray-400">
                        {video.duration}
                      </Text>
                      <TouchableOpacity
                        onPress={() => openLink(video?.link)}
                        className="mt-2"
                        activeOpacity={0.9}
                      >
                        <View className="px-3 py-2 border rounded items-center">
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons
                              name="play-outline"
                              size={16}
                              color="#374151"
                            />
                            <Text className="ml-2 text-sm">Watch Video</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

export default LearningMaterials;
