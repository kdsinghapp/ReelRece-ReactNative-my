import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import font from '@theme/font';
import { toggleBookmark } from '@redux/Api/ProfileApi';
 import CustomText from '@components/common/CustomText/CustomText';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import { t } from 'i18next';

const SearchMovieCom = ({
  movieData = [],
  navigation,
  togglePlatform,
  isVisible,
  setIsVisible,
  searchQuery = '',
  selectedPlatforms = [],
  loading,
  setSearchData,
  token,
}) => {
  
  
  
  // ✅ All hooks MUST be called before any early returns (Rules of Hooks)
  const compareHook = useCompareComponent(token);
  
  const formattedQuery = movieData.length === 0 ? searchQuery : '';

  // Bookmark Toggle Logic
  const toggleSave = async (imdb_id: string) => {
    try {
      const updatedSaved = await toggleBookmark(token, imdb_id);
      const updatedList = movieData.map((movie: object | string) =>
        movie.imdb_id === imdb_id ? { ...movie, saved: updatedSaved } : movie
      );
      setSearchData(updatedList);
    } catch (error) {
      // Handle error silently
    }
  };
  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
   };



  const handleNavigation = (imdb_id: string, token: string) => {
    navigation.navigate(ScreenNameEnum.SearchMovieDetail, { imdb_idData: imdb_id, token: token })
    // navigation.navigate(ScreenNameEnum.SearchMovieDetail)
    // Alert.alert(imdb_id)
  }

  //  Render Individual Movie
  const renderMovie = useCallback(({ item }) => {
    // const isSelected = selectedPlatforms?.includes(item?.id);
     return (
      <TouchableOpacity
        style={styles.movieCard}
        activeOpacity={0.9}
        // onPress={() => navigation.navigate(ScreenNameEnum.MovieDetailScreen, { imdb_idData: item?.imdb_id, token: token })}
        onPress={() => handleNavigation(item.imdb_id, token)}
      >
        <TouchableOpacity onPress={() => handleNavigation(item.imdb_id, token)}>
          <Image source={{ uri: item?.cover_image_url }} style={styles.poster} 
          resizeMode='stretch'
          />

        </TouchableOpacity>

        <TouchableOpacity style={styles.info} onPress={() => {
          handleNavigation(item?.imdb_id, token);
 
 
 }} >
          <TouchableOpacity style={styles.titleContainer} >


            <CustomText
              size={16}
              color={Color.whiteText}
              style={[styles.title]}
              font={font.PoppinsMedium}
              numberOfLines={2}
            >
              {item?.title}
            </CustomText>
          </TouchableOpacity>

          <CustomText
            size={14}
            color={Color.placeHolder}
            style={styles.year}
            font={font.PoppinsRegular}
          >
            {item?.release_year}
          </CustomText>
        </TouchableOpacity>
        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'flex-start' }}  >
          {/* <TouchableOpacity style={styles.iconprimary} onPress={() => setIsVisible(true)}>
           */}

          <TouchableOpacity style={styles.iconprimary}
            onPress={() =>
              handleRankingPress({
                imdb_id: item?.imdb_id,
                title: item?.title,
                release_year: item?.release_year, // or dynamic if available
                cover_image_url: item?.cover_image_url || '', // ensure string URL is passed
              })
            }
          >
            <Image
              source={imageIndex.mdRankings}
              resizeMode='contain'
              style={styles.rankingIcon}
            />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.iconprimary}
            onPress={() => toggleSave(item.imdb_id)}
          >
            <Image
              source={item?.is_bookmarked ? imageIndex.save : imageIndex.saveMark}
              style={{ height: 20, width: 20, marginTop: 8, }}
              resizeMode='contain'
              // tintColor={item.saved ? Color.primary : "rgba(255, 255, 255, 1)"}
            />
          </TouchableOpacity> */}


          <TouchableOpacity
            style={styles.iconprimary}
            onPress={() => toggleSave(item.imdb_id)}
          >
            <Image
              source={item?.saved ? imageIndex.save : imageIndex.saveMark}
              style={{ height: 20, width: 20, marginTop: 8 }}
              resizeMode='contain'
            />
          </TouchableOpacity>

        </View>
      </TouchableOpacity>
    );
  }, [navigation, togglePlatform, setIsVisible, movieData, token, handleRankingPress, toggleSave]);

  // ✅ Early return AFTER all hooks are called (Rules of Hooks)
  if (searchQuery.trim() === '') {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Color.background }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color={Color.primary} />
          ) : movieData.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
              {t("emptyState.noresults")}
                 {formattedQuery ? ` for "${formattedQuery}"` : ''}
              </Text>
            </View>
          ) : (
            <FlatList
              data={movieData}
              keyExtractor={(item) => item?.imdb_id}
              renderItem={renderMovie}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={12}
              maxToRenderPerBatch={14}
              windowSize={10}
              removeClippedSubviews

            />
          )}
        </View>
      </TouchableWithoutFeedback>
      <CompareModals token={token} useCompareHook={compareHook} />

    </View>
  );
};

// export default React.memo(SearchMovieCom);
export default React.memo(SearchMovieCom)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 15,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: Color.background,
    borderRadius: 8,
    marginBottom: 10,
  },
  poster: {
    width: 95,
    height: 135,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: 10,
  },
  year: {
    marginTop: 6,
  },
  rankingIcon: {
    height: 20,
    width: 20,
    marginBottom: 10,
  },
  iconprimary: {
    paddingHorizontal: 8,
    height: 35,
    width: 30,
    marginHorizontal: 4,
    // marginBottom: 14,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noResultsText: {
    color: Color.textGray,
    fontSize: 16,
  },
});
