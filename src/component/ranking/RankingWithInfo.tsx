
import React, { useState, useRef, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Popover from "react-native-popover-view";
import RankingCard from "@components/ranking/RankingCard";
import { Color } from "@theme/color";
import font from "@theme/font";
import { t } from "i18next";

interface RankingWithInfoProps {
  score?: number | string | null;
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
  const isProcessingPress = useRef(false);

  const handlePress = (event: any) => {
    // 1. Immediate lock (much faster than state) to prevent duplicate triggers
    if (isProcessingPress.current || visible) return;
    isProcessingPress.current = true;

    // 2. Clear the lock after a safe window to allow future legitimate taps
    setTimeout(() => {
      isProcessingPress.current = false;
    }, 1000);

    // 3. Wait for the next frame before opening (user's "wait then load")
    // This allows Android's layout/coords to settle
    requestAnimationFrame(() => {
      const pageY = event?.nativeEvent?.pageY;
      if (pageY && screenHeight - pageY < 225) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }
      setVisible(true);
    });
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={touchableRef}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={visible} // Disable triggering while already active
        style={[styles.cardWrapper, {
        }]}
      >
        <RankingCard ranked={score ?? '?'} loading={loading} />
      </TouchableOpacity>

      <Popover
        isVisible={visible}
        from={touchableRef}
        onRequestClose={() => setVisible(false)}
        placement={placement}
        showInModal={true} // Using native modal mode is more stable on Android
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
    marginLeft: 5
  },
  cardWrapper: {},
  tooltipBox: {
    backgroundColor: Color.primary,
    padding: 12,
    borderRadius: 12,
    width: screenWidth - 24,
    alignSelf: "center",
  },
  tooltipTitle: {
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsSemiBold,
    marginBottom: 4,
    textAlign: "center",
  },
  tooltipDescription: {
    color: Color.whiteText,
    fontSize: 13,
    fontFamily: font.PoppinsRegular,
    lineHeight: 18,
    textAlign: "center",
  },
  shimmerBox: { width: 60, height: 30, borderRadius: 8 },

});

export default memo(RankingWithInfo);


