// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { Color } from '@theme/color';
// import font from '@theme/font';

// const LayeredShadowText = ({ text = "1", fontSize = 60, shadowColor = 'white', marginRight=0, marginLeft=0 }) => {
//     return (
//         <View style={[styles.container,
//              { height: fontSize * 1.2 , marginRight:marginRight,marginLeft:marginLeft  }]}  
//              pointerEvents="none"
//                renderToHardwareTextureAndroid={true}
        
        
//         > {/* Reduced container height */}
//             {/* Reduced shadow layers */}
//             {[
//                 // Only using 4-directional shadow instead of 8
//                 { x: -1.2, y: 0 },  // left
//                 { x: 1.2, y: 0 },   // right
//                 { x: 0, y: -1.2 },  // top
//                 { x: 0, y: 1.2 },   // bottom
//                 { x: -1.3, y: -1.3 },  // diagonals
//                 { x: 1.3, y: -1.3 },
//                 { x: -1.3, y: 1.3 },
//                 { x: 1.3, y: 1.3 },
//             ].map((offset, index) => (
//                 <Text 
//                 allowFontScaling={false}
//                     key={index}
//                     style={[
//                         styles.shadowText,
//                         {
//                             fontSize,
//                             textShadowOffset: { width: offset.x, height: offset.y },
//                             textShadowRadius: 1,  // Reduced shadow blur
//                             textShadowColor: shadowColor,
//                         },
//                     ]}
//                 >
//                     {text}
//                 </Text>
//             ))}

//             {/* Foreground text */}
               
//             <Text   allowFontScaling={false} style={[styles.mainText, { fontSize }]}>{text}</Text>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         justifyContent: 'center',
//         alignItems: 'center',
//         // includeFontPadding: false
//     },
//     shadowText: {
//         position: 'absolute',
//         color: Color.whiteText,
//         fontWeight: 'bold',
//         includeFontPadding: false,
//         textAlign: 'center',
//         fontFamily: font.PoppinsBold,
//          zIndex: -1,
//     },
//     mainText: {
//         color: Color.background,
//         fontWeight: 'bold',
//         includeFontPadding: false,
//         textAlign: 'center',
//         fontFamily: font.PoppinsBold,
//         backgroundColor: 'transparent' // Ensures text background is transparent
//     },
// });

// export default LayeredShadowText;


import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';

const LayeredShadowText = ({ 
  text = "1", 
  fontSize = 60, 
  shadowColor = 'white', 
  marginRight = 3, 
  marginLeft = 0 
}) => {
  const str = String(text ?? "");

  const offsets = [
    { x: -1.2, y: 0 },  // left
    { x: 1.2, y: 0 },   // right
    { x: 0, y: -1.2 },  // top
    { x: 0, y: 1.2 },   // bottom
    { x: -1.3, y: -1.3 },  // diagonals
    { x: 1.3, y: -1.3 },
    { x: -1.3, y: 1.3 },
    { x: 1.3, y: 1.3 },
  ];

  return (
    <View
      style={[
        styles.container,
        { height: fontSize * 1.2, marginRight, marginLeft }
      ]}
      pointerEvents="none"
      renderToHardwareTextureAndroid={true}
    >
      {offsets.map((offset, index) => (
        <Text
          allowFontScaling={false}
          key={index}
          style={[
            styles.shadowText,
            {
              fontSize,
              ...(Platform.OS === 'ios' && {
                textShadowOffset: { width: offset.x, height: offset.y },
                textShadowRadius: 1,
                textShadowColor: shadowColor,
              }),
              // Android will just rely on positioned layers
              transform: Platform.OS === 'android'
                ? [{ translateX: offset.x }, { translateY: offset.y }]
                : undefined,
            },
          ]}
        >
          {str}
        </Text>
      ))}

      {/* Foreground text */}
      <Text allowFontScaling={false} style={[styles.mainText, { fontSize }]}>
        {str}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowText: {
    position: 'absolute',
    color: Color.whiteText,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlign: 'center',
    fontFamily: font.PoppinsBold,
    // zIndex: -1,
  },
  mainText: {
    color: Color.background,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlign: 'center',
    fontFamily: font.PoppinsBold,
    backgroundColor: 'transparent',
  },
});

export default LayeredShadowText;
