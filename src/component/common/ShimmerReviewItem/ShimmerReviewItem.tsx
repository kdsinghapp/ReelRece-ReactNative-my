import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

const ShimmerReviewItem = () => {
  return (
    <View style={styles.reviewContainer}>
      {/* Top Row */}
      <View style={styles.row}>
        {/* Avatar */}
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={["#181818ff", "#464545ff", "#181717ff"]}
          style={styles.avatar}
        />

        <View style={styles.info}>
          {/* Name */}
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            shimmerColors={["#181818ff", "#464545ff", "#181717ff"]}
            style={styles.name}
          />
          {/* Date */}
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            shimmerColors={["#181818ff", "#464545ff", "#181717ff"]}
            style={styles.date}
          />
        </View>

        {/* Score badge */}
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={["#181818ff", "#464545ff", "#181717ff"]}
          style={styles.score}
        />
      </View>

      {/* Comment text */}
      <View style={{ marginTop: 10 }}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={["#181818ff", "#464545ff", "#181717ff"]}
          style={styles.line}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={["#181818ff", "#464545ff", "#181717ff"]}
          style={styles.line}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={["#181818ff", "#464545ff", "#181717ff"]}
          style={[styles.line, { width: "70%" }]}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );
};

export default ShimmerReviewItem;

const styles = StyleSheet.create({
  reviewContainer: {
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    width: "50%",
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  date: {
    width: "30%",
    height: 14,
    borderRadius: 4,
  },
  score: {
    width: 40,
    height: 24,
    borderRadius: 12,
    marginLeft: 10,
  },
  line: {
    width: "100%",
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#2c2c2c",
    marginTop: 10,
  },
});
