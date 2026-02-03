import React, { memo } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import imageIndex from '@assets/imageIndex';
import styles from '../style';
import { t } from 'i18next';

interface FooterNavProps {
  onEpisodesPress: () => void;
  onMoreLikeThisPress: () => void;
}

const FooterNav = ({ onEpisodesPress, onMoreLikeThisPress }: FooterNavProps) => {
  return (
    <View style={styles.footerNav}>
      <TouchableOpacity
        onPress={onEpisodesPress}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
      >
        <Text style={styles.linkText}>{t("movieDetail.episodes")}</Text>
        <Image source={imageIndex.rightArrow} style={styles.arrowIcon} resizeMode='cover' />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onMoreLikeThisPress}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
      >
        <Text style={styles.linkText}>{t("movieDetail.morelike")}</Text>
        <Image source={imageIndex.rightArrow} style={styles.arrowIcon} resizeMode='contain' />
      </TouchableOpacity>
    </View>
  );
};

export default memo(FooterNav);
