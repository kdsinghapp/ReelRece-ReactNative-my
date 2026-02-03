import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import CustomText from '@components/common/CustomText/CustomText';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import LinearGradient from 'react-native-linear-gradient';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import styles from '../style';
import { t } from 'i18next';

interface MovieInfoSectionProps {
  item?: object | null;
  formatRuntime?: (runtime: number) => string;
  onTitleLayout?: (e: object | null) => void;
  onCommentPress?: () => void;
  onBookmarkPress?: () => void;
  isBookmarked: boolean;
}

const MovieInfoSection = ({
  item,
  formatRuntime,
  onTitleLayout,
  onCommentPress,
  onBookmarkPress,
  isBookmarked
}: MovieInfoSectionProps) => {
  const windowHeight = Dimensions.get('window').height;

  return (
    <View style={[styles.infoContainer, {}]}>
      <CustomText
        size={24}
        color={Color.whiteText}
        style={styles.title}
        font={font.PoppinsBold}
        numberOfLines={2}
        onTextLayout={onTitleLayout}
      >
        {item?.title}
      </CustomText>

      <View style={{ marginTop: 5 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item?.release_year && (
              <CustomText
                size={12}
                color={Color.lightGrayText}
                style={styles.subInfo}
                font={font.PoppinsRegular}
              >
                {item?.release_year},{' '}
              </CustomText>
            )}

            {formatRuntime(item?.runtime) && (
              <CustomText
                size={12}
                color={Color.lightGrayText}
                style={styles.subInfo}
                font={font.PoppinsRegular}
              >
                {formatRuntime(item?.runtime)},{' '}
              </CustomText>
            )}

            <CustomText
              size={12}
              color={Color.lightGrayText}
              style={styles.subInfo}
              font={font.PoppinsRegular}
            >
               {t("movieDetail.subtitle")} ,{' '}
            </CustomText>

            {item?.genres && item.genres.length > 0 && (
              <Text style={styles.genresText} allowFontScaling={false}>
                {item?.genres.join(', ')}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={[styles.scoreRow, { marginTop: 4.5 }]}>
        <TouchableOpacity style={styles.scoreBoxGreen} disabled={true}>
          <RankingWithInfo
            score={item?.rec_score}
            title= {t("discover.recscore")}
            description=  {t("discover.recscoredes")}/>
          <TouchableOpacity disabled={true}>
            <CustomText
              size={14}
              color={Color.whiteText}
              style={{ marginLeft: 6 }}
              font={font.PoppinsMedium}
            >
            {t("discover.recscore")}
            </CustomText>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.scoreBoxGreen, {}]} disabled={true}>
          <View style={{}}>
            <RankingWithInfo
              score={item?.friends_rec_score}
              title= {t("discover.friendscore")}
              description={t("discover.frienddes")}
            />
          </View>

          <CustomText
            size={14}
            color={Color.whiteText}
            style={{ marginLeft: 6 }}
            font={font.PoppinsMedium}
          >
          {item?.friends_rec_score}
          </CustomText>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}
            onPress={onCommentPress}
          >
            <Image source={imageIndex.mess} style={{ height: 20, width: 20 }} resizeMode='contain' />
            {item?.n_comments > 0 && (
              <CustomText
                size={14}
                color={Color.lightGrayText}
                style={{ marginLeft: 3, marginTop: 4 }}
                font={font.PoppinsMedium}
              >
                {item?.n_comments}
              </CustomText>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onBookmarkPress}>
            <Image
              source={isBookmarked ? imageIndex.save : imageIndex.saveMark}
              style={styles.footerSaveIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {item && item?.description && item?.description.trim() !== "" ? (
        <View style={{ flexDirection: 'row', height: windowHeight * 0.21, marginTop: 2 }}>
          <View style={{ flexDirection: 'row', height: windowHeight * 0.21, marginTop: 10 }}>
            <ScrollView
              nestedScrollEnabled={false}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
            <Text style={[styles.description, { marginBottom: 0 }]}>
  {item?.description || t("emptyState.nodescription")}
  {"\n\n\n"}
</Text>


              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.9)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradient}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.9)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradient}
              />
            </ScrollView>
          </View>
        </View>
      ) : (
        <Text style={styles.description}>{t("emptyState.nodescription")}</Text>
      )}
    </View>
  );
};

export default memo(MovieInfoSection);
