import React, { useRef, useState, useEffect, memo } from 'react';
import { View, PanResponder, Animated } from 'react-native';
  import { Color } from '@theme/color';

type ProgressBarProps = {
  progress: number; // 0..1
  onSeek: (value: number) => void;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, onSeek }) => {
  const [width, setWidth] = useState(0);
  const panX = useRef(new Animated.Value(0)).current;

  const handleLayout = (event) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => panX.setOffset(panX.__getValue()),
    onPanResponderMove: (e, gestureState) => {
      let newPos = gestureState.dx + panX._offset;
      newPos = Math.max(0, Math.min(newPos, width));
      panX.setValue(newPos - panX._offset);
    },
    onPanResponderRelease: (e, gestureState) => {
      let newPos = gestureState.dx + panX._offset;
      newPos = Math.max(0, Math.min(newPos, width));
      panX.flattenOffset();
      const newProgress = newPos / width;
      onSeek(newProgress);
    },
  });

  // Update position when `progress` changes from video playback
  useEffect(() => {
    if (width > 0) {
      Animated.timing(panX, {
        toValue: progress * width,
        duration: 50,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, width]);


return (
  <View
    style={{ height: 6, backgroundColor: Color.darkGrey, borderRadius: 3 }}
    onLayout={handleLayout}
    onStartShouldSetResponder={() => true} // allow tap
    onResponderRelease={(event) => {
      if (width === 0) return;
      const tapX = event.nativeEvent.locationX; // tap position
      const newProgress = Math.max(0, Math.min(tapX / width, 1));
      panX.setValue(newProgress * width); // update knob position
      onSeek(newProgress); // trigger seek callback
    }}
  >
    {/* Filled progress bar */}
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: 6,
        borderRadius: 3,
        backgroundColor: Color.primary,
        width: panX,
      }}
    />

    {/* Draggable knob */}
    <Animated.View
      style={{
        position: 'absolute',
        left: Animated.subtract(panX, 8),
        top: -5,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Color.TransperantColor,
      }}
      {...panResponder.panHandlers}
    />
  </View>
);



  // return (
  //   <View
  //     style={{ height: 6, backgroundColor: Color.darkGrey, borderRadius: 3 }}
  //     onLayout={handleLayout}
  //   >
  //     {/* Filled progress bar */}
  //     <Animated.View
  //       style={{
  //         position: 'absolute',
  //         left: 0,
  //         top: 0,
  //         height: 6,
  //         borderRadius: 3,
  //         backgroundColor: Color.primary,
  //         width: panX, // width follows panX
  //       }}
  //     />

  //     {/* Draggable knob */}
  //     <Animated.View
  //       style={{
  //         position: 'absolute',
  //         left: Animated.subtract(panX, 8), // center the knob
  //         top: -5,
  //         width: 16,
  //         height: 16,
  //         borderRadius: 8,
  //         backgroundColor: Color.TransperantColor, // knob color same as progress
  //       }}
  //       {...panResponder.panHandlers}
  //     />
  //   </View>
  // );
};

export default memo(ProgressBar);


// import React, { useRef, useState } from 'react';
// import { View, PanResponder, Animated, Dimensions } from 'react-native';
// import { Color } from '@theme/color';

// type ProgressBarProps = {
//   progress: number; // 0..1
//   onSeek: (value: number) => void;
// };

// const ProgressBar: React.FC<ProgressBarProps> = ({ progress, onSeek }) => {
//   const [width, setWidth] = useState(0);
//   const panX = useRef(new Animated.Value(0)).current;

//   const handleLayout = (event) => {
//     setWidth(event.nativeEvent.layout.width);
//   };

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onPanResponderGrant: () => panX.setOffset(panX.__getValue()),
//     onPanResponderMove: (e, gestureState) => {
//       let newPos = gestureState.dx + panX._offset;
//       newPos = Math.max(0, Math.min(newPos, width));
//       panX.setValue(newPos - panX._offset);
//     },
//     onPanResponderRelease: (e, gestureState) => {
//       let newPos = gestureState.dx + panX._offset;
//       newPos = Math.max(0, Math.min(newPos, width));
//       panX.flattenOffset();
//       const newProgress = newPos / width;
//       onSeek(newProgress);
//     },
//   });

//   // Update position when `progress` changes from video playback
//   React.useEffect(() => {
//     if (width > 0) {
//       Animated.timing(panX, {
//         toValue: progress * width,
//         duration: 50,
//         useNativeDriver: false,
//       }).start();
//     }
//   }, [progress, width]);

//   return (
//     <View
//       style={{ height: 6, backgroundColor: Color.darkGrey, borderRadius: 3 }}
//       onLayout={handleLayout}
//     >
//       {/* <Animated.View
//         style={{
//           height: 6,
//           backgroundColor: Color.primary,
//           borderRadius: 3,
//           width: panX,
//         }}
//         {...panResponder.panHandlers}
//       /> */}

// <Animated.View
//   style={{
//     position: 'absolute',
//     left: Animated.subtract(panX, 8),
//     top: -5,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: Color.TransperantColor,
//   }}
//   {...panResponder.panHandlers}
// />


//     </View>
//   );
// };

// export default ProgressBar;


