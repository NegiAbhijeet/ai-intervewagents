package com.app.aiinterviewagents

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CustomAudioPlayerModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object { private const val TAG = "CustomAudioPlayer" }

  private var sampleRate: Int = 24000
  private var channelCount: Int = 1
  private val audioEncoding: Int = AudioFormat.ENCODING_PCM_16BIT

  // call | speaker
  private var outputProfile: String = "call"
  private var audioTrack: AudioTrack? = null
  private var currentGain: Float = 1.0f

  override fun getName(): String = "CustomAudioPlayer"

  private fun hasHeadsetOrBt(): Boolean {
    val am = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val outs = am.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
    return outs.any { dev ->
      when (dev.type) {
        AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
        AudioDeviceInfo.TYPE_WIRED_HEADSET,
        AudioDeviceInfo.TYPE_BLUETOOTH_A2DP,
        AudioDeviceInfo.TYPE_BLUETOOTH_SCO -> true
        else -> false
      }
    }
  }

  private fun createAudioTrack(): AudioTrack {
    val channelMask = if (channelCount == 1) AudioFormat.CHANNEL_OUT_MONO else AudioFormat.CHANNEL_OUT_STEREO

    val usage = when (outputProfile) {
      // Loud on speaker. Maps to STREAM_MUSIC.
      "speaker" -> AudioAttributes.USAGE_MEDIA
      // Quiet but clean for earpiece or headsets. Maps to STREAM_VOICE_CALL.
      else -> AudioAttributes.USAGE_VOICE_COMMUNICATION
    }

    val attrs = AudioAttributes.Builder()
      .setUsage(usage)
      .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
      .build()

    val format = AudioFormat.Builder()
      .setEncoding(audioEncoding)
      .setSampleRate(sampleRate)
      .setChannelMask(channelMask)
      .build()

    val minBufferSize = AudioTrack.getMinBufferSize(sampleRate, channelMask, audioEncoding)
    return AudioTrack.Builder()
      .setAudioAttributes(attrs)
      .setAudioFormat(format)
      .setBufferSizeInBytes(minBufferSize)
      .setTransferMode(AudioTrack.MODE_STREAM)
      .build()
  }

  private fun rebuildTrack() {
    try {
      audioTrack?.stop()
      audioTrack?.release()
    } catch (e: Exception) {
      Log.e(TAG, "rebuild stop/release error", e)
    }
    audioTrack = createAudioTrack()
    try {
      // Apply last volume
      audioTrack?.setVolume(currentGain)
    } catch (_: Throwable) {}
    audioTrack?.play()
  }

  init { rebuildTrack() }

  @ReactMethod
  fun setAudioConfig(sampleRate: Int, channelCount: Int) {
    this.sampleRate = sampleRate
    this.channelCount = channelCount
    rebuildTrack()
    Log.i(TAG, "Audio config updated sr=$sampleRate ch=$channelCount")
  }

  @ReactMethod
  fun setPlayerVolume(gain: Double) {
    val g = gain.toFloat().coerceIn(0f, 1f)
    currentGain = g
    try { audioTrack?.setVolume(g) } catch (e: Exception) { Log.e(TAG, "setVolume", e) }
  }

  /**
   * profile: "call" | "speaker" | "auto"
   * - call: earpiece or headsets, cleaner, quieter
   * - speaker: loudspeaker, louder, rely on your JS gate + AEC on recorder
   * - auto: call if headset present, else speaker
   */
  @ReactMethod
  fun setOutputProfile(profile: String) {
    val chosen = when (profile) {
      "speaker", "call", "auto" -> profile
      else -> "call"
    }

    val am = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val finalProfile = if (chosen == "auto") {
      if (hasHeadsetOrBt()) "call" else "speaker"
    } else chosen

    outputProfile = finalProfile

    // Route device speaker on for speaker mode, off otherwise
    if (finalProfile == "speaker") {
      am.mode = AudioManager.MODE_NORMAL
      am.isSpeakerphoneOn = true
    } else {
      am.mode = AudioManager.MODE_IN_COMMUNICATION
      am.isSpeakerphoneOn = false
    }

    rebuildTrack()
    Log.i(TAG, "Output profile set to $finalProfile")
  }

  @ReactMethod
  fun startAudio() {
    if (audioTrack == null) rebuildTrack()
    audioTrack?.play()
  }

  @ReactMethod
  fun stopAudio() {
    try {
      audioTrack?.stop()
      audioTrack?.release()
    } catch (e: Exception) {
      Log.e(TAG, "stopAudio", e)
    } finally {
      audioTrack = null
    }
  }

  @ReactMethod
  fun playAudioChunk(base64Audio: String) {
    try {
      val audioData: ByteArray = Base64.decode(base64Audio, Base64.DEFAULT)
      val written = audioTrack?.write(audioData, 0, audioData.size) ?: -1
      if (written < 0) Log.e(TAG, "write error $written")
    } catch (e: Exception) {
      Log.e(TAG, "playAudioChunk", e)
    }
  }
}
