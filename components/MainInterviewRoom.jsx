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
import { Buffer } from 'buffer';

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

const Visualizer = ({ levels }) => {
    return (
        <View style={styles.visualizer}>
            {levels.map((h, i) => (
                <View
                    key={i}
                    style={[
                        styles.bar,
                        {
                            transform: [{ scaleY: Math.min(1.8, h / 10) }],
                        },
                    ]}
                />
            ))}
        </View>
    );
};

export default function MainInterviewRoom({ meetingId, interviewTime, cameraOn, setCameraOn, hasCameraPermission, setHasCameraPermission, hasStarted, handleInterviewCompletion, quitStep, setQuitStep, halfHandleInterviewCompletion, uid, candidateName, position }) {
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

    const [levels, setLevels] = useState(Array(20).fill(4));
    const peakRef = useRef(300);     // dynamic max
    const smoothRef = useRef(0);

    const animationRef = useRef(null);
    const analyserRef = useRef(null);

    const updateLevelsFromAmplitude = (amplitude) => {
        const NOISE_FLOOR = 80;   // very low
        const DECAY = 0.995;     // slow peak decay
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
        setLevels(Array(20).fill(4));
    };
    const handleStartRecording = async () => {
        await startRecording();
        startVisualizer();
    };

    const handleStopRecording = async () => {
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
                            {/* Start Speaking */}
                            <TouchableOpacity
                                onPress={handleStartRecording}
                                disabled={status === 'recording' || status === 'ai-speaking' || showLoader}
                                style={[
                                    styles.startBtn,
                                    status === 'recording' && { opacity: 0.8 },
                                    (status === 'ai-speaking' || showLoader) &&
                                    styles.disabledBtn,
                                ]}
                            >
                                {status === 'recording' ? (
                                    <Visualizer levels={levels} />
                                ) : (
                                    <>
                                        <Image
                                            source={require('../assets/images/mic-on.png')}
                                            style={styles.micIcon}
                                        />
                                        <Text style={styles.btnText}>Start Speaking</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Stop Speaking */}
                            <TouchableOpacity
                                onPress={handleStopRecording}
                                disabled={status !== 'recording'}
                                style={[
                                    styles.stopBtn,
                                    status !== 'recording' && styles.disabledBtn,

                                ]}
                            >
                                <Image
                                    source={require('../assets/images/pause-black.png')}
                                    style={styles.micIcon}
                                />
                                <Text style={styles.btnTextBlack}>Stop Speaking</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </View>
                {/* Bottom Controls */}
                <View style={styles.bottomRow}>
                    {/* Transcript Button */}
                    <TouchableOpacity
                        style={[styles.transcriptBtn, { borderColor: showTranscript ? "#cec8c8ff" : '#F2F2F2', backgroundColor: showTranscript ? "#000" : 'rgba(0, 0, 0, 0.50)', }]}
                        onPress={() => setShowTranscript(v => !v)}
                    >
                        <Image
                            source={require('../assets/images/transcript-on.png')}
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
                        imageOn={require('../assets/images/camera-on.png')}
                        imageOff={require('../assets/images/camera-off.png')}
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
        flexDirection: 'row',
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
        width: "50%",
        paddingHorizontal: 16,
        gap: 6,
        height: 50
    },

    stopBtn: {
        backgroundColor: '#fff',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        width: "50%",
        paddingHorizontal: 16,
        gap: 6,
        height: 50
    },

    disabledBtn: {
        opacity: 0.5,
    },

    btnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
    },
    btnTextBlack: {
        color: '#000',
        fontSize: 12,
        fontWeight: 600,
    },

    visualizer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        height: 24,
        overflow: 'hidden',
    },

    bar: {
        width: 3,
        height: 16,
        backgroundColor: '#fff',
        borderRadius: 2,
    },

    micIcon: {
        height: 16,
        width: 20,
        resizeMode: 'contain',
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
        backgroundColor: '#000', // Glass effect
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },

    transcriptText: {
        color: '#fff',
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