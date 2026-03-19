import React, { memo } from 'react';
import { View, Platform } from 'react-native';
import VideoPlayer from '@utils/NewNativeView';
import CustomVideoPlayer from '@components/common/CustomVideoPlayerios';

interface VideoSectionProps {
  item?: any;
  isMuted: boolean;
  paused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  isFeedbackModal: boolean;
}

const VideoSection = ({
  item,
  isMuted,
  paused,
  onToggleMute,
  onTogglePause,
  isFeedbackModal,
}: VideoSectionProps) => {
  return (
    <View style={{ marginTop: -4, paddingHorizontal: 0 }}>
      {Platform.OS === 'ios' ? (
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
          posterUrl={item?.horizontal_poster_url}
          paused={paused}
          muted={isMuted}
          onTogglePause={onTogglePause}
          onToggleMute={onToggleMute}
          isModalOpen={isFeedbackModal}
        />
      )}
    </View>
  );
};

export default memo(VideoSection);
