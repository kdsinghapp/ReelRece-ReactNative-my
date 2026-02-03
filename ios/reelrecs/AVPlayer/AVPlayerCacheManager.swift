import Foundation

import AVKit

import React
 
@objc(AVPlayerViewManager)

class AVPlayerViewManager: RCTViewManager {

    override func view() -> UIView! {

        return AVPlayerView()

    }

    override static func requiresMainQueueSetup() -> Bool {

        return true

    }

}
 
class AVPlayerView: UIView {

    private var player: AVPlayer?

    private var playerLayer: AVPlayerLayer?

    private var playerItem: AVPlayerItem?

    private var timeObserver: Any?

    @objc var onVideoLoad: RCTDirectEventBlock?

    @objc var onVideoError: RCTDirectEventBlock?

    @objc var onVideoEnd: RCTDirectEventBlock?

    @objc var onPlaybackStatus: RCTDirectEventBlock?

    @objc var onVideoBuffer: RCTDirectEventBlock?

    @objc var source: [String: Any]? {

        didSet {

            guard let source = source, let uri = source["uri"] as? String else { return }

            setupPlayer(with: uri)

        }

    }

    @objc var paused: Bool = false {

        didSet {

            if paused {

                player?.pause()

            } else {

                player?.play()

            }

        }

    }

    @objc var muted: Bool = false {

        didSet {

            player?.isMuted = muted

        }

    }

    @objc var volume: Float = 1.0 {

        didSet {

            player?.volume = volume

        }

    }

    @objc var seekTo: Double = 0 {

        didSet {

            let time = CMTime(seconds: seekTo, preferredTimescale: 1000)

            player?.seek(to: time)

        }

    }

    override init(frame: CGRect) {

        super.init(frame: frame)

        setupView()

    }

    required init?(coder: NSCoder) {

        super.init(coder: coder)

        setupView()

    }

    deinit {

        removeObservers()

    }

    private func setupView() {

        backgroundColor = .black

    }

    private func setupPlayer(with urlString: String) {

        removeObservers()

        guard let url = URL(string: urlString) else {

            sendError("Invalid URL")

            return

        }

        let asset = AVAsset(url: url)

        playerItem = AVPlayerItem(asset: asset)

        player = AVPlayer(playerItem: playerItem)

        // Setup player layer

        playerLayer = AVPlayerLayer(player: player)

        playerLayer?.videoGravity = .resizeAspect

        playerLayer?.frame = bounds

        if let playerLayer = playerLayer {

            layer.addSublayer(playerLayer)

        }

        setupObservers()

    }

    private func setupObservers() {

        // Time observer for progress updates

        let interval = CMTime(seconds: 0.5, preferredTimescale: CMTimeScale(NSEC_PER_SEC))

        timeObserver = player?.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in

            self?.handleTimeUpdate(time: time)

        }

        // Notification observers

        NotificationCenter.default.addObserver(

            self,

            selector: #selector(playerDidFinishPlaying),

            name: .AVPlayerItemDidPlayToEndTime,

            object: playerItem

        )

        NotificationCenter.default.addObserver(

            self,

            selector: #selector(handlePlaybackStalled),

            name: .AVPlayerItemPlaybackStalled,

            object: playerItem

        )

        // KVO observers

        playerItem?.addObserver(self, forKeyPath: #keyPath(AVPlayerItem.status), options: [.new, .initial], context: nil)

        player?.addObserver(self, forKeyPath: #keyPath(AVPlayer.rate), options: [.new, .initial], context: nil)

    }

    private func removeObservers() {

        if let timeObserver = timeObserver {

            player?.removeTimeObserver(timeObserver)

        }

        NotificationCenter.default.removeObserver(self)

        playerItem?.removeObserver(self, forKeyPath: #keyPath(AVPlayerItem.status))

        player?.removeObserver(self, forKeyPath: #keyPath(AVPlayer.rate))

        player?.pause()

        player = nil

        playerItem = nil

    }

    @objc private func playerDidFinishPlaying() {

        onVideoEnd?([:])

    }

    @objc private func handlePlaybackStalled() {

        onVideoBuffer?([:])

    }

    private func handleTimeUpdate(time: CMTime) {

        // Handle time updates if needed

    }

    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {

        if keyPath == #keyPath(AVPlayerItem.status) {

            let status: AVPlayerItem.Status

            if let statusNumber = change?[.newKey] as? NSNumber {

                status = AVPlayerItem.Status(rawValue: statusNumber.intValue)!

            } else {

                status = .unknown

            }

            switch status {

            case .readyToPlay:

                if let duration = playerItem?.duration {

                    let durationSeconds = CMTimeGetSeconds(duration)

                    onVideoLoad?([

                        "duration": durationSeconds,

                        "currentTime": 0

                    ])

                }

            case .failed:

                if let error = playerItem?.error {

                    sendError(error.localizedDescription)

                }

            case .unknown:

                break

            @unknown default:

                break

            }

        } else if keyPath == #keyPath(AVPlayer.rate) {

            let rate = player?.rate ?? 0

            onPlaybackStatus?([

                "isPlaying": rate > 0

            ])

        }

    }

    private func sendError(_ message: String) {

        onVideoError?(["error": message])

    }

    override func layoutSubviews() {

        super.layoutSubviews()

        playerLayer?.frame = bounds

    }

}
 
AVPlayerCacheManager.swift
 
import Foundation

import React

import AVFoundation
 
@objc(AVPlayerCacheManager)

class AVPlayerCacheManager: RCTEventEmitter {

    private var player: AVPlayer?

    override func supportedEvents() -> [String]! {

        return []

    }

    override static func requiresMainQueueSetup() -> Bool {

        return true

    }

    @objc override func constantsToExport() -> [AnyHashable : Any]! {

        return [:]

    }

    @objc(initializePlayer:rejecter:)

    func initializePlayer(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {

            if self.player == nil {

                self.player = AVPlayer()

            }

            resolve(true)

        }

    }

    @objc(playVideo:resolver:rejecter:)

    func playVideo(_ url: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {

            guard let videoURL = URL(string: url) else {

                reject("INVALID_URL", "Invalid video URL", nil)

                return

            }

            let playerItem = AVPlayerItem(url: videoURL)

            self.player?.replaceCurrentItem(with: playerItem)

            self.player?.play()

            resolve("Video playing")

        }

    }

    @objc(pausePlayer:rejecter:)

    func pausePlayer(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {

            self.player?.pause()

            resolve(true)

        }

    }

    @objc(resumePlayer:rejecter:)

    func resumePlayer(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {

            self.player?.play()

            resolve(true)

        }

    }

    @objc(stopPlayer:rejecter:)

    func stopPlayer(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {

            self.player?.pause()

            self.player?.replaceCurrentItem(with: nil)

            resolve(true)

        }

    }

    @objc(seekTo:resolver:rejecter:)

    func seekTo(_ position: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {

            let time = CMTime(seconds: position, preferredTimescale: 1000)

            self.player?.seek(to: time)

            resolve(true)

        }

    }

    @objc(setVolume:resolver:rejecter:)

    func setVolume(_ volume: Float, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {

            self.player?.volume = volume

            resolve(true)

        }

    }

    @objc(clearCache:rejecter:)

    func clearCache(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        // AVPlayer cache is managed by iOS automatically

        resolve(true)

    }

}
 
