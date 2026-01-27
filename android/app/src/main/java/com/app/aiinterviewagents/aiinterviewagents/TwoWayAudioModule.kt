package com.app.aiinterviewagents

import com.facebook.react.bridge.*
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.util.Base64
import android.util.Log

class TwoWayAudioModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val NAME = "TwoWayAudio"
        private const val SAMPLE_RATE = 16000 // adjust to match your server (Azure often 16000 or 16000)
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_OUT_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT

        private var audioTrack: AudioTrack? = null

        fun pausePlayback() {
            try {
                audioTrack?.pause()
                Log.d(NAME, "Audio playback paused")
            } catch (e: Exception) {
                Log.e(NAME, "Error pausing playback", e)
            }
        }

        fun resumePlayback() {
            try {
                audioTrack?.play()
                Log.d(NAME, "Audio playback resumed")
            } catch (e: Exception) {
                Log.e(NAME, "Error resuming playback", e)
            }
        }
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            if (audioTrack == null) {
                val bufferSize = AudioTrack.getMinBufferSize(
                    SAMPLE_RATE,
                    CHANNEL_CONFIG,
                    AUDIO_FORMAT
                )

                audioTrack = AudioTrack(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build(),
                    AudioFormat.Builder()
                        .setEncoding(AUDIO_FORMAT)
                        .setSampleRate(SAMPLE_RATE)
                        .setChannelMask(CHANNEL_CONFIG)
                        .build(),
                    bufferSize,
                    AudioTrack.MODE_STREAM,
                    AudioManager.AUDIO_SESSION_ID_GENERATE
                )
                audioTrack?.play()
                Log.d(NAME, "AudioTrack initialized at ${SAMPLE_RATE}Hz")
            }
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(NAME, "Initialization failed", e)
            promise.reject("E_INIT", e)
        }
    }

    @ReactMethod
    fun playPCMArray(data: ReadableArray, promise: Promise) {
        try {
            val pcmBytes = ByteArray(data.size() * 2)
            for (i in 0 until data.size()) {
                val sample = data.getInt(i).toShort()
                pcmBytes[i * 2] = (sample.toInt() and 0xFF).toByte()
                pcmBytes[i * 2 + 1] = ((sample.toInt() shr 8) and 0xFF).toByte()
            }
            val written = audioTrack?.write(pcmBytes, 0, pcmBytes.size) ?: 0
            Log.d(NAME, "PCM array written: $written bytes")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(NAME, "Error in playPCMArray", e)
            promise.reject("E_PLAY", e)
        }
    }

    @ReactMethod
    fun playBase64(base64Audio: String, promise: Promise) {
        try {
            val pcmBytes = Base64.decode(base64Audio, Base64.DEFAULT)
            val written = audioTrack?.write(pcmBytes, 0, pcmBytes.size) ?: 0
            Log.d(NAME, "Base64 audio written: $written bytes")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(NAME, "Error in playBase64", e)
            promise.reject("E_PLAY_BASE64", e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            audioTrack?.stop()
            audioTrack?.release()
            audioTrack = null
            Log.d(NAME, "AudioTrack stopped and released")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(NAME, "Error stopping AudioTrack", e)
            promise.reject("E_STOP", e)
        }
    }
}
