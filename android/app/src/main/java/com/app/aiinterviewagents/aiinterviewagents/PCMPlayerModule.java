package com.app.aiinterviewagents;
import android.content.Context;            
import android.media.AudioAttributes;
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

        // 1. Define AudioAttributes for Voice Communication (Enables AEC)
        AudioAttributes attributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION) 
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build();

        AudioFormat format = new AudioFormat.Builder()
                .setSampleRate(sampleRate)
                .setChannelMask(channelConfig)
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .build();

        // 2. Create the AudioTrack
        audioTrack = new AudioTrack(
                attributes,
                format,
                bufferSize,
                AudioTrack.MODE_STREAM,
                AudioManager.AUDIO_SESSION_ID_GENERATE
        );

        if (audioTrack.getState() != AudioTrack.STATE_INITIALIZED) {
            promise.reject("E_INIT", "Failed to init AudioTrack");
            return;
        }

        // 3. FORCE SPEAKERPHONE & MAX VOLUME
        try {
            AudioManager am = (AudioManager) getReactApplicationContext().getSystemService(Context.AUDIO_SERVICE);
            
            // Switch to Communication Mode (Required for AEC)
            am.setMode(AudioManager.MODE_IN_COMMUNICATION);
            
            // Force Audio to Loudspeaker
            am.setSpeakerphoneOn(true);

            // Max out the volume for the "Voice Call" stream (since we are in Communication mode)
            int maxVol = am.getStreamMaxVolume(AudioManager.STREAM_VOICE_CALL);
            int currentVol = am.getStreamVolume(AudioManager.STREAM_VOICE_CALL);
            
            // Optional: Only set if it's too low, or just force it to max
            am.setStreamVolume(AudioManager.STREAM_VOICE_CALL, maxVol, 0);
            
            Log.d("PCMPlayer", "Speakerphone ON. Volume set to: " + maxVol);
            
        } catch (Exception e) {
            Log.e("PCMPlayer", "Failed to set speakerphone", e);
        }

        audioTrack.play();
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
        
        AudioManager am = (AudioManager) getReactApplicationContext().getSystemService(Context.AUDIO_SERVICE);
        am.setMode(AudioManager.MODE_NORMAL); 
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
