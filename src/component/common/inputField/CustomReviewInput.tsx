
import { Color } from "@theme/color";
import font from "@theme/font";
import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
 

interface CustomReviewInputProps extends TextInputProps {
  text: string;
  setText: (val: string) => void;
  placeholderTextColor?: string; // Optional prop for placeholder text color
}

export default function CustomReviewInput({
  style,
    text, setText,
    placeholderTextColor,
    
  ...props

}: CustomReviewInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // condition: active tab ya text available tab border color show
  const showBorder = isFocused || text.length > 0;

  return (
    <View style={styles.wrapper}>
      <View
         style={[
          styles.container,
          {
            borderColor: showBorder ? Color.primary : "transparent",
       
          },
          style,
        ]}
      >
        <TextInput
        allowFontScaling={false}
        // allowFontScaling={false}
          ref={inputRef}
          placeholderTextColor={Color.textGray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={(val) => setText(val)}
          value={text}
          style={styles.input}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // marginVertical: 12,
  },
  container: {
    flexDirection: "row",
    height: 50,
    backgroundColor: Color.grey,
    borderRadius: 10,
    borderWidth: 1, // border dikhane ke liye zaroori
    paddingHorizontal: 12
  },
  input: {
    flex: 1,
    fontSize: 14,
    marginTop:3,
    alignItems:'center',
    justifyContent:'center',
    fontFamily: font.PoppinsRegular,
    lineHeight: 18,
    color: Color.whiteText,
  },
});

