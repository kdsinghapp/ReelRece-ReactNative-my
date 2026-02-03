
import React, { useCallback, useState } from 'react';
import {
  View,
   Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import font from '@theme/font';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import FastImage from 'react-native-fast-image';
 import CustomText from '@components/common/CustomText/CustomText';
import ScoreIntroModal from '@components/modal/ScoreIntroModal/ScoreIntroModal';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { t } from 'i18next';

interface HorizontalMovieListProps {
  title: string;
  data?: Array<unknown>;
  type?: string;
  isSelectList?: string;
  navigateTo: string;
  backnavigateTab?: string;
  backnavigate?: string;
  backSceen?: string;
  navigateToLabel?: string;
  username?: string;
  otheruser?: boolean;
  loading?: boolean;
  onEndReached?: () => void;
  hasMore?: boolean;
  imageUri?: string;
  token?: string;
  otheruserAvatarUrl?: string;
  userAvatarUrl?: string;
  disableBottomSheet?: string;
  emptyData?: string;
  scoreType?: "Rec" | "Friend";
  my_profile?: boolean
}
const HorizontalMovieList: React.FC<HorizontalMovieListProps> = ({
  title,
  data,
  type,
  imageUri,
  isSelectList,
  backnavigate,
  backnavigateTab = ScreenNameEnum.FeedTab,
  navigateTo,
  otheruser,
  backSceen,
  navigateToLabel,
  username,
  userAvatarUrl,
  emptyData,
  loading = false,
  hasMore = false,
  otheruserAvatarUrl,
  disableBottomSheet,
  scoreType,
  onEndReached,
  my_profile
}) => {
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.auth.token);

  const [showFirstModal, setShowFirstModal] = useState(false);

  // const token = useSelector((state: RootState) => state.auth.token);
  const handleNavigate = () => {
 
    if (isSelectList && type) {
      navigation.navigate(ScreenNameEnum.DiscoverTab as never, {
        screen: ScreenNameEnum.DiscoverScreen,
        params: { isSelectList, type },
      });
    } else if (navigateTo) {
      navigation.navigate(navigateTo, {
        title,
        datamovie: data,
        username,
        imageUri,
        token,
        userAvatarUrl,
        disableBottomSheet,
        my_profile,
      });
    }
  };
  const goToDetail = useCallback(
    (item) => {
      const imdb_idData = item?.imdb_id;

      navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
        imdb_idData,
        token,
      });
    },
    [navigation]
  );
   const renderItem = useCallback(
    ({ item }: { item: object & { imdb_id?: string } }) => (
      <TouchableOpacity
        onPress={() => goToDetail(item)}
        style={styles.movieCardContainer}
      >
        {/* <ImageBackground
          source={{ uri: item.cover_image_url }}
          style={styles.movieCard}
          resizeMode="cover"
        > */}

        <FastImage
          source={{
            uri: item?.cover_image_url,
            priority: FastImage.priority.low,
            cache: FastImage.cacheControl.immutable

          }}
          style={styles.movieCard}
          resizeMode={FastImage.resizeMode.stretch}

        />

        <TouchableOpacity style={styles.rankingOverlay}
        //  onPress={() => setShowFirstModal(!showFirstModal)}  
        >
          {item?.rec_score &&
          // 
            <RankingWithInfo
              score={item?.rec_score}
              title={scoreType === "Rec" ? t("discover.recscore") :  t("discover.friendscore")  }
              description={
                scoreType === "Rec"
                  ? 
                  t("discover.recscoredes")
                  
                  // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                  : 
                  // "This score shows the rating from your friend for this title."
                     t("discover.frienddes")
              }
            />
          }
        </TouchableOpacity>

        {/* <ImageBackground
          source={
            typeof item.cover_image_url === 'string'
              ? { uri: item?.cover_image_url }
              : imageIndex.profile1 // fallback image
          }
          style={styles.movieCard}
          resizeMode="cover"

        >
          <TouchableOpacity style={styles.rankingOverlay}
          //  onPress={() => setShowFirstModal(!showFirstModal)}  
          >
            {item?.rec_score &&
              //  <RankingCard ranked={item?.rec_score} />
              // <RankingWithInfo
              //   score={item?.rec_score}
              //   title="Rec Score"
              //   description="This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
              // />

              <RankingWithInfo
                score={item?.rec_score}
                title={scoreType === "Rec" ? "Rec Score" : "Friend Score"}
                description={
                  scoreType === "Rec"
                    ? "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                    : "This score shows the rating from your friend for this title."
                }
              />
            }
          </TouchableOpacity>
        </ImageBackground> */}
      </TouchableOpacity>
    ),
    [navigation]
  );
  const renderShimmerItem = () => (
    <View style={styles.movieCardContainer}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={styles.movieCard}
        shimmerStyle={{ borderRadius: 8 }}
        shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
      />
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>

        <CustomText
          size={22}
          color={Color.whiteText}
          style={styles.sectionTitle}
          font={font.PoppinsBold}
        >
          {title}
        </CustomText>

        <TouchableOpacity style={styles.arrowIconContainer}  onPress={handleNavigate}>
          <Image source={imageIndex.rightArrow} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      {loading && data.length === 0 ? (
        <FlatList
          data={[...Array(5)]}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderShimmerItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : data && data.length > 0 ? (
        <>
          <FlatList
            data={data}
            horizontal
            keyExtractor={(item) => item.imdb_id}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (hasMore && !loading && onEndReached) {
                onEndReached();
              }
            }}
            onEndReachedThreshold={0.5}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={6}
            // windowSize={5}
            // removeClippedSubviews

            removeClippedSubviews={false}
nestedScrollEnabled={true}
          />
           {loading && (
    // <ActivityIndicator
    //   size="small"
    //   color={Color.primary}
    //   style={{ marginVertical: 10 }}
    // /> 
    <>
    </>
  )}  
        </>
      ) : (
        <CustomText
          size={14}
          color={Color.whiteText}
           font={font.PoppinsRegular}
        >
          {emptyData}
        </CustomText>
      )}
      <ScoreIntroModal
        visible={showFirstModal}
        onClose={() => setShowFirstModal(false)}
        variant="second"
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: Color.whiteText,
    fontSize: 16,
    lineHeight: 18,
    fontFamily: font.PoppinsBold,
  },
  arrowIconContainer:{
    height:32,
    width:32,
  },
  arrowIcon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  listContent: {
    // paddingHorizontal: 10,
    paddingVertical: 5,
  },
  movieCardContainer: {
    width: 110,
    marginRight: 10,
    justifyContent:'center',
    alignItems:'center',
  },
  movieCard: {
    width: 110,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  rankingOverlay: {
    position: 'absolute',
     left: 0,
    bottom: 0,
  },
  // movieTitle: {
  //   color: Color.whiteText,
  //   fontSize: 12,
  //   marginTop: 5,
  //   fontFamily: font.PoppinsRegular,
  // },
  // emptyText: {
  //   color: Color.placeHolder,
  //   paddingHorizontal: 8,
  //   marginTop: 5,
  // },
});

export default React.memo(HorizontalMovieList);