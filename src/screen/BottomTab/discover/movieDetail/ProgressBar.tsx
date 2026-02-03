import React, { useRef, useState, useEffect, memo } from 'react';
import { View, PanResponder, Animated, findNodeHandle } from 'react-native';
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

  // Update progress bar visualization
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
    
     
    // Update visual immediately during seek
    progressAnim.setValue(clampedX);
    
    // Call seek callback with progress (0-1)
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
      // Get the touch position relative to the progress bar
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
        height: 20, // Increased touch area
        justifyContent: 'center',
      }}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      {/* Background track */}
      <View
        style={{
          height: 6,
          backgroundColor: Color.darkGrey,
          borderRadius: 3,
        }}
      />
      
      {/* Progress fill */}
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
      
      {/* Knob */}
      {/* <Animated.View
        style={{
          position: 'absolute',
          left: Animated.subtract(progressAnim, 8),
          top: -5,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: Color.primary,
          borderWidth: 2,
          borderColor: Color.whiteText,
        }}
      /> */}
    </View>
  );
};

export default memo(ProgressBar);