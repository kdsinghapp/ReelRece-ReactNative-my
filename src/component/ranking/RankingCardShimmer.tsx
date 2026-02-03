// import React, { useEffect } from "react";
// import { Dimensions } from "react-native";
// import Svg, { Path, Defs, LinearGradient, Stop, Mask, Rect } from "react-native-svg";
// import Animated, {
//   useSharedValue,
//   withRepeat,
//   withTiming,
//   useAnimatedProps,
//   Easing,
// } from "react-native-reanimated";

// type Props = {
//   loading?: boolean;
// };

// const AnimatedRect = Animated.createAnimatedComponent(Rect);

// const RankingCardShimmer: React.FC<Props> = ({ loading = true }) => {
//   const windowHeight = Dimensions.get("window").height * 0.05;
//   const windowWidth = Dimensions.get("window").width * 0.088;

//   const progress = useSharedValue(0);

//   useEffect(() => {
//     progress.value = withRepeat(
//       withTiming(1, { duration: 1200, easing: Easing.linear }),
//       -1,
//       false
//     );
//   }, []);

//   const animatedProps = useAnimatedProps(() => ({
//     x: progress.value * windowWidth * 2 - windowWidth, // gradient move
//   }));

//   if (!loading) return null;

//   return (
//     <Svg width={windowWidth} height={windowHeight} viewBox="0 0 16 16" fill="none">
//       <Defs>
//         <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
//           <Stop offset="0%" stopColor="#dddddd" stopOpacity={1} />
//           <Stop offset="50%" stopColor="#eeeeee" stopOpacity={1} />
//           <Stop offset="100%" stopColor="#dddddd" stopOpacity={1} />
//         </LinearGradient>

//         <Mask id="mask">
//           <Path
//             d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"
//             fill="white"
//             transform="rotate(90 8 8)"
//           />
//         </Mask>
//       </Defs>

//       {/* Animated shimmer rectangle */}
//       <AnimatedRect
//         width={windowWidth * 1.5} // gradient slightly larger than mask
//         height={windowHeight}
//         fill="url(#grad)"
//         mask="url(#mask)"
//         animatedProps={animatedProps}
//       />
//     </Svg>
//   );
// };

// export default RankingCardShimmer;



import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Mask, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedProps,
  Easing,
} from "react-native-reanimated";

type Props = {
  loading?: boolean;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const RankingCardShimmer: React.FC<Props> = ({ loading = true }) => {
  const windowHeight = Dimensions.get("window").height * 0.05;
  const windowWidth = Dimensions.get("window").width * 0.088;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    x: progress.value * windowWidth * 2 - windowWidth, // gradient move
  }));

  if (!loading) return null;

  return (
    <Svg width={windowWidth} height={windowHeight} viewBox="0 0 16 16" fill="none">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#181818ff" stopOpacity={1} />
          <Stop offset="50%" stopColor="#464545ff" stopOpacity={1} />
          <Stop offset="100%" stopColor="#181717ff" stopOpacity={1} />
        </LinearGradient>

        <Mask id="mask">
          <Path
            d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"
            fill="white"
            transform="rotate(90 8 8)"
          />
        </Mask>
      </Defs>

      <AnimatedRect
        width={windowWidth * 1.5} 
        height={windowHeight}
        fill="url(#grad)"
        mask="url(#mask)"
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

export default RankingCardShimmer;

