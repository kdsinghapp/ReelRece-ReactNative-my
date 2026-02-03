import imageIndex from '@assets/imageIndex';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import useWelcome from '@screens/Auth/welcome/useWelcome';
import { RootState } from '@redux/store';
import ScreenNameEnum from '@routes/screenName.enum';
import { Button, CustomStatusBar } from '@components/index';
import CustomText from '@components/common/CustomText/CustomText';
import font from '@theme/font';
import { t } from 'i18next';

const { width, height } = Dimensions.get('window');

/* ----------------------------------
   LAYOUT CONSTANTS
-----------------------------------*/
const HORIZONTAL_PADDING = 15;
const POSTER_GAP = 10;
const totalAvailableWidth = width - HORIZONTAL_PADDING * 2;
const columnWidth = (totalAvailableWidth - POSTER_GAP * 2) / 3;
const posterHeight = columnWidth * 1.45;

/* ----------------------------------
   POSTERS DATA
-----------------------------------*/
const moviePosters = [
  [
    imageIndex.SingleMovi,
    imageIndex.SingleMovie4,
    imageIndex.SingleMovie7,
    imageIndex.LargePortraitPoster,
  ],
  [
    imageIndex.SingleMovieSlide2,
    imageIndex.SingleMovie5,
    imageIndex.SingleMovie8,
    imageIndex.LargePortraitPoster1,
  ],
  [
    imageIndex.SingleMovieSlide3,
    imageIndex.SingleMovie6,
    imageIndex.SingleMovie9,
    imageIndex.LargePortraitPoster2,
  ],
];

/* ----------------------------------
   MAIN SCREEN
-----------------------------------*/
const OnboardingStepTwo = () => {
  const { navigation } = useWelcome();
  const token = useSelector((state: RootState) => state.auth.token);

  const goToInitialScreen = () => {
    navigation.reset({
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
                  routes: [
                    {
                      name: ScreenNameEnum.RankingScreen,
                      params: { openTooltipModal: true },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
  };

  return (
    <ImageBackground
      source={imageIndex.Introduction}
      style={styles.container}
    >
      <CustomStatusBar
        backgroundColor="#0A1628"
        barStyle="light-content"
      />

      {/* 🔹 Animated Posters */}
      <View style={styles.posterWrapper}>
        {moviePosters.map((column, index) => (
          <FloatingColumn
            key={index}
            posters={column}
            columnIndex={index}
            isUpward={index % 2 === 0}
          />
        ))}
      </View>

      {/* 🔹 Gradient Overlay */}
      <LinearGradient
        colors={[
          'rgba(10,22,40,0)',
          'rgba(10,22,40,0.6)',
          'rgba(10,22,40,0.95)',
        ]}
        locations={[0, 0.7, 1]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      {/* 🔹 Center Play Button */}
      <View style={styles.centerPlayWrapper}>
        <View style={styles.playButtonShadow}>
          <Image
            source={imageIndex.WatchNowButton2}
            style={styles.largePlayIcon}
          />
        </View>
      </View>

      {/* 🔹 Text */}
      <View style={styles.textWrapper}>
        <CustomText
          size={18}
          color="#FFFFFF"
          style={styles.heading}
          font={font.PoppinsBold}
        >
          {t("onboarding.moreYouRate")}
        </CustomText>
      </View>

      {/* 🔹 Bottom Button */}
      <View style={styles.bottomContent}>
        <Button
          title={t("common.next")}
          onPress={goToInitialScreen}
          textStyle={{
            color: '#FFFFFF',
            fontFamily: font.PoppinsBold,
          }}
          buttonStyle={styles.button}
        />
      </View>
    </ImageBackground>
  );
};

/* ----------------------------------
   FLOATING COLUMN
-----------------------------------*/
interface FloatingColumnProps {
  posters:string;
  columnIndex: number;
  isUpward: boolean;
}

const FloatingColumn: React.FC<FloatingColumnProps> = ({
  posters,
  columnIndex,
  isUpward,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const distance = isUpward ? -40 : 40;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: distance,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.column,
        {
          left:
            HORIZONTAL_PADDING +
            columnIndex * (columnWidth + POSTER_GAP),
          transform: [{ translateY }],
        },
      ]}
    >
      {posters.map((poster, i) => (
        <View key={i} style={styles.posterContainer}>
          <Image source={poster} style={styles.poster} />
        </View>
      ))}
    </Animated.View>
  );
};

/* ----------------------------------
   STYLES
-----------------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  posterWrapper: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: height * 0.75,
    overflow: 'hidden',
  },

  column: {
    position: 'absolute',
    width: columnWidth,
  },

  posterContainer: {
    marginBottom: POSTER_GAP,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a2a3a',
  },

  poster: {
    width: columnWidth,
    height: posterHeight,
  },

  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  centerPlayWrapper: {
    position: 'absolute',
    bottom: 220,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },

  textWrapper: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },

  playButtonShadow: {
    shadowColor: '#35C75A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },

  largePlayIcon: {
    width: 68,
    height: 68,
  },

  heading: {
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },

  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    zIndex: 5,
  },

  button: {
    backgroundColor: '#35C75A',
    borderRadius: 8,
    paddingVertical: 16,
  },
});

export default OnboardingStepTwo;
