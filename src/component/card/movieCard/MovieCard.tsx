// import React from 'react';
// import { Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import imageIndex from '@assets/imageIndex';
// import { Color } from '@theme/color';
// import font from '@theme/font';
 




// interface Props {

//   onPress: () => void;
// }

// const MovieCard: React.FC<Props> = React.memo(({ item, onPress }) => {
 //   // Alert.alert(item)
//   // const  rank = item.action
//   return (
//     <TouchableOpacity onPress={onPress}>
//       <ImageBackground source={{uri : item.cover_image_url}} style={styles.movieCard} imageStyle={styles.imageBackground}>
//         <View style={styles.overlay}>
//           <RankingCard ranked={item.ranked} />
//         </View>
//         <Text
//          allowFontScaling={false}
//          style={{color:'red'}} >
//           {item.id}
//         </Text>
//       </ImageBackground>
//     </TouchableOpacity>
//   );
// });

// const styles = StyleSheet.create({
//   movieCard: {
//     width: 110,
//     height: 170,
//     borderRadius: 10,
//     overflow: 'hidden',
//     marginHorizontal: 5,
//   },
//   imageBackground: {
//     borderRadius: 10,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     padding: 4,
//   },
//   icon: {
//     height: 36,
//     width: 36,
//   },
//   rating: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },


// });

// export default MovieCard;
