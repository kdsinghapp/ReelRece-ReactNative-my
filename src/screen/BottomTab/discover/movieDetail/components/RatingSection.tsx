import React, { memo, useMemo } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import CustomText from '@components/common/CustomText/CustomText';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import { t } from 'i18next';

interface RatingSectionProps {
  item: any;
  onRatingPress: (preference: 'love' | 'like' | 'dislike') => void;
}

const RatingSection = ({ item, onRatingPress }: RatingSectionProps) => {
  // Memoize the rating options to prevent unnecessary re-calculating styles and assets on parent re-renders
  const ratingOptions = useMemo(() => [
    {
      type: 'love' as const,
      label: t('modal.loveIt'),
      activeIcon: imageIndex.acrtivePlay,
      inactiveIcon: imageIndex.stopPlay,
      isActive: item?.preference === 'love',
    },
    {
      type: 'like' as const,
      label: t('modal.itWasOkay'),
      activeIcon: imageIndex.modalitWasPoster,
      inactiveIcon: imageIndex.play,
      isActive: item?.preference === 'like',
    },
    {
      type: 'dislike' as const,
      label: t('modal.didntLikeIt'),
      activeIcon: imageIndex.redCloseActive,
      inactiveIcon: imageIndex.redClose,
      isActive: item?.preference === 'dislike',
    },
  ], [item?.preference]);

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      paddingTop: 14,
      paddingBottom: 14,
      paddingHorizontal: 16,
      marginTop: 12,
    }}>
      <View style={{ flex: 1 }}>
        <CustomText size={12} color={Color.whiteText} font={font.PoppinsMedium} style={{ textAlign: 'center' }}>
          {t("movieDetail.howDoYouFeel") || "How do you feel about this one?"}
        </CustomText>
        <View style={{ width: '90%', height: 0.5, backgroundColor: Color.whiteText, marginTop: 4, alignSelf: 'center' }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {ratingOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={{ alignItems: 'center', minWidth: 60 }}
            onPress={() => onRatingPress(option.type)}
          >
            <Image
              source={option.isActive ? option.activeIcon : option.inactiveIcon}
              style={{ height: 24, width: 24 }}
              resizeMode="contain"
            />
            <CustomText
              size={12}
              color={option.isActive ? Color.whiteText : Color.subText}
              font={option.isActive ? font.PoppinsMedium : font.PoppinsRegular}
              style={{ marginTop: 4 }}
            >
              {option.label}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default memo(RatingSection);
