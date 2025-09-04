package com.aiinterviewagents

import android.content.Context
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.media.audiofx.AcousticEchoCanceler
import android.media.audiofx.AutomaticGainControl
import android.media.audiofx.NoiseSuppressor
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
  private var isMuted = false
  private var recordingThread: Thread? = null

  private var failedReads = 0
  private var restartCount = 0

  override fun getName(): String = "CustomAudioRecorder"

  @ReactMethod
  fun addListener(eventName: String) {
    Log.d(TAG, "addListener $eventName")
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    Log.d(TAG, "removeListeners $count")
  }

  @ReactMethod
  fun setMuted(muted: Boolean) {
    isMuted = muted
    Log.d(TAG, "Muted $muted")
  }

  @ReactMethod
  fun startRecording() {
    if (isRecording) return

    try {
      Log.d(TAG, "Initializing AudioRecord")
      audioRecord = AudioRecord(
        MediaRecorder.AudioSource.VOICE_COMMUNICATION,
        SAMPLE_RATE,
        CHANNEL_CONFIG,
        AUDIO_FORMAT,
        bufferSize
      )

      if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
        Log.e(TAG, "AudioRecord init failed")
        return
      }

      // Attach system effects
      val sessionId = audioRecord!!.audioSessionId
      try { AcousticEchoCanceler.create(sessionId)?.apply { enabled = true } } catch (_: Exception) {}
      try { NoiseSuppressor.create(sessionId)?.apply { enabled = true } } catch (_: Exception) {}
      try { AutomaticGainControl.create(sessionId)?.apply { enabled = true } } catch (_: Exception) {}

      // Use voice path and prefer earpiece
      val am = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      am.mode = AudioManager.MODE_IN_COMMUNICATION
      am.isSpeakerphoneOn = false

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
      Log.d(TAG, "Stopping recording")
      recordingThread?.interrupt()
      recordingThread = null
      audioRecord?.stop()
      audioRecord?.release()
      audioRecord = null

      val am = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      am.mode = AudioManager.MODE_NORMAL
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
        failedReads = 0
        restartCount = 0

        while (isRecording && audioRecord != null) {
          if (audioRecord?.state != AudioRecord.STATE_INITIALIZED ||
              audioRecord?.recordingState != AudioRecord.RECORDSTATE_RECORDING) {
            Log.e(TAG, "AudioRecord not recording state=${audioRecord?.state} rec=${audioRecord?.recordingState}")
            restartRecording()
            break
          }

          val read = audioRecord!!.read(buffer, 0, buffer.size)
          if (read > 0) {
            failedReads = 0
            if (!isMuted) sendEvent("AudioChunk", buffer.copyOf(read))
          } else {
            failedReads++
            Log.w(TAG, "read error $failedReads")
            if (failedReads >= MAX_FAILED_READS) {
              Log.e(TAG, "Too many read failures, restarting")
              restartRecording()
              break
            }
          }
        }
      } catch (e: Exception) {
        Log.e(TAG, "Recording thread error", e)
      } finally {
        try { audioRecord?.release() } catch (_: Exception) {}
        audioRecord = null
      }
    }
    recordingThread?.start()
  }

  private fun restartRecording() {
    if (restartCount < MAX_RESTARTS) {
      stopRecording()
      try { Thread.sleep(200) } catch (_: InterruptedException) {}
      startRecording()
      restartCount++
    } else {
      Log.e(TAG, "Too many restarts, stop")
      stopRecording()
      sendErrorEvent("Too many restarts, stopping recording")
    }
  }

  private fun sendEvent(eventName: String, byteArray: ByteArray) {
    val eventData = WritableNativeMap()
    val array = WritableNativeArray()
    for (b in byteArray) array.pushInt(b.toInt())
    eventData.putArray("data", array)
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, eventData)
  }

  private fun sendErrorEvent(errorMessage: String) {
    val eventData = WritableNativeMap()
    eventData.putString("error", errorMessage)
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("AudioError", eventData)
  }
}
