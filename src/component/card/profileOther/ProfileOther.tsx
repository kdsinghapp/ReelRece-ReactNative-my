import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import FastImage from 'react-native-fast-image';

const ProfileOther = ({ imageSource, label, onPress, imgStyle, imageSource2 }: { imageSource: string; label: string; onPress: () => void; imgStyle?: object; imageSource2?: string }) => {
   return (
    <View style={styles.container} >
      {imageSource2 ? (
        <View style={styles.imageWrapper}>
          {/* Background Image (Right) */}
          <TouchableOpacity onPress={onPress} >
            {/* <Image source={{ uri : imageSource2}} style={[styles.image]} /> */}
            <FastImage 
            source={{
              uri : imageSource2,
              priority:FastImage.priority.low,
              cache:FastImage.cacheControl.web
            }}
            style={[styles.image]}
            />
          </TouchableOpacity>

          {/* Overlapping Image (Left) */}
          <TouchableOpacity style={styles.overlapImageWrapper} onPress={onPress}>
            {/* <Image
              source={{ uri: imageSource }}
              style={[
                styles.image,
                imgStyle,
              ]}
            /> */}

                <FastImage 
            source={{
             uri: imageSource,
              priority:FastImage.priority.low,
              cache:FastImage.cacheControl.web
            }}
       style={[
                styles.image,
                imgStyle,
              ]}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={onPress}>
          {/* <Image source={{ uri: imageSource }} style={[styles.image, imgStyle]} /> */}
           <FastImage 
            source={{
             uri: imageSource,
              priority:FastImage.priority.low,
              cache:FastImage.cacheControl.immutable,
            }}
      style={[styles.image, imgStyle]} 
            />
        </TouchableOpacity>
      )}

      <Text   allowFontScaling={false} style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',

  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
     // marginRight:-20

  },
  label: {
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    fontSize: 20,
    marginTop: 15,
    textAlign: 'center',
    alignSelf: 'center',
    width: '80%'
  },
  imageWrapper: {
    // marginLeft: 90,
    width: 150,
    height: 96,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  overlapImageWrapper: {
    marginLeft: -180,
    // position: 'absolute',
    // left: -10,
    // right:-10,
    //  // adjust this to control overlap distance
    // top: 0,
  },
});

export default ProfileOther;
