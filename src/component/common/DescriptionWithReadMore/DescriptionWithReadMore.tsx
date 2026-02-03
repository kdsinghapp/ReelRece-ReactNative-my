// import React, { useState, useMemo, useEffect } from 'react';
// import { Text, StyleSheet, TouchableOpacity, TextStyle, View, Pressable } from 'react-native';
// import { Color } from '@theme/color';
// import font from '@theme/font';
 
// interface Props {
//   description: string;
//   onViewMore: () => void;
//   descriptionStyle?: TextStyle;
//   titleLines?: number; // 1 or 2
// }

// export const DescriptionWithReadMore: React.FC<Props> = ({
//   description,
//   onViewMore,
//   descriptionStyle,
//   titleLines = 1,
// }) => {
//   const [wordLimit, setWordLimit] = useState(titleLines === 1 ?145   : 90);

//   useEffect(() => {
//     // adjust word limit dynamically when titleLines changes
//     setWordLimit(titleLines === 1 ? 145 : 90);
//   }, [titleLines]);


//   const cleanAndFormatText = (str: string): string => {
//     if (!str) return '';
//     return str
//       .replace(/\\'/g, "'") // fix I\'m → I'm
//       .replace(/\s+/g, ' ') // collapse extra spaces
//       .replace(/\n\s*\n/g, '\n\n') // keep paragraph breaks
//       .trim();
//   };

//   const trimmedText = useMemo(() => {
//     const cleaned = cleanAndFormatText(description);
//     if (cleaned.length <= wordLimit) return cleaned;

//     // avoid cutting in middle of word
//     const cutoffIndex = cleaned.lastIndexOf(' ', wordLimit);
//     return cleaned.slice(0, cutoffIndex > 0 ? cutoffIndex : wordLimit).trim() + '... ';
//   }, [description, wordLimit]);


//   if (!description || description.trim() === '') {
//     return (
//       <Text  style={[styles.defaultText, descriptionStyle]}>
//         No description available.
//       </Text>
//     );
//   }



//   return (
//     // <TouchableOpacity onPress={onViewMore} activeOpacity={0.8}>
//     <View>

//       <CustomText
//         size={14}
//         color={Color.lightGrayText}
//         style={[styles.defaultText, descriptionStyle]}
//         font={font.PoppinsRegular}
//         numberOfLines={titleLines === 1 ? 6 : 4} // dynamic lines based on title
//         ellipsizeMode="tail"
//       >
//         {trimmedText}
//         {/* <Pressable onPress={onViewMore} 
      
//          >
//           <CustomText
//             size={13}
//             color={Color.whiteText}
//             style={{
//                  top:5
//             }}
//             font={font.PoppinsMedium}
//           >
//             View more
//           </CustomText>
//         </Pressable> */}
//       </CustomText>
//     {/* </TouchableOpacity> */}
//     </View>

//   );
// };

// const styles = StyleSheet.create({
//   defaultText: {
//     color: Color.whiteText,
//     fontFamily: font.PoppinsRegular,
//     fontSize: 14,
//     lineHeight: 20,
//     // textAlign:'justify',
//   },
//   viewMoreText: {
//     color: Color.whiteText,
//     fontFamily: font.PoppinsBold,
//     // marginLeft:-50,
//     // zIndex:22,
//   },
// });

import React, { useState, useMemo, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextStyle,
} from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
 import { ScrollView } from 'react-native-gesture-handler';
import CustomText from '../CustomText/CustomText';
import { t } from 'i18next';

interface Props {
  description: string;
  onViewMore: () => void;
  descriptionStyle?: TextStyle;
  titleLines?: number;
}

export const DescriptionWithReadMore: React.FC<Props> = ({
  description,
  descriptionStyle,
  titleLines = 1,
}) => {
  const [wordLimit, setWordLimit] = useState(titleLines === 1 ? 145 : 90);

  useEffect(() => {
    setWordLimit(titleLines === 1 ? 145 : 90);
  }, [titleLines]);

  const cleanAndFormatText = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/\\'/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  const trimmedText = useMemo(() => {
    const cleaned = cleanAndFormatText(description);
    if (cleaned.length <= wordLimit) return cleaned;
    return cleaned.slice(0, wordLimit).trim();
  }, [description, wordLimit]);

  if (!description?.trim()) {
    return (
      <Text style={[styles.defaultText, descriptionStyle]}>
        {t("emptyState.nodata")}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vertical scroll inside horizontal scroll */}
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={true}
        // contentContainerStyle={{height:100}}
      >
        <CustomText
          size={14}
          color={Color.lightGrayText}
          style={[styles.defaultText, descriptionStyle]}
          font={font.PoppinsRegular}
        >
          {description}  
        </CustomText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // maxHeight: 60, // 👈 REQUIRED for scrolling
  },
  defaultText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsRegular,
    fontSize: 14,
    lineHeight: 20,
  },
});
