import { NativeModules } from "react-native";

const { PCMPlayer } = NativeModules;

export class Player {
  private isInitialized = false;

  async init(sampleRate: number = 16000) {
    console.log('[Player] Initializing PCMPlayer...');
    await PCMPlayer.init(sampleRate, 1);
    this.isInitialized = true;
  }

  async play(buffer: Int16Array) {
    if (!buffer || buffer.length === 0) {
      console.warn("PCM buffer empty");
      return;
    }

    if (!this.isInitialized) {
      console.warn('[Player] PCMPlayer not initialized. Initializing now...');
      await this.init(); // Re-initialize if needed
    }

    try {
      await PCMPlayer.play(Array.from(buffer));
    } catch (err: any) {
      console.error('[Player] Play failed:', err);

      if (String(err).includes('AudioTrack not initialized')) {
        console.warn('[Player] Re-initializing PCMPlayer due to AudioTrack failure...');
        await this.init(); // Try re-initializing
        await PCMPlayer.play(Array.from(buffer)); // Retry
      } else {
        throw err; // Rethrow for other errors
      }
    }
  }

  async stop() {
    await PCMPlayer.stop();
    this.isInitialized = false;
  }

  async testTone() {
    await PCMPlayer.testTone();
  }
}
