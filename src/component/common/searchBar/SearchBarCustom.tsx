import imageIndex from "@assets/imageIndex";
import { useNavigation } from "@react-navigation/native";
import { Color } from "@theme/color";
import font from "@theme/font";
import { t } from "i18next";
import React from "react";
import { View, TextInput, Image, StyleSheet, TouchableOpacity, Pressable } from "react-native";
 
interface SearchBarProps {
  placeholder?: string;
  onSearchChange?: (text: string) => void;
  onSubmitSearch?: () => void;
  onpress?: () => void;
  editable?: boolean;
  value?: string;
  placeholderTextColor?: string;
  closeIm?: boolean;
  invide?: boolean;
}

const SearchBarCustom: React.FC<SearchBarProps> = ({
  // invide, closeIm, placeholderTextColor = "#8C8C8C", placeholder = "Search...", onSearchChange, value  
  invide,
  closeIm,
  placeholderTextColor = Color.placeHolder,
  placeholder = t("common.search"),
  onSearchChange,
  onSubmitSearch,
  onpress,
  editable,
  value,

}
) => {
  const navgation = useNavigation()
  return (
    <View style={closeIm && styles.imgBack} >
      {closeIm && <TouchableOpacity onPress={() => navgation.goBack()}>
        <Image source={imageIndex.backArrow} style={{
          height: 24,
          width: 24,

        }}

          resizeMode="contain"
        />
      </TouchableOpacity>
      }

      <Pressable onPress={onpress}
        style={[
          styles.searchBar,
          {
            marginHorizontal: closeIm && 18,
            borderWidth: invide && 1,
            borderColor: invide && "rgba(118, 118, 118, 1)",
          },
        ]}
      >
        <Image source={imageIndex.search} style={styles.icon} resizeMode="cover" />
        <TextInput
          editable={editable}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          onChangeText={onSearchChange}
          onSubmitEditing={onSubmitSearch} //  Add this line
          value={value}

        />
        {closeIm && (
          <Image
            source={imageIndex.closeWhite}
            style={{ height: 16, width: 16 }}
            resizeMode="contain"
          />
        )}
      </Pressable>
    </View>

  );
};
const styles = StyleSheet.create({
  imgBack: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12
  },

  searchBar: {
  backgroundColor: Color.grey,
  borderRadius: 44,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 14,
  marginVertical: 8,
  height: 45,
},

input: {
  flex: 1,
  fontSize: 14,
  color: Color.whiteText,
  marginLeft: 4,
  paddingVertical: 0,     // 🔥 Fix vertical alignment
  includeFontPadding: false,
  fontFamily: font.PoppinsRegular,
},
icon: {
  height: 20,
  width: 20,
  marginRight:0,
},

  // searchBar: {
  //   backgroundColor: Color.grey,
  //   borderRadius: 44,
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 14,
  //   // paddingVertical: 6,
  //   marginVertical: 8,
  //   height:45

  // },
  // icon: {
  //   height: 20,
  //   width: 20,
  //   resizeMode: "contain",
  // },
  // input: {
  //   flex: 1,
  //   fontSize: 14,
  //   color: Color.whiteText,
  //   marginLeft: 5,
  //   height: 45,
  //   fontFamily: font.PoppinsRegular,
  //   textAlignVertical: "center",
  //   lineHeight:45,
  //   marginTop:3.5

  // },
});

export default SearchBarCustom;
