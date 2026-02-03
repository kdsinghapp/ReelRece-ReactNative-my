
import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

const shimmerColors = ['#181818ff', '#464545ff', '#181717ff'];

const ShimmerGroupItem = () => {
  return (
    <View style={styles.groupItem}>
      <LinearGradient
        colors={['#1a1a1a', '#1a1a1a']}
        style={styles.gradientContainer}
      >
        {/* Left: Profile Image */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.userImage}
        />

        {/* Right: Text Section */}
        <View style={styles.textContainer}>
          {/* Title line */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
            style={styles.titleLine}
          />

          {/* Subtitle line */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
            style={styles.subTitleLine}
          />

          {/* Time line (small right side) */}
          <View style={styles.timeRow}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
              style={styles.timeLine}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  groupItem: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    height: 92,
    borderRadius: 20,
    backgroundColor: "#181818",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleLine: {
    width: "60%",
    height: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  subTitleLine: {
    width: "80%",
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  timeLine: {
    width: 40,
    height: 10,
    borderRadius: 5,
  },
});

export default ShimmerGroupItem;
