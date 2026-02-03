import React, { memo } from 'react';
import { View, TouchableOpacity, Image, Dimensions } from 'react-native';
import CustomText from '@components/common/CustomText/CustomText';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import styles from '../style';
import { t } from 'i18next';

interface ActionButtonsProps {
  onWatchNowPress: () => void;
  onRankNowPress: () => void;
}

const ActionButtons = ({ onWatchNowPress, onRankNowPress }: ActionButtonsProps) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, marginTop: 7 }}>
      <TouchableOpacity
        style={styles.watchNowContainer}
        onPress={onWatchNowPress}
      >
        <Image style={styles.watchNowImg} source={imageIndex.puased} resizeMode='contain' />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.watchNowContainer, {
          backgroundColor: Color.primary,
          width: Dimensions.get('window').width * 0.58,
        }]}
        onPress={onRankNowPress}
      >
        <Image
          style={[styles.watchNowImg, { marginRight: 5, height: 20, width: 20 }]}
          source={imageIndex.ranking}
          resizeMode='contain'
        />
        <CustomText
          size={14}
          color={Color.whiteText}
          style={styles.watchNowText}
          font={font.PoppinsBold}
        >
         {t("movieDetail.rankNow")}
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default memo(ActionButtons);
