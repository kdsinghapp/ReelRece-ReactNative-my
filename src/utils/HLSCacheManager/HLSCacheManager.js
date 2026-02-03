// HLSCacheManager.js
import RNFS from 'react-native-fs';
import md5 from 'md5';

/**
 * HLS Cache Manager
 * - cacheHLS(url, onProgress) => returns local file:// path to cached index.m3u8
 * - getCacheSize(), clearCache(), enforceCacheLimit(maxBytes)
 * - cancelCurrentDownloads()
 *
 * Notes:
 * - Downloads segments sequentially to avoid too many parallel connections.
 * - onProgress receives { downloadedSegments, totalSegments, currentSegmentProgress (0-1) }
 */

const BASE_CACHE = `${RNFS.CachesDirectoryPath}/hlsCache`;
let currentDownloadJobIds = []; // for cancellation

async function ensureBaseDir() {
  const ex = await RNFS.exists(BASE_CACHE);
  if (!ex) await RNFS.mkdir(BASE_CACHE);
}

function normalizeLines(text) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

function isSegmentLine(line) {
  if (!line) return false;
  line = line.trim();
  if (line.startsWith('#')) return false; // comment or tag
  // typical segment extensions: .ts .m4s .aac etc. We allow anything without #.
  return true;
}

function resolveUrl(segment, baseUrl) {
  try {
    // If segment is absolute, URL() will parse; else it resolves against baseUrl
    return new URL(segment, baseUrl).toString();
  } catch (e) {
    // fallback: naive concat
    if (segment.startsWith('/')) {
      const m = baseUrl.match(/^https?:\/\/[^/]+/i);
      return (m ? m[0] : baseUrl) + segment;
    }
    return baseUrl + segment;
  }
}

// download one segment with RNFS.downloadFile (supports progress callbacks)
async function downloadSegment(segUrl, destPath, onSegProgress) {
  // ensure parent dir exists
  const destDir = destPath.substring(0, destPath.lastIndexOf('/'));
  const dirExists = await RNFS.exists(destDir);
  if (!dirExists) await RNFS.mkdir(destDir);

  // if already exists, skip
  if (await RNFS.exists(destPath)) {
    return { ok: true, skipped: true };
  }

  return new Promise((resolve, reject) => {
    const download = RNFS.downloadFile({
      fromUrl: segUrl,
      toFile: destPath,
      background: true,
      discretionary: false,
      progressDivider: 5,
      begin: (res) => {
        // res.jobId available
      },
      progress: (res) => {
        if (onSegProgress && res.contentLength > 0) {
          onSegProgress(res.bytesWritten / res.contentLength);
        }
      },
    });

    currentDownloadJobIds.push(download.jobId);

    download.promise
      .then((res) => {
        // remove jobId
        currentDownloadJobIds = currentDownloadJobIds.filter(id => id !== download.jobId);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true });
        } else {
          resolve({ ok: false, statusCode: res.statusCode });
        }
      })
      .catch(err => {
        currentDownloadJobIds = currentDownloadJobIds.filter(id => id !== download.jobId);
        resolve({ ok: false, error: err });
      });
  });
}

// Main function to cache HLS
export async function cacheHLS(originalUrl, onProgress) {
  // originalUrl: .m3u8 URL
  await ensureBaseDir();

  const hash = md5(originalUrl);
  const folder = `${BASE_CACHE}/${hash}`;
  const indexLocalPath = `${folder}/index.m3u8`;

  // if cached index exists and at least one segment exists, return it
  if (await RNFS.exists(indexLocalPath)) {
    // quick validation: index text and at least one .ts file in folder
    try {
      const txt = await RNFS.readFile(indexLocalPath, 'utf8');
      if (txt && txt.includes('.ts')) {
        return `file://${indexLocalPath}`;
      }
    } catch (e) {
      // continue to re-fetch
    }
  }

  // ensure folder
  if (!(await RNFS.exists(folder))) {
    await RNFS.mkdir(folder);
  }

  // fetch playlist text
  let playlistText;
  try {
    const res = await fetch(originalUrl);
    if (!res.ok) throw new Error('Playlist fetch failed: ' + res.status);
    playlistText = await res.text();
  } catch (err) {
    throw new Error('Unable to download playlist: ' + (err.message || err));
  }

  // parse playlist: get segment lines (non-#)
  const lines = normalizeLines(playlistText);
  // base url for relative segments
  const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/') + 1);

  const segmentLines = lines.filter(isSegmentLine);
  const total = segmentLines.length;

  // sequential download each segment
  let downloadedSegments = 0;
  for (let i = 0; i < segmentLines.length; i++) {
    const segLine = segmentLines[i].trim();
    if (!segLine) { downloadedSegments++; continue; }

    const segUrl = segLine.startsWith('http') ? segLine : resolveUrl(segLine, baseUrl);
    const segName = segUrl.split('/').pop().split('?')[0];
    const segLocal = `${folder}/${segName}`;

    // progress callback per segment
    const onSegProgress = (p) => {
      if (onProgress) onProgress({
        downloadedSegments,
        totalSegments: total,
        currentSegmentProgress: p,
      });
    };

    const res = await downloadSegment(segUrl, segLocal, onSegProgress);
    // If a segment fails, we will try again upto 2 retries
    if (!res.ok) {
      let ok = false;
      let attempts = 0;
      while (!ok && attempts < 2) {
        attempts++;
        const r2 = await downloadSegment(segUrl, segLocal, onSegProgress);
        if (r2.ok) ok = true;
      }
      if (!ok) {
        // skip this segment but continue (playlist may still play partially)
       }
    }

    downloadedSegments++;
    if (onProgress) onProgress({
      downloadedSegments,
      totalSegments: total,
      currentSegmentProgress: 1,
    });
  }

  // rewrite playlist to use local file:// paths (replace only segment references)
  // We'll replace each segment line with file://<folder>/<segName>
  const newLines = lines.map(line => {
    if (isSegmentLine(line)) {
      const absolute = line.startsWith('http') ? line : resolveUrl(line, baseUrl);
      const segName = absolute.split('/').pop().split('?')[0];
      return `file://${folder}/${segName}`;
    }
    return line;
  });

  await RNFS.writeFile(indexLocalPath, newLines.join('\n'), 'utf8');

  // return local playlist path
  return `file://${indexLocalPath}`;
}

export async function getCacheSize() {
  try {
    const exists = await RNFS.exists(BASE_CACHE);
    if (!exists) return 0;
    // compute size recursively
    const walk = async (p) => {
      let total = 0;
      const items = await RNFS.readDir(p);
      for (const it of items) {
        if (it.isFile()) total += Number(it.size || 0);
        else if (it.isDirectory()) total += await walk(it.path);
      }
      return total;
    };
    return await walk(BASE_CACHE);
  } catch (e) {
     return 0;
  }
}

export async function enforceCacheLimit(maxBytes = 100 * 1024 * 1024) {
  await ensureBaseDir();
  // list folders (each hash folder)
  const folders = await RNFS.readDir(BASE_CACHE);
  const info = [];
  for (const f of folders) {
    if (!f.isDirectory()) continue;
    // get folder size & mtime
    let size = 0;
    const items = await RNFS.readDir(f.path);
    for (const it of items) {
      size += Number(it.size || 0);
    }
    info.push({ path: f.path, size, mtime: f.mtime ? new Date(f.mtime) : new Date() });
  }
  // current total
  let total = info.reduce((s, x) => s + x.size, 0);
  if (total <= maxBytes) return { totalBefore: total, totalAfter: total, deleted: [] };
   // sort by oldest
  info.sort((a, b) => a.mtime - b.mtime);
  const deleted = [];
  for (const f of info) {
    if (total <= maxBytes) break;
    try {
      await RNFS.unlink(f.path);
      deleted.push(f.path);
      total -= f.size;
    } catch (e) {
     }
  }
  return { totalBefore: info.reduce((s,x)=>s+x.size,0), totalAfter: total, deleted };
}

// export async function clearCache() {
//   try {
//     const ex = await RNFS.exists(BASE_CACHE);
//     if (ex) {
//       await RNFS.unlink(BASE_CACHE);
//     }
//   } catch (e) {
 //   } finally {
//     await ensureBaseDir();
//   }
// }

export async function clearCache() {
  try {
    const exists = await RNFS.exists(BASE_CACHE);
    if (!exists) return;

    const items = await RNFS.readDir(BASE_CACHE);
    for (const item of items) {
      if (item.isFile()) {
        await RNFS.unlink(item.path);
      } else if (item.isDirectory()) {
        await RNFS.unlink(item.path); // RNFS.unlink can remove directory
      }
    }

   } catch (e) {
   }
}


export function cancelCurrentDownloads() {
  // RNFS.stopDownload accepts jobId
  if (!currentDownloadJobIds.length) return;
  currentDownloadJobIds.forEach(id => {
    try {
      RNFS.stopDownload(id);
    } catch (e) {
      // ignore
    }
  });
  currentDownloadJobIds = [];
}

