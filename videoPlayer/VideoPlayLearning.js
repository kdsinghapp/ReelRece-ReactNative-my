import imageIndex from "@assets/imageIndex";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import Video from "react-native-video";
 const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const VideoPlayLearning = ({externalPaused, videoUri , onTogglePause}) => {
  const videoPlayer = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  useEffect(() => {
    setPaused(externalPaused);
  }, [externalPaused]);
  const [paused, setPaused] = useState(externalPaused); // Added paused state to control play/pause
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handleLoad = (data) => {
    setDuration(data.duration);
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const secondsToTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    videoPlayer.current.seek(newTime);
    setCurrentTime(newTime);
  };

  const handleRewind = () => {
    const newTime = Math.max(0, currentTime - 10);
    videoPlayer.current.seek(newTime);
    setCurrentTime(newTime);
  };

  const handleSliderTap = (event) => {
    const touchX = event.nativeEvent.locationX;
    const newTime = (touchX / screenWidth) * duration;
    videoPlayer.current.seek(newTime);
    setCurrentTime(newTime);
  };

  // Toggle paused state when user taps on the video controls
  const togglePlayPause = () => {
    setPaused(!paused);
    // Alert.alert(paused ? "Video is paused" : "Video is playing");
  };

  // const togglePlayPause = () => {
  //   if (paused) {
  //     // onPlay(); // tell parent to make this the active video
  //   } else {
  //     setPaused(!paused);
  //     // do nothing or you can add optional pause logic
  //   }
  // };

  // const togglePlayPause = () => {
  //   setPaused(prev => !prev);
  // };

//   Alert.alert(paused ? "Video is paused vVVV" : "Video VV is playing");

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <Video
          ref={videoPlayer}
          source={{
            uri: videoUri,
          }}
          style={styles.video}
          resizeMode="stretch"
          muted={isMuted}
          paused={paused} // Use the paused state to control playback
          onLoad={handleLoad}
          onProgress={handleProgress}
          repeat
        />

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity   onPress={onTogglePause} style={styles.playIconContainer} >
            {/* <Text style={styles.controlText}>{paused ? "▶️" : "⏸"}</Text> */}
            {/* onPress={() => togglePlayPause() ; }  */}
            {paused == true ? 
            <Image source={imageIndex.puased} style={styles.playIcon} />
         :   <Image source={imageIndex.play} style={[styles.playIcon, {}]} />
         
        
        }
            {/* <Image source={imageIndex.paused} style={styles.muteIcon} /> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.muteIconContainer}>
          {isMuted == true ? 
            <Image source={imageIndex.mutedIcon} style={styles.playIcon} />
         :   <Image source={imageIndex.mute} style={[styles.playIcon, {}]} />
         
          }
          </TouchableOpacity>
        </View>

        {/* Custom Slider */}
        <View style={styles.sliderContainer}>
          <TouchableWithoutFeedback onPress={handleSliderTap}>
            <View style={styles.sliderBackground}>
              <View
                style={[
                  styles.sliderProgress,
                  { width: `${(currentTime / duration) * 100}%` },
                ]}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* Time */}
        <Text style={styles.timeText}>
          {secondsToTime(currentTime)} / {secondsToTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  videoWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#222",
    position: "relative", // This allows absolute positioning of the play button inside it
  },
  video: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  controls: {
    position: "absolute",
    // bottom: 40,
    // right: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  controlText: {
    color: "white",
    fontSize: 24,
  },
  sliderContainer: {
    position: "absolute",
    bottom: 0,
    width: screenWidth,
  },
  playIconContainer: {
    backgroundColor:"rgba(40, 38, 41, 0.5)",
    height: 50,  // Increased size for better visibility
    width: 50,   // Same as height for a circular button
    borderRadius: 32,  // Half of width/height to make it a circle
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    // top: "50%",    // Vertically center the button
    // left: "50%",   // Horizontally center the button
    transform: [{ translateX: 160 }, { translateY: 90 }], // Offset by half the button's size
  },
  playIcon:{
    height:20,
    width:20,
    resizeMode:'contain',
  },
  muteIconContainer: {
    backgroundColor: "rgba(40, 38, 41, 0.5)",
    height: 32,
    width: 32,
    // bottom:,
    top:150 ,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: 310 }, { translateY: 8  }],
  },
  muteIcon: {
    height: 19,
    width: 19,
    resizeMode: "center",
  },
  sliderBackground: {
    height: 6,
    backgroundColor: "gray",
    borderRadius: 5,
    overflow: "hidden",
  },
  sliderProgress: {
    height: "100%",
    backgroundColor: "#008ac9",
  },
  timeText: {
    position: "absolute",
    bottom: 10,
    right: 10,
    color: "white",
    fontSize: 12,
  },
});

export default VideoPlayLearning;
