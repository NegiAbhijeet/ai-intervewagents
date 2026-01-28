import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    Image,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera'; // ✅ Camera
import Timer from "../components/timer"
import AudioRecord from 'react-native-audio-record';
import useAudioPlayer from '../hooks/useAudioPlayer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import BackgroundGradient2 from './backgroundGradient2';
import ExitInterviewModal from './quitPopup';
import ExitReasonsModal from './quitFeedback';
import ChatLoader from "./chatLoader"
import ToggleButton from './ToggleButton';
const WS_URL = 'wss://room.aiinterviewagents.com/ws/voice/';

export default function MainInterviewRoom({ meetingId, interviewTime, cameraOn, setCameraOn, hasStarted, handleInterviewCompletion, quitStep, setQuitStep, halfHandleInterviewCompletion, uid, candidateName, position }) {
    const devices = useCameraDevices();

    const cameraDevice = devices.find(d => d.position === 'front');
    const wsRef = useRef(null);
    const ttsDoneRef = useRef(false);
    const transcriptScrollRef = useRef(null);
    const showLoaderRef = useRef(false);

    const isAudioPlayingRef = useRef(false);
    const pendingAgentTextRef = useRef(null);
    const agentMessageShownRef = useRef(false);
    const activeAudioChunksRef = useRef(0);

    const [showTranscript, setShowTranscript] = useState(true);
    const [socketConnected, setSocketConnected] = useState(false);
    const [socketConnecting, setSocketConnecting] = useState(false);
    const [status, setStatus] = useState('idle');
    const [messages, setMessages] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);

    const {
        init: initAudioPlayer,
        play: playAudio,
        stop: stopAudioPlayer,
    } = useAudioPlayer();

    useEffect(() => {
        transcriptScrollRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    // 2. Keep the Ref in sync with state
    useEffect(() => {
        showLoaderRef.current = showLoader;
    }, [showLoader]);

    /* ---------------- LIFECYCLE ---------------- */
    useEffect(() => {
        if (hasStarted && meetingId) {
            connectWebSocket();
            initAudioPlayer();
            return () => wsRef.current?.close();
        }
    }, [hasStarted, meetingId]);

    async function handleCameraToggle() {
        if (!hasCameraPermission) {
            const permission = await Camera.requestCameraPermission();
            if (permission !== 'granted') return;
            setHasCameraPermission(true);
        }

        setCameraOn(prev => !prev);
    }

    const connectWebSocket = () => {
        if (wsRef.current || socketConnecting) return;

        setSocketConnecting(true);

        const ws = new WebSocket(
            `${WS_URL}?meeting_id=${meetingId}&interview_duration=${interviewTime}`
        );

        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
            setSocketConnected(true);
            setSocketConnecting(false);
        };

        ws.onclose = () => {
            setSocketConnected(false);
            wsRef.current = null;
        };

        ws.onerror = () => {
            setSocketConnecting(false);
            Alert.alert('Connection error');
        };

        ws.onmessage = handleWsMessage;

        wsRef.current = ws;
    };

    function forceIdleState() {
        ttsDoneRef.current = false;
        isAudioPlayingRef.current = false;
        activeAudioChunksRef.current = 0;

        pendingAgentTextRef.current = null;
        agentMessageShownRef.current = false;

        // stopAudioPlayer();
        setShowLoader(false);
        setStatus('idle');
    }

    function tryExitAiSpeaking() {
        if (
            ttsDoneRef.current &&
            activeAudioChunksRef.current === 0
        ) {
            forceIdleState();
        }
    }

    function handleAgentAudio(arrayBuffer) {
        // 1. IMMEDIATELY hide loader when the very first chunk arrives
        if (showLoaderRef.current) {
            setShowLoader(false);
        }

        if (
            pendingAgentTextRef.current &&
            !agentMessageShownRef.current
        ) {
            setMessages(prev => [
                ...prev,
                {
                    role: 'Nova',
                    text: pendingAgentTextRef.current,
                    time: new Date().toLocaleTimeString(),
                },
            ]);

            setStatus('ai-speaking');
            agentMessageShownRef.current = true;
        }

        activeAudioChunksRef.current += 1;


        playAudio(arrayBuffer, {
            onEnd: () => {
                console.log("onend called")
                activeAudioChunksRef.current -= 1;
                tryExitAiSpeaking();
            },
        });
    }

    const handleWsMessage = event => {
        // 🔊 Binary audio from backend
        if (event.data instanceof ArrayBuffer) {
            handleAgentAudio(event.data);
            return;
        }

        // 📦 JSON messages
        const data = JSON.parse(event.data);

        if (data.type === 'transcript') {
            setMessages(prev => [
                ...prev,
                { role: 'You', text: data.text },
            ]);
        }

        if (data.type === 'assistant_text') {
            ttsDoneRef.current = false;
            pendingAgentTextRef.current = data.text;
            agentMessageShownRef.current = false;
            setShowLoader(true);
        }

        if (data.type === 'tts_done') {
            ttsDoneRef.current = true;
            tryExitAiSpeaking();
        }

        if (data.type === 'interview.completed') {
            terminateInterview();
        }
    };

    /* ---------------- AUDIO RECORDING ---------------- */
    const startRecording = async () => {
        // if (!socketConnected || status !== 'idle') return;
        if (!socketConnected) return;
        setStatus('recording');
        setShowLoader(false);
        AudioRecord.init({
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            wavFile: 'input.wav',
        });

        AudioRecord.on('data', data => {
            if (wsRef.current) {
                wsRef.current.send(base64ToArrayBuffer(data));
            }
        });

        AudioRecord.start();
    };

    const stopRecording = async () => {
        if (status !== 'recording') return;

        await AudioRecord.stop();
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
        setStatus('idle');
        setShowLoader(true);
    };

    /* ---------------- UTILS ---------------- */
    const base64ToArrayBuffer = base64 => {
        const binary = global.atob(base64);
        const len = binary.length;
        const buffer = new ArrayBuffer(len);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    };

    const terminateInterview = () => {
        wsRef.current?.close();
        handleInterviewCompletion()
        stopAudioPlayer();
    };

    return (
        <Modal transparent animationType="slide" visible statusBarTranslucent>
            {
                quitStep === 1 ?
                    <ExitInterviewModal onContinue={() => setQuitStep(null)} onQuit={async () => { await halfHandleInterviewCompletion(); setQuitStep(2) }} />
                    : (quitStep === 2 ?
                        <ExitReasonsModal
                            uid={uid}
                            name={candidateName}
                            onContinue={terminateInterview} />
                        : <></>
                    )
            }
            <SafeAreaView style={styles.container}>
                <BackgroundGradient2 />
                {/* Header */}
                <Text style={styles.header} numberOfLines={1}>
                    <Timer />{" "}
                    <Text style={styles.headerText}>
                        | {position || "Position not specified"}
                    </Text>
                </Text>

                {/* MAIN BORDERED BOX */}
                <View style={styles.interviewBox}>

                    {/* Camera as background */}
                    {cameraOn && cameraDevice && hasCameraPermission && (
                        <Camera
                            style={StyleSheet.absoluteFill}
                            device={cameraDevice}
                            isActive={cameraOn}
                        />
                    )}

                    {/* Overlay content */}
                    <View style={styles.overlay}>

                        {/* Nova Card */}
                        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                            <View style={styles.novaCard}>
                                <View style={styles.avatarCircle}>
                                    <Image source={require('../assets/images/nova-avatar.png')} style={styles.avatarImage} resizeMode="cover" />
                                </View>
                                <Text style={styles.avatarName}>Nova</Text>
                                <Text style={styles.speakingText}>
                                    {status === 'recording' ? 'Listening...' :
                                        status === 'ai-speaking' ? 'Nova Speaking...' : ''}
                                </Text>
                            </View>
                        </View>
                        {/* Transcript */}
                        {showTranscript && (
                            <View style={styles.transcriptBox}>
                                <ScrollView
                                    ref={transcriptScrollRef}
                                    showsVerticalScrollIndicator={false}
                                >

                                    {messages.map((m, i) => (
                                        <View
                                            key={i}
                                        >
                                            <Text style={[styles.chatRole, m.role === 'You' && { textAlign: "right" }]}>{m.role}</Text>
                                            <View
                                                style={[
                                                    styles.chatBubble,
                                                    m.role === 'You'
                                                        ? styles.userBubble
                                                        : styles.aiBubble,
                                                ]}
                                            >
                                                <Text style={styles.chatText}>{m.text}</Text>
                                            </View>

                                        </View>
                                    ))}

                                    {showLoader && (
                                        <View style={styles.loaderRow}>
                                            <ChatLoader />
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}

                        {/* Speaking Button */}
                        <View style={styles.micWrapper}>
                            <TouchableOpacity
                                // 1. Disable the button when AI is speaking or loading
                                disabled={status === 'ai-speaking' || showLoader}
                                style={[
                                    status === 'recording' ? styles.micStop : styles.micStart,
                                    {
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 4,
                                        width: 220,
                                        borderRadius: 30,
                                        paddingVertical: 16,
                                        // 2. Decrease opacity when disabled
                                        opacity: (status === 'ai-speaking' || showLoader) ? 0.5 : 1
                                    }
                                ]}
                                onPress={status === 'recording' ? stopRecording : startRecording}
                            >
                                <Image
                                    source={
                                        status === 'recording'
                                            ? require('../assets/images/mic-off.png')
                                            : require('../assets/images/mic-on.png')
                                    }
                                    style={styles.micIcon}
                                />
                                <Text style={styles.micText}>
                                    {status === 'recording' ? 'End Speaking' : 'Start Speaking'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {/* Bottom Controls */}
                <View style={styles.bottomRow}>
                    {/* Transcript Button */}
                    <TouchableOpacity
                        style={[styles.transcriptBtn, { borderColor: showTranscript ? "#fff" : '#53637D', }]}
                        onPress={() => setShowTranscript(v => !v)}
                    >
                        <Image
                            source={showTranscript ? require('../assets/images/transcript-on.png') : require('../assets/images/transcript-off.png')}
                            style={styles.iconSm}
                        />
                        <Text style={showTranscript ? styles.transcriptTextActive : styles.transcriptText}>
                            {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                        </Text>
                    </TouchableOpacity>

                    {/* Camera Toggle Button */}
                    <ToggleButton
                        isActive={cameraOn}
                        onToggle={handleCameraToggle}
                        iconOn="videocam-outline"
                        iconOff="videocam-off-outline"
                    />
                    {/* Quit Button */}
                    <TouchableOpacity style={styles.quitBtn} onPress={() => setQuitStep(1)}>
                        <Image source={require('../assets/images/logout.png')} style={styles.iconSm} />
                        <Text style={styles.quitText}>Quit</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    header: {
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        paddingHorizontal: 50,
        textAlign: "center"
    },
    headerText: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.90)',
        fontWeight: 400,
    },

    interviewBox: {
        flex: 1,
        margin: 16,
        marginTop: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        overflow: 'hidden',
    },

    overlay: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.10)"
    },

    novaCard: {
        alignItems: 'center',
        justifyContent: "center",
        paddingVertical: 12,
        height: 160,
        width: 160,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.10)',
        boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.10)",
        backgroundColor: "#FFFFFF"
    },

    avatarCircle: {
        width: 96,
        height: 96,
        borderRadius: "100%",
        marginBottom: 6,
    },
    avatarImage: {
        width: 96,
        height: 96,
    },
    avatarName: {
        fontWeight: '600',
        fontSize: 14,
    },

    speakingText: {
        marginTop: 6,
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.40)',
        position: "absolute",
        top: "120%",
        left: 0,
        right: 0,
        textAlign: "center",
        marginLeft: 2
    },

    transcriptBox: {
        flex: 1,
        marginTop: 30,
        borderRadius: 16,
    },

    chatBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 8,
        maxWidth: '80%',
        backgroundColor: "#fff"
    },

    aiBubble: {
        alignSelf: 'flex-start',
        borderRadius: 10,
        borderTopLeftRadius: 0,
    },

    userBubble: {
        alignSelf: 'flex-end',
        borderRadius: 10,
        borderTopRightRadius: 0,
    },

    chatRole: {
        fontSize: 14,
        color: '#3C3C3C',
        marginBottom: 6,
        fontWeight: 600,
    },

    chatText: {
        color: '#3C3C3C',
    },

    micWrapper: {
        alignItems: 'center',
        marginBottom: 0,
    },
    micIcon: {
        height: 20,
        resizeMode: 'contain',
    },

    micStart: {
        backgroundColor: '#111827',
    },

    micStop: {
        backgroundColor: '#DC2626',
    },

    micText: {
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: 18
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 26,
        paddingVertical: 15,
        width: '100%',
    },
    // Transcript Pill
    transcriptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)', // Glass effect
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },

    transcriptText: {
        color: 'rgba(83, 99, 125, 0.52)',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 6,
    },
    transcriptTextActive: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 6,
    },



    // Quit Pill
    quitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EB5757',
        paddingVertical: 10,
        paddingHorizontal: 26,
        borderRadius: 25,
    },
    quitText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    iconSm: {
        width: 12,
        height: 12,
        resizeMode: 'contain',
    },
});