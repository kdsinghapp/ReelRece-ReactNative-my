// import React from "react";
// import { View } from "react-native";
// import NormalMovieCardShimmer from "./NormalMovieCardShimmer";
// type Props = {
//   count: number; // कितने shimmer cards दिखाने हैं
// };

// const NormalMovieCardShimmerList = ({ count }: Props) => {
//   return (
//     <View>
//       {Array.from({ length: count }).map((_, index) => (
//         <NormalMovieCardShimmer key={index.toString()} />
//       ))}
//     </View>
//   );
// };

// export default NormalMovieCardShimmerList;



import React from "react";
import { View, FlatList } from "react-native";
import NormalMovieCardShimmer from "./NormalMovieCardShimmer";

const NormalMovieCardShimmerList = ({ count }: { count: number }) => {
  const data = Array.from({ length: count });

  return (
    <FlatList
      data={data}
      keyExtractor={(_, index) => index.toString()}
      renderItem={() => <NormalMovieCardShimmer />}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      scrollEnabled={false} // अगर scroll outer container handle कर रहा है
    />
  );
};

export default NormalMovieCardShimmerList;
