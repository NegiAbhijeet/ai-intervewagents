package com.app.aiinterviewagents;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.util.Log;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class PCMRecorderModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private AudioRecord audioRecord;
    private Thread recordingThread;
    private boolean isRecording = false;

    public PCMRecorderModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "PCMRecorder";
    }

    @ReactMethod
    public void start(int sampleRate, int channels, Promise promise) {
        int channelConfig = channels == 1 ?
                AudioFormat.CHANNEL_IN_MONO : AudioFormat.CHANNEL_IN_STEREO;

        int bufferSize = AudioRecord.getMinBufferSize(
                sampleRate, channelConfig, AudioFormat.ENCODING_PCM_16BIT
        );

        audioRecord = new AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION, // <-- change here
                sampleRate,
                channelConfig,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize
        );
        if (android.media.audiofx.AcousticEchoCanceler.isAvailable()) {
            android.media.audiofx.AcousticEchoCanceler aec = 
                android.media.audiofx.AcousticEchoCanceler.create(audioRecord.getAudioSessionId());
            if (aec != null) {
                aec.setEnabled(true);
                Log.d("PCMRecorder", "AEC Enabled: " + aec.getEnabled() + " Has Control: " + aec.hasControl());
            } else {
                Log.w("PCMRecorder", "AEC Failed to initialize");
            }
        }


        audioRecord.startRecording();
        isRecording = true;

        recordingThread = new Thread(() -> {
            short[] buffer = new short[bufferSize];
            while (isRecording) {
                int read = audioRecord.read(buffer, 0, buffer.length);
                if (read > 0) {
                    WritableArray arr = Arguments.createArray();
                    for (int i = 0; i < read; i++) {
                        arr.pushInt(buffer[i]);
                    }
                    WritableMap event = Arguments.createMap();
                    event.putArray("data", arr);

                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onAudioData", event);

                    Log.d("PCMRecorder", "Emitted " + read + " samples");
                }
            }
        }, "AudioRecordingThread");

        recordingThread.start();
        promise.resolve(null);
    }

    @ReactMethod
    public void stop(Promise promise) {
        isRecording = false;
        if (audioRecord != null) {
            audioRecord.stop();
            audioRecord.release();
            audioRecord = null;
        }
        if (recordingThread != null) {
            try { recordingThread.join(); } catch (InterruptedException ignored) {}
            recordingThread = null;
        }
        promise.resolve(null);
    }
}
