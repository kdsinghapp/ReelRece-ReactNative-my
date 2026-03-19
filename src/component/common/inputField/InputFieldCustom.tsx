

import { View, TextInput, Image, TouchableOpacity } from 'react-native';
import React, { useRef, useState } from 'react';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';

export default function InputFieldCustom({ validSuccess = undefined, ...props }) {
  const [showPassword, setShowPassword] = useState(props.hide);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(props.text || "");
  const inputRef = useRef(null);

  const onChangeText = (value: string) => {
    setText(value);
    if (props.onChangeText) {
      props.onChangeText(value);
    }
  };
  const showBorder = isFocused || text.length > 0;

  return (
    <View style={{ marginVertical: 8 }}>
      <View style={{ position: 'relative' }}>
        <View
          style={[
            {
              flexDirection: 'row',
              backgroundColor: Color.gray,
              height: 48,
              borderRadius: 10,
              paddingHorizontal: 12,
              alignItems: 'center',
              // borderWidth: 0.8,
              // borderColor: showBorder ? Color.whiteText : 'transparent',
            },
            props.style,
          ]}
        >
          <TextInput
            placeholder={props.placeholder}
            placeholderTextColor={Color.lightGrayText}
            ref={inputRef}
            style={{
              flex: 1,
              fontFamily: font.PoppinsRegular,
              fontSize: 14,
              color: Color.whiteText,
              textAlignVertical: 'center',
              paddingVertical: 0,
              includeFontPadding: false,

            }}
            onChangeText={onChangeText}
            value={text}
            secureTextEntry={showPassword}
            maxLength={props.maxLength}
            keyboardType={props.type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={props.editable}
            autoFocus={false}
            returnKeyType={props.returnKeyType}
            onSubmitEditing={props.onSubmitEditing}
            allowFontScaling={false}
            keyboardAppearance="light"
          />

          {/* Eye Icon Toggle */}
          {props.showEye && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image
                source={showPassword ? imageIndex.eyes : imageIndex.view}
                style={{ width: 24, height: 24 }}
                tintColor={'white'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
