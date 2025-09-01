import { NativeModules, NativeEventEmitter } from "react-native";

const { PCMRecorder } = NativeModules;
const recorderEmitter = new NativeEventEmitter(PCMRecorder);

export class Recorder {
  private subscription: any;
  private onDataAvailable: (buffer: Int16Array) => void;

  constructor(onDataAvailable: (buffer: Int16Array) => void) {
    this.onDataAvailable = onDataAvailable;
  }

  async start(sampleRate: number) {
    await PCMRecorder.start(sampleRate, 1);

    this.subscription = recorderEmitter.addListener("onAudioData", (event) => {
      if (event && event.data) {
        const buffer = Int16Array.from(event.data);
        this.onDataAvailable(buffer);
      }
    });
  }

  async stop() {
    await PCMRecorder.stop();
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }
}
