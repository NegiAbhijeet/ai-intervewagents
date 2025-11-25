import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Tabs from './Tabs';
import CarouselCard from './reports/CarouselCard';
import ArcGaugeFull from './Guage';
import SkillCards from './SkillCards';
import InterviewCard from './InterviewCard';
import Ionicons from '@react-native-vector-icons/ionicons';
import ImprovementsPoints from './improvementsPoints';
import InterviewSummaryModal from './summaryModal';
import ReportCards from './ReportCards';
import Transcript from './Transcript';
import { useNavigation } from '@react-navigation/native';
import RewindImage from '../assets/images/Rewind.svg';
import RetryIamge from '../assets/images/Repeat.svg';
import { useTranslation } from 'react-i18next';
const ReportModal = ({
  visible,
  onClose,
  report,
  isViewDetails,
  setIsViewDetails,
  isViewSkills,
  setIsViewSkills,
}) => {
  const { t } = useTranslation();
  const feedback = report?.feedback || null;
  const navigation = useNavigation();
  const [showSummary, setShowSummary] = useState(false);
  const [showImprovementPoints, setShowImprovementPoints] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); //details or transcript
  function getScoreText(score) {
    if (score <= 25) return t('home.score.bad');
    if (score <= 75) return t('home.score.good');
    return t('home.score.excellent');
  }
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: 'white',
          paddingTop: 20,
        }}
      >
        {/* background image is a sibling of ScrollView, not a child */}
        <Image
          source={require('../assets/images/bgGradient.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translateY(250%)',
            height: '100%',
          }}
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 111,
            paddingHorizontal: 16,
            paddingVertical: 6,
          }}
          className="w-full flex-row items-center justify-between bg-white"
        >
          {isViewDetails || isViewSkills ? (
            <TouchableOpacity
              onPress={() => {
                setIsViewDetails(false);
                setIsViewSkills(false);
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
            <Text style={{ fontSize: 24, fontWeight: '700', color: 'black' }}>
              {t('reports.detailedReport')}
            </Text>
          ) : isViewSkills ? (
            <Text style={{ fontSize: 24, fontWeight: '700', color: 'black' }}>
              {t('reports.skillOverview')}
            </Text>
          ) : (
            <Text
              style={{ fontSize: 24, fontWeight: '700', color: 'black' }}
              className="line-clamp-1"
            >
              {report?.position || 'Report'}
            </Text>
          )}

          <View className="w-8" />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} className="py-5">
          {isViewDetails ? (
            <ReportCards
              interviewType={report?.interviewType}
              report={feedback?.report || null}
              setIsViewSkills={setIsViewSkills}
              setIsViewDetails={setIsViewDetails}
            />
          ) : isViewSkills ? (
            <SkillCards
              skills={feedback?.report?.technical_skills || []}
              setIsViewSkills={setIsViewSkills}
              setIsViewDetails={setIsViewDetails}
            />
          ) : (
            <View className="flex-1 px-6 pt-4 gap-6">
              <ArcGaugeFull
                percentage={report?.feedback?.averagePercentage || 0}
              />
              <InterviewCard
                title={report?.position || 'Report'}
                duration={report?.interviewDuration || 0}
                total={report?.duration || 0}
                interviewType={report?.interviewType || ''}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: ' rgba(242, 242, 242, 0.4)',
                    borderRadius: 16,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderWidth: 2,
                    borderColor: 'rgba(221, 221, 221, 1)',
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#d9d9d9',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 6,
                      borderWidth: 2,
                      borderColor: 'rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <Text
                      style={{ color: '#555', fontWeight: '700', fontSize: 12 }}
                    >
                      i
                    </Text>
                  </View>

                  <Text style={{ fontSize: 14, color: '#333', fontSize: 12 }}>
                    {t('home.youScored', { scoreText: getScoreText(report?.feedback?.averagePercentage || 0) })}
                  </Text>

                  <Pressable onPress={() => setShowSummary(true)} hitSlop={6}>
                    <Text
                      style={{
                        fontSize: 12,
                        marginLeft: 6,
                        textDecorationLine: 'underline'
                      }}
                    >
                      {t('reports.viewSummary')}
                    </Text>
                  </Pressable>

                  {showSummary && (
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#2e7d32',
                        fontWeight: '600',
                      }}
                    >
                      Summary Visible
                    </Text>
                  )}
                </View>
              </View>
              <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
              {activeTab === 'transcript' ? (
                <Transcript transcript={report?.feedback?.transcript || []} />
              ) : (
                <>
                  <CarouselCard
                    setIsViewDetails={setIsViewDetails}
                    interviewType={report?.interviewType}
                    report={feedback?.report || null}
                    setShowImprovementPoints={setShowImprovementPoints}
                  />

                  {/* <AnalysisCards
                    setShowImprovementPoints={setShowImprovementPoints}
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
                  /> */}

                  <View className="items-center justify-center gap-4">
                    <Pressable
                      onPress={() => setShowImprovementPoints(true)}
                      className="flex-row items-center justify-center gap-4"
                      style={{
                        backgroundColor: 'rgba(109, 18, 192, 0.2)',
                        borderWidth: 1,
                        borderColor: 'rgba(109, 18, 192, 1)',
                        borderRadius: 10,
                        paddingHorizontal: 25,
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        className="text-white"
                        style={{ fontSize: 20, fontWeight: 700 }}
                      >
                        {t('analysis.howToImprove')}
                      </Text>

                      <RewindImage />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        navigation.navigate('interview', {
                          type: report?.interviewType || '',
                          skills: report?.candidateRequiredSkills || [],
                          position: report?.position || '',
                        });
                        onClose();
                      }}
                      className="flex-row items-center justify-center gap-4"
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(60, 60, 60, 1)',
                        borderRadius: 10,
                        paddingHorizontal: 25,
                        paddingVertical: 10,
                      }}
                    >
                      <RetryIamge />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'rgba(60, 60, 60, 1)',
                        }}
                      >
                        {t('analysis.tryAgain')}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}
          <ImprovementsPoints
            visible={showImprovementPoints}
            onClose={() => setShowImprovementPoints(false)}
            data={report?.feedback?.nextSteps || []}
          />
          <InterviewSummaryModal
            visible={showSummary}
            onClose={() => setShowSummary(false)}
            summaryText={report?.feedback?.report?.analysis_summary || ''}
          />
          <View className="h-8"></View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default ReportModal;
