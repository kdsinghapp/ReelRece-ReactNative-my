
import { Color } from "@theme/color";
import font from "@theme/font";
import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface CustomReviewInputProps extends TextInputProps {
  text: string;
  setText: (val: string) => void;
  placeholderTextColor?: string; // Optional prop for placeholder text color
}

export default React.forwardRef<TextInput, CustomReviewInputProps>(function CustomReviewInput({
  style,
  text, setText,
  placeholderTextColor,

  ...props

}, ref) {
  const [isFocused, setIsFocused] = useState(false);

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
          ref={ref}
          placeholderTextColor={Color.textGray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={(val) => setText(val)}
          value={text}
          style={styles.input}
          multiline={true}
          // textAlignVertical="top"
          {...props}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    // marginVertical: 12,
  },
  container: {
    flexDirection: "row",
    minHeight: 50,
    maxHeight: 200, // Approximately 10-12 lines
    backgroundColor: Color.gray,
    borderRadius: 10,
    borderWidth: 1, // border dikhane ke liye zaroori
    paddingHorizontal: 12,
    width: width * 0.90,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    lineHeight: 18,
    color: Color.whiteText,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8, // Initial centering and multiline padding
    textAlignVertical: 'center',
  },
});

