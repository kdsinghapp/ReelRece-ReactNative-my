import React, { useState, useMemo, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextStyle,
} from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
 import { ScrollView } from 'react-native-gesture-handler';
import CustomText from '../CustomText/CustomText';
import { t } from 'i18next';

interface Props {
  description: string;
  onViewMore: () => void;
  descriptionStyle?: TextStyle;
  titleLines?: number;
  /** Font size in pixels. Default 14. */
  fontSize?: number;
  /** Line height in pixels. Defaults to fontSize * 1.43 if omitted. */
  lineHeight?: number;
}

export const DescriptionWithReadMore: React.FC<Props> = ({
  description,
  descriptionStyle,
  titleLines = 1,
  fontSize = 12.81,
  lineHeight: lineHeightProp,
}) => {
  const lineHeight = lineHeightProp ?? Math.round(fontSize * 1.43);
  const [wordLimit, setWordLimit] = useState(titleLines === 1 ? 145 : 90);

  useEffect(() => {
    setWordLimit(titleLines === 1 ? 145 : 90);
  }, [titleLines]);

  const cleanAndFormatText = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/\\'/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  const trimmedText = useMemo(() => {
    const cleaned = cleanAndFormatText(description);
    if (cleaned.length <= wordLimit) return cleaned;
    return cleaned.slice(0, wordLimit).trim();
  }, [description, wordLimit]);

  const textStyle: TextStyle[] = [
    styles.baseText,
    { fontSize, lineHeight },
    ...(descriptionStyle ? [descriptionStyle] : []),
  ];

  if (!description?.trim()) {
    return (
      <Text style={textStyle}>
        {t("emptyState.nodata")}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={true}
      >
        <CustomText
          size={fontSize}
          color={Color.lightGrayText}
          style={textStyle}
          font={font.PoppinsRegular}
        >
          {description}
        </CustomText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  baseText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsRegular,
  },
});
