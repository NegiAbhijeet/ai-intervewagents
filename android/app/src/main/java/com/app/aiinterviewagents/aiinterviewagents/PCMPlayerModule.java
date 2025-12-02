package com.app.aiinterviewagents;

import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

public class PCMPlayerModule extends ReactContextBaseJavaModule {
    private AudioTrack audioTrack;
    private int sampleRate = 24000; // default safe rate

    public PCMPlayerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PCMPlayer";
    }

    @ReactMethod
    public void init(int sampleRate, int channels, Promise promise) {
        this.sampleRate = sampleRate;

        int channelConfig = channels == 1
                ? AudioFormat.CHANNEL_OUT_MONO
                : AudioFormat.CHANNEL_OUT_STEREO;

        int bufferSize = AudioTrack.getMinBufferSize(
                sampleRate,
                channelConfig,
                AudioFormat.ENCODING_PCM_16BIT
        );

        if (bufferSize == AudioTrack.ERROR || bufferSize == AudioTrack.ERROR_BAD_VALUE) {
            promise.reject("E_BUFFER", "Unsupported config: " + sampleRate + "Hz");
            return;
        }

        audioTrack = new AudioTrack(
                AudioManager.STREAM_MUSIC,
                sampleRate,
                channelConfig,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize,
                AudioTrack.MODE_STREAM
        );

        if (audioTrack.getState() != AudioTrack.STATE_INITIALIZED) {
            promise.reject("E_INIT", "Failed to init AudioTrack at " + sampleRate + "Hz");
            return;
        }

        audioTrack.play();
        Log.d("PCMPlayer", "AudioTrack initialized with " + sampleRate + "Hz, buffer=" + bufferSize);
        promise.resolve(null);
    }

    @ReactMethod
    public void play(ReadableArray data, Promise promise) {
        if (audioTrack == null) {
            promise.reject("E_NO_INIT", "AudioTrack not initialized");
            return;
        }

        byte[] pcmBytes = new byte[data.size() * 2];
        for (int i = 0; i < data.size(); i++) {
            short value = (short) data.getInt(i);
            pcmBytes[i * 2] = (byte) (value & 0xFF);
            pcmBytes[i * 2 + 1] = (byte) ((value >> 8) & 0xFF);
        }

        int written = audioTrack.write(pcmBytes, 0, pcmBytes.length, AudioTrack.WRITE_BLOCKING);
        Log.d("PCMPlayer", "Requested=" + pcmBytes.length + " Written=" + written);
        promise.resolve(null);
    }

    @ReactMethod
    public void stop(Promise promise) {
        if (audioTrack != null) {
            audioTrack.stop();
            audioTrack.release();
            audioTrack = null;
        }
        promise.resolve(null);
    }

    @ReactMethod
    public void testTone(Promise promise) {
        try {
            int durationSec = 2;
            int numSamples = sampleRate * durationSec;
            byte[] pcmBytes = new byte[numSamples * 2];

            for (int i = 0; i < numSamples; i++) {
                double t = (double) i / sampleRate;
                short sample = (short) (Math.sin(2 * Math.PI * 440 * t) * 32767);
                pcmBytes[i * 2] = (byte) (sample & 0xFF);
                pcmBytes[i * 2 + 1] = (byte) ((sample >> 8) & 0xFF);
            }

            if (audioTrack != null) {
                int written = audioTrack.write(pcmBytes, 0, pcmBytes.length, AudioTrack.WRITE_BLOCKING);
                Log.d("PCMPlayer", "Test tone written=" + written);
                promise.resolve(null);
            } else {
                promise.reject("E_NO_INIT", "AudioTrack not initialized");
            }
        } catch (Exception e) {
            promise.reject("E_TONE", e);
        }
    }
}