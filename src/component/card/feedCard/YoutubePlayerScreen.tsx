import imageIndex from "@assets/imageIndex";
import CustomText from "@components/common/CustomText/CustomText";
import { Button } from "@components/index";
import { RootState } from "@redux/store";
import ScreenNameEnum from "@routes/screenName.enum";
import useWelcome from "@screens/Auth/welcome/useWelcome";
import { Color } from "@theme/color";
import font from "@theme/font";
import { t } from "i18next";
import React, { useEffect, useRef } from "react";
import { View, Image, Animated, Dimensions, StyleSheet } from "react-native";
import { useSelector } from "react-redux";


const { width } = Dimensions.get("window");
const columnWidth = 120;
const posterHeight = 180;
const posterGap = 12;
const horizontalGap = 14;

// Dummy Posters
const moviePosters = [
  [imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23],
  [imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23],
  [imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23],
  [imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23],
];

const YoutubePlayerScreen = () => {
  const { navigation } = useWelcome()
  const token = useSelector((state: RootState) => state.auth.token)
  const userProfile = useSelector((state: RootState) => state.auth.userGetData);

  const goToInitialScreen = () => {
    if (token) {
      navigation.replace(ScreenNameEnum.TabNavigator, {
        screen: ScreenNameEnum.RankingTab,
      });
    } else {
      navigation.navigate(ScreenNameEnum.LoginScreen);
    }

  };

  return (
    <View style={styles.container}>
      {/* Poster Columns */}
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
        {/* Overlays */}
        <View style={styles.overlayLeft} />
        <View style={styles.overlayRight} />
        <View style={styles.overlayColor} />
        <View style={styles.overlayColorCenter} />
        <View style={styles.overlayBottom} />
        <View style={styles.contentWrapper}>
          <View style={styles.contentWrapp}>
            <Image source={imageIndex.appLogo} style={styles.logo} resizeMode='contain' />
            <CustomText
              size={28}
              color={Color.primary}
              style={styles.heading}
              font={font.PoppinsRegular}
            >
              {t("common.findgreat")}

            </CustomText>
            {/* <Text style={styles.heading}>Find Great Shows and Movies in Seconds</Text> */}
            <CustomText
              size={16}
              color={Color.primary}
              style={styles.subHeading}
              font={font.PoppinsRegular}
            >
              {t("common.delivering")}
            </CustomText>
            {/* <Text style={styles.subHeading}>
                        
                    </Text> */}
          </View>
          {/* <Button title="Get Started" onPress={goToInitialScreen} /> */}

          {/* <Button title='Get Started' onPress={() => navigation.navigate(ScreenNameEnum.LoginScreen)} /> */}
          <Button
            title={t("common.get_started")}

            onPress={() => { goToInitialScreen() }}
          />
        </View>
      </View>
    </View>
  );
};

// Floating Column Component
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
    height: 774,
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
    marginBottom: posterGap, // vertical gap
    borderRadius: 12,
  },
  overlayLeft: {
    position: "absolute",
    width: columnWidth / 2,
    height: "100%",
    top: 0,
    left: 0,
    // backgroundColor: "rgba(0,0,0,0.8)", // first column half hide
  },
  overlayRight: {
    position: "absolute",
    width: "100%",
    // width: columnWidth / 2,
    height: "100%",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0, 108, 157,0.3)", // last column half hide
  },
  overlayColor: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: "80%",
    left: 0,
    backgroundColor: "rgba(18, 18, 18, 0.8)"
  },
  overlayColorCenter: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: "70%",
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  overlayBottom: {
    position: "absolute",
    width: "100%",
    height: "50%",
    top: "60%",
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: Color.whiteText,
    textAlign: 'center',
    // marginBottom: 6,
  },
  subHeading: {
    fontSize: 16,
    color: Color.whiteText,
    textAlign: 'center',
    marginBottom: 20,
    // paddingHorizontal: 10,
    marginTop: 18,
    lineHeight: 22
  },
  contentWrapper: {
    marginHorizontal: 16,
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  contentWrapp: {
    alignItems: 'center',
  },
});

export default YoutubePlayerScreen;










// import React, { useEffect, useRef } from "react";
// import { View, Image, Animated, Dimensions, StyleSheet } from "react-native";
// import imageIndex from '@assets/imageIndex";

// const { width } = Dimensions.get("window");

// const moviePosters = [
//   [ imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23 ],
//   [ imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23 ],
//   [ imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23 ],
//   [ imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23 ],
// ];

// const YoutubePlayerScreen = () => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.posterWrapper}>
//         {moviePosters.map((column, columnIndex) => {
//           const isAtTop = columnIndex % 2 === 0;
//           return (
//             <FloatingColumn
//               key={`column-${columnIndex}`}
//               posters={column}
//               columnIndex={columnIndex}
//               isAtTop={isAtTop}
//             />
//           );
//         })}
//       </View>
//       {/* Overlays */}
//       <View style={styles.overlayLeft} />
//       <View style={styles.overlayColor} />
//       <View style={styles.overlayBottom} />
//     </View>
//   );
// };

// // Floating Column Component
// const FloatingColumn = ({ posters, columnIndex, isAtTop }) => {
//   const translateY = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const direction = isAtTop ? -130 : 130;

//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(translateY, {
//           toValue: direction,
//           duration: 5000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(translateY, {
//           toValue: 0,
//           duration: 5000,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, [translateY, isAtTop]);

//   return (
//     <Animated.View
//       style={[
//         styles.column,
//         {
//           left: columnIndex * 110,
//           top: isAtTop ? 104 : 0,
//           transform: [{ translateY }],
//         },
//       ]}
//     >
//       {posters.map((poster, posterIndex) => (
//         <Image
//           key={`poster-${columnIndex}-${posterIndex}`}
//           source={poster}
//           style={styles.poster}
//           resizeMode="cover"
//         />
//       ))}
//     </Animated.View>
//   );
// };

// // const styles = StyleSheet.create({
// //   container: {
// //     position: "absolute",
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     height: 744,
// //     overflow: "hidden",
// //   },
// //   posterWrapper: {
// //     position: "relative",
// //     width: "100%",
// //     height: "100%",
// //     top: -124,
// //     left: -186,
// //   },
// //   column: {
// //     position: "absolute",
// //     width: 140,
// //     height: 864,
// //     flexDirection: "column",
// //     alignItems: "flex-start",
// //     justifyContent: "flex-start",
// //     gap: 12,
// //   },
// //   poster: {
// //     width: "100%",
// //     height: 207,
// //     marginBottom: 12,
// //   },
// //   overlayLeft: {
// //     position: "absolute",
// //     width: "100%",
// //     height: "100%",
// //     top: 0,
// //     left: 0,
// //     backgroundColor: "rgba(0,0,0,0.6)", // linear-gradient को RN में सीधे support नहीं करता
// //   },
// //   overlayColor: {
// //     position: "absolute",
// //     width: "100%",
// //     height: "100%",
// //     top: 0,
// //     left: 0,
// //     backgroundColor: "#006c9d22",
// //   },
// //   overlayBottom: {
// //     position: "absolute",
// //     width: "100%",
// //     height: "60%",
// //     top: "40%",
// //     left: 0,
// //     backgroundColor: "rgba(0,0,0,0.8)", // Gradient के लिए react-native-linear-gradient use करें
// //   },
// // });
// const styles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 744,
//     overflow: "hidden",
//   },
//   posterWrapper: {
//     position: "relative",
//     width: width,   // अब स्क्रीन की चौड़ाई के हिसाब से
//     height: "100%",
//     top: -124,
//     left: 0,        // ❌ पहले -186 था, अब 0 किया
//   },
//   column: {
//     position: "absolute",
//     width: 110,
//     height: 864,
//     flexDirection: "column",
//     alignItems: "flex-start",
//     justifyContent: "flex-start",
//   },
//   poster: {
//     width: "100%",
//     height: 207,
//     marginBottom: 12,
//   },
//   overlayLeft: {
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     top: 0,
//     left: 0,
//     backgroundColor: "rgba(0,0,0,0.6)",
//   },
//   overlayColor: {
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     top: 0,
//     left: 0,
//     backgroundColor: "#006c9d22",
//   },
//   overlayBottom: {
//     position: "absolute",
//     width: "100%",
//     height: "60%",
//     top: "40%",
//     left: 0,
//     backgroundColor: "rgba(0,0,0,0.8)",
//   },
// });

// export default YoutubePlayerScreen;





// import React, { useRef, useEffect } from "react";
// import {
//   View,
//   Image,
//   StyleSheet,
//   FlatList,
//   Dimensions,
// } from "react-native";
// import imageIndex from '@assets/imageIndex";

// const { width } = Dimensions.get("window");

// const images = [
//   imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23,
//   imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23,
//   imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23,
//   imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23,
//   imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23,
//   imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23,
//   imageIndex.welcomePost23, imageIndex.welcomePost23, imageIndex.welcomePost23,
// ];

// export default function YoutubePlayerScreen() {
//   // Refs for 5 columns
//   const listRefs = Array.from({ length: 4 }, () => useRef(null));

//   useEffect(() => {
//     // y offset for each column
//     let yOffsets = [200, 90, 50, 150,];

//     const interval = setInterval(() => {
//       listRefs.forEach((ref, i) => {
//         // different speed for each column
//         yOffsets[i] += 1 + i; // col-1 speed 1, col-2 speed 2, etc
//         ref.current?.scrollToOffset({
//           offset: yOffsets[i],
//           animated: false,
//         });

//         // reset when reaching bottom
//         if (yOffsets[i] > images.length * 200) {
//           yOffsets[i] = i * 50; // restart with little offset
//         }
//       });
//     }, 30); // smooth scroll

//     return () => clearInterval(interval);
//   }, []);

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Image source={item} style={styles.image} />
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {listRefs.map((ref, i) => (
//         <FlatList
//           key={i}
//           ref={ref}
//           data={images}
//           renderItem={renderItem}
//           keyExtractor={(_, idx) => `${i}-${idx}`}
//           showsVerticalScrollIndicator={false}
//         />
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row", // 5 columns side by side
//     flex: 1,
//     backgroundColor: "#000",
//     paddingTop: 40,
//   },
//   card: {
//     margin: 5,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#222",
//   },
//   image: {
//     width: width / 5 - 15, // 5 columns fit screen
//     height: 200,
//     resizeMode: "cover",
//   },
// });







// import React, { useRef, useEffect, useState } from "react";
// import {
//   View,
//   Image,
//   StyleSheet,
//   Animated,
//   FlatList,
//   Dimensions,
// } from "react-native";
// import imageIndex from '@assets/imageIndex";

// const { width } = Dimensions.get("window");

// const images = [
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
//   imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,  imageIndex.welcomePost23,
// ];

// export default function YoutubePlayerScreen() {
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       let nextIndex = currentIndex + 1;
//       if (nextIndex >= images.length) {
//         nextIndex = 0; // reset to start
//       }
//       flatListRef.current?.scrollToIndex({
//         index: nextIndex,
//         animated: true,
//       });
//       setCurrentIndex(nextIndex);
//     }, 400); // 2 sec interval

//     return () => clearInterval(interval);
//   }, [currentIndex]);

//   return (
//     <View style={styles.container}>
//       <Animated.FlatList
//         ref={flatListRef}
//         data={images}
//         keyExtractor={(_, index) => index.toString()}
//         numColumns={2}
//         showsVerticalScrollIndicator={false}
//         onScroll={Animated.event(
//           [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//           { useNativeDriver: true }
//         )}
//         renderItem={({ item, index }) => {
//           const inputRange = [-1, 0, 140 * index, 150 * (index + 2)];
//           const scale = scrollY.interpolate({
//             inputRange,
//             outputRange: [0.7, 0.7, 0.7, 0],
//           });

//           return (
//             <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
//               <Image source={item} style={styles.image} />
//             </Animated.View>
//           );
//         }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//     paddingTop: 40,
//   },
//   card: {
//     flex: 1,
//     margin: 5,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#222",
//   },
//   image: {
//     width: width / 2 - 20,
//     height: 200,
//     resizeMode: "cover",
//   },
// });





