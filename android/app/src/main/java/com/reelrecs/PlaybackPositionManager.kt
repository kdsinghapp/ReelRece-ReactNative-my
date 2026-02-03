// PlaybackPositionManager.kt
package com.reelrecs

import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext

class PlaybackPositionManager(private val reactContext: ReactApplicationContext) {
    
    companion object {
        private const val PREFS_NAME = "VideoPlaybackPositions"
        private const val KEY_POSITION_PREFIX = "playback_position_"
        private const val KEY_DURATION_PREFIX = "video_duration_"
    }
    
    private val sharedPreferences: SharedPreferences by lazy {
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    fun savePlaybackPosition(videoUrl: String, position: Long, duration: Long) {
        val videoKey = generateVideoKey(videoUrl)
        with(sharedPreferences.edit()) {
            putLong("${KEY_POSITION_PREFIX}$videoKey", position)
            putLong("${KEY_DURATION_PREFIX}$videoKey", duration)
            apply()
        }
    }
    
    fun getPlaybackPosition(videoUrl: String): PlaybackPosition {
        val videoKey = generateVideoKey(videoUrl)
        val position = sharedPreferences.getLong("${KEY_POSITION_PREFIX}$videoKey", 0L)
        val duration = sharedPreferences.getLong("${KEY_DURATION_PREFIX}$videoKey", 0L)
        
        // Only resume if position is meaningful (at least 5 seconds and not near the end)
        val shouldResume = position > 5000 && (duration - position) > 10000
        
        return PlaybackPosition(
            position = if (shouldResume) position else 0L,
            duration = duration,
            shouldResume = shouldResume
        )
    }
    
    fun clearPlaybackPosition(videoUrl: String) {
        val videoKey = generateVideoKey(videoUrl)
        with(sharedPreferences.edit()) {
            remove("${KEY_POSITION_PREFIX}$videoKey")
            remove("${KEY_DURATION_PREFIX}$videoKey")
            apply()
        }
    }
    
    private fun generateVideoKey(videoUrl: String): String {
        return videoUrl.hashCode().toString()
    }
    
    data class PlaybackPosition(
        val position: Long,
        val duration: Long,
        val shouldResume: Boolean
    )
}