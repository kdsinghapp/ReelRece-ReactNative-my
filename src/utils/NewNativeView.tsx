// NewNativeView.tsx - Simplified Version
import React, { useState, useEffect, useRef } from 'react';
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
  ...props 
}) => {
  const [showPoster, setShowPoster] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const posterOpacity = useRef(new Animated.Value(1)).current;
  const playerRef = useRef(null);

  // Event Listeners for Native Events
  useEffect(() => {
    const eventListeners = [];

    // Listen for video ready with duration
    const readyListener = DeviceEventEmitter.addListener("onVideoReady", (event) => {
      console.log('onVideoReady event received with duration:', event);
      setIsVideoLoaded(true);

      if (event && event.duration) {
        const durationInSeconds = event.duration;     
        // Send duration to parent component via onLoad
        onLoad?.({
          duration: durationInSeconds
        });
        
        // Hide poster when video loads
        hidePoster();
      }
    });

    // Listen for play/pause events from native controller
    const playPauseListener = DeviceEventEmitter.addListener("onPlayPause", (event) => {
      console.log('onPlayPause event:', event);
      if (event?.isPlaying !== undefined) {
        onPlayPause?.(event.isPlaying);
      }
    });

    // Listen for video end
    const endListener = DeviceEventEmitter.addListener("onVideoEnd", () => {
      console.log('onVideoEnd event received');
      onEnd?.();
    });

    // Add all listeners to the array
    eventListeners.push(readyListener, playPauseListener, endListener);

    // Cleanup function
    return () => {
      eventListeners.forEach(listener => listener.remove());
    };
  }, [onLoad, onPlayPause, onEnd]);

  const hidePoster = () => {
    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setShowPoster(false);
    });
  };

  const onNativeError = (event: any) => {
    const eventData = event?.nativeEvent || event;
    const errorMessage = eventData?.error || 'Unknown video error';
    console.error('Video error:', errorMessage);
    onError?.({ error: errorMessage });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.videoContainer}>
        {/* Poster Image - Shows until video loads */}
        {showPoster && posterUrl && !isVideoLoaded && (
          <Animated.Image
            source={{ uri: posterUrl }}
            style={[styles.poster, { opacity: posterOpacity }]}
            resizeMode="stretch"
          />
        )}
        
        {Platform.OS === 'android' ? (
          <ExoPlayerView
            ref={playerRef}
            style={styles.video}
            source={{
              uri: String(source?.uri || ''),
            }}
            // controllerEnabled={controllerEnabled}
            controllerEnabled={true}
            onError={onNativeError}
            resizeMode="stretch"
            {...props}
          />
        ) : (
          <View style={styles.unsupportedContainer}>
            {posterUrl && (
              <Image
                source={{ uri: posterUrl }}
                style={styles.poster}
                resizeMode="stretch"
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoPlayer;