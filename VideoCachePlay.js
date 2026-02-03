/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

// Cache config - same as before
const CACHE_KEY_PREFIX = 'movie_';
const movieCache = new Map();
const MAX_CACHE_SIZE = 10;

// ✅ Save metadata
const setCachedMovie = async (id, data) => {
  if (movieCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = movieCache.keys().next().value;
    movieCache.delete(oldestKey);
  }
  movieCache.set(id, data);
  // await AsyncStorage.setItem(CACHE_KEY_PREFIX + id, JSON.stringify(data));
};

// ✅ Get metadata
const getCachedMovie = async (id) => {
  if (movieCache.has(id)) return movieCache.get(id);
  const raw = await AsyncStorage.getItem(CACHE_KEY_PREFIX + id);
  if (raw) {
    const data = JSON.parse(raw);
    movieCache.set(id, data);
    return data;
  }
  return null;
};

// ✅ Download video and cache locally
const cacheVideoFile = async (id, remoteUrl) => {
  if (!remoteUrl || !id) return null;
  try {
    const fileExt = remoteUrl.endsWith('.m3u8') ? '.m3u8' : '.mp4';
    const fileName = `${id}${fileExt}`;
    const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // If file already exists → reuse
    const exists = await RNFS.exists(localPath);
    if (exists) {
       return 'file://' + localPath;
    }

    // Otherwise download file
     const download = await RNFS.downloadFile({
      fromUrl: remoteUrl,
      toFile: localPath,
    }).promise;

    if (download.statusCode === 200) {
       const meta = { 
        localVideo: 'file://' + localPath,
        originalUri: remoteUrl,
        cachedAt: new Date().toISOString()
      };
      await setCachedMovie(id, meta);
      return 'file://' + localPath;
    } else {
       return null;
    }
  } catch (err) {
     return null;
  }
};

// ✅ Check if video is fully cached
const isVideoFullyCached = async (id) => {
  const cached = await getCachedMovie(id);
  if (!cached || !cached.localVideo) return false;
  
  // Check if file actually exists
  const localPath = cached.localVideo.replace('file://', '');
  return await RNFS.exists(localPath);
};

// VideoCachePlay Screen
const VideoCachePlay = ({ route, navigation }) => {
  const { movieId = '9', videoUri } = route.params || {};
  const playerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [localUri, setLocalUri] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [videoFullyWatched, setVideoFullyWatched] = useState(false);
  const [inputId, setInputId] = useState(movieId);
  const [inputUri, setInputUri] = useState(videoUri || '');

  // Sample video URLs for testing
  const sampleVideos = {
    '9': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    '10': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    '11': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  };

  useEffect(() => {
    checkCacheStatus();
  }, [movieId]);

  const checkCacheStatus = async () => {
    const cached = await isVideoFullyCached(movieId);
    setIsCached(cached);
    
    if (cached) {
      Alert.alert('Cache Status', '✅ Video cache se play ho rahi hai!');
      loadCachedVideo();
    } else {
      Alert.alert('Cache Status', '📥 Video cache mein nahi hai. Internet se play ho rahi hai.');
    }
  };

  const loadCachedVideo = async () => {
    const cached = await getCachedMovie(movieId);
    if (cached?.localVideo) {
      setLocalUri(cached.localVideo);
      setLoading(false);
    }
  };

  const handleLoadVideo = async () => {
    setLoading(true);
    
    // Check cache first
    const cached = await isVideoFullyCached(inputId);
    
    if (cached) {
      setIsCached(true);
      Alert.alert('Cache Status', '✅ Video cache se play ho rahi hai!');
      await loadCachedVideo();
      return;
    }

    // If not cached, use provided URI or sample URI
    const uriToUse = inputUri || sampleVideos[inputId];
    if (!uriToUse) {
      Alert.alert('Error', 'Please provide a video URL');
      setLoading(false);
      return;
    }

    // Download and cache video
    const localPath = await cacheVideoFile(inputId, uriToUse);
    if (localPath) {
      setLocalUri(localPath);
      setIsCached(true);
      Alert.alert('Success', '✅ Video cache mein save ho gayi!');
    } else {
      // Fallback to online streaming
      setLocalUri(uriToUse);
      setIsCached(false);
      Alert.alert('Info', '🌐 Internet se play ho rahi hai');
    }
    setLoading(false);
  };

  const handleProgress = async (data) => {
    setCurrentTime(data.currentTime);
    await AsyncStorage.setItem(`video_${inputId}`, data.currentTime.toString());
    
    // Check if video is 95% watched to consider as fully watched
    if (data.currentTime >= data.seekableDuration * 0.95 && !videoFullyWatched) {
      setVideoFullyWatched(true);
      if (!isCached) {
        // Auto-cache when video is fully watched
        const uriToUse = inputUri || sampleVideos[inputId];
        if (uriToUse) {
          cacheVideoFile(inputId, uriToUse);
          Alert.alert('Cache Complete', '✅ Video cache mein download ho gayi! Agli baar cache se play hogi.');
          setIsCached(true);
        }
      }
    }
  };

  const handleEnd = () => {
    setVideoFullyWatched(true);
    if (!isCached) {
      const uriToUse = inputUri || sampleVideos[inputId];
      if (uriToUse) {
        cacheVideoFile(inputId, uriToUse);
        Alert.alert('Cache Complete', '✅ Video cache mein download ho gayi! Agli baar cache se play hogi.');
        setIsCached(true);
      }
    }
  };

  const clearCache = async () => {
    try {
      const cached = await getCachedMovie(inputId);
      if (cached?.localVideo) {
        const localPath = cached.localVideo.replace('file://', '');
        await RNFS.unlink(localPath);
      }
      await AsyncStorage.removeItem(CACHE_KEY_PREFIX + inputId);
      movieCache.delete(inputId);
      
      setLocalUri(null);
      setIsCached(false);
      setVideoFullyWatched(false);
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
     }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Cache Play</Text>
      
      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Movie ID (e.g., 9)"
          value={inputId}
          onChangeText={setInputId}
        />
        <TextInput
          style={[styles.input, styles.uriInput]}
          placeholder="Video URL (optional)"
          value={inputUri}
          onChangeText={setInputUri}
        />
        <TouchableOpacity style={styles.button} onPress={handleLoadVideo}>
          <Text style={styles.buttonText}>Load Video</Text>
        </TouchableOpacity>
      </View>

      {/* Cache Status */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, isCached ? styles.cached : styles.notCached]}>
          Status: {isCached ? '✅ Cached' : '🌐 Online'}
        </Text>
        {videoFullyWatched && (
          <Text style={styles.watchedText}>✅ Video fully watched</Text>
        )}
      </View>

      {/* Video Player */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#000"
          style={styles.loader}
        />
      )}

      {localUri && (
        <View style={styles.videoContainer}>
          <Video
            ref={playerRef}
            source={{ uri: localUri }}
            paused={paused}
            onProgress={handleProgress}
            onLoad={() => setLoading(false)}
            onEnd={handleEnd}
            style={styles.video}
            controls
            resizeMode="contain"
          />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setPaused(!paused)}>
          <Text style={styles.controlButtonText}>
            {paused ? '▶️ Play' : '⏸️ Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.clearButton]}
          onPress={clearCache}>
          <Text style={styles.controlButtonText}>🗑️ Clear Cache</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Current Time: {Math.round(currentTime)}s
        </Text>
        <Text style={styles.infoText}>
          Movie ID: {inputId}
        </Text>
        <Text style={styles.infoText}>
          Source: {isCached ? 'Cache Storage' : 'Internet'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  uriInput: {
    height: 60,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cached: {
    color: 'green',
  },
  notCached: {
    color: 'orange',
  },
  watchedText: {
    color: 'green',
    marginTop: 5,
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
  },
  videoContainer: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 250,
    backgroundColor: 'black',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  controlButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  infoText: {
    fontSize: 14,
    marginVertical: 2,
  },
});

export default VideoCachePlay;