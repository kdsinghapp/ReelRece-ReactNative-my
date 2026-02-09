import imageIndex from "@assets/imageIndex";
import React, { useEffect, useRef, useState } from "react";
import { View, Image, Animated, Dimensions, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import useWelcome from "./useWelcome";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import ScreenNameEnum from "@routes/screenName.enum";
import { Button, CustomStatusBar } from "@components/index";
import CustomText from "@components/common/CustomText/CustomText";
import { Color } from "@theme/color";
import font from "@theme/font";

// ✅ add this
import { useTranslation } from "react-i18next";
import { getRatedMovies } from "@redux/Api/movieApi";
import LoadingModal from "@utils/Loader";

const { width } = Dimensions.get("window");
const columnWidth = 120;
const posterHeight = 170;
const posterGap = 12;
const horizontalGap = 14;

const moviePosters = [
  [imageIndex.welcomePost1, imageIndex.welcomePost2, imageIndex.welcomePost3, imageIndex.welcomePost4, imageIndex.welcomePost5, imageIndex.welcomePost6],
  [imageIndex.welcomePost7, imageIndex.welcomePost8, imageIndex.welcomePost9, imageIndex.welcomePost10, imageIndex.welcomePost11, imageIndex.welcomePost12],
  [imageIndex.welcomePost13, imageIndex.welcomePost14, imageIndex.welcomePost15, imageIndex.welcomePost16, imageIndex.welcomePost17, imageIndex.welcomePost18],
  [imageIndex.welcomePost19, imageIndex.welcomePost20, imageIndex.welcomePost21, imageIndex.welcomePost22],
];

const Welcome = () => {
  const { navigation } = useWelcome();
  const token = useSelector((state: RootState) => state.auth.token);
  const userProfile = useSelector((state: RootState) => state.auth.userGetData);
  const [valid, setValid] = useState(true)
  const [loading, setLoading] = useState(true)
useEffect(()=>{
  bothBookMovie()
},[])
  // ✅ add this
  const { t } = useTranslation();

  const goToInitialScreen = () => {
    if (userProfile?.email_id && valid) {
      navigation.replace(ScreenNameEnum.TabNavigator, {
        screen: ScreenNameEnum.RankingTab,
      });
            // navigation.navigate(ScreenNameEnum.OnboardingScreen);

    } else {
      navigation.navigate(ScreenNameEnum.LoginScreen);
    }
  };


  const bothBookMovie = async () => {
      setLoading(true);
      try {
        const response = await getRatedMovies(token);
         // setMovies(response?.results || []);
      } catch (error) {
       
        if(error?.status == 401){
          setValid(false)
         }
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="transparent" translucent />
{/* {loading && <LoadingModal visible={loading}/>} */}
      <View style={styles.posterWrapper}>
        {moviePosters.map((column, columnIndex) => {
          const isAtTop = columnIndex % 2 === 0;
          return (
            <FloatingColumn
              key={`column-${columnIndex}`}
              posters={column}
              columnIndex={columnIndex}
              isAtTop={isAtTop}
            />
          );
        })}
      </View>

      <View style={styles.container}>
        <View style={styles.overlayLeft} />

        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.11)",
            "rgba(0, 0, 0, 0.9)",
            "rgba(0, 0, 0, 0.9)",
          ]}
          locations={[0, 0.4, 0.7]}
          style={styles.gradientOverlay}
        />

        <View style={styles.overlayColor} />

        <LinearGradient
          colors={["rgba(0, 108, 157,0.2)", "rgba(0, 108, 157,0.25)"]}
          style={styles.overlayRight}
        />

        <View style={styles.contentWrapper}>
          <View style={styles.contentWrapp}>
            <Image source={imageIndex.appLogo} style={styles.logo} resizeMode="stretch" />

            <CustomText
              size={28}
              color={Color.primary}
              style={styles.heading}
              font={font.PoppinsBold}
            >
              {t("welcome.title")}
            </CustomText>

            <CustomText
              size={16}
              color={Color.primary}
              style={styles.subHeading}
              font={font.PoppinsRegular}
            >
              {t("welcome.subtitle")}
            </CustomText>
          </View>

          <Button
            textStyle={{ color: "#FFFFFF" }}
            title={t("common.get_started")}
            onPress={goToInitialScreen}
          />
        </View>
      </View>
    </View>
  );
};

// Floating Column Component (no string changes needed)
const FloatingColumn = ({ posters, columnIndex, isAtTop }) => {
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

  return (
    <Animated.View
      style={[
        styles.column,
        {
          left: columnIndex * (columnWidth + horizontalGap),
          top: isAtTop ? 104 : 0,
          transform: [{ translateY }],
        },
      ]}
    >
      {posters.map((poster, posterIndex) => (
        <Image
          key={`poster-${columnIndex}-${posterIndex}`}
          source={poster}
          style={styles.poster}
          resizeMode="cover"
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    overflow: "hidden",
  },
  posterWrapper: {
    position: "relative",
    width: width + columnWidth,
    height: "100%",
    top: -124,
    left: -(columnWidth / 2),
    flexDirection: "row",
  },
  column: {
    position: "absolute",
    width: columnWidth,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  poster: {
    width: "100%",
    height: posterHeight,
    marginBottom: posterGap,
    borderRadius: 12,
  },
  overlayLeft: {
    position: "absolute",
    width: columnWidth / 2,
    height: "100%",
    top: 0,
    left: 0,
  },
  overlayRight: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    right: 0,
  },
  gradientOverlay: {
    position: "absolute",
    width: "100%",
    height: "28%",
    bottom: "17%",
    left: 0,
  },
  overlayColor: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: "80%",
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.99)",
  },
  logo: {
    width: 60,
    height: 72,
    marginBottom: 10,
    marginTop: 5,
    borderRadius: 8,
  },
  heading: {
    fontSize: 28,
    color: Color.whiteText,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    color: Color.whiteText,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 18,
    lineHeight: 22,
  },
  contentWrapper: {
    marginHorizontal: 16,
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  contentWrapp: {
    alignItems: "center",
  },
});

export default Welcome;
