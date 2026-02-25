import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Color } from '@theme/color';
import { t } from 'i18next';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';

const SWIPE_TOOLTIP_STORAGE_KEY = 'hasSeenSwipeTooltip';

const HAND_BOUNCE_DISTANCE = 12;
const HAND_ANIM_DURATION = 1200;
/** Height reserved for bottom tab bar so tooltip sits above it */
const BOTTOM_TAB_HEIGHT = 65;
// const GAP_ABOVE_TAB_BAR = 16;
const GAP_ABOVE_TAB_BAR = Platform.OS =="ios" ? 20:   20;
 

interface SwipeIntroTooltipProps {
  visible: boolean;
  onClose: () => void;
  handImage?: 'tooltipHand3' | 'tooltipHand4';
}

const SwipeIntroTooltip = ({
  visible,
  onClose,
  handImage = 'tooltipHand4',
}: SwipeIntroTooltipProps) => {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const handSource = handImage === 'tooltipHand4' ? imageIndex.tooltipHand4 : imageIndex.tooltipHand3;
  const handAnim = useRef(new Animated.Value(0)).current;
  const bottomPadding = BOTTOM_TAB_HEIGHT + insets.bottom + GAP_ABOVE_TAB_BAR;
  const contentWidth = Math.min(width * 0.92, 340);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(handAnim, {
          toValue: 1,
          duration: HAND_ANIM_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(handAnim, {
          toValue: 0,
          duration: HAND_ANIM_DURATION / 2,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, handAnim]);

  const handTranslateY = handAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-HAND_BOUNCE_DISTANCE, HAND_BOUNCE_DISTANCE],
  });

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { paddingBottom: bottomPadding }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, { width: contentWidth }]}>
              <View style={styles.bubble}>
                <Text style={styles.description}>
                  {t('discover.swipeTooltipText')}
                </Text>
              </View>
              {handSource && (
                <Animated.Image
                  source={handSource}
                  style={[styles.handImage, { transform: [{ translateY: handTranslateY }] }]}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: Color.primary,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  description: {
    color: Color.whiteText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: font.PoppinsRegular,
  },
  handImage: {
    width: 120,
    height: 140,
    marginTop: -28,
    opacity: 0.9,
  },
});

export default SwipeIntroTooltip;
export { SWIPE_TOOLTIP_STORAGE_KEY };
