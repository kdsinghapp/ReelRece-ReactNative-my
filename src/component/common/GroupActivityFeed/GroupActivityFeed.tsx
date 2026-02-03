import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import font from '@theme/font';
import { Color } from '@theme/color';
import { t } from 'i18next';

interface Props {
  groupActivity: object | string | [];
}

const GroupActivityFeed: React.FC<Props> = ({ groupActivity }) => {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const currentItem = groupActivity[index];
   const isLiked = currentItem?.preference === 'like';
  const colorBasedOnPref = isLiked ? '#00C851' : '#ff4444';

  const animateIn = () => {
    fadeAnim.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!groupActivity?.length) return;

    animateIn();

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIndex(prev => (prev + 1) % groupActivity.length);
        animateIn();
      });
    }, 2500); // every 2.5 seconds

    return () => clearInterval(interval);
  }, [groupActivity, index]);

  if (!currentItem) return null;

  return (
    <View style={styles.container}>
      <Animated.Text
      allowFontScaling={false}
        style={[
          styles.userName,
          {
            color: colorBasedOnPref,
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* {currentItem?.user?.name} {isLiked ? 'liked' : 'disliked'} {currentItem?.movie?.title} on {currentItem?.pref_record_date} */}
        {`${currentItem?.user?.name ?? currentItem?.user?.username} ${isLiked ? 
            t("common.liked")
           :  t("common.disliked")  } ${currentItem?.movie?.title} on ${currentItem?.pref_record_date}`}

      </Animated.Text>
    </View>
  );
};

export default memo(GroupActivityFeed);

const styles = StyleSheet.create({
  container: {
    marginTop:8,
    height: 20, // fix height so text doesn't shift screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontFamily: font.PoppinsRegular,
    fontSize: 12,
    color: Color.whiteText,
  },
});
