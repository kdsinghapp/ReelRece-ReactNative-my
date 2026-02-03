import React, { 
  useEffect, 
  useRef, 
  useState, 
  useCallback, 
  useImperativeHandle 
} from "react";
import {
  View,
  Animated,
  Platform,
  ActivityIndicator,
  StyleSheet,
  NativeSyntheticEvent,
  findNodeHandle,
  UIManager,
   NativeModules,
   ViewStyle,
   StyleProp,
} from "react-native";

 interface VideoSource {
  uri: string;
  type?: string;
  headers?: { [key: string]: string };
}

interface VideoLoadData {
  duration: number;
  naturalSize: {
    width: number;
    height: number;
  };
}

interface VideoProgressData {
  currentTime: number;
  duration: number;
  playableDuration: number;
}

interface VideoErrorData {
  error: string;
}

interface VideoBufferData {
  isBuffering: boolean;
}

interface PlaybackStateData {
  isPlaying: boolean;
}

interface NativeVideoProps {
  source: VideoSource;
  paused: boolean;
  muted: boolean;
  volume: number;
  resizeMode: "cover" | "contain" | "stretch";
  repeat: boolean;
  onVideoLoad: (event: NativeSyntheticEvent<VideoLoadData>) => void;
  onVideoLoadStart: () => void;
  onVideoProgress: (event: NativeSyntheticEvent<VideoProgressData>) => void;
  onVideoError: (event: NativeSyntheticEvent<VideoErrorData>) => void;
  onVideoEnd: () => void;
  onVideoPlaybackStateChange: (event: NativeSyntheticEvent<PlaybackStateData>) => void;
  onVideoBuffer: (event: NativeSyntheticEvent<VideoBufferData>) => void;
style?: StyleProp<ViewStyle>;
}

interface Props {
  source: VideoSource;
  posterUrl?: string;
  paused?: boolean;
  muted?: boolean;
  volume?: number;
  resizeMode?: "cover" | "contain" | "stretch";
  repeat?: boolean;
  onLoad?: (data: VideoLoadData) => void;
  onLoadStart?: () => void;
  onProgress?: (data: VideoProgressData) => void;
  onError?: (error: VideoErrorData) => void;
  onEnd?: () => void;
  onBuffer?: (data: VideoBufferData) => void;
  onPlaybackStateChange?: (data: PlaybackStateData) => void;
style?: StyleProp<ViewStyle>;
  controls?: boolean;
}

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

 const {VideoViewManager} = NativeModules
const IOSVideoPlayer = React.forwardRef<VideoPlayerHandle, Props>((props, ref) => {
  const {
    source,
    posterUrl,
    paused = true,
    muted = false,
    volume = 1,
    resizeMode = "cover",
    repeat = false,
    onLoad,
    onLoadStart,
    onProgress,
    onError,
    onEnd,
    onBuffer,
    onPlaybackStateChange,
    style,
  } = props;

  const videoRef = useRef(null);
  const [posterVisible, setPosterVisible] = useState(!!posterUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const posterOpacity = useRef(new Animated.Value(1)).current;

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (videoRef.current) {
        const node = findNodeHandle(videoRef.current);
        if (node) {
          UIManager.dispatchViewManagerCommand(
            node,
            'seekTo' ,
            [time]
          );
        }
      }
    },
    play: () => {
      if (videoRef.current) {
        const node = findNodeHandle(videoRef.current);
        if (node) {
          UIManager.dispatchViewManagerCommand(
            node,
            'setPaused'  ,
            [false]
          );
        }
      }
    },
    pause: () => {
      if (videoRef.current) {
        const node = findNodeHandle(videoRef.current);
        if (node) {
          UIManager.dispatchViewManagerCommand(
            node,
            'setPaused'  ,
            [true]
          );
        }
      }
    },
  }));

  // Event Handlers
  const onNativeLoad = useCallback((event: NativeSyntheticEvent<VideoLoadData>) => {
     setIsLoading(false);
    hidePoster();
    onLoad?.(event.nativeEvent);
  }, [onLoad]);

  const onNativeLoadStart = useCallback(() => {
     setIsLoading(true);
    setPosterVisible(!!posterUrl);
    posterOpacity.setValue(1);
    onLoadStart?.();
  }, [onLoadStart, posterUrl, posterOpacity]);

  const onNativeError = useCallback((event: NativeSyntheticEvent<VideoErrorData>) => {
     setIsLoading(false);
    setIsBuffering(false);
    onError?.(event.nativeEvent);
  }, [onError]);

  const onNativeProgress = useCallback((event: NativeSyntheticEvent<VideoProgressData>) => {
    onProgress?.(event.nativeEvent);
  }, [onProgress]);

  const onNativeEnd = useCallback(() => {
     onEnd?.();
  }, [onEnd]);

  const onNativePlaybackStateChange = useCallback((event: NativeSyntheticEvent<PlaybackStateData>) => {
     onPlaybackStateChange?.(event.nativeEvent);
  }, [onPlaybackStateChange]);

  const onNativeBuffer = useCallback((event: NativeSyntheticEvent<VideoBufferData>) => {
     setIsBuffering(event.nativeEvent.isBuffering);
    onBuffer?.(event.nativeEvent);
  }, [onBuffer]);

  const hidePoster = useCallback(() => {
    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setPosterVisible(false));
  }, [posterOpacity]);

  // Effects
  useEffect(() => {
    if (source?.uri) {
       setIsLoading(true);
      setPosterVisible(!!posterUrl);
      posterOpacity.setValue(1);
    }
  }, [source?.uri, posterUrl, posterOpacity]);

  // Handle iOS only rendering
  if (Platform.OS !== 'ios') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.unsupportedPlatform}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  const showLoading = isLoading || isBuffering;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.videoContainer}>
        <VideoViewManager
          ref={videoRef}
          style={styles.video}
          source={source}
          paused={paused}
          muted={muted}
          volume={volume}
          resizeMode={resizeMode}
          repeat={repeat}
          onVideoLoad={onNativeLoad}
          onVideoLoadStart={onNativeLoadStart}
          onVideoError={onNativeError}
          onVideoProgress={onNativeProgress}
          onVideoEnd={onNativeEnd}
          onVideoPlaybackStateChange={onNativePlaybackStateChange}
          onVideoBuffer={onNativeBuffer}
        />

        {posterVisible && posterUrl && (
          <Animated.Image
            source={{ uri: posterUrl }}
            style={[styles.poster, { opacity: posterOpacity }]}
            resizeMode="cover"
          />
        )}
       
        {showLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'black',
    overflow: 'hidden',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: 'black',
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  unsupportedPlatform: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default IOSVideoPlayer;

// Export types
export type { 
  VideoSource, 
  Props as IOSVideoPlayerProps,
  VideoPlayerHandle,
  VideoLoadData,
  VideoProgressData,
  VideoErrorData,
  VideoBufferData,
  PlaybackStateData
};