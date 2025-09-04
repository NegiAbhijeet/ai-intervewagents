import { NativeModules } from "react-native";

const { PCMPlayer } = NativeModules;

export class Player {
  async init(sampleRate: number = 24000) {
    await PCMPlayer.init(sampleRate, 1);
  }

  async play(buffer: Int16Array) {
    if (!buffer || buffer.length === 0) {
      console.warn("PCM buffer empty");
      return;
    }
    await PCMPlayer.play(Array.from(buffer));
  }

  async stop() {
    await PCMPlayer.stop();
  }

  async testTone() {
    await PCMPlayer.testTone();
  }
}
