import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import imageIndex from '@assets/imageIndex';
const PosterImage = ({ poster, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      {/* Placeholder (static image) */}
      {/* {(loading || error) && ( */}
      {/* <Image
                    source={imageIndex.welcomePost14} // 👈 yahan apni static image lagana
                    style={style}
                    resizeMode="cover"
                /> */}
      {/* )} */}

      {/* Actual image */}
      <FastImage
        source={
          typeof poster === 'string'
            ? {
              uri: poster,
              priority: FastImage.priority.low,
              cache: FastImage.cacheControl.immutable,
            }
            : poster?.uri
              ? {
                uri: poster.uri,
                priority: FastImage.priority.low,
                cache: FastImage.cacheControl.immutable,
              }
              : imageIndex.welcomePost14 // fallback if nothing found
        }
        style={style}
        resizeMode={FastImage.resizeMode.stretch}
        onLoadStart={() => {
          setLoading(true);
          setError(false);
        }}
        
        onLoadEnd={() => setLoading(false)}
        onError={(e) => {
          setLoading(false);
          setError(true);
        }}
      />


    </View>
  );
};


export default PosterImage;
