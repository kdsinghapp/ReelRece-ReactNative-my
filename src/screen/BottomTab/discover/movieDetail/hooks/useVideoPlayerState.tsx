import { useState, useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for managing video player state and controls
 */
export const useVideoPlayerState = () => {
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [paused, setPaused] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(1);
  const [isShowMuteIcon, setIsShowMuteIcon] = useState(false);
  
  const posterOpacity = useRef(new Animated.Value(1)).current;
  const videoRef = useRef(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle video load
  const handleVideoLoad = useCallback((data: { duration: number }) => {
    setVideoDuration(data.duration);
    setDuration(data.duration);

    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [posterOpacity]);

  // Handle video progress
  const onVideoProgress = useCallback((data: { currentTime: number; duration: number; progress: number }) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
      setDuration(data.duration);
      setProgress(data.progress);
    }
  }, [isSeeking]);

  // Handle seek
  const handleSeek = useCallback((newProgress: number) => {
    if (duration <= 0) {
       return;
    }
    const seekTimeInSeconds = newProgress * duration;
    setIsSeeking(true);
    setProgress(newProgress);
    setCurrentTime(seekTimeInSeconds);
    setSeekPosition(seekTimeInSeconds);

    setTimeout(() => setIsSeeking(false), 300);
  }, [duration]);

  // Show/hide mute icon with timeout
  const handlerShowMuteImg = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsShowMuteIcon(true);
    timerRef.current = setTimeout(() => {
      setIsShowMuteIcon(false);
    }, 5000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Reset progress when needed
  const resetProgress = useCallback(() => {
    posterOpacity.setValue(1);
    setProgress(0);
  }, [posterOpacity]);

  return {
    isVideoPaused,
    setIsVideoPaused,
    paused,
    setPaused,
    isSeeking,
    setIsSeeking,
    seekPosition,
    duration,
    videoDuration,
    currentTime,
    progress,
    setProgress,
    isShowMuteIcon,
    posterOpacity,
    videoRef,
    handleVideoLoad,
    onVideoProgress,
    handleSeek,
    handlerShowMuteImg,
    resetProgress
  };
};
