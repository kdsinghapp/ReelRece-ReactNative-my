import React, { useRef, useEffect } from 'react';
import {
  View,
  Image,
  Modal,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';

const SIZE = 110;
const LOGO_SIZE = 70;
const DOT_SIZE = 8;

const createPulseAnimation = (value: Animated.Value) =>
  Animated.sequence([
    Animated.timing(value, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 400,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }),
  ]);

const LoadingModal = ({ visible }: { visible: boolean }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const floatValue = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatValue, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(floatValue, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.stagger(300, [
            createPulseAnimation(pulse1),
            createPulseAnimation(pulse2),
            createPulseAnimation(pulse3),
          ])
        ),
      ]).start();
    } else {
      spinValue.setValue(0);
      fadeValue.setValue(0);
      scaleValue.setValue(0.8);
      floatValue.setValue(0);
      pulse1.setValue(0);
      pulse2.setValue(0);
      pulse3.setValue(0);
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const fade = fadeValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const scale = scaleValue;
  const float = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const pulseScale = (p: Animated.Value) =>
    p.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1.2],
    });
  const pulseOpacity = (p: Animated.Value) =>
    p.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    });

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <Animated.View
          style={[
            styles.logoCircle,
            {
              transform: [
                { scale },
                { translateY: float },
              ],
            }]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Image
              source={imageIndex.appLogo}
              style={styles.appLogo}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
        <View style={styles.dotsRow}>
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ scale: pulseScale(pulse1) }],
                opacity: pulseOpacity(pulse1),
              }]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ scale: pulseScale(pulse2) }],
                opacity: pulseOpacity(pulse2),
              }]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ scale: pulseScale(pulse3) }],
                opacity: pulseOpacity(pulse3),
              }]}
          />
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Color.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  appLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Color.primary,
  },
});

export default LoadingModal;