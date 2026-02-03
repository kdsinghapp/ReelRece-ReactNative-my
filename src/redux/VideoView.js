import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { requireNativeComponent, findNodeHandle, NativeModules } from "react-native";

const NativeVideoView = requireNativeComponent("VideoPlayerView");
const { VideoPlayerViewManager } = NativeModules;
 
const VideoPlayer = forwardRef(({ source, style }, ref) => {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => VideoPlayerViewManager.play(findNodeHandle(videoRef.current)),
    pause: () => VideoPlayerViewManager.pause(findNodeHandle(videoRef.current)),
    seekTo: (time) => VideoPlayerViewManager.seekTo(findNodeHandle(videoRef.current), time),
  }));

  return <NativeVideoView ref={videoRef} source={source} style={style} />;
});

export default VideoPlayer;
