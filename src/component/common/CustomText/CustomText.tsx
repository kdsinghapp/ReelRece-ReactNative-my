import { Color } from '@theme/color';
import React, { memo } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
  
interface CustomTextProps extends TextProps {
  children: React.ReactNode;
  font?: string;            // font family
  size?: number;            // font size
  color?: string;           // text color
  lineHeight?: number;
  letterSpacing?: number;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle | TextStyle[];
  numberOfLines?:number;
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  font , // default font
  size = 14,
  color = Color.whiteText,
  lineHeight,
  letterSpacing,
  align = 'left',
  numberOfLines,
  style,
  disabled,
  ...props
}) => {
   return (
    <Text 
      disabled={disabled}
 
      allowFontScaling={false}
      numberOfLines={numberOfLines }
      {...(numberOfLines ? { numberOfLines } : {})}
      style={[
        {
          fontFamily: font,
          fontSize: size,
          color,
          textAlign: align,
          lineHeight: lineHeight ?? size * 1.2,
          letterSpacing: letterSpacing ?? 0.2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default memo(CustomText);
