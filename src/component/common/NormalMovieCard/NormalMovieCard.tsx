// NormalMovieCard.tsx
import React, { memo, useEffect, useState } from 'react';
import { View,  Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import font from '@theme/font';
// import { getUserBookmarks, toggleBookmark } from '@redux/Api/ProfileApi';
import { useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import { useBookmarks } from '@hooks/useBookmark';
 import FastImage from 'react-native-fast-image';
import CustomText from '@components/common/CustomText/CustomText';
const NormalMovieCard = ({
  item,
  token,
  onPressClose,
  onPressRanking,
  flatlistTop,
  imdb_id,
  isFirstItem,
  onFirstRankIconMeasure,
  movieList = [],
}: {
  item: object & { is_bookmarked?: boolean; cover_image_url?: string; title?: string; release_year?: string; imdb_id?: string; };
  onPressClose: () => void;
  onPressRanking: () => void;
  onPressRankingTooltip?: () => void;
  flatlistTop: number | null;
  imdb_id: string;
  token: string;
  isFirstItem?: boolean;
  onFirstRankIconMeasure?: (x: number, y: number) => void;
  movieList?: any[];
}) => {
  const [save, setSave] = useState(false);
  const navigation = useNavigation();
  const rankIconRef = React.useRef<View>(null);
  const [isSaved, setIsSaved] = useState(item?.is_bookmarked ?? false);
  const { isBookmarked, toggleBookmark } = useBookmarks(token);

  const handleNavigation = (imdb_id: string, token: string) => {
    const movieIndex = Array.isArray(movieList) ? movieList.findIndex((m: any) => m?.imdb_id === imdb_id) : -1;
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
      imdb_idData: imdb_id,
      token: token,
      movieList: movieList || [],
      initialIndex: movieIndex >= 0 ? movieIndex : 0,
      source: 'normalCard',
      filterGenreString: '',
      platformFilterString: '',
      selectedSimpleFilter: '1',
      selectedSortId: null,
      contentSelect: null,
      currentPage: 1,
      totalPages: 1,
    });
  };

  const handleToggleBookmark = async () => {
    try {

      setIsSaved((prev: boolean) => !prev);
      await toggleBookmark(item.imdb_id)

    } catch (error: unknown) {
      const err = error as { message?: string };
       setIsSaved((prev: boolean) => !prev);

    };
  };

  useEffect(() => {
    if (!isFirstItem || !onFirstRankIconMeasure) return;
    const t = setTimeout(() => {
      rankIconRef.current?.measureInWindow?.((x, y) => {
        onFirstRankIconMeasure(x, y);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [isFirstItem, onFirstRankIconMeasure]);

  return (
    <View style={styles.movieCard}>
      <TouchableOpacity onPress={() => handleNavigation(item?.imdb_id, token)} >
        {/* <Image source={{ uri: item?.cover_image_url }}
          style={styles.poster} /> */}
        <FastImage source={{
          uri: item?.cover_image_url,
          priority: FastImage.priority.low,
          cache: FastImage.cacheControl.web
        }}
          style={styles.poster}
          resizeMode={FastImage.resizeMode.contain}
        />

      </TouchableOpacity>

      <View style={styles.info}>
        {/* Title and Close Icon */}
        <View style={styles.titleRow}>
         <View style={{flex:1,flexDirection:'row',}}>
           <TouchableOpacity onPress={() => handleNavigation(item?.imdb_id, token)} style={styles.titleContainer}>
            <CustomText
              size={16}
              color={Color.whiteText}
              style={[styles.title]}
              font={font.PoppinsMedium}
              numberOfLines={2}
            >
              {item?.title}
            </CustomText>

            <CustomText
              size={14}
              color={Color.placeHolder}
              style={styles.year}
              font={font.PoppinsRegular}
            >
              {item?.release_year}
            </CustomText>
          </TouchableOpacity>
         </View>
          <TouchableOpacity style={{alignSelf:'flex',marginRight:6,}} onPress={onPressClose}>
            <Image
              resizeMode="contain"
              source={imageIndex.close}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
        {/* Year and Icons */}




          <View style={styles.bottomRow}>

{/* <TouchableOpacity style={{alignSelf:'flex-end',marginRight:6,}} onPress={onPressClose}>
            <Image
              resizeMode="contain"
              source={imageIndex.close}
              style={styles.closeIcon}
            />
          </TouchableOpacity> */}

{/* 
          <TouchableOpacity onPress={() => handleNavigation(item?.imdb_id, token)}>
            

          </TouchableOpacity> */}
          <View style={styles.iconRow}>
            <View ref={isFirstItem ? rankIconRef : undefined} collapsable={false}>
              <TouchableOpacity style={styles.iconprimary}
                onPress={onPressRanking}
              >
                <Image
                  source={imageIndex.ranking}
                  style={styles.iconImage}
                  resizeMode="contain"
                  tintColor={Color.whiteText}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.iconprimary}
              // onPress={() => toggleBookmark(item.imdb_id)}
              onPress={handleToggleBookmark}
            >
              <Image
                source={isSaved ? imageIndex.save : imageIndex.saveMark}
                style={styles.iconImage}
                resizeMode="contain"
              // tintColor={!isSaved ? Color.primary : Color.whiteText}
              />
            </TouchableOpacity>

          </View>
        </View>
      </View>
   
    </View>
  );
};
export default memo(NormalMovieCard);
const styles = StyleSheet.create({
  movieCard: {
    flexDirection: 'row',
    marginTop: 14,
  },
  poster: {
    width: 98,
    height: 135,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 15,
    // backgroundColor:'blue',
    // flexDirection:'row',
    // justifyContent:'space-between',
    // width:'100%'
  },
  titleRow: {
    // backgroundColor:'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // flex:1,
    // alignItems: 'flex-start',
    // width:'70%',

    // backgroundColor:'yellow'
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    marginBottom: 4,
  },
  closeIcon: {
    height: 20,
    width: 20,
  },
  bottomRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // justifyContent:'flex-start',
    alignSelf:'flex-end',
    zIndex:11,
    // marginBottom:'50%',
    // marginTop:6,
    // flex:1,
    // backgroundColor:'pink'
  },
  year: {
    // marginBottom: 10,

  },
  iconRow: {
    flexDirection: 'row',
    // alignItems: 'center',
    // backgroundColor:'green',
    // marginTop:'40%',
    alignSelf:'center',
    
    // justifyContent:'flex-end'
  },
  iconprimary: {
    marginHorizontal: 2,
    height: 35,
    width: 30,
  },
  iconImage: {
    height: 20,
    width: 20,
    marginLeft: 10,
  },
});