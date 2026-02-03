import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const CACHE_DIR = `${RNFS.CachesDirectoryPath}/videoCache`;
const MAX_VIDEO_COUNT = 10;
const MAX_CACHE_SIZE_MB = 20;

// Ensure cache folder exists
export const ensureCacheDir = async () => {
  const exists = await RNFS.exists(CACHE_DIR);
  if (!exists) await RNFS.mkdir(CACHE_DIR);
};

// Generate cache file path for a given video URL
export const getCachedFilePath = (url) => {
  const fileName = url.replace(/[^a-zA-Z0-9]/g, '_');
  return `${CACHE_DIR}/${fileName}.mp4`;
};

// Check if a video is already cached
export const isVideoCached = async (url) => {
  const filePath = getCachedFilePath(url);
  return RNFS.exists(filePath);
};

// Download and cache a video (background)
export const cacheVideo = async (url, onProgress) => {
  try {
    await ensureCacheDir();
    const filePath = getCachedFilePath(url);

    const download = RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      progress: (res) => {
        const percent = Math.floor((res.bytesWritten / res.contentLength) * 100);
        if (onProgress) onProgress(percent);
      },
      progressDivider: 5,
    });

    const result = await download.promise;

    if (result.statusCode === 200) {
       await autoMaintainCache();
      return filePath;
    } else {
       return null;
    }
  } catch (err) {
     return null;
  }
};

// Cache maintenance: delete old or oversized cache
export const autoMaintainCache = async () => {
  try {
    await ensureCacheDir();
    const files = await RNFS.readDir(CACHE_DIR);
    const sorted = files.sort((a, b) => b.mtime - a.mtime);

    let totalSize = 0;
    for (const f of sorted) totalSize += f.size;
    totalSize = totalSize / (1024 * 1024);

    if (sorted.length > MAX_VIDEO_COUNT) {
      const extra = sorted.slice(MAX_VIDEO_COUNT);
      for (const f of extra) await RNFS.unlink(f.path);
     }

    if (totalSize > MAX_CACHE_SIZE_MB) {
       let currentSize = totalSize;
      for (let i = sorted.length - 1; i >= 0 && currentSize > MAX_CACHE_SIZE_MB; i--) {
        await RNFS.unlink(sorted[i].path);
        currentSize -= sorted[i].size / (1024 * 1024);
      }
    }
  } catch (err) {
   }
};



// import RNFS from 'react-native-fs';
// import { getCacheDir, getCacheSize, autoCleanIfNeeded } from './videoCacheHelper';

// // Function to cache .m3u8 video
// export const cacheVideo = async (url) => {
//   try {
//     const cacheDir = await getCacheDir();
//     const finalCacheDir = cacheDir || `${RNFS.CachesDirectoryPath}/video_cache`;
//     await RNFS.mkdir(finalCacheDir);

//     const filename = url.substring(url.lastIndexOf('/') + 1) || `video_${Date.now()}.m3u8`;
//     const path = `${finalCacheDir}/${filename}`;

//     const exists = await RNFS.exists(path);
//     if (exists) {
 //       await autoCleanIfNeeded();
//       await getCacheSize();
//       return `file://${path}`;
//     }

 //     const download = await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
//     if (download.statusCode === 200) {
 //       await autoCleanIfNeeded();
//       await getCacheSize();
//       return `file://${path}`;
//     } else {
 //       return url;
//     }
//   } catch (e) {
 //     return url;
//   }
// };

// // Show cached video files
// export const getCachedVideos = async () => {
//   try {
//     const cacheDir = await getCacheDir();
//     const finalCacheDir = cacheDir || `${RNFS.CachesDirectoryPath}/video_cache`;
//     const exists = await RNFS.exists(finalCacheDir);

//     if (!exists) {
 //       return [];
//     }

//     const files = await RNFS.readDir(finalCacheDir);
//     const videoFiles = files.filter(f => f.isFile());

//     const detailed = await Promise.all(
//       videoFiles.map(async (file) => ({
//         name: file.name,
//         path: file.path,
//         sizeMB: (file.size / (1024 * 1024)).toFixed(2),
//       }))
//     );

 //     return detailed;
//   } catch (e) {
 //     return [];
//   }
// };



// import { NativeModules, Platform } from 'react-native';
// import RNFS from 'react-native-fs';

// const { AndroidVideoCache } = NativeModules;

// // 100MB limit (in bytes)
// const MAX_CACHE_SIZE = 100 * 1024 * 1024;

// export async function getProxyUrl(originalUrl) {
//   if (Platform.OS !== 'android') return originalUrl;
//   try {
//     const proxyUrl = await AndroidVideoCache.getProxyUrl(originalUrl);
 //     return proxyUrl;
//   } catch (e) {
 //     return originalUrl;
//   }
// }

// // 🧹 Clean cache if size > limit (keep 50%)
// export async function cleanOldCache() {
//   try {
//     const cacheDir = `${RNFS.CachesDirectoryPath}/video-cache`;
//     const exists = await RNFS.exists(cacheDir);
//     if (!exists) return;

//     const files = await RNFS.readDir(cacheDir);
//     const videoFiles = files.filter(f => f.isFile());
//     let totalSize = 0;

//     videoFiles.forEach(f => (totalSize += Number(f.size)));

 
//     // If total > 100MB → clean 50%
//     if (totalSize > MAX_CACHE_SIZE) {
//       const sorted = videoFiles.sort((a, b) => a.mtime - b.mtime);
//       const half = Math.ceil(sorted.length / 2);

//       for (let i = 0; i < half; i++) {
//         try {
//           await RNFS.unlink(sorted[i].path);
//         } catch (err) {
 //         }
//       }
 //     }
//   } catch (e) {
 //   }
// }

// // 🗂️ List all cached videos
// export async function getCachedVideos() {
//   try {
//     const cacheDir = `${RNFS.CachesDirectoryPath}/video-cache`;
//     const exists = await RNFS.exists(cacheDir);
//     if (!exists) {
 //       return [];
//     }

//     const files = await RNFS.readDir(cacheDir);
//     const videoFiles = files.filter(f => f.isFile());

//     const detailed = videoFiles.map(f => ({
//       name: f.name,
//       path: f.path,
//       sizeMB: (f.size / (1024 * 1024)).toFixed(2),
//     }));

 //     return detailed;
//   } catch (e) {
 //     return [];
//   }
// }



// // // src/utils/videoCache.js
// // import RNFS from 'react-native-fs';
// // import { getCacheDir, cleanOldCache } from './videoCacheHelper';

// // export const cacheVideo = async (url) => {
// //   try {
// //     const cacheDir = await getCacheDir();
// //     if (!cacheDir) {
// //       // fallback to RNFS default caches dir
// //       const fallback = `${RNFS.CachesDirectoryPath}/video_cache`;
// //       await RNFS.mkdir(fallback);
 // //       return await saveAndCleanup(url, fallback);
// //     }
// //     await RNFS.mkdir(cacheDir); // create if not exists
// //     return await saveAndCleanup(url, cacheDir);
// //   } catch (e) {
 // //     return url; // fallback to remote url
// //   }
// // }

// // async function saveAndCleanup(url, cacheDir) {
// //   const filename = url.substring(url.lastIndexOf('/') + 1) || `video_${Date.now()}.mp4`;
// //   const path = `${cacheDir}/${filename}`;

// //   const exists = await RNFS.exists(path);
// //   if (exists) {
// //     // enforce cleanup policy after confirm
// //     await cleanOldCache();
// //     return `file://${path}`;
// //   }

// //   const downloadResult = await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
// //   if (downloadResult.statusCode && (downloadResult.statusCode === 200 || downloadResult.statusCode === 201)) {
// //     // cleanup after download
// //     await cleanOldCache();
// //     return `file://${path}`;
// //   } else {
// //     // failed to download — remove partial 
// //     try { await RNFS.unlink(path); } catch {}
// //     return url;
// //   }
// // }