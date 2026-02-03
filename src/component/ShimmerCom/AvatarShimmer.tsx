import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

// shimmer placeholder create
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const AvatarShimmer = ({
  count = 5, 
  size = 60,
  borderRadius = 60,
  gap = 12,
  shimmerColors = ['#181818ff', '#464545ff', '#181717ff'],
  containerStyle,
}: null | number| string | StyleProp<ViewStyle>) => {
  return (
    <View style={[styles.row, containerStyle]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ marginRight: gap }}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            shimmerStyle={{
              height: size,
              width: size,
              borderRadius: borderRadius,
            }}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:10,
  },
});

export default AvatarShimmer;
