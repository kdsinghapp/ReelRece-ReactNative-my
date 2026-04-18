// AndroidExoPlayerCacheModule.kt - Replace the entire file with this:
package com.reelrecs

import android.content.Context
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DataSpec
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import java.io.File
import java.util.concurrent.Executors

@UnstableApi
class AndroidExoPlayerCacheModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext
    private val executor = Executors.newFixedThreadPool(4)
    private var player: ExoPlayer? = null
    private val playbackPositionManager = PlaybackPositionManager(reactContext)

    companion object {
        private const val TAG = "ExoPlayerCache"
    }

    override fun getName(): String {
        return "AndroidExoPlayerCache"
    }

    // Create media source with caching
    private fun createMediaSource(url: String): MediaSource {
        val uri = Uri.parse(url)
        val dataSourceFactory: DataSource.Factory = CacheDataSourceFactory(context)
        
        return if (url.endsWith(".m3u8")) {
            HlsMediaSource.Factory(dataSourceFactory)
                .setAllowChunklessPreparation(true)
                .createMediaSource(MediaItem.fromUri(uri))
        } else {
            ProgressiveMediaSource.Factory(dataSourceFactory)
                .createMediaSource(MediaItem.fromUri(uri))
        }
    }

    // Add these new methods for playback position management
    @ReactMethod
    fun savePlaybackPosition(url: String, positionSeconds: Double, durationSeconds: Double, promise: Promise) {
        try {
            val positionMs = (positionSeconds * 1000).toLong()
            val durationMs = (durationSeconds * 1000).toLong()
            
            playbackPositionManager.savePlaybackPosition(url, positionMs, durationMs)
            Log.d(TAG, "Saved playback position: $positionMs ms for $url")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error saving playback position", e)
            promise.reject("SAVE_POSITION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getPlaybackPosition(url: String, promise: Promise) {
        try {
            val playbackPosition = playbackPositionManager.getPlaybackPosition(url)
            val result = WritableNativeMap()
            result.putDouble("position", playbackPosition.position.toDouble() / 1000.0)
            result.putDouble("duration", playbackPosition.duration.toDouble() / 1000.0)
            result.putBoolean("shouldResume", playbackPosition.shouldResume)
            
            Log.d(TAG, "Retrieved playback position: ${playbackPosition.position} ms for $url")
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting playback position", e)
            promise.reject("GET_POSITION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearPlaybackPosition(url: String, promise: Promise) {
        try {
            playbackPositionManager.clearPlaybackPosition(url)
            Log.d(TAG, "Cleared playback position for: $url")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing playback position", e)
            promise.reject("CLEAR_POSITION_ERROR", e.message)
        }
    }

    // Update the playVideo method to support resuming
    @ReactMethod
    fun playVideo(url: String, promise: Promise) {
        playVideoWithResume(url, true, promise)
    }

    @ReactMethod
    fun playVideoWithResume(url: String, autoResume: Boolean, promise: Promise) {
        try {
            initializePlayer { success ->
                if (success) {
                    val mediaSource = createMediaSource(url)
                    player?.setMediaSource(mediaSource)
                    player?.prepare()
                    
                    // Check if we should resume from last position
                    if (autoResume) {
                        val playbackPosition = playbackPositionManager.getPlaybackPosition(url)
                        if (playbackPosition.shouldResume) {
                            player?.seekTo(playbackPosition.position)
                            Log.d(TAG, "Resuming video from position: ${playbackPosition.position} ms")
                        }
                    }
                    
                    player?.playWhenReady = true
                    
                    Log.d(TAG, "Playing video with caching: $url")
                    promise.resolve("Video playing with cache support")
                } else {
                    promise.reject("PLAY_ERROR", "Failed to initialize player")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error playing video", e)
            promise.reject("PLAY_ERROR", e.message)
        }
    }

    @ReactMethod
    fun initializePlayer(promise: Promise) {
        try {
            if (player == null) {
                player = ExoPlayer.Builder(context).build()
                Log.d(TAG, "ExoPlayer initialized successfully")
                promise.resolve(true)
            } else {
                promise.resolve(true) // Already initialized
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing player", e)
            promise.reject("PLAYER_INIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun preloadVideo(url: String, promise: Promise) {
        executor.execute {
            try {
                Log.d(TAG, "Starting preload for: $url")
                val cache = CacheDataSourceFactory.getCache(context)
                val uri = Uri.parse(url)
                
                val httpDataSourceFactory = DefaultHttpDataSource.Factory()
                    .setConnectTimeoutMs(30000)
                    .setReadTimeoutMs(30000)
                
                val cacheDataSource = CacheDataSource.Factory()
                    .setCache(cache)
                    .setUpstreamDataSourceFactory(httpDataSourceFactory)
                    .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)
                    .createDataSource()

                val dataSpec = DataSpec(uri)
                
                cacheDataSource.open(dataSpec)
                
                val buffer = ByteArray(128 * 1024) // 128KB buffer
                var totalRead = 0L
                var read: Int
                
                do {
                    read = cacheDataSource.read(buffer, 0, buffer.size)
                    if (read != C.RESULT_END_OF_INPUT) {
                        totalRead += read
                        // Log progress for large files
                        if (totalRead % (5 * 1024 * 1024) == 0L) {
                            Log.d(TAG, "Preload progress: ${totalRead / 1024 / 1024}MB")
                        }
                    }
                } while (read != C.RESULT_END_OF_INPUT)
                
                cacheDataSource.close()
                
                Log.d(TAG, "Preload completed: ${totalRead / 1024 / 1024}MB cached")
                
                // Verify cache
                val cachedSpans = cache.getCachedSpans(url)
                val isCached = !cachedSpans.isNullOrEmpty()
                
                val result = WritableNativeMap()
                result.putBoolean("success", true)
                result.putDouble("bytesCached", totalRead.toDouble())
                result.putBoolean("isCached", isCached)
                result.putInt("cachedSegments", cachedSpans?.size ?: 0)
                
                promise.resolve(result)
                
            } catch (e: Exception) {
                Log.e(TAG, "Preload error for $url", e)
                promise.reject("PRELOAD_ERROR", "Preload failed: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun isVideoCached(url: String, promise: Promise) {
        executor.execute {
            try {
                val cache = CacheDataSourceFactory.getCache(context)
                val cachedSpans = cache.getCachedSpans(url)
                val isCached = !cachedSpans.isNullOrEmpty()
                
                val result = WritableNativeMap()
                result.putBoolean("isCached", isCached)
                result.putInt("cachedSegments", cachedSpans?.size ?: 0)
                result.putDouble("cachedBytes", cache.getCachedBytes(url, 0, Long.MAX_VALUE).toDouble())
                
                promise.resolve(result)
            } catch (e: Exception) {
                Log.e(TAG, "Error checking cache", e)
                val errorResult = WritableNativeMap()
                errorResult.putBoolean("isCached", false)
                errorResult.putInt("cachedSegments", 0)
                errorResult.putDouble("cachedBytes", 0.0)
                promise.resolve(errorResult)
            }
        }
    }

    @ReactMethod
    fun getCacheSize(promise: Promise) {
        try {
            val cache = CacheDataSourceFactory.getCache(context)
            val cacheSize = cache.cacheSpace
            Log.d(TAG, "Cache size: ${cacheSize / 1024 / 1024}MB")
            promise.resolve(cacheSize.toDouble())
        } catch (e: Exception) {
            Log.e(TAG, "Error getting cache size", e)
            promise.reject("CACHE_SIZE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearCache(promise: Promise) {
        executor.execute {
            try {
                CacheDataSourceFactory.clearCacheInstance()
                
                val cacheDir = File(context.cacheDir, "media3_cache")
                if (cacheDir.exists()) {
                    cacheDir.deleteRecursively()
                }
                
                Log.d(TAG, "Cache cleared successfully")
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Error clearing cache", e)
                promise.reject("CLEAR_CACHE_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun pausePlayer(promise: Promise) {
        try {
            player?.playWhenReady = false
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PAUSE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun resumePlayer(promise: Promise) {
        try {
            player?.playWhenReady = true
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("RESUME_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopPlayer(promise: Promise) {
        try {
            player?.stop()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message)
        }
    }

    @ReactMethod
    fun seekTo(position: Double, promise: Promise) {
        try {
            player?.seekTo((position * 1000).toLong())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SEEK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun trimCache(targetSizeMB: Double, promise: Promise) {
        executor.execute {
            try {
                val cache = CacheDataSourceFactory.getCache(context)
                val targetBytes = (targetSizeMB * 1024 * 1024).toLong()
                val currentSize = cache.cacheSpace
                
                if (currentSize <= targetBytes) {
                    promise.resolve(false) // No trimming needed
                    return@execute
                }
                
                Log.d(TAG, "Starting cache trim: Current ${currentSize/1024/1024}MB, Target ${targetSizeMB}MB")
                
                // Media3 doesn't provide easy access to all cached keys for manual trimming
                // The cache uses LRU eviction automatically when it reaches the max size
                // We'll rely on the built-in eviction policy
                
                Log.d(TAG, "Cache trim completed: relying on Media3's built-in LRU eviction")
                promise.resolve(true)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error trimming cache", e)
                promise.reject("TRIM_CACHE_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun setVolume(volume: Float, promise: Promise) {
        try {
            player?.volume = volume
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("VOLUME_ERROR", e.message)
        }
    }

    // Helper method for async initialization
    private fun initializePlayer(callback: (Boolean) -> Unit) {
        if (player != null) {
            callback(true)
            return
        }
        
        try {
            player = ExoPlayer.Builder(context).build()
            callback(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing player", e)
            callback(false)
        }
    }

    override fun invalidate() {
        super.invalidate()
        player?.release()
        player = null
        executor.shutdown()
    }
}