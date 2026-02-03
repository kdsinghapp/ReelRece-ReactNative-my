import React from 'react';
import { View, ScrollView, Dimensions, StyleSheet } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
 import ScreenNameEnum from '@routes/screenName.enum';
import { SafeAreaView } from 'react-native-safe-area-context';
import imageIndex from '@assets/imageIndex';
import { CustomStatusBar, HeaderCustom } from '@components/index';

const { height: windowHeight } = Dimensions.get('window');

interface MovieDetailsShimmerProps {
  ITEM_HEIGHT?: number;
  navigation?: object | string | number;
}

const shimmerColors = ['#1a1a1a', '#2a2a2a', '#1a1a1a'];

const MovieDetailsShimmer: React.FC<MovieDetailsShimmerProps> = ({ ITEM_HEIGHT, navigation }) => {
  return (
    <SafeAreaView style={{ height: ITEM_HEIGHT, backgroundColor: '#000', flex: 1 ,   }}>
      {/* Header Shimmer */}
      {/* <SafeAreaView style={{ backgroundColor: effectiveBackgroundColor }} /> */}
      <CustomStatusBar />
      <View style={styles.headerContainer}>
        
        <HeaderCustom
          backIcon={imageIndex.backArrow}
          rightIcon={imageIndex.search}
          onRightPress={() => navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' })}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Poster */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.poster}
        />

        {/* Title */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.title}
        />

        {/* Sub Info Row */}
        <View style={styles.subInfoRow}>
          <ShimmerPlaceholder LinearGradient={LinearGradient} shimmerColors={shimmerColors} style={styles.subInfo(40)} />
          <ShimmerPlaceholder LinearGradient={LinearGradient} shimmerColors={shimmerColors} style={styles.subInfo(60)} />
          <ShimmerPlaceholder LinearGradient={LinearGradient} shimmerColors={shimmerColors} style={styles.subInfo(80)} />
        </View>

        {/* Rec Score & Friend Score */}
        <View style={styles.scoreRow}>
          <ShimmerPlaceholder LinearGradient={LinearGradient} shimmerColors={shimmerColors} style={styles.scoreBox} />
          <ShimmerPlaceholder LinearGradient={LinearGradient} shimmerColors={shimmerColors} style={styles.scoreBox} />
        </View>

        {/* Description */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.description}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MovieDetailsShimmer;

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  scrollContainer: { paddingHorizontal: 10 },
  poster: {
    height: windowHeight / 3.8,
    width: '100%',
    borderRadius: 8,
  },
  title: {
    height: 45,
    width: '60%',
    marginTop: 16,
    borderRadius: 4,
  },
  subInfoRow: { flexDirection: 'row', marginTop: 10 },
  
  subInfo: (width: number) => ({
    height: 12,
    width,
    marginRight: 10,
    borderRadius: 4,
  }),
  scoreRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  scoreBox: {
    height: 32,
    width: 100,
    borderRadius: 8,
  },
  description: {
    height: 110,
    width: '100%',
    marginTop: 16,
    borderRadius: 4,
  },
});


// import { ScrollView, StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
// import { CustomStatusBar, HeaderCustom } from '@components'
// import imageIndex from '@assets/imageIndex'
// import ScreenNameEnum from '@routes/screenName.enum'

// const MovieDetailsShimmer = ({ITEM_HEIGHT , }) => {
//   return (
//       <View style={{ height: ITEM_HEIGHT, backgroundColor: '#000', flex: 1 }}>
//         {/* Header Shimmer */}
//         <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
//           <CustomStatusBar />
//           <HeaderCustom
//             backIcon={imageIndex.backArrow}
//             rightIcon={imageIndex.search}
//             onRightPress={() => navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' })}
//             onBackPress={() => navigation.goBack()}
//           />
//           {/* <View style={{ flex: 1, marginLeft: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
//             <ShimmerPlaceHolder
//               visible={!isLoading}
//               LinearGradient={LinearGradient}
//               shimmerColors={shimmerColors}
//               style={{ height: 24, width: 24, borderRadius: 12 }}
//             />
//           </View> */}
//         </View>

//         <ScrollView contentContainerStyle={{ paddingHorizontal: 10 }}>
//           {/* Poster */}

//           <ShimmerPlaceholder
//             visible={!isLoading}
//             LinearGradient={LinearGradient}
//             shimmerColors={shimmerColors}
//             style={{
//               height: windowHeight / 3.8,
//               width: '100%',
//               borderRadius: 8,
//             }}
//           />

//           {/* Title */}
//           <ShimmerPlaceholder
//             visible={!isLoading}
//             LinearGradient={LinearGradient}
//             shimmerColors={shimmerColors}
//             style={{
//               height: 45,
//               width: '60%',
//               marginTop: 16,
//               borderRadius: 4,
//             }}
//           />

//           {/* Sub Info Row */}
//           <View style={{ flexDirection: 'row', marginTop: 10, }}>
//             <ShimmerPlaceholder
//               visible={!isLoading}
//               LinearGradient={LinearGradient}
//               shimmerColors={shimmerColors}
//               style={{ height: 12, width: 40, marginRight: 10, borderRadius: 4 }}
//             />
//             <ShimmerPlaceholder
//               visible={!isLoading}
//               LinearGradient={LinearGradient}
//               shimmerColors={shimmerColors}
//               style={{ height: 12, width: 60, marginRight: 10, borderRadius: 4 }}
//             />
//             <ShimmerPlaceholder
//               visible={!isLoading}
//               LinearGradient={LinearGradient}
//               shimmerColors={shimmerColors}
//               style={{ height: 12, width: 80, borderRadius: 4 }}
//             />
//           </View>

//           {/* Rec Score and Friend Score Placeholders */}
//           <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
//             <ShimmerPlaceholder
//               visible={!isLoading}
//               LinearGradient={LinearGradient}
//               shimmerColors={shimmerColors}
//               style={{ height: 32, width: 100, borderRadius: 8, marginRight: 16 }}
//             />
//             <ShimmerPlaceholder
//               visible={!isLoading}
//               LinearGradient={LinearGradient}
//               shimmerColors={shimmerColors}
//               style={{ height: 32, width: 100, borderRadius: 8 }}
//             />
//           </View>

//           {/* Description */}
//           <ShimmerPlaceholder
//             visible={!isLoading}
//             LinearGradient={LinearGradient}
//             shimmerColors={shimmerColors}
//             style={{
//               height: 110,
//               width: '100%',
//               marginTop: 16,
//               borderRadius: 4,
//             }}
//           />

//           {/* Action Buttons */}

//         </ScrollView>
//       </View>
//   )
// }

// export default MovieDetailsShimmer

// const styles = StyleSheet.create({})