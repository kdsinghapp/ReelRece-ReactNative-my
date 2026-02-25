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
  /** Called when native controller shows/hides (e.g. to show/hide mute button) */
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
}) => {
  const [showPoster, setShowPoster] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const posterOpacity = useRef(new Animated.Value(1)).current;
  const playerOpacity = useRef(new Animated.Value(0)).current;
  const playerRef = useRef(null);

  const hidePoster = useCallback(() => {
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
  }, [posterOpacity, playerOpacity]);

  // Event Listeners for Native Events
  useEffect(() => {
    const eventListeners = [];

    // Listen for video ready – hide poster as soon as video is ready (duration may be 0 for HLS)
    const readyListener = DeviceEventEmitter.addListener("onVideoReady", (event) => {
      setIsVideoLoaded(true);
      hidePoster();
      const durationInSeconds = event?.duration ?? 0;
      onLoad?.({ duration: durationInSeconds });
    });

    // Listen for play/pause events from native controller – hide poster when playback starts (fallback if onVideoReady is delayed)
    const playPauseListener = DeviceEventEmitter.addListener("onPlayPause", (event) => {
      if (event?.isPlaying !== undefined) {
        onPlayPause?.(event.isPlaying);
        if (event.isPlaying) {
          setIsVideoLoaded(true);
          hidePoster();
        }
      }
    });

    // Listen for video end
    const endListener = DeviceEventEmitter.addListener("onVideoEnd", () => {
       onEnd?.();
    });

    // Listen for native controller show/hide (for mute button visibility)
    const controllerVisibilityListener = DeviceEventEmitter.addListener(
      "onControllerVisibilityChange",
      (event: { visible?: boolean }) => {
        if (event?.visible !== undefined) {
          onControllerVisibilityChange?.(event.visible);
        }
      }
    );

    // Listen for native playback error (e.g. load failed) so we hide poster and don't stay stuck
    const errorListener = DeviceEventEmitter.addListener(
      "onVideoError",
      (event: { error?: string }) => {
        setIsVideoLoaded(true);
        hidePoster();
        onError?.({ error: event?.error ?? 'Unknown video error' });
      }
    );

    // Add all listeners to the array
    eventListeners.push(readyListener, playPauseListener, endListener, controllerVisibilityListener, errorListener);

    // Cleanup function
    return () => {
      eventListeners.forEach(listener => listener.remove());
    };
  }, [onLoad, onPlayPause, onEnd, onControllerVisibilityChange, hidePoster]);

  const onNativeError = (event: any) => {
    const eventData = event?.nativeEvent || event;
    const errorMessage = eventData?.error || 'Unknown video error';
    console.error('Video error:', errorMessage);
    onError?.({ error: errorMessage });
    setIsVideoLoaded(true);
    hidePoster();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.videoContainer}>
        {/* Android: render player first but invisible (opacity 0) so poster shows on top during load */}
        {Platform.OS === 'android' ? (
          <Animated.View style={[styles.videoWrapper, { opacity: playerOpacity }]}>
            <ExoPlayerView
              ref={playerRef}
              style={styles.video}
              source={source}
              controllerEnabled={true}
              onError={onNativeError}
              resizeMode="stretch"
              {...props}
            />
          </Animated.View>
        ) : null}
        {/* Poster on top during loading - visible first, then fades out when video ready */}
        {posterUrl ? (
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