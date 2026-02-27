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
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import Timer from "../components/timer"
import AudioRecord from 'react-native-audio-record';
import useAudioPlayer from '../hooks/useAudioPlayer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import BackgroundGradient2 from './backgroundGradient2';
import ExitInterviewModal from './quitPopup';
import ExitReasonsModal from './quitFeedback';
import ChatLoader from "./chatLoader"
import { Buffer } from 'buffer';
import Ionicons from '@react-native-vector-icons/ionicons';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import AnimatedActionButton from './AnimatedActionButton';
const VISULIZER_LINES_COUNT = 6

const WS_URL = 'wss://room.aiinterviewagents.com/ws/voice/';

const getAmplitudeFromPCM = (base64Data) => {
    const buffer = Buffer.from(base64Data, 'base64');
    let sumSquares = 0;

    for (let i = 0; i < buffer.length; i += 2) {
        const sample = buffer.readInt16LE(i);
        sumSquares += sample * sample;
    }

    const rms = Math.sqrt(sumSquares / (buffer.length / 2));
    return rms;
};
const triggerHaptic = (type = "impactMedium") => {
    const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    };

    ReactNativeHapticFeedback.trigger(type, options);
};
const Visualizer = ({ levels }) => {
    return (
        <View style={styles.visualizer}>
            {levels.map((h, i) => (
                <View
                    key={i}
                    style={[
                        styles.bar,
                        {
                            transform: [{ scaleY: Math.min(1.5, h / 10) }],
                        },
                    ]}
                />
            ))}
        </View>
    );
};

export default function MainInterviewRoom({ meetingId, interviewTime, cameraOn, setCameraOn, hasCameraPermission, setHasCameraPermission, hasStarted, handleInterviewCompletion, quitStep, setQuitStep, uid, candidateName, position }) {
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
    const [status, setStatus] = useState('agent-speaking');
    const [messages, setMessages] = useState([]);
    const [showLoader, setShowLoader] = useState(false);

    const [levels, setLevels] = useState(Array(VISULIZER_LINES_COUNT).fill(4));
    const peakRef = useRef(300);
    const smoothRef = useRef(0);

    const animationRef = useRef(null);
    const analyserRef = useRef(null);

    const updateLevelsFromAmplitude = (amplitude) => {
        const NOISE_FLOOR = 80;
        const DECAY = 0.995;
        const SMOOTHING = 0.7;

        // 1️⃣ Remove noise floor
        const clean = Math.max(0, amplitude - NOISE_FLOOR);

        // 2️⃣ Track rolling peak (auto gain)
        peakRef.current = Math.max(
            clean,
            peakRef.current * DECAY
        );

        // 3️⃣ Normalize against learned peak
        let normalized =
            peakRef.current > 0
                ? clean / peakRef.current
                : 0;

        normalized = Math.min(1, normalized);

        // 4️⃣ Log curve (brings up quiet speech)
        const boosted = Math.pow(normalized, 0.4);

        // 5️⃣ Smooth movement
        smoothRef.current =
            SMOOTHING * smoothRef.current +
            (1 - SMOOTHING) * boosted;

        const level = Math.max(4, smoothRef.current * 20);

        // 6️⃣ Update bars
        setLevels(prev =>
            prev.map(() => level * (0.8 + Math.random() * 0.4))
        );
    };


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
    useEffect(() => {
        if (
            socketConnected &&
            status === 'idle' &&
            !showLoader &&
            !ttsDoneRef.current
        ) {
            handleStartRecording();
        }
    }, [socketConnected, status, showLoader]);
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
            // Alert.alert('Connection error');
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
    const startVisualizer = () => {
        const analyser = analyserRef.current;
        if (!analyser) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const animate = () => {
            analyser.getByteFrequencyData(dataArray);

            const chunkSize = Math.floor(dataArray.length / 20);
            const newLevels = [];

            for (let i = 0; i < 20; i++) {
                let sum = 0;
                for (let j = 0; j < chunkSize; j++) {
                    sum += dataArray[i * chunkSize + j];
                }

                const avg = sum / chunkSize;
                newLevels.push(Math.max(4, avg / 3)); // 👈 silence stays flat
            }

            setLevels(newLevels);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
    };

    const stopVisualizer = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        // reset bars
        peakRef.current = 300;
        smoothRef.current = 0;
        setLevels(Array(VISULIZER_LINES_COUNT).fill(4));
    };
    const handleStartRecording = async () => {
        triggerHaptic("notificationSuccess");
        await startRecording();
        startVisualizer();
    };

    const handleStopRecording = async () => {
        triggerHaptic("notificationSuccess");
        await stopRecording();
        stopVisualizer();
    };

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
            // 1️⃣ Send audio to WS
            if (wsRef.current) {
                wsRef.current.send(base64ToArrayBuffer(data));
            }

            // 2️⃣ Drive visualizer from mic strength
            const amplitude = getAmplitudeFromPCM(data);
            updateLevelsFromAmplitude(amplitude);
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

    const terminateInterview = async () => {
        wsRef.current?.close();
        handleInterviewCompletion()
        stopAudioPlayer();
    };

    return (
        <Modal transparent animationType="slide" visible statusBarTranslucent>
            {
                quitStep === 1 ?
                    <ExitInterviewModal onContinue={() => setQuitStep(null)} onQuit={async () => { setQuitStep(2) }} />
                    : (quitStep === 2 ?
                        <ExitReasonsModal
                            uid={uid}
                            name={candidateName}
                            onContinue={async () => {
                                await terminateInterview();
                            }}
                        />
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
                            {status === 'recording' && (
                                <Visualizer levels={levels} />
                            )}

                            <AnimatedActionButton
                                enabled={status === 'recording'}
                                onPress={handleStopRecording}
                                style={styles.stopBtn}
                                disabledStyle={styles.disabledBtn}
                            >
                                <Image
                                    source={require('../assets/images/pause.png')}
                                    style={styles.micIcon}
                                />
                                <Text style={styles.btnText}>Stop Speaking</Text>
                            </AnimatedActionButton>
                        </View>
                    </View>
                </View>
                {/* Bottom Controls */}
                <View style={styles.wrapper}>
                    <View style={styles.bottomBar}>

                        {/* Left Icons Group */}
                        <View style={styles.leftGroup}>

                            {/* Transcript Button (Icon Only) */}
                            <TouchableOpacity
                                style={[styles.circleBtn, showTranscript && styles.circleBtnActive]}
                                onPress={() => setShowTranscript(v => !v)}
                            >
                                <Image
                                    source={
                                        require('../assets/images/transcript-on.png')}
                                    style={styles.iconMd}
                                />
                            </TouchableOpacity>

                            {/* Camera Toggle Button */}
                            <TouchableOpacity
                                style={[
                                    styles.circleBtn,
                                    cameraOn && styles.circleBtnActive
                                ]}
                                onPress={handleCameraToggle}
                            >
                                <Image
                                    source={
                                        cameraOn
                                            ? require('../assets/images/camera-on.png')
                                            : require('../assets/images/camera-off.png')
                                    }
                                    style={styles.iconMd}
                                />
                            </TouchableOpacity>

                        </View>

                        {/* Quit Button */}
                        <TouchableOpacity style={styles.quitBtn} onPress={() => setQuitStep(1)}>
                            <Ionicons
                                name="call-sharp"
                                size={22}
                                color="#fff"
                                style={{ transform: [{ rotate: '135deg' }] }} // phone cut style
                            />
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: "black",
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 10,
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
        height: 130,
        width: 130,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.10)',
        boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.10)",
        backgroundColor: "#FFFFFF"
    },

    avatarCircle: {
        width: 80,
        height: 80,
        paddingBottom: 4,
        borderRadius: "100%",
        marginBottom: 6,
    },
    avatarImage: {
        width: 80,
        height: 80,
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
        marginVertical: 8,
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
        color: '#fff',
        marginBottom: 6,
        fontWeight: 600,
    },

    chatText: {
        color: '#3C3C3C',
    },

    micWrapper: {
        // flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    startBtn: {
        backgroundColor: '#3B82F6',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        minWidth: "50%",
        paddingHorizontal: 32,
        gap: 6,
        height: 50
    },

    stopBtn: {
        backgroundColor: '#3C3C3C',
        borderColor: 'rgba(242, 242, 242, 0.50)',
        borderWidth: 2,
        borderRadius: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        minWidth: "50%",
        paddingHorizontal: 32,
        gap: 6,
        height: 50
    },

    disabledBtn: {
        opacity: 0.5,
    },

    btnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
    },
    btnTextBlack: {
        color: '#000',
        fontSize: 14,
        fontWeight: 600,
    },

    visualizer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        // height: 24,
        paddingHorizontal: 24,
        paddingVertical: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderRadius: 1000
    },

    bar: {
        width: 4,
        height: 16,
        backgroundColor: '#5C5CEF',
        borderRadius: 2,
    },

    micIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },

    micText: {
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: 18
    },

    wrapper: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },

    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        backgroundColor: '#2B2B2F',
        padding: 12,
        borderRadius: 20,

        // subtle shadow
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },

    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },

    circleBtn: {
        width: 48,
        height: 48,
        borderRadius: 27,
        backgroundColor: '#3A3A3F',
        justifyContent: 'center',
        alignItems: 'center',
    },

    circleBtnActive: {
        backgroundColor: 'gray',
    },

    iconMd: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },

    quitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E54848',
        padding: 12,
        borderRadius: 100,
        gap: 8,
    },

    iconSmWhite: {
        width: 18,
        height: 18,
        tintColor: '#FFF',
        resizeMode: 'contain',
    },
});