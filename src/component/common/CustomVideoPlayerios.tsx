import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  Image,
  PanResponder,
  Alert,
} from "react-native";
import Video from "react-native-video";
import imageIndex from "@assets/imageIndex";
import SvgImage from "@assets/svg/svgImage";

const { height } = Dimensions.get("window");

interface Props {
  videoUrl: string;
  muted?: boolean;
  paused?: boolean;
  isModalOpen?: boolean;
  onTogglePause?: () => void;
  onToggleMute?: () => void;
}

const CustomVideoPlayer: React.FC<Props> = ({
  videoUrl,
  muted = false,
  paused = false,
  isModalOpen = false,
  onTogglePause,
  onToggleMute
}) => {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);

  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(paused);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const prevModalOpenRef = useRef(isModalOpen);

  const progressWidthRef = useRef(0);
  const durationRef = useRef(0);
  const isModalOpenRef = useRef<boolean>(false);

  useEffect(() => {
    progressWidthRef.current = progressWidth;
  }, [progressWidth]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  // Handle modal state changes
  useEffect(() => {
    // When modal closes, resume video if it was playing before modal opened
    if (prevModalOpenRef.current === true && isModalOpen === false) {
      setIsPaused(false);
    }

    // Update previous state
    prevModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  // Sync with parent paused state
  useEffect(() => {
    // Only update from parent when modal is NOT open
    // This prevents parent from overriding the modal's pause state
    if (!isModalOpen) {
      setIsPaused(paused);
    }
  }, [paused, isModalOpen]);

  // Compute final paused state
  const finalPaused = isModalOpen ? true : isPaused;

  /* ================= AUTO HIDE CONTROLS ================= */
  const startAutoHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isModalOpen) {
        setShowControls(false);
      }
    }, 3000);
  }, [isModalOpen]);

  useEffect(() => {
    startAutoHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [startAutoHide]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.seek(0);
          videoRef.current.setNativeProps?.({ paused: true });
        } catch (_) {
          // best-effort cleanup
        }
      }
      videoRef.current = null;
    };
  }, []);

  /* ================= HANDLE MODAL OPEN/CLOSE FOR CONTROLS ================= */
  useEffect(() => {
    if (isModalOpen) {
      setShowControls(false);
    } else {
      setShowControls(true);
      startAutoHide();
    }
  }, [isModalOpen, startAutoHide]);

  /* ================= TIME FORMAT ================= */
  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ================= SEEK ================= */
  const seekBy = (sec: number) => {
    if (isModalOpen) return;

    const newTime = Math.min(Math.max(currentTime + sec, 0), duration);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    startAutoHide();
  };

  const handlePlayPause = () => {
    if (isModalOpen) return;

    const newPausedState = !isPaused;
    setIsPaused(newPausedState);

    // Notify parent if needed
    if (onTogglePause) {
      onTogglePause();
    }

    startAutoHide();
  };

  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    }
    startAutoHide();
  };

  /* ================= SCRUBBING ================= */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isModalOpen,
      onMoveShouldSetPanResponder: () => !isModalOpen,
      onPanResponderGrant: (evt) => {
        if (isModalOpenRef.current) return;
        if (progressWidthRef.current <= 0 || durationRef.current <= 0) return;

        setIsScrubbing(true);
        const x = Math.max(0, Math.min(evt.nativeEvent.locationX, progressWidthRef.current));
        const seekTime = (x / progressWidthRef.current) * durationRef.current;
        videoRef.current?.seek(seekTime);
        setCurrentTime(seekTime);
      },
      onPanResponderMove: (evt) => {
        if (isModalOpenRef.current) return;
        if (progressWidthRef.current <= 0 || durationRef.current <= 0) return;

        const x = Math.max(0, Math.min(evt.nativeEvent.locationX, progressWidthRef.current));
        const seekTime = (x / progressWidthRef.current) * durationRef.current;
        videoRef.current?.seek(seekTime);
        setCurrentTime(seekTime);
      },
      onPanResponderRelease: () => {
        setIsScrubbing(false);
        startAutoHide();
      },
    })
  ).current;

  // Handle container press
  const handleContainerPress = () => {
    // Alert.alert('hiii')
    if (!isModalOpen) {
      // if(showControls){

      // }
      setShowControls(!showControls);
      startAutoHide();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleContainerPress}>
      <View style={styles.container}>
        {/* VIDEO */}
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={[styles.video, { height: height / 3.9 }]}
          resizeMode="contain"
          paused={finalPaused}
          muted={muted}
          onProgress={(d) => {
            if (!isScrubbing) {
              setCurrentTime(d.currentTime);
            }
          }}
          onLoad={(d) => setDuration(d.duration)}
          progressUpdateInterval={250}
          playInBackground={false}
          playWhenInactive={false}
        />

        {/* MUTE/UNMUTE BUTTON */}
        {showControls && (
          <TouchableOpacity
            style={styles.muteButton}
            onPress={handleToggleMute}
          >
            <Image
              source={muted ? imageIndex.volumeOff : imageIndex.mute}
              style={styles.muteIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {!showControls && (
          <TouchableOpacity activeOpacity={1} onPress={() => handleContainerPress()} style={styles.overlay}>

          </TouchableOpacity>
        )}
        {/* CONTROLS OVERLAY */}
        {showControls && (
          <TouchableOpacity activeOpacity={1} onPress={() => handleContainerPress()} style={styles.overlay}>
            {/* CENTER CONTROLS */}
            <View style={styles.centerControls}>
              <TouchableOpacity onPress={() => seekBy(-5)}>
                <SvgImage.Timeplay />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playBtn}
              >
                {finalPaused ? <SvgImage.Play /> : <SvgImage.Pause />}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => seekBy(15)}>
                <SvgImage.Second />
              </TouchableOpacity>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.bottomBar}>
              <View
                style={styles.progressWrapper}
                onLayout={(e) =>
                  setProgressWidth(e.nativeEvent.layout.width)
                }
                {...panResponder.panHandlers}
              >
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: duration
                          ? `${(currentTime / duration) * 100}%`
                          : "0%",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* TIME DISPLAY */}
        {!isModalOpen && (
          <View style={[styles.timeRow, { marginLeft: 13 }]}>
            <Text style={styles.timeText}>
              <Text style={{ color: "white" }}>
                {formatTime(currentTime)}
              </Text>
              <Text style={{ color: "gray" }}>
                {" "}{formatTime(duration)}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CustomVideoPlayer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
    // backgroundColor:'red'
  },
  muteButton: {
    position: 'absolute',
    top: Platform.OS === "ios" ? 33 : 10,
    right: 10,
    zIndex: 1000,
    borderRadius: 20,
    padding: 8,
  },
  muteIcon: {
    height: 20,
    width: 20,
    tintColor: "#FFFFFF",
  },
  centerControls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
  },
  playBtn: {
    padding: 12,
  },
  bottomBar: {
    paddingHorizontal: 10,
    bottom: 15,
  },
  progressWrapper: {
    width: "100%",
  },
  progressBg: {
    height: 4.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  progressFill: {
    height: 4.5,
    backgroundColor: "#fff",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
  },
});