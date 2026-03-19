// NewNativeView.tsx - Simplified Version
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  requireNativeComponent,
  View,
  Image,
  Animated,
  Platform,
  DeviceEventEmitter
} from 'react-native';
import { styles } from './NewNativeViewStyle';

const ExoPlayerView = requireNativeComponent('ExoPlayerView');

interface VideoPlayerProps {
  source: { uri: string };
  posterUrl?: string;
  controllerEnabled?: boolean;
  style?: any;
  onLoad?: (data: { duration: number }) => void;
  onError?: (error: { error: string }) => void;
  onPlayPause?: (isPlaying: boolean) => void;
  onEnd?: () => void;
  onControllerVisibilityChange?: (visible: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  posterUrl,
  controllerEnabled = true,
  style,
  onLoad,
  onError,
  onPlayPause,
  onEnd,
  onControllerVisibilityChange,
  ...props
}: any) => {
  const [showPoster, setShowPoster] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const posterOpacity = useRef(new Animated.Value(1)).current;
  const playerOpacity = useRef(new Animated.Value(0)).current;
  const playerRef = useRef(null);

  // Use refs for callbacks to avoid re-registering event listeners when props change
  const callbacksRef = useRef({
    onLoad,
    onError,
    onPlayPause,
    onEnd,
    onControllerVisibilityChange,
    onProgress: props.onProgress,
  });

  useEffect(() => {
    callbacksRef.current = {
      onLoad,
      onError,
      onPlayPause,
      onEnd,
      onControllerVisibilityChange,
      onProgress: props.onProgress,
    };
  }, [onLoad, onError, onPlayPause, onEnd, onControllerVisibilityChange, props.onProgress]);

  const hidePoster = useCallback(() => {
    if (!showPoster) return;
    Animated.parallel([
      Animated.timing(posterOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(playerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setShowPoster(false);
    });
  }, [posterOpacity, playerOpacity, showPoster]);

  const onVideoProgress = useCallback((event: any) => {
    const data = event?.nativeEvent || event;
    // Hide poster on any progress if it's still showing
    if (showPoster && data?.currentTime !== undefined) {
      hidePoster();
    }
    callbacksRef.current.onProgress?.(data);
  }, [hidePoster, showPoster]);

  const handleNativeReady = useCallback((event: any) => {
    const data = event?.nativeEvent || event;
    setIsVideoLoaded(true);
    hidePoster();
    callbacksRef.current.onLoad?.({ duration: data?.duration ?? 0 });
  }, [hidePoster]);

  const handleNativePlayPause = useCallback((event: any) => {
    const data = event?.nativeEvent || event;
    if (data?.isPlaying !== undefined) {
      callbacksRef.current.onPlayPause?.(data.isPlaying);
      if (data.isPlaying && showPoster) {
        setIsVideoLoaded(true);
        hidePoster();
      }
    }
  }, [hidePoster, showPoster]);

  const handleNativeEnd = useCallback(() => {
    callbacksRef.current.onEnd?.();
  }, []);

  const handleNativeControllerVisibility = useCallback((event: any) => {
    const data = event?.nativeEvent || event;
    if (data?.visible !== undefined) {
      callbacksRef.current.onControllerVisibilityChange?.(data.visible);
    }
  }, []);

  // Event Listeners for Native Events (Global Emitter fallback)
  useEffect(() => {
    const eventListeners: any[] = [];

    const readyListener = DeviceEventEmitter.addListener("onVideoReady", (event) => {
      if (props.movieId && event?.movieId && props.movieId !== event.movieId) return;
      handleNativeReady(event);
    });

    const playPauseListener = DeviceEventEmitter.addListener("onPlayPause", (event) => {
      if (props.movieId && event?.movieId && props.movieId !== event.movieId) return;
      handleNativePlayPause(event);
    });

    const endListener = DeviceEventEmitter.addListener("onVideoEnd", (event) => {
      if (props.movieId && event?.movieId && props.movieId !== event.movieId) return;
      handleNativeEnd();
    });

    const controllerVisibilityListener = DeviceEventEmitter.addListener(
      "onControllerVisibilityChange",
      (event) => {
        if (props.movieId && event?.movieId && props.movieId !== event.movieId) return;
        handleNativeControllerVisibility(event);
      }
    );

    const errorListener = DeviceEventEmitter.addListener(
      "onVideoError",
      (event) => {
        if (props.movieId && event?.movieId && props.movieId !== event.movieId) return;
        setIsVideoLoaded(true);
        hidePoster();
        callbacksRef.current.onError?.({ error: event?.error ?? 'Unknown video error' });
      }
    );

    eventListeners.push(readyListener, playPauseListener, endListener, controllerVisibilityListener, errorListener);

    return () => {
      eventListeners.forEach(listener => listener.remove());
    };
  }, [props.movieId, handleNativeReady, handleNativePlayPause, handleNativeEnd, handleNativeControllerVisibility, hidePoster]);

  const onNativeError = (event: any) => {
    const eventData = event?.nativeEvent || event;
    const errorMessage = eventData?.error || 'Unknown video error';
    callbacksRef.current.onError?.({ error: errorMessage });
    setIsVideoLoaded(true);
    hidePoster();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.videoContainer}>
        {Platform.OS === 'android' ? (
          <Animated.View style={[styles.videoWrapper, { opacity: playerOpacity }]}>
            <ExoPlayerView
              ref={playerRef}
              style={styles.video}
              source={source}
              controllerEnabled={true}
              resizeMode="stretch"
              {...props}
              onVideoReady={handleNativeReady}
              onPlayPause={handleNativePlayPause}
              onVideoEnd={handleNativeEnd}
              onVideoError={onNativeError}
              onControllerVisibilityChange={handleNativeControllerVisibility}
              onProgress={onVideoProgress}
              onError={onNativeError}
            />
          </Animated.View>
        ) : null}

        {posterUrl && showPoster ? (
          <Animated.Image
            source={{ uri: posterUrl }}
            style={[styles.poster, { opacity: posterOpacity }]}
            resizeMode="stretch"
          />
        ) : null}

        {Platform.OS !== 'android' ? (
          <View style={styles.unsupportedContainer}>
            {posterUrl && (
              <Image
                source={{ uri: posterUrl }}
                style={styles.poster}
                resizeMode="stretch"
              />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default VideoPlayer;