package com.aiinterviewagents;

import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class PCMPlayerModule extends ReactContextBaseJavaModule {
    private AudioTrack audioTrack;

    public PCMPlayerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PCMPlayer";
    }

    @ReactMethod
    public void init(int sampleRate, int channels, Promise promise) {
        int channelConfig = channels == 1 ? AudioFormat.CHANNEL_OUT_MONO : AudioFormat.CHANNEL_OUT_STEREO;

        int bufferSize = AudioTrack.getMinBufferSize(
                sampleRate,
                channelConfig,
                AudioFormat.ENCODING_PCM_16BIT
        );

        audioTrack = new AudioTrack(
                AudioManager.STREAM_MUSIC,
                sampleRate,
                channelConfig,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize,
                AudioTrack.MODE_STREAM
        );
        audioTrack.play();
        promise.resolve(null);
    }

    @ReactMethod
    public void play(com.facebook.react.bridge.ReadableArray data, Promise promise) {
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

        audioTrack.write(pcmBytes, 0, pcmBytes.length);
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
}
