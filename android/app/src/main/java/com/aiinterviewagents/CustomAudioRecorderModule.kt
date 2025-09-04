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

  private val minBufferSize: Int = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
  private var bufferSize: Int = minBufferSize * 4
  private var audioRecord: AudioRecord? = null
  private var isRecording = false
  private var isMuted = false
  private var recordingThread: Thread? = null
  private var failedReads = 0
  private var restartCount = 0

  // "call" | "speaker"
  private var inputProfile: String = "call"

  override fun getName(): String = "CustomAudioRecorder"

  @ReactMethod fun addListener(eventName: String) {}
  @ReactMethod fun removeListeners(count: Int) {}

  @ReactMethod
  fun setMuted(muted: Boolean) { isMuted = muted }

  @ReactMethod
  fun setInputProfile(profile: String) {
    inputProfile = if (profile == "speaker") "speaker" else "call"
  }

  @ReactMethod
  fun startRecording() {
    if (isRecording) return
    try {
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

      val sessionId = audioRecord!!.audioSessionId
      try { AcousticEchoCanceler.create(sessionId)?.apply { enabled = true } } catch (_: Exception) {}
      try { NoiseSuppressor.create(sessionId)?.apply { enabled = true } } catch (_: Exception) {}
      try { AutomaticGainControl.create(sessionId)?.apply { enabled = true } } catch (_: Exception) {}

      val am = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      if (inputProfile == "call") {
        am.mode = AudioManager.MODE_IN_COMMUNICATION
        am.isSpeakerphoneOn = false
      } else {
        // For speaker profile, let the player control routing
        am.mode = AudioManager.MODE_NORMAL
      }

      audioRecord?.startRecording()
      isRecording = true
      startRecordingThread()
    } catch (e: Exception) {
      Log.e(TAG, "startRecording error", e)
    }
  }

  @ReactMethod
  fun stopRecording() {
    isRecording = false
    try {
      recordingThread?.interrupt()
      recordingThread = null
      audioRecord?.stop()
      audioRecord?.release()
      audioRecord = null
    } catch (e: Exception) {
      Log.e(TAG, "stopRecording error", e)
    }
  }

  private fun startRecordingThread() {
    recordingThread = Thread {
      try {
        val buffer = ByteArray(bufferSize)
        failedReads = 0
        restartCount = 0
        while (isRecording && audioRecord != null) {
          val valid = audioRecord?.state == AudioRecord.STATE_INITIALIZED &&
                      audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING
          if (!valid) {
            restartRecording()
            break
          }
          val read = audioRecord!!.read(buffer, 0, buffer.size)
          if (read > 0) {
            failedReads = 0
            if (!isMuted) sendEvent("AudioChunk", buffer.copyOf(read))
          } else {
            failedReads++
            if (failedReads >= MAX_FAILED_READS) {
              restartRecording()
              break
            }
          }
        }
      } catch (e: Exception) {
        Log.e(TAG, "recording thread error", e)
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
