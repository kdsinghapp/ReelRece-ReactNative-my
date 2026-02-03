import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

const BlurViewCom = () => {
  return (
    <View style={styles.container}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor="black" // for Android
      />
      <View style={styles.backgroundColorOverlay} />
    </View>
  );
};

export default BlurViewCom;

const styles = StyleSheet.create({
  container: {
    borderTopEndRadius:20,
    borderTopRightRadius:20,
    ...StyleSheet.absoluteFillObject,
  },
  backgroundColorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 20, 0.7)', // dark transparent overlay
  },
});
