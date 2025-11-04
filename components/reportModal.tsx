import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Button,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Tabs from './Tabs';
import CarouselCard from './reports/CarouselCard';
import AnalysisCards from './AnalysisCards';
import ArcGaugeFull from './Guage';
import SkillCards from './SkillCards';
import InterviewCard from './InterviewCard';
import Ionicons from '@react-native-vector-icons/ionicons';

const ReportModal = ({ visible, onClose, report }) => {
  const feedback = report?.feedback || null;
  console.log(feedback);
  const [isViewDetails, setIsViewDetails] = useState(false);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <Image
          source={require('../assets/images/bgGradient.png')}
          className="absolute bottom-0 left-0 w-full h-full"
          resizeMode="cover"
        />

        <View className="w-full flex-row items-center justify-between px-8 z-10">
          {isViewDetails ? (
            <TouchableOpacity
              onPress={() => {
                setIsViewDetails(false);
              }}
            >
              <View className="w-10 h-10 rounded-full border border-gray-300 items-center justify-center">
                <Ionicons name="close" size={24} color="#000" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose}>
              <View className="w-10 h-10 rounded-full border border-gray-300 items-center justify-center">
                <Ionicons name="close" size={24} color="#000" />
              </View>
            </TouchableOpacity>
          )}
          {isViewDetails ? (
            <Text style={{ fontSize: 24, fontWeight: 700, color: 'black' }}>
              Detailed Report
            </Text>
          ) : (
            <Text
              style={{ fontSize: 24, fontWeight: 700, color: 'black' }}
              className="line-clamp-1"
            >
              {report?.position || 'Report'}
            </Text>
          )}

          <View className="w-8" />
        </View>
        {isViewDetails ? (
          <SkillCards skills={feedback?.report?.technical_skills || []} />
        ) : (
          <ScrollView className="flex-1 px-6 pt-4 space-y-6">
            <ArcGaugeFull size={360} percentage={74} />
            <InterviewCard
              title={report?.position || 'Report'}
              duration={report?.interviewDuration || 0}
              total={report?.duration || 0}
              interviewType={report?.type || ''}
            />
            <Tabs />

            <CarouselCard />
            <Pressable
              onPress={() => setIsViewDetails(true)}
              className="rounded-full w-full py-2 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(211, 127, 58, 1)' }}
            >
              <Text
                className="text-white py-2"
                style={{ fontSize: 20, fontWeight: 700 }}
              >
                See Detailed Report
              </Text>
            </Pressable>
            <AnalysisCards
              strengths={
                Array.isArray(feedback?.report?.strengths)
                  ? feedback?.report?.strengths
                  : []
              }
              weaknesses={
                Array.isArray(feedback?.report?.weaknesses)
                  ? feedback?.report?.weaknesses
                  : []
              }
            />
            <Pressable
              onPress={() => {}}
              className="flex-row rounded-full w-full py-2 items-center justify-center gap-4"
              style={{
                backgroundColor: 'rgba(109, 18, 192, 0.2)',
                borderWidth: 2,
                borderColor: 'rgba(109, 18, 192, 1)',
              }}
            >
              <Text
                className="text-white py-2"
                style={{ fontSize: 20, fontWeight: 700 }}
              >
                How to Improve
              </Text>
              <Image
                source={require('../assets/images/Rewind.png')}
                className="w-7 h-7"
                resizeMode="cover"
              />
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default ReportModal;
