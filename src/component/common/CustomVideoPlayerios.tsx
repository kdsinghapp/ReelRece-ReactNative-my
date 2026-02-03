import imageIndex from "@assets/imageIndex";
import SvgImage from "@assets/svg/svgImage";
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
} from "react-native";
import Video from "react-native-video";
const { width, height } = Dimensions.get("window");

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
  isModalOpen,
  onTogglePause,
  onToggleMute
}) => {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);

  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  
  // Compute final paused state: modal takes priority
  const finalPaused = isModalOpen ? true : isPaused;

  // Refs to provide current values to PanResponder (avoids stale closure)
  const progressWidthRef = useRef(0);
  const durationRef = useRef(0);
  const isModalOpenRef = useRef<boolean | undefined>(undefined);

  // Sync refs with current values so PanResponder handlers can read them
  useEffect(() => { progressWidthRef.current = progressWidth; }, [progressWidth]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { isModalOpenRef.current = isModalOpen; }, [isModalOpen]);

  /* ================= AUTO HIDE CONTROLS ================= */
  const startAutoHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    startAutoHide();
    return () => hideTimer.current && clearTimeout(hideTimer.current);
  }, []);

  /* ================= SYNC WITH PARENT PAUSED STATE ================= */
  useEffect(() => {
    setIsPaused(paused);
  }, [paused]);

  /* ================= HANDLE MODAL OPEN/CLOSE FOR CONTROLS ================= */
  useEffect(() => {
    if (isModalOpen) {
      setShowControls(false);
    } else {
      setShowControls(true);
      startAutoHide();
    }
  }, [isModalOpen]);

  /* ================= TIME FORMAT ================= */
  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ================= SEEK ================= */
  const seekBy = (sec: number) => {
    if (isModalOpen === true) return;

    const newTime = Math.min(Math.max(currentTime + sec, 0), duration);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    startAutoHide();
  };

  const handlePlayPause = () => {
    if (isModalOpen === true) return;

    setIsPaused(prev => !prev);
    startAutoHide();
  };

  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    }
    startAutoHide();
  };

  /* ================= SCRUBBING (DRAG) FUNCTIONALITY ================= */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Read from refs instead of stale closure values
        if (isModalOpenRef.current === true) return;
        if (progressWidthRef.current <= 0 || durationRef.current <= 0) return;

        setIsScrubbing(true);
        const x = evt.nativeEvent.locationX;
        const seekTime = (x / progressWidthRef.current) * durationRef.current;
        videoRef.current?.seek(seekTime);
        setCurrentTime(seekTime);
      },
      onPanResponderMove: (evt) => {
        // Read from refs instead of stale closure values
        if (isModalOpenRef.current === true) return;
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

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (!isModalOpen) {
          setShowControls(true);
          startAutoHide();
        }
      }}
    >
      <View style={styles.container}>
        {/* VIDEO */}
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
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
        />

        {/* MUTE/UNMUTE BUTTON - Top Right (Same visibility as controls) */}
        {showControls && !isModalOpen && (
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

        {/* CONTROLS OVERLAY - Hidden when modal is open */}
        {showControls && !isModalOpen && (
          <View style={styles.overlay}>
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
                  >
                    <View style={{
                      //         position: "absolute",
                      //                     right: -6,
                      // top: -5,
                      // width: 15,
                      // height: 15,
                      // borderRadius: 10,
                      // backgroundColor: "#fff",
                    }} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TIME DISPLAY */}
        {!isModalOpen && (
          <View style={[styles.timeRow, { marginLeft: 13 }]}>
            <Text style={styles.timeText}>
              <Text style={{ color: "white" }}>
                {formatTime(currentTime)}
              </Text>
              <Text style={{ color: "gray" }}>
                {" "} {formatTime(duration)}
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
    height: height / 3.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
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
