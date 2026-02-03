import React from "react";
import { Image, Text } from "react-native";
import { Color } from "@theme/color";
import font from "@theme/font";
// ✅ Pure Component
const TabIcon = React.memo(({ focused, logo, logo1, label }) => (
  <>
    <Image
      source={focused ? logo1 : logo}
      style={{ width: 20, height: 20, resizeMode: "contain" }}
    />
    {label && (
      <Text
        numberOfLines={1}
        style={{
          fontFamily: focused ? font.PoppinsBold : font.PoppinsRegular,
          color: focused ? Color.primary : Color.lightGrayText,
          fontSize: 12,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    )}
  </>
));
export default TabIcon;
