package com.aiinterviewagents

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CustomAudioPlayerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val TAG = "CustomAudioPlayer"
  }

  // Default configuration; mutable to allow changes.
  private var sampleRate: Int = 24000
  private var channelCount: Int = 1 // 1 for mono
  private val audioEncoding: Int = AudioFormat.ENCODING_PCM_16BIT  // 16-bit PCM

  // Create an AudioTrack using the current configuration.
  private var audioTrack: AudioTrack? = createAudioTrack()

  /**
   * Helper function to create an AudioTrack based on current parameters.
   */
  private fun createAudioTrack(): AudioTrack {
    val channelMask = if (channelCount == 1) AudioFormat.CHANNEL_OUT_MONO else AudioFormat.CHANNEL_OUT_STEREO
    val minBufferSize = AudioTrack.getMinBufferSize(sampleRate, channelMask, audioEncoding)
    return AudioTrack.Builder()
      .setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_MEDIA)
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
    // Start playback so that the AudioTrack is ready to accept data.
    audioTrack?.play()
  }

  override fun getName(): String {
    return "CustomAudioPlayer"
  }

  /**
   * Allows the React Native side to customize audio parameters.
   *
   * @param sampleRate The sample rate in Hz (e.g., 48000).
   * @param channelCount The number of channels (1 for mono, 2 for stereo).
   */
  @ReactMethod
  fun setAudioConfig(sampleRate: Int, channelCount: Int) {
    try {
      // Stop and release the current AudioTrack.
      audioTrack?.stop()
      audioTrack?.release()
    } catch (e: Exception) {
      Log.e(TAG, "Error releasing AudioTrack: ", e)
    }
    // Update parameters.
    this.sampleRate = sampleRate
    this.channelCount = channelCount

    // Re-create the AudioTrack with the new configuration.
    audioTrack = createAudioTrack()
    audioTrack?.play()
    Log.i(TAG, "Audio config updated: sampleRate=$sampleRate, channelCount=$channelCount")
  }

  /**
   * Decodes a Base64-encoded string representing raw 16-bit PCM audio data (no endianness conversion needed)
   * and writes it to the AudioTrack for playback.
   *
   * @param base64Audio The Base64-encoded audio data.
   */
  @ReactMethod
  fun playAudioChunk(base64Audio: String) {
    try {
      // Decode the Base64 string into a byte array.
      val audioData: ByteArray = Base64.decode(base64Audio, Base64.DEFAULT)
      // Write the audio data into the AudioTrack.
      val written = audioTrack?.write(audioData, 0, audioData.size) ?: -1
      if (written < 0) {
        Log.e(TAG, "Error writing audio data: $written")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error in playAudioChunk: ", e)
    }
  }

  @ReactMethod
  fun startAudio() {
    if (audioTrack == null) {
      audioTrack = createAudioTrack()
    }
    audioTrack?.play()
  }

  @ReactMethod
  fun stopAudio() {
    try {
      audioTrack?.stop()
      audioTrack?.release()
    } catch (e: Exception) {
      Log.e(TAG, "Error stopping audio: ", e)
    } finally {
      audioTrack = null
    }
  }
}