
import React, { useState, useRef, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Popover from "react-native-popover-view";
  import RankingCard from "@components/ranking/RankingCard";
import { Color } from "@theme/color";
import font from "@theme/font";
import { t } from "i18next";

interface RankingWithInfoProps {
  score: number;
  title?: string;
  description?: string;
  loading?: boolean;
}
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const RankingWithInfo: React.FC<RankingWithInfoProps> = ({
  score,
  title = t("discover.recscore"),
  description = t("discover.moviedes"),
  // description = "This score predicts how much you'll enjoy this movie/show.",
  loading
}) => {
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const touchableRef = useRef(null);
 
 
  const handlePress = (event: string) => {
    const { pageY } = event.nativeEvent;

    // Bottom me space kam hai to top, warna bottom
    if (screenHeight - pageY < 225) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    };
    setVisible(true);
  };
  return (
    <View style={styles.container}>
      {/* <Popover
  isVisible={visible}
  from={touchableRef}
  onRequestClose={() => setVisible(false)}
  placement={placement}
  backgroundStyle={{ backgroundColor: "rgba(0,0,0,0)" }} // transparent backdrop
  // popoverStyle={{ backgroundColor: Color.primary }}       // popover background
   popoverStyle={{
    backgroundColor: Color.primary,
    borderWidth: 1,        // ✅ border visible
    borderColor:  "rgba(0,0,0,0)", 
    borderRadius: 8,       // ✅ rounded corners
  }}
  arrowStyle={{ borderTopColor: Color.primary }}          // arrow color (top arrow)
>

        <View style={styles.tooltipBox}>
          {title ? <Text style={styles.tooltipTitle}>{title}</Text> : null}
          {description ? (
            <Text style={styles.tooltipDescription}>{description}</Text>
          ) : null}
        </View>
      </Popover> */}

      <Popover
        isVisible={visible}
        from={touchableRef}
        onRequestClose={() => setVisible(false)}
        placement={placement}
        backgroundStyle={{ backgroundColor: "rgba(0,0,0,0)" }}
        popoverStyle={{
          backgroundColor: Color.primary,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0)",
          borderRadius: 8,
        }}
        arrowStyle={{ borderTopColor: Color.primary }}
      >
        <View style={styles.tooltipBox}>
          {title ? <Text style={styles.tooltipTitle}>{title}</Text> : null}
          {description ? (
            <Text style={styles.tooltipDescription}>{description}</Text>
          ) : null}
        </View>
      </Popover>



      {/* {loading ? (
  <ShimmerPlaceHolder
    LinearGradient={LinearGradient}
    style={styles.shimmerBox}
  />
) : ( */}
      <TouchableOpacity
        ref={touchableRef}
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.cardWrapper,{
         }]}
      >
   <RankingCard ranked={score} loading={loading} />
 

      </TouchableOpacity>
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 0,
    zIndex: 22,
    overflow: "visible",
    justifyContent: "center",
    marginLeft:5
  },
  cardWrapper: {},
  tooltipBox: {
    backgroundColor: Color.primary,
    padding: 12,
    borderRadius: 12,
    width: screenWidth - 24,
    // marginHorizontal:16,
    // maxWidth: screenWidth - 34, // Safe margin from edges
    alignSelf: "center",
  },
  tooltipTitle: {
    color: Color.whiteText,
    fontSize: 16,
    fontFamily: font.PoppinsBold,
    marginBottom: 4,
    textAlign: "center",
  },
  tooltipDescription: {
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    lineHeight: 18,
    textAlign: "center",
  },
  shimmerBox: { width: 60, height: 30, borderRadius: 8 },

});

export default memo(RankingWithInfo);


