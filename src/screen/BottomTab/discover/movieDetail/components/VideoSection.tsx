import React, { memo } from 'react';
import { View, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import VideoPlayer from '@utils/NewNativeView';
import CustomVideoPlayer from '@components/common/CustomVideoPlayerios';

interface VideoSectionProps {
  item?: object| string | null | number;
  isMuted: boolean;
  paused: boolean;
  isVideoPaused: boolean;
  currentIndex: number;
  index: number;
  isSeeking: boolean;
  seekPosition: number;
  isShowMuteIcon: boolean;
  onVideoProgress: (data: object| string | null | number) => void;
  onVideoLoad: (data: object| string | null | number) => void;
  videoRef: object| string | null | number;
  onToggleMute: () => void;
  onTogglePause: () => void;
  handlerShowMuteImg: () => void;
  isFeedbackModal: boolean;
}

const VideoSection = ({
  item,
  isMuted,
  paused,
  isVideoPaused,
  currentIndex,
  index,
  isSeeking,
  seekPosition,
  isShowMuteIcon,
  onVideoProgress,
  onVideoLoad,
  videoRef,
  onToggleMute,
  onTogglePause,
  handlerShowMuteImg,
  isFeedbackModal
}: VideoSectionProps) => {
  const windowHeight = Dimensions.get('window').height;

  return (
    <View style={{ marginTop: -4, paddingHorizontal: 0 }}>
      {Platform.OS === "ios" ? (
        <CustomVideoPlayer
          videoUrl={item.trailer_url}
          paused={paused}
          muted={isMuted}
          onTogglePause={onTogglePause}
          onToggleMute={onToggleMute}
          isModalOpen={isFeedbackModal}
        />
      ) : (
        <VideoPlayer
          source={{ uri: item?.trailer_url }}
          movieId={item.imdb_id}
          posterUrl={item.horizontal_poster_url}
          style={{ height: windowHeight / 3.9, width: '100%' }}
          resizeMode='stretch'
          repeat
          muted={isMuted}
          paused={isVideoPaused || index !== currentIndex || isSeeking}
          onProgress={onVideoProgress}
          seekTo={isSeeking ? seekPosition : undefined}
          onLoad={onVideoLoad}
          // onSeek={(position) => {
           // }}
          ref={videoRef}
        />
      )}

      {isShowMuteIcon && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: Platform.OS === "ios" ? 33 : 10,
            right: 10,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => {
            onToggleMute();
            handlerShowMuteImg();
          }}
        >
          <Image
            source={isMuted ? imageIndex.volumeOff : imageIndex.mute}
            style={{ height: 20, width: 20, tintColor: Color.whiteText }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(VideoSection);
