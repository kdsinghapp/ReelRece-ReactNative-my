package com.reelrecs

import android.content.Context
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.cache.Cache
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import java.io.File

class CacheDataSourceFactory(private val context: Context) : DataSource.Factory {

    companion object {
        @Volatile private var simpleCache: SimpleCache? = null
        @Volatile private var databaseProvider: StandaloneDatabaseProvider? = null
        private const val CACHE_SIZE = 200L * 1024L * 1024L // 200MB

        fun getCache(context: Context): Cache {
            return simpleCache ?: synchronized(this) {
                simpleCache ?: run {
                    val cacheDir = File(context.cacheDir, "media3_cache")
                    if (!cacheDir.exists()) {
                        cacheDir.mkdirs()
                    }
                    val evictor = LeastRecentlyUsedCacheEvictor(CACHE_SIZE)
                    val dbProvider = getDatabaseProvider(context)
                    val cache = SimpleCache(cacheDir, evictor, dbProvider)
                    simpleCache = cache
                    cache
                }
            }
        }

        fun clearCacheInstance() {
            simpleCache?.release()
            simpleCache = null
        }

        private fun getDatabaseProvider(context: Context): StandaloneDatabaseProvider {
            return databaseProvider ?: synchronized(this) {
                databaseProvider ?: StandaloneDatabaseProvider(context).also {
                    databaseProvider = it
                }
            }
        }
    }

    private val httpDataSourceFactory = DefaultHttpDataSource.Factory()
        .setConnectTimeoutMs(30000)
        .setReadTimeoutMs(30000)

    override fun createDataSource(): DataSource {
        val cache = getCache(context)
        return CacheDataSource.Factory()
            .setCache(cache)
            .setUpstreamDataSourceFactory(httpDataSourceFactory)
            .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)
            .createDataSource()
    }
}