import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';

interface FieldErrorCustomProps {
  message: string;
  style?: object;
}

const FieldErrorCustom = ({ message, style }: FieldErrorCustomProps) => {
  if (!message) return null;
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text} allowFontScaling={false}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 2,
  },
  text: {
    fontSize: 12,
    fontFamily: font.PoppinsRegular,
    color: Color.red,
  },
});

export default FieldErrorCustom;
