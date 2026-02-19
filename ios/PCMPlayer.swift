import Foundation
import AVFoundation
import React

@objc(PCMPlayer)
class PCMPlayer: NSObject {
    // Keep these alive for the lifetime of the module
    private let audioEngine = AVAudioEngine()
    private let playerNode = AVAudioPlayerNode()
    private var audioFormat: AVAudioFormat?
    private var isInitialized = false

    @objc(init:channels:resolver:rejecter:)
    func initPlayer(sampleRate: NSNumber, channels: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        if isInitialized {
            resolve("Already initialized")
            return
        }

        let session = AVAudioSession.sharedInstance()
        do {
            // Use .playAndRecord to allow transitions between mic and speaker without resetting the engine
            try session.setCategory(.playAndRecord, mode: .voiceChat, options: [.defaultToSpeaker, .allowBluetooth])
            try session.setActive(true)
        } catch {
            reject("E_SESSION", "Session failed", error)
            return
        }

        audioFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32,
                                   sampleRate: sampleRate.doubleValue,
                                   channels: channels.uint32Value,
                                   interleaved: false)
        
        audioEngine.attach(playerNode)
        audioEngine.connect(playerNode, to: audioEngine.mainMixerNode, format: audioFormat)
        
        do {
            try audioEngine.start()
            playerNode.play()
            isInitialized = true
            resolve(nil)
        } catch {
            reject("E_INIT", "Engine start failed", error)
        }
    }

    @objc(play:resolver:rejecter:)
    func play(data: [Int], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let format = audioFormat else { return }

        // If engine stopped due to system interruption, restart it
        if !audioEngine.isRunning {
            try? audioEngine.start()
            playerNode.play()
        }

        let frameCount = UInt32(data.count)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }

        buffer.frameLength = frameCount
        let channelData = buffer.floatChannelData![0]
        for i in 0..<data.count {
            channelData[i] = Float(data[i]) / 32768.0
        }

        playerNode.scheduleBuffer(buffer, at: nil, options: [], completionHandler: nil)
        resolve(nil)
    }

    @objc(stop:rejecter:)
    func stop(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        // Just stop the sound, don't kill the engine or set to nil
        playerNode.stop()
        // We keep the engine running so it's ready for the next "AI turn"
        resolve(nil)
    }
}