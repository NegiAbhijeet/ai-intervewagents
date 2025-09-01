// Player.ts
import { NativeModules } from 'react-native';

const { PCMPlayer } = NativeModules;

export class Player {
  async init(sampleRate: number) {
    await PCMPlayer.init(sampleRate, 1); // mono
  }

  async play(buffer: Int16Array) {
    // send raw PCM16 LE data to native side
    await PCMPlayer.play(Array.from(buffer));
  }

  async stop() {
    await PCMPlayer.stop();
  }
}
