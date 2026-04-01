import React, { useRef, useState, useEffect, memo } from 'react';
import { View, PanResponder, Animated, } from 'react-native';
import { Color } from '@theme/color';

type ProgressBarProps = {
  progress: number;
  onSeek: (value: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  onSeek,
  onSeekStart,
  onSeekEnd
}) => {
  const [width, setWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleLayout = (event) => {
    const newWidth = event.nativeEvent.layout.width;
    setWidth(newWidth);
  };

  useEffect(() => {
    if (width > 0) {
      const newX = progress * width;
      if (!isSeeking) {
        Animated.timing(progressAnim, {
          toValue: newX,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [progress, width, isSeeking]);

  const handleSeek = (xPosition: number) => {
    if (width === 0) return;
    const clampedX = Math.max(0, Math.min(xPosition, width));
    const newProgress = clampedX / width;

    progressAnim.setValue(clampedX);

    onSeek(newProgress);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsSeeking(true);
      onSeekStart?.();
      handleSeek(evt.nativeEvent.locationX);
    },

    onPanResponderMove: (evt, gestureState) => {
      containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const relativeX = gestureState.moveX - pageX;
        handleSeek(relativeX);
      });
    },

    onPanResponderRelease: () => {
      setIsSeeking(false);
      onSeekEnd?.();
    },
  });

  const containerRef = useRef<View>(null);

  return (
    <View
      ref={containerRef}
      style={{
        height: 20,
        justifyContent: 'center',
      }}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View
        style={{
          height: 6,
          backgroundColor: Color.darkGrey,
          borderRadius: 3,
        }}
      />

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: 6,
          borderRadius: 3,
          backgroundColor: Color.primary,
          width: progressAnim,
        }}
      />

    </View>
  );
};

export default memo(ProgressBar);