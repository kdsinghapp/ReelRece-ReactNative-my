import React, { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from '../style';
import { t } from 'i18next';

interface FooterNavProps {
  onWatchNowPress: () => void;
  onEpisodesPress: () => void;
  onMoreLikeThisPress: () => void;
}

const FooterNav = ({ onWatchNowPress, onEpisodesPress, onMoreLikeThisPress }: FooterNavProps) => {
  return (
    <View style={styles.footerNav}>
      <TouchableOpacity
        onPress={onWatchNowPress}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
      >
        <Text style={styles.linkText}>{t("movieDetail.watchNow") || "Watch Now"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onEpisodesPress}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
      >
        <Text style={styles.linkText}>{t("movieDetail.episodes")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onMoreLikeThisPress}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
      >
        <Text style={styles.linkText}>{t("movieDetail.morelike")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(FooterNav);
