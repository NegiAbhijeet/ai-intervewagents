package com.aiinterviewagents

import android.media.AudioRecord
import android.media.MediaRecorder
import android.media.AudioFormat
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class CustomAudioRecorderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "CustomAudioRecorder"
        private const val SAMPLE_RATE = 24000
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT

        private const val MAX_FAILED_READS = 5
        private const val MAX_RESTARTS = 3
    }

    private val minBufferSize: Int =
        AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
    private var bufferSize: Int = minBufferSize * 4
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var recordingThread: Thread? = null

    private var failedReads = 0
    private var restartCount = 0

    override fun getName(): String = "CustomAudioRecorder"

    /**
     * Required for NativeEventEmitter support in React Native.
     * Even if you don't use them, they must be present or RN may replace your module with {}
     */
    @ReactMethod
    fun addListener(eventName: String) {
        // No-op: RN requires this for EventEmitter
        Log.d(TAG, "addListener called for $eventName")
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // No-op: RN requires this for EventEmitter
        Log.d(TAG, "removeListeners called, count=$count")
    }

    @ReactMethod
    fun startRecording() {
        if (isRecording) return

        try {
            Log.d(TAG, "Initializing AudioRecord...")
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "AudioRecord initialization failed")
                return
            }

            audioRecord?.startRecording()
            isRecording = true
            Log.d(TAG, "Recording started")
            startRecordingThread()
        } catch (e: Exception) {
            Log.e(TAG, "Error starting recording", e)
        }
    }

    @ReactMethod
    fun stopRecording() {
        isRecording = false
        try {
            Log.d(TAG, "Stopping recording...")
            recordingThread?.interrupt()
            recordingThread = null
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
            Log.d(TAG, "Recording stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping recording", e)
        }
    }

    private fun startRecordingThread() {
        recordingThread = Thread {
            try {
                Thread.currentThread().priority = Thread.NORM_PRIORITY
                val buffer = ByteArray(bufferSize)
                Log.d(TAG, "Recording thread started")
                failedReads = 0
                restartCount = 0

                while (isRecording && audioRecord != null) {
                    if (audioRecord?.state != AudioRecord.STATE_INITIALIZED &&
                        audioRecord?.recordingState != AudioRecord.RECORDSTATE_RECORDING
                    ) {
                        Log.e(
                            TAG,
                            "AudioRecord not recording. State: ${audioRecord?.state}, Recording: ${audioRecord?.recordingState}"
                        )
                        restartRecording()
                        break
                    }

                    val read = audioRecord!!.read(buffer, 0, buffer.size)
                    if (read > 0) {
                        failedReads = 0
                        sendEvent("AudioChunk", buffer.copyOf(read))
                    } else {
                        failedReads++
                        Log.w(TAG, "AudioRecord read error ($failedReads times)")
                        if (failedReads >= MAX_FAILED_READS) {
                            Log.e(TAG, "Too many read failures, restarting recording...")
                            restartRecording()
                            break
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Recording thread error", e)
            } finally {
                audioRecord?.release()
                audioRecord = null
            }
        }
        recordingThread?.start()
    }

    private fun restartRecording() {
        if (restartCount < MAX_RESTARTS) {
            stopRecording()
            Thread.sleep(200)
            startRecording()
            restartCount++
        } else {
            Log.e(TAG, "Too many restarts, stopping recording...")
            stopRecording()
            sendErrorEvent("Too many restarts, stopping recording")
        }
    }

    private fun sendEvent(eventName: String, byteArray: ByteArray) {
        val eventData = WritableNativeMap()
        val array = WritableNativeArray()
        for (byte in byteArray) {
            array.pushInt(byte.toInt())
        }
        eventData.putArray("data", array)
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, eventData)
        Log.d(TAG, "Audio chunk sent to JS")
    }

    private fun sendErrorEvent(errorMessage: String) {
        val eventData = WritableNativeMap()
        eventData.putString("error", errorMessage)
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("AudioError", eventData)
        Log.e(TAG, "Error event sent to JS: $errorMessage")
    }
}
