import { Dimensions } from 'react-native';
import React, { memo } from 'react';
import Svg, { Path, Text as SvgText, Image as SvgImage, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
 import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import RankingCardShimmer from './RankingCardShimmer';
 
type Props = {
  ranked: number | string;
  loading?: boolean;
};

const RankingCard: React.FC<Props> = ({ ranked, loading = false }) => {
  // Handle undefined or null values properly
  const safeRanked = ranked ?? "";
  const rankNum = parseFloat(String(safeRanked));

  const windowHeight = Dimensions.get('window').height * 0.05;
  const windowWidth = Dimensions.get('window').width * 0.088;

  let backgroundColor = "#CA462A";
  let showBackArrow = false;

  if (!isNaN(rankNum)) {
    if (rankNum === -1.0 || rankNum === 0.0 || rankNum == -1) {
      backgroundColor = Color.primary;
      showBackArrow = true;
    } else if (rankNum < 3.34) {
      backgroundColor = "#CA462A";
    } else if (rankNum <= 6.7) {
      backgroundColor = "#eac613";
    } else if (rankNum > 6.7) {
      backgroundColor = "#6ED989";
    }
  }

  // Ensure displayText is always a valid string, never undefined
  const displayText = !isNaN(rankNum)
    ? rankNum === 10
      ? "10"
      : rankNum.toFixed(1)
    : String(safeRanked || "");

  // ========================
  // Shimmer logic
  // ========================
  if (loading) {
    return <RankingCardShimmer />; // अगर loading true तो सिर्फ shimmer show होगा
  }


  // ========================
  // Normal card
  // ========================
  return (
    <Svg width={windowWidth} height={windowHeight} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"
        fill={backgroundColor}
        transform="rotate(90 8 8)"
      />
      {showBackArrow ? (
        <SvgImage x={1} y={5} width={11} height={11} preserveAspectRatio="xMidYMid meet" href={imageIndex.questionMark} />
      ) : (
        <SvgText
          x="7"
          y="10"
          fill={Color.whiteText}
          fontSize="5.5"
          fontWeight="bold"
          fontFamily={font.PoppinsBold}
          textAnchor="middle"
        >
          {displayText} 
        </SvgText>
      )}
    </Svg>
  );
};

export default memo(RankingCard);





// // // import { Dimensions, Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
// // // import React, { useState } from 'react'
// // // import Svg, { Path, Defs, Filter, FeDropShadow ,  Text as SvgText  } from 'react-native-svg';
 
 // // // type Props = {
// // //     ranked: number | string;
// // // };

// // // // const RankingCard:React.FC<Props> = ({ranked}) => {
// // // const RankingCard:React.FC<Props> = ({  ranked }) => {
// // //   // imageIndex.rankredImg <= 5.0
// // //   // imageIndex.rankyellowImg <= 7.0
// // //   // imageIndex.rankgreenImg  <= 10.0



// // //   // const withoutFloating = rankingdataWithoutData
// // //  const rankNum = parseFloat(String(ranked));
// // // const [letShowImage , setLetShowImage] = useState(false);
// // // const windowHeight = Dimensions.get('window').height * 0.05
// // // const windowWidth = Dimensions.get('window').width * 0.088
// // // let backgroundImage = imageIndex.rankredImg; // default

// // // if (!isNaN(rankNum)) {
// // //   if (rankNum <= -1.0) {

// // //     backgroundImage = Color.primary;
// // //     setLetShowImage(true)
// // //   } else if (rankNum <= 5.0) {
// // //     backgroundImage = "#CA462A";
// // //   } else if (rankNum <= 7.0) {
// // //     backgroundImage = "#eac613";
// // //   } else {
// // //     backgroundImage = "#6ED989";
// // //   }
// // // }.0

// // //   return (
// // //     <>

// // //  <Svg
// // //     width={windowWidth}
// // //     height={windowHeight}
// // //     viewBox="0 0 16 16"
// // //     fill="none"
// // //   >
// // //     <Path
// // //       d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"
// // //       fill={  backgroundImage  }
// // //       transform="rotate(90 8 8)"  
// // //       // Rotate 90 degrees around the center (8,8)
// // //     />
// // //      {letShowImage ? (
// // //         // Render arrow image over SVG
// // //         <Image
// // //           source={imageIndex.backArrow}
// // //           style={{
// // //             position: 'absolute',
// // //             left: 0,
// // //             top: 0,
// // //             height: windowHeight,
// // //             width: windowWidth,
// // //             resizeMode: 'contain',
// // //           }}
// // //         />
// // //       ) : (
// // //         <SvgText
// // //           x="7"
// // //           y="10"
// // //           fill={Color.whiteText}
// // //           fontSize="5.5"
// // //           fontWeight="bold"
// // //           fontFamily={font.PoppinsBold}
// // //           textAnchor="middle"
// // //         >
// // //           {!isNaN(rankNum) ? rankNum.toFixed(1) : ranked}
// // //         </SvgText>
// // //       )}
// // //   </Svg>


  
// // //     </>
  
// // //   )
// // // }

// // // export default RankingCard

// // // const styles = StyleSheet.create({
// // //  ranking:{
// // //      height:46,
// // //      width:46,
// // //      alignItems:'center',
// // //      justifyContent:'center',
// // //      paddingBottom:4,
// // //      resizeMode:'contain',
// // //      paddingRight:6,
// // //     //  paddingTop:2,
// // //     //  paddingLeft:10,
     
// // //    },
// // //      rankingText:{
// // //       color: Color.whiteText,
// // //   fontFamily:font.PoppinsBold,
// // //       fontSize: 12,
// // //     },

// // //   text: {
// // //     position: 'absolute',
// // //     color: 'black',
// // //     fontWeight: 'bold',
// // //     fontSize: 16,
// // //   },
 
// // // })


// // import { Dimensions, Image, StyleSheet, View } from 'react-native'
// // import React from 'react'
// // import Svg, { Path, Text as SvgText } from 'react-native-svg';
// // import imageIndex from '../../assets/imageIndex'
// // import { Color } from '../../theme/color'
// // import font from '../../theme/font'

// // type Props = {
// //   ranked: number | string;
// // };

// // const RankingCard: React.FC<Props> = ({ ranked }) => {
// //   const rankNum = parseFloat(String(ranked));

// //   const windowHeight = Dimensions.get('window').height * 0.05
// //   const windowWidth = Dimensions.get('window').width * 0.088

// //   let backgroundColor = "#CA462A"; // default
// //   let showBackArrow = false;

// //   if (!isNaN(rankNum)) {
// //     if (rankNum === -1.0) {
// //       backgroundColor = Color.primary;
// //       showBackArrow = true;
// //     } else if (rankNum <= 5.0) {
// //       backgroundColor = "#CA462A";
// //     } else if (rankNum <= 7.0) {
// //       backgroundColor = "#eac613";
// //     } else {
// //       backgroundColor = "#6ED989";
// //     }
// //   }

// //   return (
// //     <Svg
// //       width={windowWidth}
// //       height={windowHeight}
// //       viewBox="0 0 16 16"
// //       fill="none"
// //     >
// //       <Path
// //         d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"
// //         fill={backgroundColor}
// //         transform="rotate(90 8 8)"
// //       />

// //       {showBackArrow ? (
// //         // Render arrow image over SVG
// //         <View  style={{justifyContent:'center',alignItems:'center'}} >
// //   <Image
// //           source={imageIndex.questionMark}
// //           style={{
// //             height: windowHeight * 0.8,
// //             width: windowWidth * 0.8,
// //             resizeMode: 'contain',
// //           }}
// //         />
// //         </View>
// //       ) : (
// //         <SvgText
// //           x="7"
// //           y="10"
// //           fill={Color.whiteText}
// //           fontSize="5.5"
// //           fontWeight="bold"
// //           fontFamily={font.PoppinsBold}
// //           textAnchor="middle"
// //         >
// //           {!isNaN(rankNum) ? rankNum.toFixed(1) : ranked}
// //         </SvgText>
// //       )}
// //     </Svg>
// //   )
// // }

// // export default RankingCard


// // const styles = StyleSheet.create({
// //  ranking:{
// //      height:46,
// //      width:46,
// //      alignItems:'center',
// //      justifyContent:'center',
// //      paddingBottom:4,
// //      resizeMode:'contain',
// //      paddingRight:6,
// //     //  paddingTop:2,
// //     //  paddingLeft:10,
     
// //    },
// //      rankingText:{
// //       color: Color.whiteText,
// //   fontFamily:font.PoppinsBold,
// //       fontSize: 12,
// //     },

// //   text: {
// //     position: 'absolute',
// //     color: 'black',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
 
// // })


// //    {/* Background shape */}
// //       // <Path
// //       //   d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"
// //       //   fill={backgroundColor}
// //       //   transform="rotate(90 8 8)"
// //       // />



// import { Dimensions, Easing, StyleSheet } from 'react-native'
// import React, { memo } from 'react'
// import Svg, { Path, Text as SvgText, Image as SvgImage, Defs, Stop } from 'react-native-svg';
// import imageIndex from '../../assets/imageIndex'
// import { Color } from '../../theme/color'
// import font from '../../theme/font'
// import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
// import LinearGradient from 'react-native-linear-gradient';
// import { Rect } from 'react-native-popover-view';
// import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// type Props = {
//   ranked: number | string;
//    loading?: boolean; // shiimer from ranking screen
// };

// const RankingCard: React.FC<Props> = ({ ranked , loading}) => {
//   const rankNum = parseFloat(String(ranked));

//   const windowHeight = Dimensions.get('window').height * 0.05
//   const windowWidth = Dimensions.get('window').width * 0.088
//   let backgroundColor = "#CA462A"; // default
//   let showBackArrow = false;

//   if (!isNaN(rankNum)) {
//     if (rankNum === -1.0 || rankNum === 0.0 || rankNum == -1 || rankNum ==- 1) {
 //       backgroundColor = Color.primary;
//       showBackArrow = true;
//     } else if (rankNum <  3.34) {
//       backgroundColor = "#CA462A";
//     } else if (rankNum <= 6.7) {
//       backgroundColor = "#eac613";
//     }   else if (rankNum > 6.7) {
//       backgroundColor =  "#6ED989"  
//     } else {
//       backgroundColor = "#6ED989";
//     }
//   };
//   const displayText = !isNaN(rankNum)
//   ? rankNum === 10
//     ? "10"
//     : rankNum.toFixed(1)
//   : ranked;


//  const shimmerProgress = useSharedValue(0);
//   shimmerProgress.value = withRepeat(
//     withTiming(1, { duration: 1000, easing: Easing.linear }),
//     -1,
//     false
//   );


// if (loading) {
//     return (
//       <Svg width={windowWidth} height={windowHeight}>
//         <Defs>
//           <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
//             <Stop offset="0%" stopColor="#dddddd" />
//             <Stop offset="50%" stopColor="#eeeeee" />
//             <Stop offset="100%" stopColor="#dddddd" />
//           </LinearGradient>
//         </Defs>

//         {/* Shimmer rectangle same size as SVG */}
//         <Rect width={windowWidth} height={windowHeight} fill="url(#grad)" />
//       </Svg>
//     );
//   }



//   return (
//     <Svg
//       width={windowWidth}
//       height={windowHeight}
//       viewBox="0 0 16 16"
//       fill="none"
//     >
//       {/* Background shape */}
//       <Path
//         d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"
//         fill={backgroundColor}
//         transform="rotate(90 8 8)"
//       />

//       {showBackArrow ? (
//         // Centered image inside SVG
//         <SvgImage
//           x={0} // x position
//           y={4} // y position
//           width={12}
//           height={12}
//           preserveAspectRatio="xMidYMid meet"
//           href={imageIndex.questionMark} // PNG/JPG local asset
//         />
//       ) : (
//         <SvgText
//           x="7"   // center X
//           y="10"  // center Y
//           fill={Color.whiteText}
//           fontSize="5.5"
//           fontWeight="bold"
//           fontFamily={font.PoppinsBold}
//           textAnchor="middle"
//         >
//           {/* {!isNaN(rankNum) ? rankNum.toFixed(1) : ranked} */}
//           {displayText}
//         </SvgText>
//       )}
//     </Svg>
//   )
// }

// export default memo(RankingCard)
