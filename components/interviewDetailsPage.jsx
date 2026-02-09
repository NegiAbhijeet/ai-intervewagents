import { Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { secondsToMinutes } from '../libs/getInterviewTime';
import Ionicons from '@react-native-vector-icons/ionicons';
import ToggleButton from './ToggleButton';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

const InterviewDetailsPage = ({
    interviewTime,
    skills,
    handleMicToggle,
    handleCameraToggle,
    hasCameraPermission,
    cameraOn,
    isFetching,
    handleManualStart,
    position,
    micOn
}) => {
    const devices = useCameraDevices();
    const cameraDevice = devices.find(d => d.position === 'front');

    return (
        <View style={{ flex: 1, }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.preInterviewContainer}>

                    {/* HEADER CARD */}
                    <View style={styles.headerCard}>
                        <View style={styles.headerRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.roleTitle} numberOfLines={1}>
                                    {position || ''}
                                </Text>
                                <Text style={styles.subTitle}>Technical Interview</Text>
                            </View>

                            <View style={styles.timePill}>
                                <Ionicons name="time-outline" size={14} color="#000" />
                                <Text style={styles.timeText}>
                                    {secondsToMinutes(interviewTime) || 10} mins
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Skills Being Assessed</Text>

                        <View style={styles.skillWrap}>
                            {(skills || []).map((skill, index) => (
                                <View key={index} style={styles.skillChip}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* INSTRUCTIONS CARD */}
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionsTitle}>Interview Instructions</Text>

                        <View style={styles.instructionRow}>
                            <View style={[styles.iconBubble, { backgroundColor: '#000' }]}>
                                <Ionicons name="mic" size={16} color="#fff" />
                            </View>
                            <Text style={styles.instructionText}>
                                Click <Text style={styles.highlightText}>“Start Speaking”</Text> to begin answering a question.
                            </Text>
                        </View>

                        <View style={styles.instructionRow}>
                            <View style={[styles.iconBubble, { backgroundColor: '#000' }]}>
                                <Ionicons name="pause" size={16} color="#fff" />
                            </View>
                            <Text style={styles.instructionText}>
                                Click <Text style={styles.highlightText}>“Stop Speaking”</Text> once you finish the answer.
                            </Text>
                        </View>

                        <View style={styles.videoBox}>
                            {cameraOn && cameraDevice && hasCameraPermission ? (
                                <Camera
                                    style={{ width: '100%', height: '100%' }}
                                    device={cameraDevice}
                                    isActive={cameraOn}
                                />
                            ) : (
                                <View style={styles.cameraOffState}>
                                    <Ionicons name="videocam-off-outline" size={32} color="#9CA3AF" />
                                    <Text style={styles.cameraOffText}>Camera is off</Text>
                                </View>
                            )}
                        </View>

                        {/* BOTTOM CONTROLS */}
                        <View style={styles.bottomBar}>
                            <View style={styles.toggleRow}>
                                <ToggleButton
                                    isActive={micOn}
                                    onToggle={handleMicToggle}
                                    iconOn="mic-outline"
                                    iconOff="mic-off-outline"
                                />
                                <ToggleButton
                                    isActive={cameraOn}
                                    onToggle={handleCameraToggle}
                                    iconOn="videocam-outline"
                                    iconOff="videocam-off-outline"
                                />
                            </View>

                            <TouchableOpacity
                                disabled={!micOn || isFetching}
                                onPress={handleManualStart}
                                style={[
                                    styles.startButton,
                                    (!micOn || isFetching) && { backgroundColor: '#9CA3AF' }
                                ]}
                            >
                                <Text style={styles.startButtonText}>
                                    {isFetching ? 'Please wait...' : 'Let’s start'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default InterviewDetailsPage

const styles = {
    preInterviewContainer: {
        // padding: 16,
    },

    headerCard: {
        backgroundColor: '#DED0F3',
        borderRadius: 20,
        padding: 16,
        marginVertical: 20,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

    roleTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },

    subTitle: {
        fontSize: 12,
        color: '#4B5563',
        marginTop: 4,
        fontWeight: 400
    },

    timePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    timeText: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        color: '#374151',
    },

    skillWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    skillChip: {
        backgroundColor: '#FFF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },

    skillText: {
        fontSize: 10,
        color: '#000',
        fontWeight: 500
    },

    instructionsCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        borderColor: 'rgba(0, 0, 0, 0.25)',
        borderWidth: 1,
        paddingTop: 20,
        paddingBottom: 40
    },

    instructionsTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
    },

    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },

    iconBubble: {
        height: 36,
        width: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    instructionText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },

    highlightText: {
        fontWeight: '700',
    },

    videoBox: {
        height: 160,
        backgroundColor: '#0F172A',
        borderRadius: 16,
        marginVertical: 20,
        overflow: 'hidden',
    },

    bottomIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },

    circleIcon: {
        height: 52,
        width: 52,
        borderRadius: 26,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    bottomBar: {
        gap: 18,
    },

    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },

    startButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 16,
    },

    startButtonText: {
        color: '#FFF',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
    cameraOffState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    cameraOffText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E5E7EB',
    },
}
