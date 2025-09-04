import { NativeModules, DeviceEventEmitter } from "react-native";

const { TwoWayAudio } = NativeModules; // <- matches getName() in TwoWayAudioModule

export default TwoWayAudio;
