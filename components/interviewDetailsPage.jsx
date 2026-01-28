import { Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { secondsToMinutes } from '../libs/getInterviewTime';
import Ionicons from '@react-native-vector-icons/ionicons';
import ToggleButton from './ToggleButton';

const InterviewDetailsPage = ({ interviewTime, skills, handleMicToggle, handleCameraToggle, cameraOn, isFetching, handleManualStart, position, micOn }) => {
    return (
        <View style={{ flex: 1, paddingBottom: 170 }}>
            <ScrollView style={{ flex: 1, height: "100%" }} showsVerticalScrollIndicator={false}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        width: "100%",
                        height: "100%"
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
                                        <Text style={styles.durationText}>{secondsToMinutes(interviewTime) || 10} minutes</Text>
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
                                {(skills || []).map(
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
            </ScrollView>

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
                    style={{
                        paddingVertical: 18,
                        paddingHorizontal: 28,
                        backgroundColor: (!micOn || isFetching) ? 'rgba(255, 255, 255, 0.25)' : "rgba(0,0,0)",
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
            </View>
        </View>
    )
}

export default InterviewDetailsPage

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
        width: "100%",
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