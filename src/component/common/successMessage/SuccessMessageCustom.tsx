import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import CustomText from '../CustomText/CustomText';
interface SuccessMessageCustomProps {
  message: string;
  titie?: string;
  first?: boolean;
  color?: string;
  textColor?: string;
}

const SuccessMessageCustom = ({ message, titie, first = true, color, textColor }: SuccessMessageCustomProps) => {

  return (
    <View style={[styles.container, { backgroundColor: color ? color : 'red' }]}>
      {titie &&
        //  <Text style={[styles.title, {color: textColor ? textColor : Color.whiteText}]}>{titie}</Text>}

        <CustomText

          size={16}
          color={Color.whiteText}
          style={[styles.title, { color: textColor ? textColor : Color.whiteText }]}
          font={font.PoppinsRegular}
        >
          {titie}
        </CustomText>}

      <CustomText

        size={14}
        color={Color.whiteText}
        style={[styles.message, { color: textColor ? textColor : Color.whiteText }]}
        font={font.PoppinsRegular}
      >
        {message}
      </CustomText>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 18,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 22232,
    position: 'absolute',
    bottom: 10,
    right: 8,
    left: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
    alignSelf: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
    alignSelf: 'center',
  },
});

export default SuccessMessageCustom;
