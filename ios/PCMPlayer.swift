import Foundation
import AVFoundation
import React

@objc(PCMPlayer)
class PCMPlayer: NSObject {
    private var audioEngine: AVAudioEngine?
    private var playerNode: AVAudioPlayerNode?
    private var audioFormat: AVAudioFormat?

    @objc(init:channels:resolver:rejecter:)
    func initPlayer(sampleRate: NSNumber, channels: NSNumber, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        audioEngine = AVAudioEngine()
        playerNode = AVAudioPlayerNode()
        
        // Setup format: PCM Int16 to Float32 is standard for iOS AudioEngine
        audioFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32,
                                   sampleRate: sampleRate.doubleValue,
                                   channels: channels.uint32Value,
                                   interleaved: false)
        
        guard let engine = audioEngine, let node = playerNode, let format = audioFormat else {
            reject("E_INIT", "Failed to create Audio Engine components", nil)
            return
        }
        
        engine.attach(node)
        engine.connect(node, to: engine.mainMixerNode, format: format)
        
        do {
            try engine.start()
            node.play()
            resolve(nil)
        } catch {
            reject("E_INIT", "Failed to start Audio Engine: \(error.localizedDescription)", error)
        }
    }

    @objc(play:resolver:rejecter:)
    func play(data: [Int], resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard let node = playerNode, let format = audioFormat else {
            reject("E_NO_INIT", "Audio Engine not initialized", nil)
            return
        }

        // Convert Int16 (from JS) to Float32 (iOS Audio Standard)
        let frameCount = UInt32(data.count)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
            reject("E_BUFFER", "Failed to create PCM buffer", nil)
            return
        }

        buffer.frameLength = frameCount
        let channelData = buffer.floatChannelData![0]
        for i in 0..<data.count {
            // Normalize Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
            channelData[i] = Float(data[i]) / 32767.0
        }

        node.scheduleBuffer(buffer, completionHandler: nil)
        resolve(nil)
    }

    @objc(stop:rejecter:)
    func stop(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        playerNode?.stop()
        audioEngine?.stop()
        audioEngine = nil
        playerNode = nil
        resolve(nil)
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
