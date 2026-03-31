import React, { useMemo } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextStyle,
  Dimensions,
} from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import { ScrollView } from 'react-native-gesture-handler';
import CustomText from '../CustomText/CustomText';
import { t } from 'i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  description: string;
  onViewMore?: () => void;
  descriptionStyle?: TextStyle;
  titleLines?: number;
  fontSize?: number;
  lineHeight?: number;
  /** Custom max height. If omitted, uses 12% of screen height. */
  maxHeight?: number;
}

export const DescriptionWithReadMore: React.FC<Props> = ({
  description,
  descriptionStyle,
  fontSize = 12.81,
  lineHeight: lineHeightProp,
  maxHeight,
}) => {
  const lineHeight = lineHeightProp ?? Math.round(fontSize * 1.43);

  const cleanAndFormatText = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/\\'/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  const textStyle: TextStyle[] = [
    styles.baseText,
    { fontSize, lineHeight },
    ...(descriptionStyle ? [descriptionStyle] : []),
  ];

  const dynamicMaxHeight = maxHeight ?? SCREEN_HEIGHT * 0.12;

  if (!description?.trim()) {
    return (
      <View style={[styles.container, { maxHeight: dynamicMaxHeight, justifyContent: 'center' }]}>
        <CustomText
          size={fontSize}
          color={Color.lightGrayText}
          style={{ textAlign: 'center' }}
        >
          {t("emptyState.nodata")}
        </CustomText>
      </View>
    );
  }

  const cleanedDescription = useMemo(() => cleanAndFormatText(description), [description]);

  return (
    <View style={[styles.container, { maxHeight: dynamicMaxHeight }]}>
      <ScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        horizontal={false}
        directionalLockEnabled={true}
        failOffsetX={[-8, 8]}
        activeOffsetY={[-5, 5]}
      >
        <CustomText
          size={fontSize}
          color={Color.whiteText}
          style={textStyle}
          font={font.PoppinsRegular}
        >
          {cleanedDescription}
        </CustomText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
  },
  baseText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsRegular,
  },
});
