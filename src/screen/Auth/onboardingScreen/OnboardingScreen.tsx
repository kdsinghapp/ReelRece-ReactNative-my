import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import font from '@theme/font';
import ScreenNameEnum from '@routes/screenName.enum';
import imageIndex from '@assets/imageIndex';
import { Button } from '@components/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';

const { width, height } = Dimensions.get('window');

/* ----------------------------------
   BACKGROUND POSTERS DATA
-----------------------------------*/
const moviePosters = [
  [
    imageIndex.welcomePost1,
    imageIndex.welcomePost2,
    imageIndex.welcomePost3,
    imageIndex.welcomePost4,
    imageIndex.welcomePost5,
    imageIndex.welcomePost6,
  ],
  [
    imageIndex.welcomePost7,
    imageIndex.welcomePost8,
    imageIndex.welcomePost9,
    imageIndex.welcomePost10,
    imageIndex.welcomePost11,
    imageIndex.welcomePost12,
  ],
  [
    imageIndex.welcomePost13,
    imageIndex.welcomePost14,
    imageIndex.welcomePost15,
    imageIndex.welcomePost16,
    imageIndex.welcomePost17,
    imageIndex.welcomePost18,
  ],
  [
    imageIndex.welcomePost19,
    imageIndex.welcomePost20,
    imageIndex.welcomePost21,
    imageIndex.welcomePost21,
    imageIndex.welcomePost22,
  ],
];

/* ----------------------------------
   ONBOARDING DATA
 

/* ----------------------------------
   CONSTANTS FOR BACKGROUND
-----------------------------------*/

  const data = [
    {
      id: '1',
      image: imageIndex.step1,
      title: t("onboarding.text"),
      title1: t("onboarding.title"),
      desc: t("onboarding.desc"),
      img: imageIndex.WatchNowButton,
    },
    {
      id: '2',
      image: imageIndex.step3,
      title: t("onboarding.title1"),
      desc: '',
      img: imageIndex.WatchNowButton2,
    },
  ];
const columnWidth = 120;
const posterHeight = 170;
const posterGap = 12;
const horizontalGap = 14;

/* ----------------------------------
   FLOATING COLUMN COMPONENT
-----------------------------------*/
const FloatingColumn = ({ posters, columnIndex, isAtTop }: { posters: string; columnIndex: number; isAtTop: boolean; }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const direction = isAtTop ? -130 : 130;

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: direction,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY, isAtTop]);
  useEffect(() => {
    removeCurrentStep();
  }, []);
  const removeCurrentStep = async () => {
    try {
      await AsyncStorage.removeItem('currentStep');
    } catch (error) {
    }
  };
  return (
    <Animated.View
      style={[
        styles.column,
        {
          left: columnIndex * (columnWidth + horizontalGap),
          top: isAtTop ? 100 : 0,
          transform: [{ translateY }],
        },
      ]}
    >
      {posters?.map((poster: string | number, index: number) => (
        <Image
          key={index}
          source={poster}
          style={styles.bgPoster}
          resizeMode="cover"
        />
      ))}
    </Animated.View>
  );
};

/* ----------------------------------
   SLIDE COMPONENT
-----------------------------------*/
const SlideItem = ({ item, index, currentIndex }: { item: object; index: number; currentIndex: number; }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    // Only animate when this slide becomes active
    if (index === currentIndex) {
      // Reset animation values
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.88);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 80,
          mass: 1,
          overshootClamping: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 80,
          mass: 1,
          overshootClamping: false,
        }),
      ]).start();
    } else {
      // Reset to initial state for inactive slides
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.88);
    }
  }, [currentIndex, index]);

  // Don't render if not current or adjacent slide (for performance)
  if (Math.abs(index - currentIndex) > 1) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.slide,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
            {
              rotateZ: slideAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0deg', '5deg'],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.slideContent}>
        <Image source={item.image} style={styles.poster} />

        <View style={styles.bottomContainer}>
          <Image source={item.img} style={styles.playBtn} />

          <View style={styles.textBox}>
            <Text style={styles.title}>{item.title}</Text>
            {item.title1 && <Text style={styles.title}>{item.title1}</Text>}
            {!!item.desc && <Text style={styles.desc}>{item.desc}</Text>}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

/* ----------------------------------
   MAIN SCREEN
-----------------------------------*/
const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef<FlatList>(null);
  const navigation = useNavigation();

  const onNext = () => {
    if (currentIndex < data.length - 1) {
      ref.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate(ScreenNameEnum.OnboardingScreen2);
    }
  };

  const handleScrollEnd = (e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <View style={styles.root}>
      {/* 🔹 Animated Background */}
      <View style={styles.posterWrapper}>
        {moviePosters.map((column, i) => (
          <FloatingColumn
            key={i}
            posters={column}
            columnIndex={i}
            isAtTop={i % 2 === 0}
          />
        ))}
      </View>

      {/* 🔹 Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,108,157,0.35)', 'rgba(0,24,35,0.75)']}
        locations={[0, 0.5]}
        style={StyleSheet.absoluteFill}
      />

      {/* 🔹 Foreground Content */}
      <View style={styles.content}>
        <FlatList
          ref={ref}
          data={data}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={handleScrollEnd}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <SlideItem
              item={item}
              index={index}
              currentIndex={currentIndex}
            />
          )}
        />

        <View style={styles.btnWrap}>
          <Button
            title=  {t("login.next") }
            onPress={onNext}
            buttonStyle={{
              backgroundColor: currentIndex === data.length - 1 ? '#35C75A' : '#00A8F5',
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;

/* ----------------------------------
   STYLES
-----------------------------------*/
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  posterWrapper: {
    position: 'absolute',
    width: width + columnWidth,
    height: '100%',
    top: -120,
    left: -(columnWidth / 2),
    flexDirection: 'row',
  },
  column: {
    position: 'absolute',
    width: columnWidth,
    alignItems: 'center',
  },
  bgPoster: {
    width: '100%',
    height: posterHeight,
    marginBottom: posterGap,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 90 : 55,
  },
  slideContent: {
    width: '100%',
    alignItems: 'center',
  },
  poster: {
    width: width * 0.9,
    height: height * 0.5,
    resizeMode: 'stretch',
  },
  bottomContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  playBtn: {
    width: 69,
    height: 69,
  },
  textBox: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: font.PoppinsBold,
  },
  desc: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: font.PoppinsRegular,
  },
  btnWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});