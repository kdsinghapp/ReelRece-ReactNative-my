// MovieTrailer.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Video from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMute } from '@redux/feature/videoAudioSlice';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import styles from './style';

type MovieTrailerProps = {
  trailerUrl: string;
  posterUrl: string;
  paused?: boolean;
  windowHeight?: number;
  onProgress?: (progress: number) => void;
};

const MovieTrailer: React.FC<MovieTrailerProps> = ({
  trailerUrl,
  posterUrl,
  paused = false,
  windowHeight = Dimensions.get('window').height,
  onProgress,
}) => {
  const dispatch = useDispatch();
  const isMuted = useSelector((state: string | null | boolean | object) => state.videoAudio.isMuted);
  const videoRef = useRef<Video>(null);
  const posterOpacity = useRef(new Animated.Value(1)).current;
  const [isShowMuteIcon, setIsShowMuteIcon] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState(0);

  // Fade out poster once video loads
  const onLoad = useCallback((data) => {
    setDuration(data.duration || 0);
    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVideoProgress = useCallback(
    (data) => {
      if (duration > 0 && onProgress) {
        onProgress(data.currentTime / duration);
      }
    },
    [duration, onProgress]
  );

  const showMuteIcon = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsShowMuteIcon(true);
    timerRef.current = setTimeout(() => setIsShowMuteIcon(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);


  const handlerShowMuteImg = useCallback(() => {
    // Purana timer clear karo
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Show immediately
    setIsShowMuteIcon(true);

    // Hide after 5 sec
    timerRef.current = setTimeout(() => {
      setIsShowMuteIcon(false);
    }, 5000);
  }, []);


  useEffect(() => {
    handlerShowMuteImg();

    // cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [ handlerShowMuteImg]);
  


  return (
    <TouchableOpacity style={{ marginTop: -4, paddingHorizontal: 10 }} onPress={handlerShowMuteImg}>
      <Video
        source={{ uri: trailerUrl }}
        style={{ height: windowHeight / 3.9, width: '100%' }}
        resizeMode="stretch"
        repeat
        muted={isMuted}
        paused={paused}
        onProgress={handleVideoProgress}
        onLoad={onLoad}
        ref={videoRef}
         onEnd={() => {
                setProgress(1);
                if (item?.imdb_id) {
                  trailerTracker.triggerInteractionIfAny();
                }
              }}
      />

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 10,
          right: 10,
          height: windowHeight / 3.8,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isShowMuteIcon && (
          <TouchableOpacity style={styles.tButton} onPress={() => dispatch(toggleMute())}>
            <Image
              source={isMuted ? imageIndex.volumeOff : imageIndex.mute}
              style={{ height: 22, width: 22, tintColor: Color.whiteText }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        <Animated.Image
          source={{ uri: posterUrl }}
          resizeMode="cover"
          style={{
            alignSelf: 'center',
            opacity: posterOpacity,
            height: windowHeight / 3.8,
            width: '100%',
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(MovieTrailer);



// import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
// import { View, Image, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
// import Video from 'react-native-video';
// import { useSelector, useDispatch } from 'react-redux';
// import imageIndex from '@assets/imageIndex';
// import { Color } from '@theme/color';
// import { toggleMute } from '@redux/feature/videoAudioSlice';
// import styles from './style';

// const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT  , } = Dimensions.get('window');

// type MovieTrailerProps = {
//   trailerUrl: string;
//   posterUrl?: string;
//   paused?: boolean;
//   onProgress?: (progress: number) => void;
// };

// const MovieTrailer: React.FC<MovieTrailerProps> = ({
//   trailerUrl,
//   posterUrl,
//   paused = false,
//   onProgress,
//   windowHeight,
// }) => {
//   const dispatch = useDispatch();
//   const isMuted = useSelector((state) => state.videoAudio.isMuted);

//   const videoRef = useRef<Video>(null);
//   const posterOpacity = useRef(new Animated.Value(1)).current;

//   const [isShowMuteIcon, setIsShowMuteIcon] = useState(false);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   // Throttle progress updates
//   const handleProgress = useCallback(
//     (data) => {
//       if (onProgress && data.duration > 0) {
//         const progress = data.currentTime / data.duration;
//         onProgress(progress);
//       }
//     },
//     [onProgress]
//   );

//   const onLoad = useCallback(() => {
//     Animated.timing(posterOpacity, {
//       toValue: 0,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const handleMutePress = useCallback(() => {
//     dispatch(toggleMute());
//     setIsShowMuteIcon(true);
//     if (timerRef.current) clearTimeout(timerRef.current);
//     timerRef.current = setTimeout(() => setIsShowMuteIcon(false), 3000);
//   }, [dispatch]);

//   const handlerShowMuteImg = useCallback(() => {
//     // Purana timer clear karo
//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//     }

//     // Show immediately
//     setIsShowMuteIcon(true);

//     // Hide after 5 sec
//     timerRef.current = setTimeout(() => {
//       setIsShowMuteIcon(false);
//     }, 5000);
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, []);

//   return (
//  <TouchableOpacity style={{ marginTop: -4, paddingHorizontal: 10 }}
//             onPress={handlerShowMuteImg}
//           >
//             <Video
//               source={{ uri: item?.trailer_url }}
//               style={{ height: windowHeight / 3.9, width: '100%' }}
//               resizeMode='stretch'
//               repeat
//               muted={isMuted}
//               paused={isVideoPaused || index !== currentIndex || isSeeking}
//               onProgress={onVideoProgress}
//               onEnd={() => {
//                 setProgress(1);
//                 if (item?.imdb_id) {
//                   trailerTracker.triggerInteractionIfAny();
//                 }
//               }}
//               onLoad={onLoad}
//               ref={videoRef}
//             />
//             <View style={{
//               position: 'absolute',
//               top: 0,
//               left: 10,
//               right: 10,
//               height: windowHeight / 3.8,
//               width: '100%',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>

//               {isShowMuteIcon &&
//                 <TouchableOpacity
//                   style={styles.tButton}
//                   // onPress={() => setMuted(!muted)}
//                   onPress={() => dispatch(toggleMute())}
//                 >
//                   <Image
//                     source={isMuted ? imageIndex.volumeOff : imageIndex.mute}
//                     style={{ height: 22, width: 22, tintColor: Color.whiteText }}
//                     resizeMode="contain"
//                   />
//                 </TouchableOpacity>
//               }
//               <Animated.Image
//                 source={{ uri: item.horizontal_poster_url }}
//                 resizeMode="cover"
//                 style={{
//                   alignSelf: 'center',
//                   opacity: posterOpacity,
//                   height: windowHeight / 3.8,
//                   width: '100%',
//                 }}
//               />
//             </View>
//           </TouchableOpacity> 
//   );
// };

// export default memo(MovieTrailer);

// // const styles = StyleSheet.create({
// //   container: {
// //     width: '100%',
// //     height: WINDOW_HEIGHT / 3.8,
// //     backgroundColor: '#000',
// //     overflow: 'hidden',
// //   },
// //   video: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   poster: {
// //     ...StyleSheet.absoluteFillObject,
// //   },
// //   muteButton: {
// //     position: 'absolute',
// //     top: 10,
// //     right: 10,
// //     zIndex: 10,
// //     backgroundColor: 'rgba(0,0,0,0.4)',
// //     padding: 6,
// //     borderRadius: 20,
// //   },
// //   icon: { width: 22, height: 22, tintColor: Color.whiteText },
// // });
