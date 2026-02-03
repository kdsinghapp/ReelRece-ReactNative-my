// ExoPlayerViewManager.kt
package com.reelrecs

import android.util.Log
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.media3.common.Player
import androidx.media3.ui.AspectRatioFrameLayout

@UnstableApi
class ExoPlayerViewManager(private val reactContext: ReactApplicationContext) :
    SimpleViewManager<PlayerView>() {

    companion object {
        private const val TAG = "ExoPlayerViewManager"
        private const val POSITION_UPDATE_INTERVAL = 1000L
    }

    private var exoPlayer: ExoPlayer? = null
    private var currentVideoUrl: String? = null
    private var playbackPositionManager: PlaybackPositionManager? = null
    private var playerView: PlayerView? = null
    private val handler = Handler(Looper.getMainLooper())
    private val positionUpdateRunnable = object : Runnable {
        override fun run() {
            exoPlayer?.let { player ->
                currentVideoUrl?.let { url ->
                    val currentPosition = player.currentPosition
                    val duration = player.duration
                    
                    if (player.isPlaying && duration > 0) {
                        playbackPositionManager?.savePlaybackPosition(url, currentPosition, duration)
                    }
                }
            }
            handler.postDelayed(this, POSITION_UPDATE_INTERVAL)
        }
    }

    override fun getName(): String {
        return "ExoPlayerView"
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): PlayerView {
        Log.d(TAG, "Creating ExoPlayerView instance")
        
        playbackPositionManager = PlaybackPositionManager(reactContext)
        
        playerView = PlayerView(themedReactContext)
        playerView?.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_FILL)

        try {
            exoPlayer = ExoPlayer.Builder(themedReactContext).build()
            
            // IMPORTANT: Auto-play disable karo initially
            exoPlayer?.playWhenReady = false

            exoPlayer?.addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    Log.d(TAG, "Playback state changed: $playbackState")
                    when (playbackState) {
                        Player.STATE_READY -> {
                            val duration = exoPlayer?.duration ?: 0L
                            Log.d(TAG, "Video ready, duration: ${duration / 1000}s")
                            
                            // Controller ko permanently show karne ka try karo
                            handler.post {
                                playerView?.showController()
                            }
                            
                            handler.post(positionUpdateRunnable)
                            sendEvent("onVideoReady", createEventData(duration = duration))
                        }
                        Player.STATE_ENDED -> {
                            Log.d(TAG, "Video ended")
                            currentVideoUrl?.let { url ->
                                playbackPositionManager?.clearPlaybackPosition(url)
                            }
                            handler.removeCallbacks(positionUpdateRunnable)
                            sendEvent("onVideoEnd", null)
                        }
                        Player.STATE_IDLE -> {
                            handler.removeCallbacks(positionUpdateRunnable)
                        }
                    }
                }

                override fun onIsPlayingChanged(isPlaying: Boolean) {
                    Log.d(TAG, "Is playing changed: $isPlaying")
                    sendEvent("onPlayPause", createEventData(
                        currentTime = exoPlayer?.currentPosition ?: 0L,
                        duration = exoPlayer?.duration ?: 0L,
                        isPlaying = isPlaying
                    ))
                    if (isPlaying) {
        playerView?.showController()
        playerView?.controllerShowTimeoutMs = 1000
    }
                }
            })

            // CONTROLLER SETUP - Yeh important hai
            playerView?.useController = true
            playerView?.controllerAutoShow = true // Auto-show enable
            playerView?.controllerShowTimeoutMs = 1000 // Timeout disable - controller hide nahi hoga
            playerView?.setShowNextButton(false)
            playerView?.setShowPreviousButton(false)
            playerView?.setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER)
           // playerView?.controllerHideOnTouch = false // Touch pe hide disable
            playerView?.player = exoPlayer
            
            // Initially controller show karo
            handler.postDelayed({
                playerView?.showController()
            }, 100)
            
            Log.d(TAG, "ExoPlayer created successfully with PERMANENT controller")
        } catch (e: Exception) {
            Log.e(TAG, "Error creating ExoPlayer", e)
        }
        
        return playerView!!
    }

    @ReactProp(name = "source")
    fun setSource(playerView: PlayerView, source: ReadableMap?) {
        Log.d(TAG, "Setting source: $source")
        
        if (source == null) {
            Log.w(TAG, "Source is null")
            return
        }

        try {
            val uriString = source.getString("uri")
            if (uriString.isNullOrEmpty()) {
                Log.e(TAG, "URI is null or empty")
                return
            }

            currentVideoUrl = uriString
            Log.d(TAG, "Loading media from URI: $uriString")
            
            val playbackPosition = playbackPositionManager?.getPlaybackPosition(uriString)
            
            val dataSourceFactory = CacheDataSourceFactory(reactContext)
            val mediaItem = MediaItem.fromUri(uriString)
            
            val mediaSource = if (uriString.endsWith(".m3u8")) {
                androidx.media3.exoplayer.hls.HlsMediaSource.Factory(dataSourceFactory)
                    .createMediaSource(mediaItem)
            } else {
                androidx.media3.exoplayer.source.ProgressiveMediaSource.Factory(dataSourceFactory)
                    .createMediaSource(mediaItem)
            }
            exoPlayer?.setMediaSource(mediaSource)
            exoPlayer?.prepare()
            
            if (playbackPosition != null && playbackPosition.shouldResume) {
                handler.postDelayed({
                    exoPlayer?.seekTo(playbackPosition.position)
                    Log.d(TAG, "Resuming from saved position: ${playbackPosition.position}ms")
                    
                    sendEvent("onVideoResume", createEventData(
                        currentTime = playbackPosition.position,
                        duration = playbackPosition.duration
                    ))
                }, 100)
            }
            
            // Source set hone ke baad controller show karo
            handler.postDelayed({
                playerView?.showController()
            }, 500)
            
            Log.d(TAG, "Media source set successfully")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error setting source", e)
        }
    }

    // CONTROLLER KO MANUALLY SHOW KARNE KA METHOD
    @ReactProp(name = "showController")
    fun showController(playerView: PlayerView, show: Boolean) {
        Log.d(TAG, "Manually show controller: $show")
        if (show) {
            playerView.showController()
            playerView.controllerShowTimeoutMs = 1000
        }
    }


    @ReactProp(name = "paused")
    fun setPaused(playerView: PlayerView, paused: Boolean) {
        Log.d(TAG, "Set paused: $paused")
        exoPlayer?.playWhenReady = !paused
        // Play/pause pe controller show karo
        if (!paused) {
            playerView.showController()
        }
    }

    @ReactProp(name = "muted")
    fun setMuted(playerView: PlayerView, muted: Boolean) {
        Log.d(TAG, "Set muted: $muted")
        exoPlayer?.volume = if (muted) 0f else 1f
    }

    @ReactProp(name = "volume")
    fun setVolume(playerView: PlayerView, volume: Float) {
        Log.d(TAG, "Set volume: $volume")
        exoPlayer?.volume = volume
    }

    @ReactProp(name = "seekTo")
    fun seekTo(playerView: PlayerView, position: Double) {
        Log.d(TAG, "Seek to: $position")
        exoPlayer?.seekTo((position * 1000).toLong())
        // Seek karne ke baad controller show karo
        playerView.showController()
    }

    @ReactProp(name = "controllerEnabled")
    fun setControllerEnabled(playerView: PlayerView, enabled: Boolean) {
        playerView.useController = enabled
        if (enabled) {
            playerView.controllerShowTimeoutMs = 0 // Permanent show
            playerView.showController()
        }
        Log.d(TAG, "Controller enabled set to: $enabled")
    }

    @ReactProp(name = "autoResume")
    fun setAutoResume(playerView: PlayerView, autoResume: Boolean) {
        Log.d(TAG, "Auto resume set to: $autoResume")
    }

    private fun sendEvent(eventName: String, data: WritableMap?) {
        Log.d(TAG, "Sending event: $eventName with data: $data")
        reactContext
            .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }

    private fun createEventData(
        currentTime: Long = 0L,
        duration: Long = 0L,
        isPlaying: Boolean? = null
    ): WritableMap {
        val data = Arguments.createMap()
        data.putDouble("currentTime", currentTime.toDouble() / 1000.0)
        data.putDouble("duration", duration.toDouble() / 1000.0)
        isPlaying?.let { data.putBoolean("isPlaying", it) }
        return data
    }

    override fun onDropViewInstance(view: PlayerView) {
        Log.d(TAG, "Dropping view instance")
        
        exoPlayer?.let { player ->
            currentVideoUrl?.let { url ->
                if (player.duration > 0) {
                    playbackPositionManager?.savePlaybackPosition(
                        url, 
                        player.currentPosition, 
                        player.duration
                    )
                }
            }
        }
        
        handler.removeCallbacks(positionUpdateRunnable)
        exoPlayer?.release()
        exoPlayer = null
        playerView = null
        super.onDropViewInstance(view)
    }
}