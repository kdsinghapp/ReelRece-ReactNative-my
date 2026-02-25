
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  ImageSourcePropType,
  Easing,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import font from '@theme/font';

const { width, height } = Dimensions.get('window');

const TOOLTIP_BLUE = '#008AC9';

type SlideInTooltipModalProps = {
  visible: boolean;
  onClose: () => void;
  tooltipText?: string;
  buttonText?: string;
  flatlistTop?: number | null;
  firstRankIconPosition?: { x: number; y: number } | null;
};

const SlideInTooltipModal = ({
  visible,
  onClose,
  tooltipText = 'Tap on this to rank movies/shows',
  buttonText = 'Got it!',
  flatlistTop = 0,
  firstRankIconPosition,
}: SlideInTooltipModalProps) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const handJumpAnim = useRef(new Animated.Value(0)).current;
  const [handFrame, setHandFrame] = useState(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  /* Animated jump for hand (loop) + alternate hand image for tap effect */
  useEffect(() => {
    if (!visible) return;
    const jump = Animated.loop(
      Animated.sequence([
        Animated.timing(handJumpAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(handJumpAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    jump.start();
    const interval = setInterval(() => setHandFrame((f) => (f + 1) % 2), 400);
    return () => {
      jump.stop();
      clearInterval(interval);
    };
  }, [visible, handJumpAnim]);

  const handleTooltipSaveAsync = async () => {
    onClose();
    await AsyncStorage.setItem('tooltipShown', 'true');
  };

  const handTranslateY = handJumpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const handSource = (imageIndex as Record<string, ImageSourcePropType>).tooltipHand;
  const handSource2 = (imageIndex as Record<string, ImageSourcePropType>).tooltipHand2;
  const handImg = handSource2 && handFrame === 1 ? handSource2 : handSource;

  /* Rank button 30x35; layout: hand above-left, dashed circle on button, blue tooltip below */
  const RANK_ICON_W = 30;
  const RANK_ICON_H = 35;
  const DASHED_SIZE = 40;
  const TOOLTIP_W = 260;
  const HAND_ROW_H = 72;
  const rankPos = firstRankIconPosition;
  const rankCenterX = rankPos != null ? rankPos.x + RANK_ICON_W / 2 : 0;
  const rankCenterY = rankPos != null ? rankPos.y + RANK_ICON_H / 2 : 0;
  const top = rankPos != null ? rankCenterY - HAND_ROW_H / 2 : 100 + (flatlistTop ?? 0);
  const containerLeft = rankPos != null ? rankCenterX - TOOLTIP_W + DASHED_SIZE / 2 : undefined;
  const containerRight = rankPos == null ? 22 : undefined;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backgroundOverlay} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim,
                top,
                ...(containerLeft != null ? { left: containerLeft } : {}),
                ...(containerRight != null ? { right: containerRight } : {}),
              },
            ]}
            pointerEvents="box-none"
          >
            {/* Row: hand (above-left) + dashed circle on rank button */}
            <View style={styles.handRow}>
              {handImg && (
                <Animated.View
                  style={[styles.handWrap, { transform: [{ translateY: handTranslateY }] }]}
                  pointerEvents="none"
                >
                  <Image source={handImg} style={styles.handImage} resizeMode="contain" />
                </Animated.View>
              )}
              <View style={styles.targetWrap}>
                <View style={styles.dashedCircle}>
                  <View style={styles.targetButton}>
                    <Image style={styles.targetIcon} source={imageIndex.ranking} />
                  </View>
                </View>
              </View>
            </View>

            {/* Blue tooltip bubble below */}
            <View style={styles.tooltip}>
              <Text style={styles.text}>{tooltipText}</Text>
              <TouchableOpacity style={styles.button} onPress={handleTooltipSaveAsync} activeOpacity={0.8}>
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default SlideInTooltipModal;

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: height,
    width: width,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    position: 'absolute',
    width: 260,
  },
  handRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 72,
    marginBottom: 4,
  },
  targetWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedCircle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    // borderWidth: 2,
    // borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:-10
  },
  targetButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: Color.modalTransperant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: Color.whiteText,
  },
  handWrap: {
    marginLeft: 8,
    zIndex: 10,
    position:'absolute',
    right:-25,
    top:20
  },
  handImage: {
    width: 70,
    height: 88,
  },
  tooltip: {
    backgroundColor: TOOLTIP_BLUE,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: Color.whiteText,
    marginBottom: 14,
    fontSize: 16,
    fontFamily: font.PoppinsRegular,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    borderRadius: 20,
    // paddingVertical: 10,
    paddingHorizontal: 32,
    // backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#fff',
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: font.PoppinsMedium,
    fontSize: 16,
    lineHeight: 20,
  },
});
