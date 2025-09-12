import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button } from 'react-native';
// import downloadPdf from '@/components/downloadPdf';

// Placeholder components (implement them later)
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
// import { Download } from 'lucide-react';
import { InterviewTranscript } from '../components/ui/InterviewTranscript';
import { SkillAssessment } from '../components/ui/skill-assessment';
// import { FeedbackCards } from '@/components/FeedbackCards';
// import FullWidthideo from '@/components/FullWidthVideo';
import { AppStateContext } from '../components/AppContext';
import fetchWithAuth from '../libs/fetchWithAuth';
import { JAVA_API_URL } from '../components/config';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

const ReportDetailScreen = ({ route }) => {
  const { meetingId } = route.params;
  const navigation = useNavigation();
  const { userProfile } = useContext(AppStateContext);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  const fetchMeetingData = async () => {
    try {
      const response = await fetchWithAuth(
        `${JAVA_API_URL}/api/meetings/${meetingId}`,
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      const data = result?.data;
      setReportData(data);
      setOverallScore(data?.feedback?.averagePercentage || 0);
    } catch (error) {
      console.error('Error fetching report:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.uid && meetingId) fetchMeetingData();
  }, [userProfile, meetingId]);

  const candidate = reportData?.candidateDetails;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>
          Loading report...
        </Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Card>
          <CardHeader>
            <CardTitle>No Data Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={{ color: '#6B7280' }}>
              We couldn’t retrieve the report. Please try again later.
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  if (!reportData.feedback) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Card>
          <CardHeader>
            <CardTitle>No Feedback Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={{ color: '#6B7280' }}>
              This report doesn't contain any feedback yet.
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
      {/* Main Card */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: 16 }}
      >
        <Ionicons name="arrow-back" size={24} color={'black'} />
      </TouchableOpacity>
      <Card>
        <CardHeader>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar>
                <AvatarFallback>
                  {candidate?.firstName?.[0]}
                  {candidate?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <View style={{ marginLeft: 12 }}>
                <CardTitle>
                  {candidate?.firstName} {candidate?.lastName}
                </CardTitle>
                <CardDescription>{reportData?.position}</CardDescription>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <Badge variant="outline">{overallScore}% Overall Match</Badge>
                  <Badge variant="outline" style={{ marginLeft: 8 }}>
                    {reportData?.interviewDate}
                  </Badge>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {}}
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: '#3B82F6',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="download" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">
                <Text>Summary</Text>
              </TabsTrigger>
              <TabsTrigger value="skills">
                <Text>Skills</Text>
              </TabsTrigger>
              <TabsTrigger value="transcript">
                <Text>Transcript</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <View style={{ padding: 0 }}>
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 18,
                    marginBottom: 12,
                    color: '#333',
                  }}
                >
                  Interview Summary
                </Text>
                <Text style={{ fontSize: 16, color: '#555' }}>
                  {reportData?.feedback?.report?.analysis_summary ||
                    'No summary available.'}
                </Text>

                {/* Strengths & Weaknesses */}
                {(reportData?.feedback?.report?.strengths.length > 0 ||
                  reportData?.feedback?.report?.weaknesses.length > 0) && (
                  <View style={{ marginTop: 24 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Strengths */}
                      {reportData?.feedback?.report?.strengths.length > 0 && (
                        <View
                          style={{ flex: 1, marginRight: 12, minWidth: '45%' }}
                        >
                          <Text
                            style={{
                              fontWeight: '700',
                              fontSize: 16,
                              marginBottom: 8,
                              color: '#333',
                            }}
                          >
                            Strengths
                          </Text>
                          {reportData?.feedback?.report?.strengths.map(
                            (s, i) => (
                              <View
                                key={i}
                                style={{
                                  flexDirection: 'row',
                                  marginBottom: 6,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: '#555',
                                    marginRight: 6,
                                  }}
                                >
                                  •
                                </Text>
                                <Text
                                  style={{
                                    flex: 1,
                                    fontSize: 16,
                                    color: '#555',
                                  }}
                                >
                                  {s}
                                </Text>
                              </View>
                            ),
                          )}
                        </View>
                      )}

                      {/* Areas for Improvement */}
                      {reportData?.feedback?.report?.weaknesses.length > 0 && (
                        <View style={{ flex: 1, minWidth: '45%' }}>
                          <Text
                            style={{
                              fontWeight: '700',
                              fontSize: 16,
                              marginBottom: 8,
                              color: '#333',
                            }}
                          >
                            Areas for Improvement
                          </Text>
                          {reportData?.feedback?.report?.weaknesses.map(
                            (w, i) => (
                              <View
                                key={i}
                                style={{
                                  flexDirection: 'row',
                                  marginBottom: 6,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: '#555',
                                    marginRight: 6,
                                  }}
                                >
                                  •
                                </Text>
                                <Text
                                  style={{
                                    flex: 1,
                                    fontSize: 16,
                                    color: '#555',
                                  }}
                                >
                                  {w}
                                </Text>
                              </View>
                            ),
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Next Steps */}
                {reportData?.feedback?.nextSteps?.length > 0 && (
                  <View style={{ marginTop: 24 }}>
                    <Text
                      style={{
                        fontWeight: '700',
                        fontSize: 18,
                        marginBottom: 12,
                        color: '#333',
                      }}
                    >
                      Next Steps
                    </Text>
                    {reportData?.feedback?.nextSteps.map((step, index) => (
                      <View
                        key={index}
                        style={{ flexDirection: 'row', marginBottom: 12 }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#555',
                            marginRight: 8,
                          }}
                        >
                          {index + 1}.
                        </Text>
                        <Text style={{ flex: 1, fontSize: 16, color: '#555' }}>
                          {step.step}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TabsContent>

            <TabsContent value="skills">
              <SkillAssessment
                skills={reportData?.feedback?.report?.technical_skills}
              />
            </TabsContent>

            <TabsContent value="transcript">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Transcript</CardTitle>
                  <CardDescription>
                    Full transcript with {candidate?.firstName}{' '}
                    {candidate?.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InterviewTranscript
                    messages={reportData?.feedback?.transcript}
                    interviewerName={reportData?.interviewers?.[0]}
                    candidateName={`${candidate?.firstName} ${candidate?.lastName}`}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sidebar - Interview Details */}
      <Card className="my-4 mb-8">
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Text style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Candidate Name: </Text>
            {candidate?.firstName} {candidate?.lastName}
          </Text>

          <Text style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Date & Time: </Text>
            {reportData?.interviewDate}, {reportData?.interviewTime}
          </Text>

          <Text style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>AI Agent: </Text>
            {reportData?.interviewers?.[0]}
          </Text>

          <Text style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>Position: </Text>
            {reportData?.position}
          </Text>

          <Button title="View Full Report" />
        </CardContent>
      </Card>
    </ScrollView>
  );
};

export default ReportDetailScreen;
