import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Video from 'react-native-video';
import {
  isVideoCached,
  getCachedFilePath,
  cacheVideo,
} from './VideoCache'; // 👈 file above

const CachedVideoPlayer = ({ videoUrl }) => {
  const [source, setSource] = useState({ uri: videoUrl });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const prepareVideo = async () => {
      const cached = await isVideoCached(videoUrl);

      if (cached) {
        const filePath = getCachedFilePath(videoUrl);
         if (isMounted) {
          setSource({ uri: `file://${filePath}` });
          setLoading(false);
        }
      } else {
         if (isMounted) setLoading(false);
        cacheVideo(videoUrl, (p) => {
          if (isMounted) setProgress(p);
        });
      }
    };

    prepareVideo();
    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : (
        <Video
          source={source}
          style={{ flex: 1/3 ,   }}
          controls
          resizeMode="contain"
          // onError={(e) =>  }
        />
      )}

      {progress > 0 && progress < 100 && (
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            backgroundColor: 'rgba(45, 30, 212, 0.5)',
            borderRadius: 8,
            padding: 6,
          }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            Caching... {progress}%
          </Text>
        </View>
      )}
    </View>
  );
};

export default CachedVideoPlayer;
