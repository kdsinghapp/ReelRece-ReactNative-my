import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Platform, Image, ActionSheetIOS, ActivityIndicator } from 'react-native';
import { Color } from '@theme/color';
 import font from '@theme/font';
import CustomText from '@components/common/CustomText/CustomText';   
// Define props type
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  source?: string | boolean| null| number
  loaderFollow?:boolean;
}

// Functional component
const ButtonCustom: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
  disabled = false, 
  source,
  loaderFollow,
}) => {


  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
{/* { loaderFollow &&
<ActivityIndicator color={Color.primary} size={'small'}  />

} */}
      {/* <Text style={[styles.buttonText, textStyle]}>{title}</Text> */}
        {loaderFollow ? (
        <ActivityIndicator color={Color.whiteText} size="small" />
      ) : (
        // <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        <CustomText
                  size={14}
                  color={Color.primary}
                 style={[styles.buttonText, textStyle]}
                  font={font.PoppinsMedium}
                >
                  {title}
                </CustomText>
      )}
      {
        source && (
          <Image source={source} style={{
            height: 24,
            width: 24,
            marginLeft: 8
          }} resizeMode='contain' />
        )
      }

    </TouchableOpacity>
  );
};

// Default styles
const styles = StyleSheet.create({
  button: {
    backgroundColor: Color.primary,
    // paddingVertical: 20,
    paddingHorizontal: 24,
    height: 50,
    // p: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "row",

    // Shadow added here
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(9, 40, 34, 0.15)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 1, // Android ke liye

      },
    }),
  },
  buttonText: {
    color: Color.whiteText,
    fontSize: 18,
    lineHeight: 24,
    // marginVertical:12,
    fontFamily:font.PoppinsBold,
  },
  disabledButton: {
  },
});

export default  React.memo(ButtonCustom);
