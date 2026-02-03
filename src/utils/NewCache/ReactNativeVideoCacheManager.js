// ReactNativeVideoCacheManager-WITH-PERMISSION.js
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { requestStoragePermission } from './requestStoragePermission';
const ReactNativeVideoCacheManager = {
  cacheSizeThreshold: 20 * 1024 * 1024, // 20MB
  intervalId: null,
  hasPermissions: false,

  // ✅ Initialize with permission check
  async initialize() {
     
    if (Platform.OS === 'android') {
      this.hasPermissions = await requestStoragePermission();
     } else {
      this.hasPermissions = true; // iOS doesn't need these permissions
    }

    if (this.hasPermissions) {
      this.startMonitoring();
    }
    
    return this.hasPermissions;
  },

  // ✅ Start monitoring only if permissions granted
  startMonitoring() {
    if (!this.hasPermissions) {
       return;
    }

     
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Immediate check
    this.simpleCacheCheck();
    
    // Regular monitoring
    this.intervalId = setInterval(() => {
      this.simpleCacheCheck();
    }, 15000);
  },

  // ✅ Stop monitoring
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
   },

  // ✅ Check only INTERNAL app directories (no permissions needed)
  async simpleCacheCheck() {
    if (!this.hasPermissions) {
       return { size: 0, files: [] };
    }

    try {
       
      let totalSize = 0;
      let videoFiles = [];

      // ONLY check internal app directories (no permissions needed)
      const internalLocations = this.getInternalAppDirectories();
      
      for (const location of internalLocations) {
        try {
          const result = await this.safeScanLocation(location);
          totalSize += result.size;
          videoFiles = videoFiles.concat(result.files);
        } catch (error) {
         }
      }

        
      if (videoFiles.length > 0) {
        videoFiles.slice(0, 3).forEach(file => {
         });
      } else {
       }

      // Cleanup if needed
      if (totalSize > this.cacheSizeThreshold && videoFiles.length > 0) {
         await this.smartCleanup(videoFiles);
      }

       
      return { size: totalSize, files: videoFiles };

    } catch (error) {
       return { size: 0, files: [] };
    }
  },

  // ✅ Get ONLY internal app directories (no permissions needed)
  getInternalAppDirectories() {
    const internalDirs = [
      RNFS.CacheDirectoryPath,      // /data/data/yourapp/cache
      RNFS.DocumentDirectoryPath,   // /data/data/yourapp/files  
      RNFS.TemporaryDirectoryPath,  // /data/data/yourapp/tmp
    ];

    // Filter valid paths
    return internalDirs.filter(path => path && typeof path === 'string');
  },

  // ✅ Safe location scanning
  async safeScanLocation(locationPath) {
    let totalSize = 0;
    let videoFiles = [];

    try {
      if (!locationPath || typeof locationPath !== 'string') {
        return { size: 0, files: [] };
      }

      const exists = await RNFS.exists(locationPath);
      if (!exists) {
        return { size: 0, files: [] };
      }

      const stats = await RNFS.stat(locationPath);
      
      if (stats.isDirectory()) {
         
        const files = await RNFS.readDir(locationPath);
        
        for (const file of files) {
          if (file.isFile() && this.isVideoRelatedFile(file.name)) {
            totalSize += file.size;
            videoFiles.push({
              path: file.path,
              name: file.name,
              size: file.size,
              mtime: file.mtime
            });
          }
        }
      }
    } catch (error) {
     }

    return { size: totalSize, files: videoFiles };
  },

  // ✅ Video file detection
  isVideoRelatedFile(filename) {
    if (!filename) return false;
    
    const name = filename.toLowerCase();
    
    const videoExtensions = ['.m3u8', '.ts', '.m4s', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const hasVideoExtension = videoExtensions.some(ext => name.endsWith(ext));
    
    const cacheKeywords = [
      'exo', 'player', 'video', 'media', 'stream', 'hls', 
      'segment', 'chunk', 'cache', 'temp', 'buff', 'download'
    ];
    const hasCacheKeyword = cacheKeywords.some(keyword => name.includes(keyword));
    
    return hasVideoExtension || hasCacheKeyword;
  },

  // ✅ Smart cleanup
  async smartCleanup(videoFiles) {
    if (!this.hasPermissions) {
       return { deletedCount: 0, deletedSize: 0 };
    }

    try {
       
      videoFiles.sort((a, b) => a.mtime - b.mtime);
      
      const deleteCount = Math.ceil(videoFiles.length * 0.5);
      const filesToDelete = videoFiles.slice(0, deleteCount);
      
      let deletedSize = 0;
      let deletedCount = 0;
      
      for (const file of filesToDelete) {
        try {
          await RNFS.unlink(file.path);
          deletedSize += file.size;
          deletedCount++;
         } catch (error) {
         }
      }
      
       
      return { deletedCount, deletedSize };
      
    } catch (error) {
       return { deletedCount: 0, deletedSize: 0 };
    }
  },

  // ✅ Format bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // ✅ Get cache info
  async getCacheInfo() {
    if (!this.hasPermissions) {
      return {
        size: 0,
        sizeFormatted: '0 Bytes',
        fileCount: 0,
        needsCleanup: false,
        hasPermissions: false
      };
    }

    try {
      const result = await this.simpleCacheCheck();
      return {
        size: result.size,
        sizeFormatted: this.formatBytes(result.size),
        fileCount: result.files.length,
        needsCleanup: result.size > this.cacheSizeThreshold,
        hasPermissions: true
      };
    } catch (error) {
       return {
        size: 0,
        sizeFormatted: '0 Bytes',
        fileCount: 0,
        needsCleanup: false,
        hasPermissions: this.hasPermissions
      };
    }
  },

  // ✅ Force cleanup
  async forceCleanup() {
    if (!this.hasPermissions) {
       return;
    }

     const result = await this.simpleCacheCheck();
    if (result.files.length > 0) {
      await this.smartCleanup(result.files);
    } else {
     }
   },

  // ✅ Create test cache
  async createTestCache() {
    if (!this.hasPermissions) {
       return null;
    }

    try {
       
      const testDir = `${RNFS.CacheDirectoryPath}/video_test`;
      await RNFS.mkdir(testDir);
      
      const testFile = `${testDir}/test_video_${Date.now()}.ts`;
      const testContent = 'Test video cache content '.repeat(100);
      
      await RNFS.writeFile(testFile, testContent, 'utf8');
      
      const exists = await RNFS.exists(testFile);
      if (exists) {
        const stats = await RNFS.stat(testFile);
         return testFile;
      }
      
      return null;
    } catch (error) {
       return null;
    }
  },

  // ✅ Check permissions status
  getPermissionsStatus() {
    return this.hasPermissions;
  },

  // ✅ Re-request permissions
  async requestPermissionsAgain() {
    this.hasPermissions = await requestStoragePermission();
    return this.hasPermissions;
  }
};

export default ReactNativeVideoCacheManager;