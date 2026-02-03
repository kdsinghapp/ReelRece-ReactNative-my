import UIKit
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
    // MARK: - Properties
    private var player: AVPlayer?
    private var playerLayer: AVPlayerLayer?
    private var playerItem: AVPlayerItem?
    private var timeObserver: Any?
    private var isPlaying = false
    
    // MARK: - React Props
    @objc var onVideoLoad: RCTDirectEventBlock?
    @objc var onVideoError: RCTDirectEventBlock?
    @objc var onVideoEnd: RCTDirectEventBlock?
    @objc var onPlaybackStatus: RCTDirectEventBlock?
    @objc var onVideoBuffer: RCTDirectEventBlock?
    @objc var onVideoProgress: RCTDirectEventBlock?
    
    @objc var source: [String: Any]? {
        didSet {
            guard let source = source, let uri = source["uri"] as? String else { return }
            setupPlayer(with: uri)
        }
    }
    
    @objc var paused: Bool = true {
        didSet {
            if paused {
                player?.pause()
                isPlaying = false
                sendPlaybackStatus()
            } else {
                player?.play()
                isPlaying = true
                sendPlaybackStatus()
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
            player?.seek(to: time, toleranceBefore: .zero, toleranceAfter: .zero)
        }
    }
    
    @objc var resizeMode: String? {
        didSet {
            updateResizeMode()
        }
    }
    
    @objc var controls: Bool = true {
        didSet {
            // This can be used to show/hide custom controls if needed
        }
    }
    
    // MARK: - Initialization
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
    
    // MARK: - Setup
    private func setupView() {
        backgroundColor = .black
        clipsToBounds = true
    }
    
    private func setupPlayer(with urlString: String) {
        removeObservers()
        
        guard let url = URL(string: urlString) else {
            sendError("Invalid URL: \(urlString)")
            return
        }
        
        // Create asset and player item
        let asset = AVAsset(url: url)
        playerItem = AVPlayerItem(asset: asset)
        player = AVPlayer(playerItem: playerItem)
        
        // Setup player layer
        playerLayer = AVPlayerLayer(player: player)
        updateResizeMode()
        playerLayer?.frame = bounds
        if let playerLayer = playerLayer {
            layer.addSublayer(playerLayer)
        }
        
        // Configure audio session for background playback
        configureAudioSession()
        
        setupObservers()
        
        // Start in paused state by default
        player?.pause()
        isPlaying = false
        sendPlaybackStatus()
    }
    
    private func configureAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to configure audio session: \(error)")
        }
    }
    
    private func updateResizeMode() {
        switch resizeMode {
        case "cover":
            playerLayer?.videoGravity = .resizeAspectFill
        case "contain":
            playerLayer?.videoGravity = .resizeAspect
        case "stretch":
            playerLayer?.videoGravity = .resize
        default:
            playerLayer?.videoGravity = .resizeAspect
        }
    }
    
    // MARK: - Observers
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
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleNewAccessLogEntry),
            name: .AVPlayerItemNewAccessLogEntry,
            object: playerItem
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleNewErrorLogEntry),
            name: .AVPlayerItemNewErrorLogEntry,
            object: playerItem
        )
        
        // KVO observers
        playerItem?.addObserver(self, forKeyPath: #keyPath(AVPlayerItem.status), options: [.new, .initial], context: nil)
        playerItem?.addObserver(self, forKeyPath: #keyPath(AVPlayerItem.isPlaybackBufferEmpty), options: [.new], context: nil)
        playerItem?.addObserver(self, forKeyPath: #keyPath(AVPlayerItem.isPlaybackLikelyToKeepUp), options: [.new], context: nil)
        player?.addObserver(self, forKeyPath: #keyPath(AVPlayer.rate), options: [.new, .initial], context: nil)
    }
    
    private func removeObservers() {
        // Remove time observer
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
            self.timeObserver = nil
        }
        
        // Remove notification observers
        NotificationCenter.default.removeObserver(self)
        
        // Remove KVO observers
        playerItem?.removeObserver(self, forKeyPath: #keyPath(AVPlayerItem.status))
        playerItem?.removeObserver(self, forKeyPath: #keyPath(AVPlayerItem.isPlaybackBufferEmpty))
        playerItem?.removeObserver(self, forKeyPath: #keyPath(AVPlayerItem.isPlaybackLikelyToKeepUp))
        player?.removeObserver(self, forKeyPath: #keyPath(AVPlayer.rate))
        
        // Clean up player
        player?.pause()
        player?.replaceCurrentItem(with: nil)
        player = nil
        playerItem = nil
        playerLayer?.removeFromSuperlayer()
        playerLayer = nil
    }
    
    // MARK: - Event Handlers
    @objc private func playerDidFinishPlaying() {
        onVideoEnd?([:])
        isPlaying = false
        sendPlaybackStatus()
    }
    
    @objc private func handlePlaybackStalled() {
        onVideoBuffer?([:])
    }
    
    @objc private func handleNewAccessLogEntry() {
        // Handle access log entries if needed
    }
    
    @objc private func handleNewErrorLogEntry() {
        if let error = playerItem?.errorLog()?.events.last {
            sendError("Playback error: \(error.errorComment ?? "Unknown error")")
        }
    }
    
    private func handleTimeUpdate(time: CMTime) {
        let currentTime = CMTimeGetSeconds(time)
        
        if let duration = playerItem?.duration, CMTimeGetSeconds(duration) > 0 {
            let totalDuration = CMTimeGetSeconds(duration)
            let progress = currentTime / totalDuration
            
            onVideoProgress?([
                "currentTime": currentTime,
                "duration": totalDuration,
                "progress": progress
            ])
        }
    }
    
    private func sendPlaybackStatus() {
        onPlaybackStatus?([
            "isPlaying": isPlaying
        ])
    }
    
    private func sendError(_ message: String) {
        onVideoError?(["error": message])
    }
    
    // MARK: - KVO
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        
        guard let keyPath = keyPath else { return }
        
        switch keyPath {
        case #keyPath(AVPlayerItem.status):
            handlePlayerItemStatusChange()
            
        case #keyPath(AVPlayerItem.isPlaybackBufferEmpty):
            if let isEmpty = playerItem?.isPlaybackBufferEmpty, isEmpty {
                onVideoBuffer?([:])
            }
            
        case #keyPath(AVPlayerItem.isPlaybackLikelyToKeepUp):
            if let isLikelyToKeepUp = playerItem?.isPlaybackLikelyToKeepUp, isLikelyToKeepUp {
                // Buffering completed
            }
            
        case #keyPath(AVPlayer.rate):
            if let rate = player?.rate {
                let wasPlaying = isPlaying
                isPlaying = rate > 0
                
                // Only send event if playing state actually changed
                if wasPlaying != isPlaying {
                    sendPlaybackStatus()
                }
            }
            
        default:
            super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
        }
    }
    
    private func handlePlayerItemStatusChange() {
        guard let status = playerItem?.status else { return }
        
        switch status {
        case .readyToPlay:
            if let duration = playerItem?.duration {
                let durationSeconds = CMTimeGetSeconds(duration)
                onVideoLoad?([
                    "duration": durationSeconds,
                    "currentTime": 0.0
                ])
            }
            
        case .failed:
            if let error = playerItem?.error {
                sendError("Player item failed: \(error.localizedDescription)")
            } else {
                sendError("Player item failed with unknown error")
            }
            
        case .unknown:
            break
            
        @unknown default:
            break
        }
    }
    
    // MARK: - Layout
    override func layoutSubviews() {
        super.layoutSubviews()
        playerLayer?.frame = bounds
    }
    
    // MARK: - Public Methods (React Commands)
    @objc func play() {
        player?.play()
        isPlaying = true
        sendPlaybackStatus()
    }
    
    @objc func pause() {
        player?.pause()
        isPlaying = false
        sendPlaybackStatus()
    }
    
    @objc func seek(_ position: Double) {
        let time = CMTime(seconds: position, preferredTimescale: 1000)
        player?.seek(to: time, toleranceBefore: .zero, toleranceAfter: .zero)
    }
    
    @objc func stop() {
        player?.pause()
        player?.seek(to: CMTime.zero)
        isPlaying = false
        sendPlaybackStatus()
    }
    
    @objc func setVolume(_ volume: Float) {
        player?.volume = volume
    }
}

// MARK: - React Module Extension
extension AVPlayerViewManager {
    
    @objc func play(_ node: NSNumber) {
        DispatchQueue.main.async {
            if let view = self.bridge.uiManager.view(forReactTag: node) as? AVPlayerView {
                view.play()
            }
        }
    }
    
    @objc func pause(_ node: NSNumber) {
        DispatchQueue.main.async {
            if let view = self.bridge.uiManager.view(forReactTag: node) as? AVPlayerView {
                view.pause()
            }
        }
    }
    
    @objc func seek(_ node: NSNumber, position: Double) {
        DispatchQueue.main.async {
            if let view = self.bridge.uiManager.view(forReactTag: node) as? AVPlayerView {
                view.seek(position)
            }
        }
    }
    
    @objc func stop(_ node: NSNumber) {
        DispatchQueue.main.async {
            if let view = self.bridge.uiManager.view(forReactTag: node) as? AVPlayerView {
                view.stop()
            }
        }
    }
    
    @objc func setVolume(_ node: NSNumber, volume: Float) {
        DispatchQueue.main.async {
            if let view = self.bridge.uiManager.view(forReactTag: node) as? AVPlayerView {
                view.setVolume(volume)
            }
        }
    }
}