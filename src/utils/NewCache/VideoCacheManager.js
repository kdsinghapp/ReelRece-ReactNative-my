// // Basic usage
// import VideoCacheManager from './VideoCacheManager';

// const videoManager = new VideoCacheManager();

// // Quick check and clean if needed
// await videoManager.quickVideoCacheCheck();

// // Get video cache info
// const info = await videoManager.getVideoCacheInfo();
 
// // Manual cleanup
// await videoManager.cleanupVideoCache();





// VideoCacheManager.js
import { 
  readDir, 
  stat, 
  unlink, 
  exists, 
  DocumentDirectoryPath, 
  CachesDirectoryPath 
} from 'react-native-fs';

class VideoCacheManager {
  constructor() {
    this.cacheLimit = 60 * 1024 * 1024; // 60MB
    this.clearPercentage = 0.5; // 50%
    this.isCleaning = false;
    this.videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp'];
  }

  // Fast cache check - sirf video files check karega
  async quickVideoCacheCheck() {
    if (this.isCleaning) {
       return;
    }

    try {
      const currentSize = await this.getVideoCacheSize();
      const currentSizeMB = currentSize / (1024 * 1024);
      
       
      if (currentSize >= this.cacheLimit) {
         await this.cleanupVideoCache();
        return true;
      }
      return false;
    } catch (error) {
       return false;
    }
  }

  // Sirf video files ka size calculate karega
  async getVideoCacheSize() {
    try {
      const cachePath = CachesDirectoryPath;
      const documentPath = DocumentDirectoryPath;
      
      const cacheVideoSize = await this.getVideoFolderSize(cachePath);
      const documentVideoSize = await this.getVideoFolderSize(documentPath);
      
      const totalVideoSize = cacheVideoSize + documentVideoSize;
      return totalVideoSize;
    } catch (error) {
       return 0;
    }
  }

  // Sirf video files ka size calculate karega
  async getVideoFolderSize(folderPath) {
    try {
      if (!(await exists(folderPath))) {
        return 0;
      }

      const items = await readDir(folderPath);
      let totalSize = 0;

      for (const item of items) {
        if (item.isDirectory()) {
          totalSize += await this.getVideoFolderSize(item.path);
        } else {
          // Sirf video files check karo
          if (this.isVideoFile(item.name)) {
            try {
              const fileStats = await stat(item.path);
              totalSize += fileStats.size;
            } catch (error) {
              // Skip inaccessible files
            }
          }
        }
      }

      return totalSize;
    } catch (error) {
       return 0;
    }
  }

  // Check if file is video
  isVideoFile(filename) {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return this.videoExtensions.includes(ext);
  }

  // Sirf video files ko clean karega
  async cleanupVideoCache() {
    if (this.isCleaning) return;
    
    this.isCleaning = true;
    
    try {
       
      const cachePath = CachesDirectoryPath;
      const documentPath = DocumentDirectoryPath;
      
      // Sirf video files get karo
      const cacheVideos = await this.getVideoFilesWithStats(cachePath);
      const documentVideos = await this.getVideoFilesWithStats(documentPath);
      
      const allVideos = [...cacheVideos, ...documentVideos];
      
      if (allVideos.length === 0) {
         return;
      }

      // Sort videos by modification time (oldest first)
      allVideos.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
      
       const videosToRemove = Math.ceil(allVideos.length * this.clearPercentage);
      
       
      let removedCount = 0;
      let removedSize = 0;

      // Remove oldest videos
      for (let i = 0; i < videosToRemove && i < allVideos.length; i++) {
        try {
          await unlink(allVideos[i].path);
          removedCount++;
          removedSize += allVideos[i].size;
        } catch (error) {
         }
      }

      const removedSizeMB = removedSize / (1024 * 1024);
       
      return {
        removedCount,
        removedSize,
        removedSizeMB,
        remainingVideos: allVideos.length - removedCount
      };
    } catch (error) {
       throw error;
    } finally {
      this.isCleaning = false;
    }
  }

  // Sirf video files with stats get karega
  async getVideoFilesWithStats(folderPath, videoList = []) {
    try {
      if (!(await exists(folderPath))) {
        return videoList;
      }

      const items = await readDir(folderPath);

      for (const item of items) {
        if (item.isDirectory()) {
          await this.getVideoFilesWithStats(item.path, videoList);
        } else {
          // Sirf video files add karo
          if (this.isVideoFile(item.name)) {
            try {
              const fileStat = await stat(item.path);
              videoList.push({
                path: item.path,
                name: item.name,
                size: fileStat.size,
                mtime: fileStat.mtime || new Date(0)
              });
            } catch (error) {
             }
          }
        }
      }

      return videoList;
    } catch (error) {
       return videoList;
    }
  }

  // Get all video files info (for UI)
  async getVideoCacheInfo() {
    try {
      const totalSize = await this.getVideoCacheSize();
      const totalSizeMB = totalSize / (1024 * 1024);
      
      const cachePath = CachesDirectoryPath;
      const documentPath = DocumentDirectoryPath;
      
      const cacheVideos = await this.getVideoFilesWithStats(cachePath);
      const documentVideos = await this.getVideoFilesWithStats(documentPath);
      const allVideos = [...cacheVideos, ...documentVideos];
      
      return {
        totalSize,
        totalSizeMB,
        videoCount: allVideos.length,
        videos: allVideos.sort((a, b) => a.mtime.getTime() - b.mtime.getTime())
      };
    } catch (error) {
       return {
        totalSize: 0,
        totalSizeMB: 0,
        videoCount: 0,
        videos: []
      };
    }
  }

  // Clear specific video file
  async clearVideoFile(filePath) {
    try {
      if (await exists(filePath)) {
        await unlink(filePath);
         return true;
      }
      return false;
    } catch (error) {
       return false;
    }
  }

  // Clear all video cache
  async clearAllVideoCache() {
    try {
      const cachePath = CachesDirectoryPath;
      const documentPath = DocumentDirectoryPath;
      
      await this.clearVideoFolder(cachePath);
      await this.clearVideoFolder(documentPath);
      
     } catch (error) {
       throw error;
    }
  }

  // Clear video folder (sirf video files)
  async clearVideoFolder(folderPath) {
    try {
      if (!(await exists(folderPath))) {
        return;
      }

      const items = await readDir(folderPath);

      for (const item of items) {
        if (item.isDirectory()) {
          await this.clearVideoFolder(item.path);
        } else {
          // Sirf video files delete karo
          if (this.isVideoFile(item.name)) {
            try {
              await unlink(item.path);
            } catch (error) {
             }
          }
        }
      }
    } catch (error) {
       throw error;
    }
  }
}

export default VideoCacheManager;