
import RNFS from 'react-native-fs';
import md5 from 'md5';
import { cacheHLS, getCacheSize, enforceCacheLimit, clearCache, cancelCurrentDownloads } from './HLSCacheManager';

 

const CACHE_LIMIT = 100 * 1024 * 1024; // 100 MB

class VideoCacheManager {
  static async getPlayableUrl(originalUrl, onProgress) {
    try {
      // 1️⃣ First enforce cache limit before caching new video
      await enforceCacheLimit(CACHE_LIMIT);

      // 2️⃣ Try caching or return existing cached path
      const localPath = await cacheHLS(originalUrl, onProgress);

 
      // 3️⃣ Return the local file URL
      return localPath;
    } catch (err) {
       return originalUrl; // fallback to streaming from network
    }
  }

  static async getCacheInfo() {
    const size = await getCacheSize();
    return {
      size,
      sizeMB: (size / (1024 * 1024)).toFixed(2) + ' MB',
    };
  }

  static async clearAll() {
    await clearCache();
  }

  static cancelDownloads() {
    cancelCurrentDownloads();
  }
}

export default VideoCacheManager;
