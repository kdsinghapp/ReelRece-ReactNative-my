import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import font from '@theme/font';
import { toggleBookmark } from '@redux/Api/ProfileApi';
import { thumbsDownMovie, getThumbsDownMovies, deleteRatedMovie } from '@redux/Api/movieApi';
import CustomText from '@components/common/CustomText/CustomText';
import { useCompareContext } from '../../context/CompareContext';
import { t } from 'i18next';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { removeMovieFromSuggestion } from '@redux/feature/rankingSlice';

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
  onEndReached,
  loadingMore,
  currentPage = 1,
  totalPages = 1,
}) => {

  const dispatch = useDispatch();
  const compareHook = useCompareContext();
  const [dislikedIds, setDislikedIds] = useState<Set<string>>(new Set());

  // Fetch initial dislikes
  useEffect(() => {
    if (token) {
      getThumbsDownMovies(token).then(res => {
        if (Array.isArray(res)) {
          setDislikedIds(new Set(res.map(m => String(m.imdb_id))));
        }
      }).catch(() => { });
    }
  }, [token]);

  const formattedQuery = movieData.length === 0 ? searchQuery : '';
  const onEndReachedInFlight = useRef(false);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEndReached = useCallback(() => {
    if (!onEndReached || onEndReachedInFlight.current) return;
    onEndReachedInFlight.current = true;
    if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
    onEndReached();
    unlockTimeoutRef.current = setTimeout(() => {
      unlockTimeoutRef.current = null;
      onEndReachedInFlight.current = false;
    }, 250);
  }, [onEndReached]);

  useEffect(() => {
    if (!loadingMore) {
      onEndReachedInFlight.current = false;
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = null;
      }
    }
  }, [loadingMore]);

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

  const handleThumbsDown = (item) => {
    if (!item.imdb_id || !token) return;
    const id = String(item.imdb_id);
    const isAlreadyDisliked = dislikedIds.has(id);

    if (isAlreadyDisliked) {
      // Undo dislike
      setDislikedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      deleteRatedMovie(token, id).catch(() => {
        // Rollback only on hard error
        setDislikedIds(prev => new Set(prev).add(id));
      });
    } else {
      // Mark as disliked
      setDislikedIds(prev => new Set(prev).add(id));
      thumbsDownMovie(token, id).then(result => {
        if (result) {
          dispatch(removeMovieFromSuggestion(id));
        } else {
          setDislikedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }).catch(() => {
        setDislikedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
    }
  };


  const handleNavigation = (imdb_id: string, token: string, index: number) => {
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
      imdb_idData: imdb_id,
      token: token,
      movieList: movieData || [],
      initialIndex: index >= 0 ? index : 0,
      source: 'search',
      filterGenreString: '',
      platformFilterString: selectedPlatforms?.join(',') || '',
      selectedSimpleFilter: '1',
      selectedSortId: null,
      contentSelect: null,
      currentPage: currentPage,
      totalPages: totalPages,
      searchQuery: searchQuery,
    });
  }

  //  Render Individual Movie
  const renderMovie = useCallback(({ item, index }) => {
    // const isSelected = selectedPlatforms?.includes(item?.id);
    return (
      <TouchableOpacity
        style={styles.movieCard}
        activeOpacity={0.9}
        // onPress={() => navigation.navigate(ScreenNameEnum.MovieDetailScreen, { imdb_idData: item?.imdb_id, token: token })}
        onPress={() => handleNavigation(item.imdb_id, token, index)}
      >
        <TouchableOpacity onPress={() => handleNavigation(item.imdb_id, token, index)}>
          <Image source={{ uri: item?.cover_image_url }} style={styles.poster}
            resizeMode='stretch'
          />

        </TouchableOpacity>

        <TouchableOpacity style={styles.info} onPress={() => {
          handleNavigation(item?.imdb_id, token, index);
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
        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-end', alignSelf: 'flex-start' }}  >
          {/* <TouchableOpacity style={styles.iconprimary} onPress={() => setIsVisible(true)}>
           */}
          <RankingWithInfo
            score={item?.rec_score}
            title={t("discover.recscore")}
            description={t("discover.recscoredes")}
          // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
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

            <TouchableOpacity
              style={styles.iconprimary}
              onPress={() => handleThumbsDown(item)}
              activeOpacity={0.7}
            >
              <Image
                source={dislikedIds.has(String(item.imdb_id)) ? imageIndex.dislike1 : imageIndex.thumpDown}
                style={{
                  height: 20,
                  width: 20,
                  marginTop: 0,
                  tintColor: dislikedIds.has(String(item.imdb_id)) ? Color.primary : Color.textGray
                }}
                resizeMode='contain'
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconprimary}
              onPress={() => toggleSave(item.imdb_id)}
            >
              <Image
                source={item?.saved ? imageIndex.save : imageIndex.saveMark}
                style={{ height: 20, width: 20, marginTop: 0 }}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, togglePlatform, setIsVisible, movieData, token, handleRankingPress, toggleSave, handleThumbsDown, dislikedIds]);

  // List footer: only "no more" message (loading is shown by sticky footer so it's visible immediately)
  const renderListFooter = useCallback(() => {
    if (loadingMore) return null;
    if (currentPage >= totalPages && movieData.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerNoMoreText}>
            {t('discover.noMore') || 'No more movies available'}
          </Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, currentPage, totalPages, movieData.length]);

  // ✅ Early return AFTER all hooks are called (Rules of Hooks)
  if (searchQuery.trim() === '') {
    return null;
  }

  return (
    <View style={styles.wrapper}>
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
              contentContainerStyle={[
                styles.listContent,
                loadingMore && styles.listContentWithStickyFooter,
              ]}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              removeClippedSubviews={true}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderListFooter}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
      {/* Sticky loader: visible as soon as loadingMore is true (no need to scroll to see it) */}
      {loadingMore && (
        <View style={styles.stickyFooter} pointerEvents="none">
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={styles.footerLoadingText}>
            {t('discover.loading')} {currentPage + 1}/{totalPages}
          </Text>
        </View>
      )}

    </View>
  );
};

// export default React.memo(SearchMovieCom);
export default React.memo(SearchMovieCom)

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Color.background,
  },
  container: {
    flex: 1,
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
    // marginBottom: 10,
  },
  iconprimary: {
    paddingHorizontal: 8,
    height: 35,
    width: 30,
    marginLeft: 8,
    // marginBottom: 14,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  listContentWithStickyFooter: {
    paddingBottom: 100,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.background,
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerLoadingText: {
    color: Color.textGray,
    marginTop: 8,
    fontSize: 14,
  },
  footerNoMoreText: {
    color: Color.textGray,
    fontSize: 14,
  },
  footerLoader: {
    margin: 10,
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
