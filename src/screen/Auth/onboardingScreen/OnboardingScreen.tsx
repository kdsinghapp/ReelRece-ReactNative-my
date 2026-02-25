import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
  BackHandler,
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

/* Step-two layout (same as OnboardingStepTwo) */
const POSTER_GAP_STEP2 = 10;
const HORIZONTAL_PADDING_STEP2 = 15;
const totalWidthStep2 = width - HORIZONTAL_PADDING_STEP2 * 2;
const columnWidthStep2 = (totalWidthStep2 - POSTER_GAP_STEP2 * 2) / 3;
const posterHeightStep2 = columnWidthStep2 * 1.45;
const moviePostersStep2 = [
  [imageIndex.SingleMovi, imageIndex.SingleMovie4, imageIndex.SingleMovie7, imageIndex.LargePortraitPoster],
  [imageIndex.SingleMovieSlide2, imageIndex.SingleMovie5, imageIndex.SingleMovie8, imageIndex.LargePortraitPoster1],
  [imageIndex.SingleMovieSlide3, imageIndex.SingleMovie6, imageIndex.SingleMovie9, imageIndex.LargePortraitPoster2],
];

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
   CONSTANTS FOR BACKGROUND
-----------------------------------*/
const columnWidth = 120;
const posterHeight = 170;
const posterGap = 12;
const horizontalGap = 14;

/* ----------------------------------
   FLOATING COLUMN COMPONENT
-----------------------------------*/
const FloatingColumn = ({
  posters,
  columnIndex,
  isAtTop,
}: {
  posters: (number | string)[];
  columnIndex: number;
  isAtTop: boolean;
}) => {
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
      {posters?.map((poster, index) => (
        <Image
          key={index}
          source={typeof poster === 'number' ? poster : { uri: String(poster) }}
          style={styles.bgPoster}
          resizeMode="cover"
        />
      ))}
    </Animated.View>
  );
};

/* ----------------------------------
   STEP-TWO FLOATING COLUMNS (optional animation; third slide uses static)
-----------------------------------*/
const FloatingColumnStep2 = ({
  posters,
  columnIndex,
  isUpward,
  animated = true,
}: {
  posters: (number | string)[];
  columnIndex: number;
  isUpward: boolean;
  animated?: boolean;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animated) return;
    const distance = isUpward ? -40 : 40;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: distance, duration: 8000, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [animated, translateY, isUpward]);
  return (
    <Animated.View
      style={[
        styles.columnStep2,
        {
          left: HORIZONTAL_PADDING_STEP2 + columnIndex * (columnWidthStep2 + POSTER_GAP_STEP2),
          transform: animated ? [{ translateY }] : [],
        },
      ]}
    >
      {posters.map((poster, i) => (
        <View key={i} style={styles.posterContainerStep2}>
          <Image source={typeof poster === 'number' ? poster : { uri: String(poster) }} style={styles.posterStep2} />
        </View>
      ))}
    </Animated.View>
  );
};

const AUTO_ADVANCE_MS = 2000;

/* ----------------------------------
   MAIN SCREEN: 3 views = slide 0, slide 1, step-two overlay. Animated background, static slide container.
-----------------------------------*/
const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showStepTwo, setShowStepTwo] = useState(false);
  const navigation = useNavigation();
  const stepTwoGridTranslateY = useRef(new Animated.Value(height)).current;
  const stepTwoBottomOverlayOpacity = useRef(new Animated.Value(0)).current;
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Slide 2 -> 3 transition: slide 2 content goes up, slide 3 grid comes up from bottom */
  const slide2OutTranslateY = useRef(new Animated.Value(0)).current;
  const slide2OutOpacity = useRef(new Animated.Value(1)).current;
  /* Slide 0 & 1 enter animation */
  const slideSlideAnim = useRef(new Animated.Value(0)).current;
  const slideFadeAnim = useRef(new Animated.Value(1)).current;
  const slideScaleAnim = useRef(new Animated.Value(1)).current;

  /* Slide content: background animates; slide container animates in (restored). */
  const slides = [
    {
      image: imageIndex.step1,
      title: t('onboarding.text'),
      title1: t('onboarding.title'),
      desc: t('onboarding.desc'),
      playImg: imageIndex.WatchNowButton,
    },
    {
      image: imageIndex.step3,
      title: t('onboarding.title1'),
      title1: '',
      desc: '',
      playImg: imageIndex.WatchNowButton2,
    },
  ];

  const goToInitialScreen = () => {
    (navigation as { reset: (arg: object) => void }).reset({
      index: 0,
      routes: [
        {
          name: ScreenNameEnum.TabNavigator,
          state: {
            index: 0,
            routes: [
              {
                name: ScreenNameEnum.RankingTab,
                state: {
                  index: 0,
                  routes: [{ name: ScreenNameEnum.RankingScreen, params: { openTooltipModal: true } }],
                },
              },
            ],
          },
        },
      ],
    });
  };

  const clearAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  const openStepTwo = () => {
    clearAutoAdvance();
    setShowStepTwo(true);
  };

  const onNext = () => {
    if (currentSlide < slides.length - 1) {
      clearAutoAdvance();
      setCurrentSlide((s) => s + 1);
    } else {
      openStepTwo();
    }
  };

  /* Auto-advance: 2s on slide 0 -> 1, 2s on slide 1 -> step-two */
  useEffect(() => {
    if (showStepTwo) return;
    if(currentSlide === 0) return;
    autoAdvanceTimerRef.current = setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      if (currentSlide < slides.length - 1) {
        setCurrentSlide((s) => s + 1);
      } else {
        openStepTwo();
      }
    }, AUTO_ADVANCE_MS);
    return () => clearAutoAdvance();
  }, [showStepTwo, currentSlide]);

  /* Restored: slide 0 & 1 enter animation (slide in, fade, scale) */
  useEffect(() => {
    if (showStepTwo) return;
    const isSecondSlide = currentSlide === 1;
    slideSlideAnim.setValue(100);
    slideFadeAnim.setValue(0);
    slideScaleAnim.setValue(isSecondSlide ? 0.75 : 0.88);

    if (isSecondSlide) {
      Animated.parallel([
        Animated.timing(slideSlideAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideFadeAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(slideScaleAnim, {
          toValue: 1.05,
          duration: 1400,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 80,
          mass: 1,
          overshootClamping: false,
        }),
        Animated.timing(slideFadeAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.spring(slideScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 80,
          mass: 1,
          overshootClamping: false,
        }),
      ]).start();
    }
  }, [currentSlide, showStepTwo]);

  /* Third slide: slide 2 content goes up, grid comes up from bottom (no blink) */
  useEffect(() => {
    if (!showStepTwo) return;
    stepTwoGridTranslateY.setValue(height);
    stepTwoBottomOverlayOpacity.setValue(0);
    slide2OutTranslateY.setValue(0);
    slide2OutOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(slide2OutTranslateY, {
        toValue: -height,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide2OutOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(stepTwoGridTranslateY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(stepTwoBottomOverlayOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [showStepTwo, stepTwoGridTranslateY, stepTwoBottomOverlayOpacity, slide2OutTranslateY, slide2OutOpacity]);

  useEffect(() => {
    const onHardwareBack = () => {
      if (showStepTwo) {
        setShowStepTwo(false);
        stepTwoGridTranslateY.setValue(height);
        stepTwoBottomOverlayOpacity.setValue(0);
        slide2OutTranslateY.setValue(0);
        slide2OutOpacity.setValue(1);
        return true;
      }
      if (currentSlide > 0) {
        setCurrentSlide((s) => s - 1);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [showStepTwo, currentSlide, stepTwoGridTranslateY, stepTwoBottomOverlayOpacity, slide2OutTranslateY, slide2OutOpacity]);

  const slide = slides[currentSlide];

  return (
    <View style={styles.root}>
      {/* Main animated background (always visible; step-two uses it too) */}
      <View style={styles.step1Wrap}>
        <View style={styles.posterWrapper}>
          {moviePosters.map((column, i) => (
            <FloatingColumn key={i} posters={column} columnIndex={i} isAtTop={i % 2 === 0} />
          ))}
        </View>
        <LinearGradient
          colors={['rgba(0,108,157,0.35)', 'rgba(0,24,35,0.75)']}
          locations={[0, 0.5]}
          style={StyleSheet.absoluteFill}
        />
        {/* Slide 0 & 1 content: slides up and fades out when going to step 3 */}
        <Animated.View
          pointerEvents={showStepTwo ? 'none' : 'auto'}
          style={[
            styles.content,
            {
              opacity: slide2OutOpacity,
              transform: [{ translateY: slide2OutTranslateY }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.slide,
              {
                opacity: slideFadeAnim,
                transform: [
                  { translateX: slideSlideAnim },
                  {
                    scale: slideScaleAnim,
                  },
                  {
                    rotateZ: slideSlideAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0deg', '5deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.slideContent}>
              <Image source={slide.image} style={styles.poster} resizeMode="contain" />
              <View style={styles.bottomContainer}>
                <Image source={slide.playImg} style={styles.playBtn} />
                <View style={styles.textBox}>
                  <Text style={styles.title}>{slide.title}</Text>
                  {slide.title1 ? <Text style={styles.title}>{slide.title1}</Text> : null}
                  {slide.desc ? <Text style={styles.desc}>{slide.desc}</Text> : null}
                </View>
              </View>
            </View>
          </Animated.View>
          <View style={styles.btnWrap}>
            <Button
              title={t('login.next')}
              onPress={onNext}
              buttonStyle={currentSlide === slides.length - 1 ? styles.nextButtonGreen : styles.nextButtonBlue}
            />
          </View>
        </Animated.View>
      </View>

      {/* 🔹 Step 2: Same content & animation as OnboardingStepTwo, in-place (no navigate to OnboardingScreen2) */}
      {/* Third slide: movie grid animates from bottom; rank icon, text and button same as 2nd (static) */}
      {showStepTwo && (
        <View style={styles.step2Overlay} pointerEvents="box-none">
          <View style={styles.step2Content} pointerEvents="box-none">
            <Animated.View
              style={[styles.posterWrapperStep2, { transform: [{ translateY: stepTwoGridTranslateY }] }]}
            >
              {moviePostersStep2.map((column, index) => (
                <FloatingColumnStep2
                  key={index}
                  posters={column}
                  columnIndex={index}
                  isUpward={index % 2 === 0}
                  animated={false}
                />
              ))}
            </Animated.View>
            {/* Play icon in grid area (above text/button), per reference image */}
            {/* <View style={styles.centerPlayWrapper}> */}
              {/* <View style={styles.playButtonShadow}>
                <Image source={imageIndex.WatchNowButton2} style={styles.largePlayIcon} />
              </View> */}
            </View>
          {/* </View> */}
          {/* Dark overlay: text + Next button only */}
          <Animated.View
            style={[styles.step2BottomOverlay, { opacity: stepTwoBottomOverlayOpacity }]}
            pointerEvents="box-none"
          >
            <View style={styles.step2BottomOverlayBlack} pointerEvents="none" />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.55)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
             <View style={styles.playButtonShadow}>
                <Image source={imageIndex.WatchNowButton2} style={styles.largePlayIcon} />
              </View>
            <Text style={styles.headingStep2}>{t('onboarding.moreYouRate')}</Text>
            <View style={styles.step2BottomOverlayButtonWrap}>
              <Button
                title={t('common.next')}
                onPress={goToInitialScreen}
                textStyle={{ color: '#FFFFFF', fontFamily: font.PoppinsBold }}
                buttonStyle={styles.nextButtonGreen}
              />
            </View>
          </Animated.View>
        </View>
      )}
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
    paddingBottom: 72,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  step1Wrap: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  step2Overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  step2Content: {
    flex: 1,
  },
  posterWrapperStep2: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: height * 0.75,
    overflow: 'hidden',
  },
  columnStep2: {
    position: 'absolute',
    width: columnWidthStep2,
  },
  posterContainerStep2: {
    marginBottom: POSTER_GAP_STEP2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a2a3a',
  },
  posterStep2: {
    width: columnWidthStep2,
    height: posterHeightStep2,
  },
  centerPlayWrapper: {
    position: 'absolute',
    bottom: 220,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  playButtonShadow: {
    shadowColor: '#35C75A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
    alignSelf:'center'
  },
  largePlayIcon: {
    width: 68,
    height: 68,
  },
  step2BottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    zIndex: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
  },
  step2BottomOverlayBlack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    marginTop:90
  },
  headingStep2: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
    fontFamily: font.PoppinsBold,
    marginBottom: 20,
  },
  step2BottomOverlayButtonWrap: {
    width: '100%',
  },
  nextButtonBlue: {
    backgroundColor: '#00A8F5',
    borderRadius: 8,
   },
  nextButtonGreen: {
    backgroundColor: '#35C75A',
    borderRadius: 8,
   },
});