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
    private var observersRegistered = false

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
            registerSessionObserversIfNeeded()
            isInitialized = true
            resolve(nil)
        } catch {
            reject("E_INIT", "Engine start failed", error)
        }
    }

    @objc(play:resolver:rejecter:)
    func play(data: [Int], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let format = audioFormat else {
            reject("E_NOT_INIT", "PCMPlayer not initialized", nil)
            return
        }
        if data.isEmpty {
            resolve(nil)
            return
        }

        // If engine stopped due to system interruption, restart it
        if !audioEngine.isRunning {
            try? audioEngine.start()
        }
        if !playerNode.isPlaying {
            playerNode.play()
        }

        let frameCount = UInt32(data.count)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
            reject("E_BUFFER", "Failed to allocate audio buffer", nil)
            return
        }

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

    private func registerSessionObserversIfNeeded() {
        if observersRegistered { return }
        observersRegistered = true

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleInterruption),
            name: AVAudioSession.interruptionNotification,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRouteChange),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )
    }

    @objc
    private func handleInterruption(_ notification: Notification) {
        guard
            let userInfo = notification.userInfo,
            let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
            let type = AVAudioSession.InterruptionType(rawValue: typeValue)
        else { return }

        if type == .ended {
            do {
                try AVAudioSession.sharedInstance().setActive(true)
                if !audioEngine.isRunning {
                    try audioEngine.start()
                }
                if !playerNode.isPlaying {
                    playerNode.play()
                }
            } catch {
                NSLog("[PCMPlayer] Failed to recover from interruption: \(error.localizedDescription)")
            }
        }
    }

    @objc
    private func handleRouteChange(_ notification: Notification) {
        guard isInitialized else { return }
        if !audioEngine.isRunning {
            try? audioEngine.start()
        }
        if !playerNode.isPlaying {
            playerNode.play()
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
