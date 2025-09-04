package com.aiinterviewagents

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CustomAudioPlayerModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object { private const val TAG = "CustomAudioPlayer" }

  private var sampleRate: Int = 24000
  private var channelCount: Int = 1
  private val audioEncoding: Int = AudioFormat.ENCODING_PCM_16BIT
  private var audioTrack: AudioTrack? = createAudioTrack()

  private fun createAudioTrack(): AudioTrack {
    val channelMask = if (channelCount == 1) AudioFormat.CHANNEL_OUT_MONO else AudioFormat.CHANNEL_OUT_STEREO
    val minBufferSize = AudioTrack.getMinBufferSize(sampleRate, channelMask, audioEncoding)
    return AudioTrack.Builder()
      .setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
          .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
          .build()
      )
      .setAudioFormat(
        AudioFormat.Builder()
          .setEncoding(audioEncoding)
          .setSampleRate(sampleRate)
          .setChannelMask(channelMask)
          .build()
      )
      .setBufferSizeInBytes(minBufferSize)
      .setTransferMode(AudioTrack.MODE_STREAM)
      .build()
  }

  init {
    audioTrack?.play()
  }

  override fun getName(): String = "CustomAudioPlayer"

  @ReactMethod
  fun setAudioConfig(sampleRate: Int, channelCount: Int) {
    try {
      audioTrack?.stop()
      audioTrack?.release()
    } catch (e: Exception) {
      Log.e(TAG, "Release error", e)
    }
    this.sampleRate = sampleRate
    this.channelCount = channelCount
    audioTrack = createAudioTrack()
    audioTrack?.play()
    Log.i(TAG, "Audio config updated sr=$sampleRate ch=$channelCount")
  }

  @ReactMethod
  fun playAudioChunk(base64Audio: String) {
    try {
      val audioData: ByteArray = Base64.decode(base64Audio, Base64.DEFAULT)
      val written = audioTrack?.write(audioData, 0, audioData.size) ?: -1
      if (written < 0) Log.e(TAG, "write error $written")
    } catch (e: Exception) {
      Log.e(TAG, "playAudioChunk error", e)
    }
  }

  @ReactMethod
  fun startAudio() {
    if (audioTrack == null) audioTrack = createAudioTrack()
    audioTrack?.play()
  }

  @ReactMethod
  fun stopAudio() {
    try {
      audioTrack?.stop()
      audioTrack?.release()
    } catch (e: Exception) {
      Log.e(TAG, "stopAudio error", e)
    } finally {
      audioTrack = null
    }
  }
}
