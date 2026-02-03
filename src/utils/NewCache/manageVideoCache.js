import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { requestStoragePermission } from './requestStoragePermission';
requestStoragePermission
const CACHE_DIR = `${RNFS.CachesDirectoryPath}/videoCache`;
const MAX_CACHE_SIZE = 20 * 1024 * 1024; // 20MB

export async function manageVideoCache() {
  try {
    // Step 1: Permission check (only for Android)
    if (Platform.OS === 'android') {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
         return;
      }
    }

    // Step 2: Ensure cache folder exists
    const exists = await RNFS.exists(CACHE_DIR);
    if (!exists) {
      await RNFS.mkdir(CACHE_DIR);
       return;
    }

    // Step 3: Read files and calculate total size
    const files = await RNFS.readDir(CACHE_DIR);
    let totalSize = 0;
    const fileList = [];

    for (const file of files) {
      const stat = await RNFS.stat(file.path);
      totalSize += Number(stat.size);
      fileList.push({
        path: file.path,
        size: Number(stat.size),
        mtime: new Date(stat.mtime),
      });
    }

 
    // Step 4: If total size exceeds limit, delete oldest 50%
    if (totalSize > MAX_CACHE_SIZE) {
      // Sort by oldest files first
      fileList.sort((a, b) => a.mtime - b.mtime);

      const halfCount = Math.ceil(fileList.length / 2);
      const toDelete = fileList.slice(0, halfCount);

 
      for (const file of toDelete) {
        try {
          await RNFS.unlink(file.path);
        } catch (err) {
         }
      }

     } else {
     }
  } catch (err) {
   }
}
