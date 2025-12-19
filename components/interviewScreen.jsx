import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  Easing,
  Modal,
  PermissionsAndroid,
  Platform,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';

import { Camera, useCameraDevices } from 'react-native-vision-camera'; // ✅ Camera
import useAudioPlayer from '../hooks/useAudioPlayer';
import useAudioRecorder from '../hooks/useAudioRecorder';
import useRealTime from '../hooks/useRealtime';
import Ionicons from '@react-native-vector-icons/ionicons';
import Timer from './timer';
import AIAgent from './AIAgent';
import { useNavigation } from '@react-navigation/native';
import { AppStateContext } from './AppContext';
import { JAVA_API_URL } from './config';
import { useTranslation } from 'react-i18next';
import ExitInterviewModal from './quitPopup';
import ExitReasonsModal from './quitFeedback';
import ToggleButton from './ToggleButton';
import Layout from '../pages/Layout';
import { ScrollView } from 'react-native-gesture-handler';
import SelectInterviewType from './SelectInterviewType';

const CallUI = ({
  agentId,
  canId,
  meetingId,
  interviewType,
  adminId,
  interviewTime,

  candidateName,

  showInterviewScreen,
  setShowInterviewScreen,

  skills,
  position,
  duration = 10,

  selectedInterviewType,
  setSelectedInterviewType
}) => {
  const { userProfile, setUserProfile, language } = useContext(AppStateContext);
  const { t } = useTranslation();
  const initialStartRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cameraOn, setCameraOn] = useState(false); // ✅ Camera toggle state
  const [micOn, setMicOn] = useState(true); // ✅ Mic toggle state
  const navigation = useNavigation();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [quitStep, setQuitStep] = useState(null)
  const [interviewEnded, setInterviewEnded] = useState(false);
  const interviewDurationSeconds = Number(interviewTime);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  function handleInterviewCompletion() {
    setIsLoading(true);
    setInterviewEnded(true);
    stopAudioRecording();
    stopAudioPlayer();

    fetch(`${JAVA_API_URL}/api/meetings/update/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interviewDuration: elapsedSeconds }),
    })
      .catch(error => {
        console.error('Error updating meeting:', error);
      })
      .finally(() => {
        setTimeout(() => {
          sendInterviewCompleted();
          setHasStarted(false);
          setShowInterviewScreen(false);
          setIsLoading(false);
          setUserProfile(prev => ({
            ...prev,
            seconds_used: (prev?.seconds_used || 0) + elapsedSeconds,
          }));

          navigation.navigate('reports', { meetingId });
        }, 2000);
      })
  }
  function halfHandleInterviewCompletion() {
    setIsLoading(true);
    setInterviewEnded(true);
    stopAudioRecording();
    stopAudioPlayer();

    fetch(`${JAVA_API_URL}/api/meetings/update/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interviewDuration: elapsedSeconds }),
    })
      .catch(error => {
        console.error('Error updating meeting:', error);
      })
  }
  const { startSession, addUserAudio, sendInterviewCompleted } = useRealTime({
    agentId,
    canId,
    meetingId,
    interviewType,
    adminId,
    interviewTime,
    language,
    onWebSocketOpen: () => { },
    onWebSocketClose: () => { },
    onWebSocketError: () => { },
    onReceivedError: () => { },
    onInterviewEndConfirmed: () => {
      handleInterviewCompletion();
    },
    onReceivedResponseAudioDelta: message => {
      if (message?.delta) {
        playAudio(message.delta);
      }
    },
    onReceivedInputAudioBufferSpeechStarted: () => {
      stopAudioPlayer();
    },
  });

  const {
    init: initAudioPlayer,
    play: playAudio,
    stop: stopAudioPlayer,
  } = useAudioPlayer();

  const { start: startAudioRecording, stop: stopAudioRecording } =
    useAudioRecorder({
      onAudioRecorded: addUserAudio,
    });

  const devices = useCameraDevices();

  const cameraDevice = devices.find(d => d.position === 'front');

  useEffect(() => {
    const requestPermissions = async () => {
      const micPermission = await requestMicrophonePermission();
      setHasMicPermission(micPermission);
      setMicOn(micPermission);
    };

    if (showInterviewScreen) {
      requestPermissions();
    }
  }, [showInterviewScreen]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone for the interview.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }

    // On iOS, permission is usually prompted when needed. Assume true for now.
    return true;
  };

  // Interview timer and wrap-up logic
  useEffect(() => {
    if (!hasStarted || interviewEnded || !interviewDurationSeconds) return;

    // Set real start time only once
    if (!initialStartRef.current) {
      initialStartRef.current = Date.now();
    }

    const skipSeconds = 3 * 60;
    const maxRestarts = Math.floor(
      (interviewDurationSeconds - 60) / skipSeconds,
    );
    let restartCount = 0;

    // Wrap-up control
    let wrapUpStartTime = null;
    let wrapUpTriggerCount = 0;
    const wrapUpMaxTriggers = 3; // Call wrap-up 4 times
    const wrapUpIntervalSeconds = 5;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor(
        (now - (initialStartRef.current || now)) / 1000,
      );
      const remaining = interviewDurationSeconds - elapsed;

      if (remaining <= 60) {
        if (!wrapUpStartTime) {
          console.log('Entering wrap-up phase: value:3');
          wrapUpStartTime = now;
          startSession('3');
          wrapUpTriggerCount = 1;
        } else {
          const wrapUpElapsed = Math.floor((now - wrapUpStartTime) / 1000);
          if (
            wrapUpTriggerCount < wrapUpMaxTriggers &&
            wrapUpElapsed >= wrapUpTriggerCount * wrapUpIntervalSeconds
          ) {
            console.log(`Wrap-up repeat #${wrapUpTriggerCount + 1}: value:3`);
            startSession('3');
            wrapUpTriggerCount++;
          }
        }
        return; // Don't allow restarts during wrap-up
      }

      if (
        elapsed > 0 &&
        elapsed % skipSeconds === 0 &&
        restartCount < maxRestarts
      ) {
        console.log(
          `Restarting at ${elapsed}s (restart #${restartCount + 1}) value:2`,
        );
        startSession('2');
        restartCount++;
      }
    }, 1000);

    const timeout = setTimeout(() => {
      console.log('Interview complete finalizing');
      handleInterviewCompletion();
    }, (interviewDurationSeconds + 20) * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hasStarted, interviewEnded, interviewDurationSeconds]);
  const handleCameraToggle = async () => {
    if (!hasCameraPermission) {
      const permission = await Camera.requestCameraPermission();
      const granted = permission === 'granted';
      setHasCameraPermission(granted);

      if (!granted) {
        Alert.alert(
          'Camera Permission Denied',
          'Please enable camera access from Settings to use this feature.',
        );
        return;
      }
    }

    setCameraOn(prev => !prev);
  };
  const handleMicToggle = async () => {
    if (!hasMicPermission) {
      console.log('===11');
      const granted = await requestMicrophonePermission();
      setHasMicPermission(granted);
      if (!granted) {
        Alert.alert(
          'Microphone Permission Denied',
          'Please enable microphone access from Settings to use this feature.',
        );
        return;
      }
    }

    setMicOn(prev => !prev);
    if (!micOn) {
      startAudioRecording();
    } else {
      stopAudioRecording();
    }
  };

  const handleManualStart = async () => {
    try {
      setIsFetching(true);

      const res = await fetch(
        'https://python.backend.aiinterviewagents.com/api/verify-meeting/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'azure',
            meetingId: meetingId,
            candidateId: canId,
            agentId: agentId,
            duration: interviewTime,
            role: 'candidate',
          }),
        },
      );

      if (!res.ok) {
        let errorMsg = 'Failed to connect. Please refresh or try again later.';
        try {
          const errorJson = await res.json();
          if (errorJson?.message) errorMsg = errorJson.message;
        } catch (e) {
          // keep default errorMsg if parsing fails
        }
        throw new Error(errorMsg);
      }

      try {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Microphone permission is required to start the interview.',
          );
          return;
        }

        startSession('1');
        startAudioRecording();
        setHasStarted(true);
      } catch (err) {
        console.error('Microphone/setup failed:', err);
        Alert.alert(
          'Error',
          'Microphone permission denied or error starting session.',
        );
        // optionally update UI error state too
        setError(err.message || 'Error starting audio session');
      }
    } catch (err) {
      console.error('Setup failed:', err);
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showInterviewScreen}
      onRequestClose={() => setShowInterviewScreen(false)}
    >
      <Layout gradientType='3' removePadding={hasStarted ? true : false}>
        {
          selectedInterviewType ?
            <View style={{ flex: 1, paddingBottom: hasStarted ? 0 : 170 }}>
              {
                !hasStarted ?
                  <ScrollView style={{ flex: 1, height: "100%" }} showsVerticalScrollIndicator={false}>
                    <View
                      style={{
                        width: "100%", height: "100%"
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          marginHorizontal: "auto"
                        }}
                      >
                        <View style={styles.preInterviewContainer}>
                          {/* Header Card */}
                          <View style={styles.headerCard}>
                            <View style={styles.headerCard1}>
                              <View style={{ flex: 1, }}>
                                <Text style={styles.roleTitle} numberOfLines={1}>{position || ''}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                  <Ionicons name="time" size={18} color="rgba(0, 0, 0, 0.5)" />
                                  <Text style={styles.durationText}>{duration || 15} minutes</Text>
                                </View>
                              </View>
                              <View style={styles.briefcaseIcon}>
                                <Ionicons name="briefcase" size={18} color="rgba(105, 28, 194, 1)" />
                              </View>
                            </View>
                            <View style={{ height: 1, width: "100%", backgroundColor: "rgba(191, 191, 191, 0.4)", marginVertical: 16 }}></View>


                            {/* Skills */}
                            <Text style={styles.sectionTitle}>Skills Being Assessed</Text>
                            <View style={styles.skillWrap}>
                              {(skills || ['UI/UX Design', 'Figma', 'Prototyping', 'User Research', 'Design Systems']).map(
                                (skill, index) => (
                                  <View key={index} style={styles.skillChip}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                  </View>
                                )
                              )}
                            </View>
                          </View>
                          {/* Instructions Card */}

                          <View style={{
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            boxShadow: "0px 8.19px 10.24px -6.14px rgba(0, 0, 0, 0.1), 0px 20.48px 25.6px -5.12px rgba(0, 0, 0, 0.1), 0px -1px 4px 0px rgba(0, 0, 0, 0.2)",
                          }}>
                            <Text style={styles.instructionsTitle}>Interview Instructions</Text>

                            <View style={styles.instructionRow}>
                              <View style={{ backgroundColor: "rgba(96, 165, 250, 1)", height: 40, width: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name="mic" size={16} color="#fff" />
                              </View>
                              <Text style={styles.instructionText}>
                                Start the interview by saying <Text style={styles.highlightText}>"Hello"</Text>
                              </Text>
                            </View>

                            <View style={styles.instructionRow}>
                              <View style={{ backgroundColor: "rgba(192, 132, 252, 1)", height: 40, width: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name="volume-mute" size={16} color="#fff" />
                              </View>
                              <Text style={styles.instructionText}>
                                Sit in a <Text style={styles.highlightText}>quiet environment</Text> without distractions
                              </Text>
                            </View>

                            <View style={styles.instructionRow}>
                              <View style={{ backgroundColor: "rgba(74, 222, 128, 1)", height: 40, width: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name="wifi" size={16} color="#fff" />
                              </View>
                              <Text style={styles.instructionText}>
                                Ensure a <Text style={styles.highlightText}>stable internet connection</Text>
                              </Text>
                            </View>

                            <View style={styles.instructionRow}>
                              <View style={{ backgroundColor: "rgba(250, 204, 21, 1)", height: 40, width: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name="bulb" size={16} color="#fff" />
                              </View>
                              <Text style={styles.instructionText}>
                                Stay in a <Text style={styles.highlightText}>well lit place</Text> for best video quality
                              </Text>
                            </View>
                            <View style={{ height: 1, width: "100%", backgroundColor: "rgba(0, 0, 0, 0.25)", marginVertical: 16 }}></View>

                            <View style={styles.infoNote}>
                              <Ionicons name="information-circle" size={18} color="rgba(37, 99, 235, 1)" />
                              <Text style={styles.infoText}>
                                Turn on your camera and microphone to begin the interview smoothly now.
                              </Text>
                            </View>
                          </View>

                        </View>
                      </View>
                    </View>
                  </ScrollView> :
                  <View style={{ flex: 1 }}>
                    <Timer
                      elapsedSeconds={elapsedSeconds}
                      setElapsedSeconds={setElapsedSeconds}
                      sessionDurationSeconds={interviewTime - 60}
                      terminateSession={handleInterviewCompletion}
                    />
                    <AIAgent isAgentSpeaking={true} />

                    {
                      quitStep === 1 ?
                        <ExitInterviewModal onContinue={() => setQuitStep(null)} onQuit={async () => { await halfHandleInterviewCompletion(); setQuitStep(2) }} />
                        : (quitStep === 2 ?
                          <ExitReasonsModal
                            uid={userProfile?.uid}
                            name={candidateName}
                            onContinue={async () => {
                              sendInterviewCompleted();
                              setHasStarted(false);
                              setShowInterviewScreen(false);
                              setIsLoading(false);
                              setUserProfile(prev => ({
                                ...prev,
                                seconds_used: (prev?.seconds_used || 0) + elapsedSeconds,
                              }));

                              navigation.navigate('reports', { meetingId });
                            }} />
                          : <></>
                        )
                    }

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {cameraOn && cameraDevice && hasCameraPermission ? (
                        <Camera
                          style={{
                            flex: 1,
                            borderRadius: 16,
                            overflow: 'hidden',
                            width: '100%'
                          }}
                          device={cameraDevice}
                          isActive={cameraOn && showInterviewScreen}
                        />
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 24,
                          }}
                        >
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 20,
                              fontWeight: 'bold',
                              marginBottom: 12
                            }}
                          >
                            {t('interview.cameraOffTitle')}
                          </Text>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 16,
                              textAlign: 'center'
                            }}
                          >
                            {t('interview.cameraOffMessage')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
              }


              <View
                style={{
                  paddingHorizontal: 20,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  gap: 22,
                  height: 160,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 20
                  }}
                >
                  <ToggleButton
                    value={micOn}
                    onToggle={handleMicToggle}
                    iconOn="mic-outline"
                    iconOff="mic-off-outline"
                  />
                  <ToggleButton
                    value={cameraOn}
                    onToggle={handleCameraToggle}
                    iconOn="videocam-outline"
                    iconOff="videocam-off-outline"
                  />
                </View>

                {
                  hasStarted ?
                    <TouchableOpacity
                      disabled={isLoading || isFetching}
                      onPress={() => setQuitStep(1)}
                      style={{
                        paddingVertical: 18,
                        paddingHorizontal: 28,
                        backgroundColor: "#d32f2f",
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {t('interview.btn_end')}
                      </Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                      disabled={!micOn}
                      onPress={handleManualStart}
                      style={{
                        paddingVertical: 18,
                        paddingHorizontal: 28,
                        backgroundColor: (!micOn) ? 'rgba(255, 255, 255, 0.25)' : "rgba(0,0,0)",
                        borderRadius: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: '600',
                          width: "100%",
                          textAlign: 'center',
                        }}
                      >
                        {isFetching ? "Please wait..." : "Let’s start"}
                      </Text>
                    </TouchableOpacity>
                }
              </View>
            </View>
            : <SelectInterviewType onClose={() => { setShowInterviewScreen(false); setSelectedInterviewType("") }} setSelectedInterviewType={setSelectedInterviewType} />}
      </Layout>
    </Modal>
  );
};

export default CallUI;
const styles = {
  preInterviewContainer: {
    flex: 1,
    padding: 12,
  },


  headerCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    boxShadow: "0px 4.1px 6.14px -4.1px rgba(0, 0, 0, 0.1),0px 10.24px 15.36px -3.07px rgba(0, 0, 0, 0.1)",
  },
  headerCard1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(60, 60, 60, 1)'
  },

  durationText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: -1
  },

  briefcaseIcon: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 999
  },

  sectionTitle: {
    width: "100%",
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    textAlign: "left"
  },

  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skillChip: {
    backgroundColor: 'rgba(217, 217, 217, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
  },

  skillText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)'
  },

  instructionsTitle: {
    width: "100%",
    textAlign: "center",
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: 'rgba(31, 41, 55, 1)'
  },

  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },

  instructionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1
  },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 246, 255, 0.4)',
    padding: 12,
    borderRadius: 12,
  },

  infoText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    fontWeight: 400
  },

  highlightText: {
    fontWeight: 700,
    color: "rgba(31, 41, 55, 1)"
  }
}