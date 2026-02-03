import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
 
const shimmerColors = ['#181818ff', '#464545ff', '#181717ff'];

const NormalMovieCardShimmer = () => {
  return (
    <View style={styles.cardContainer}>
      {/* Left Poster Shimmer */}
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
       shimmerColors={shimmerColors}
        style={styles.poster}
      />

      {/* Right Info Section */}
      <View style={styles.infoContainer}>
        {/* Title shimmer */}
     <View>
           <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.title}
        />
        {/* Year shimmer */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.year}
        />
     </View>
        {/* Bottom icons shimmer */}
        {/* <View style={styles.iconRow}>
<View style={styles.rankingContainer} >
    <RankingCardShimmer />
</View>

          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
            style={styles.icon}
          />
         
        </View> */}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    marginTop: 14,
    alignItems: "center",
  },
  poster: {
    width: 98,
    height: 135,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    flexDirection:'row',
    justifyContent: "space-between",
    height: 135,
    paddingVertical: 6,
  },
  title: {
    width: "78%",
    height: 18,
    borderRadius: 6,
  },
  year: {
    width: "30%",
    height: 14,
    marginTop: 10,
    borderRadius: 6,
  },
  iconRow: {
    flexDirection: "row",
    marginTop: 20,
    backgroundColor:'red'
    // alignItems:'center',
  },
  rankingContainer:{
    marginRight:10,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 18,
  },
});

export default NormalMovieCardShimmer;
