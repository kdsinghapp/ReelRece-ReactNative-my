import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  BackHandler,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { Color } from '@theme/color';
import font from '@theme/font';
import ScreenNameEnum from '@routes/screenName.enum';
import { SearchBarCustom } from '@components/index';
import { Button } from '@components/index';
import { useCompareContext } from '../../../context/CompareContext';
import { fetchRankingRatedMovies, fetchRankingSuggestionMovies } from '@redux/feature/rankingSlice';
import { searchMovies, deleteRatedMovie, getHubMovies, thumbsDownMovie, getThumbsDownMovies } from '@redux/Api/movieApi';
import { RootState, AppDispatch } from '@redux/store';
import RankingWithInfo from '../../../component/ranking/RankingWithInfo';
import { Movie } from '../../../types/api.types';
import DislikeStep from './DislikeStep';
import imageIndex from '@assets/imageIndex';
import { t } from 'i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import OutlineTextIOS from '@components/NumbetTextIOS';
import LayeredShadowText from '@components/common/LayeredShadowText/LayeredShadowText';

const { width, height } = Dimensions.get('window');

/* ----------------------------------
   BACKGROUND POSTERS DATA (SLIDES)
-----------------------------------*/
const moviePosters = [
  [imageIndex.welcomePost1, imageIndex.welcomePost2, imageIndex.welcomePost3, imageIndex.welcomePost4, imageIndex.welcomePost5, imageIndex.welcomePost6],
  [imageIndex.welcomePost7, imageIndex.welcomePost8, imageIndex.welcomePost9, imageIndex.welcomePost10, imageIndex.welcomePost11, imageIndex.welcomePost12],
  [imageIndex.welcomePost13, imageIndex.welcomePost14, imageIndex.welcomePost15, imageIndex.welcomePost16, imageIndex.welcomePost17, imageIndex.welcomePost18],
  [imageIndex.welcomePost19, imageIndex.welcomePost20, imageIndex.welcomePost21, imageIndex.welcomePost22],
];

const columnWidth = 120;
const posterHeight = 170;
const posterGap = 12;
const horizontalGap = 14;

const FloatingColumn = ({
  posters,
  columnIndex,
  isAtTop,
}: {
  posters: (number | string)[];
  columnIndex: number;
  isAtTop: boolean;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const direction = isAtTop ? -130 : 130;
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: direction, duration: 5000, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
  }, [translateY, isAtTop]);

  return (
    <Animated.View
      style={[
        styles.column,
        {
          left: columnIndex * (columnWidth + horizontalGap),
          top: isAtTop ? 100 : 0,
          transform: [{ translateY }],
        },
      ]}
    >
      {posters?.map((poster: any, index: number) => (
        <Image
          key={index}
          source={typeof poster === 'number' ? poster : { uri: String(poster) }}
          style={styles.bgPoster}
          resizeMode="cover"
        />
      ))}
    </Animated.View>
  );
};

/* ----------------------------------
   RATING SCREEN CONSTANTS
-----------------------------------*/
const SLOT_COUNT = 6;
const SLOT_GAP = 8;
const HORIZONTAL_PADDING = 16;
const totalSlotWidth = width - HORIZONTAL_PADDING * 2 - SLOT_GAP * (SLOT_COUNT - 1);
const slotWidth = totalSlotWidth / SLOT_COUNT;
const slotHeight = slotWidth * 1.40;

const GRID_COLS = 3;
const GRID_GAP = 12;
const totalGridWidth = width - HORIZONTAL_PADDING * 2 - GRID_GAP * (GRID_COLS - 1);
const gridItemWidth = totalGridWidth / GRID_COLS;
const gridItemHeight = gridItemWidth * 1.45;

const OnboardingScreen = () => {
  const [currentPhase, setCurrentPhase] = useState<'slides' | 'rating' | 'dislike'>('slides');
  const [currentSlide, setCurrentSlide] = useState(0);

  /* Slides Animation States */
  const slideSlideAnim = useRef(new Animated.Value(0)).current;
  const slideFadeAnim = useRef(new Animated.Value(1)).current;
  const slideScaleAnim = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      image: imageIndex.step1,
      title: t('onboarding.text'),
      title1: t('onboarding.title'),
      desc: t('onboarding.desc'),
      playImg: imageIndex.WatchNowButton,
    },
    {
      image: imageIndex.step3,
      title: t('onboarding.title1'),
      title1: '',
      desc: '',
      playImg: imageIndex.WatchNowButton2,
    },
  ];

  /* Rating states */
  const token = useSelector((state: RootState) => state.auth.token);
  const ratedMovieFromRedux = useSelector((state: RootState) => state.ranking.ratedMovies);
  const suggestionMoviesFromRedux = useSelector((state: RootState) => state.ranking.suggestionMovies);
  const suggestionPage = useSelector((state: RootState) => state.ranking.suggestionPage);
  const suggestionHasMore = useSelector((state: RootState) => state.ranking.suggestionHasMore);
  const suggestionLoading = useSelector((state: RootState) => state.ranking.loadingSuggestion);

  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const compareHook = useCompareContext();
  const { openFeedbackModal, currentStep, refreshStepCount, selectedMovie } = compareHook;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousStepRef = useRef(currentStep);
  const [optimisticRatedMovies, setOptimisticRatedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (token && (currentPhase === 'rating' || currentPhase === 'dislike')) {
      dispatch(fetchRankingRatedMovies());
      dispatch(fetchRankingSuggestionMovies(1));
    }
  }, [token, dispatch, currentPhase]);

  useEffect(() => {
    if (Array.isArray(ratedMovieFromRedux)) {
      setOptimisticRatedMovies(prev => {
        // If we have no local state, initialize with Redux state
        if (prev.length === 0) return ratedMovieFromRedux;

        // Keep local optimistic items only if they are NOT yet in the Redux state
        // This prevents the 'lag' because as soon as an item is in Redux, it moves from 
        // the optimistic list to the base list without being removed from the final merged display.
        const pendingItems = prev.filter(m => !ratedMovieFromRedux.some(r => r.imdb_id === m.imdb_id));
        
        // We also want to make sure we include any NEW items that appeared in Redux but weren't in our prev
        // Actually, ratedMovieFromRedux is already handled in mergedRatedMovies useMemo (line 289),
        // so optimisticRatedMovies ONLY needs to hold the pending delta now.
        return pendingItems;
      });
    }
  }, [ratedMovieFromRedux]);

  useEffect(() => {
    if (currentStep > previousStepRef.current && selectedMovie?.imdb_id) {
      setOptimisticRatedMovies(prev => {
        const withoutCurrent = prev.filter(movie => movie.imdb_id !== selectedMovie.imdb_id);
        return [selectedMovie as Movie, ...withoutCurrent];
      });
    }

    previousStepRef.current = currentStep;
  }, [currentStep, selectedMovie]);

  // Prevent back button on Android during onboarding
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  // Refresh rated movies when modal closes
  const handleModalClose = useCallback(() => {
    // Small delay to ensure API has processed the rating
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      dispatch(fetchRankingRatedMovies());
      // Also refresh suggestion movies to ensure we have full details
      dispatch(fetchRankingSuggestionMovies(1));
    }, 300);
  }, [dispatch]);

  const isAnyModalVisible = compareHook.isFeedbackVisible || compareHook.isComparisonVisible;
  const prevModalStateRef = useRef(false);

  useEffect(() => {
    if (isAnyModalVisible) {
      prevModalStateRef.current = true;
    } else if (prevModalStateRef.current && !isAnyModalVisible) {
      prevModalStateRef.current = false;
      handleModalClose();
    }
  }, [isAnyModalVisible, handleModalClose]);

  /* Slides animation implementation */
  useEffect(() => {
    if (currentPhase !== 'slides') return;
    const isSecondSlide = currentSlide === 1;
    slideSlideAnim.setValue(100);
    slideFadeAnim.setValue(0);
    slideScaleAnim.setValue(isSecondSlide ? 0.75 : 0.88);

    Animated.parallel([
      Animated.timing(slideSlideAnim, {
        toValue: 0,
        duration: isSecondSlide ? 1200 : 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideFadeAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(slideScaleAnim, {
        toValue: 1.0,
        duration: 1400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide, currentPhase]);

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      setCurrentPhase('rating');
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, 500);
  };

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await searchMovies(debouncedQuery, token || '');
        setSearchResults(res?.data?.results || []);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    runSearch();
  }, [debouncedQuery, token]);

  const goToInitialScreen = () => {
    (navigation as { reset: (arg: object) => void }).reset({
      index: 0,
      routes: [{ name: ScreenNameEnum.TabNavigator }],
    });
  };

  const mergedRatedMovies = useMemo(() => {
    const merged = [...optimisticRatedMovies, ...(ratedMovieFromRedux || [])];
    const seen = new Set<string>();

    return merged.filter((movie: Movie) => {
      if (!movie?.imdb_id || seen.has(movie.imdb_id)) return false;
      seen.add(movie.imdb_id);
      return true;
    });
  }, [optimisticRatedMovies, ratedMovieFromRedux]);

  const currentRatedCount = mergedRatedMovies.length;

  // Slots Data: Look up detailed movie object to solve cover_image_url missing issues from rated API
  // Also ensure newly rated movies display immediately if they don't have full details yet
  const slots = Array(SLOT_COUNT).fill(null).map((_, i) => {
    const ratedItem = mergedRatedMovies && mergedRatedMovies[i];
    if (!ratedItem) return null;

    // Try to find the full movie details from suggestion or search results
    const detailed = suggestionMoviesFromRedux.find((m: Movie) => m.imdb_id === ratedItem.imdb_id)
      || searchResults.find((m: Movie) => m.imdb_id === ratedItem.imdb_id);

    // Always prefer detailed version if available, otherwise use the rated item as-is
    const slotMovie = detailed || ratedItem;

    // Ensure we have at least a fallback for display even if cover_image_url is missing
    return slotMovie || ratedItem;
  });

  const handleRemoveMovie = async (item: any) => {
    if (!token || !item?.imdb_id) return;

    try {
      await deleteRatedMovie(token, item.imdb_id);
      setOptimisticRatedMovies(prev => prev.filter(movie => movie.imdb_id !== item.imdb_id));
      dispatch(fetchRankingRatedMovies());
      refreshStepCount();
    } catch (error) {
      // Ignore
    }
  };

  // Filter out movies with no poster image before rendering
  const displayMovies = (searchQuery.trim() ? searchResults : suggestionMoviesFromRedux)
    .filter((m: Movie) => m?.cover_image_url || (m as any)?.movie?.cover_image_url);

  const renderGridItem = ({ item }: { item: Movie }) => {
    const isRated = mergedRatedMovies?.some((m: Movie) => m.imdb_id === item.imdb_id);
    const posterUrl = item?.cover_image_url || (item as any)?.movie?.cover_image_url;

    // Safety check - though filtered, double check posterUrl
    if (!posterUrl) return null;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          isRated && styles.gridItemRated
        ]}
        activeOpacity={0.8}
        onPress={() => !isRated && openFeedbackModal(item, undefined, { isOnboarding: true })}
        disabled={isRated}
      >
        <FastImage
          source={{ uri: posterUrl, priority: FastImage.priority.high }}
          style={styles.gridPoster}
          resizeMode={FastImage.resizeMode.stretch}
        />
      </TouchableOpacity>
    );
  };

  const handleEndReached = () => {
    if (!searchQuery.trim() && suggestionHasMore && !suggestionLoading) {
      dispatch(fetchRankingSuggestionMovies(suggestionPage + 1));
    }
  };

  const isContinueEnabled = currentRatedCount >= SLOT_COUNT;
  const stepStyle = styles.step1Wrap;

  if (currentPhase === 'slides') {
    const slide = slides[currentSlide];
    return (
      <View style={styles.root}>
        <View style={stepStyle}>
          <View style={styles.posterWrapper}>
            {moviePosters.map((column, i) => (
              <FloatingColumn key={i} posters={column} columnIndex={i} isAtTop={i % 2 === 0} />
            ))}
          </View>
          <LinearGradient
            colors={['rgba(0,108,157,0.35)', 'rgba(0,24,35,0.75)']}
            locations={[0, 0.5]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={[
              styles.content,
              {
                opacity: slideFadeAnim,
                transform: [
                  { translateX: slideSlideAnim },
                  { scale: slideScaleAnim },
                ],
              },
            ]}
          >
            <View style={styles.slideContent}>
              <Image source={slide.image} style={styles.poster} resizeMode="contain" />
              <View style={styles.bottomContainerSlides}>
                <Image source={slide.playImg} style={styles.playBtn} />
                <View style={styles.textBox}>
                  <Text style={styles.titleSlides}>{slide.title}</Text>
                  {slide.title1 ? <Text style={styles.titleSlides}>{slide.title1}</Text> : null}
                  {slide.desc ? <Text style={styles.descSlides}>{slide.desc}</Text> : null}
                </View>
              </View>
            </View>
            <View style={styles.btnWrap}>
              <Button
                title={t('login.next')}
                onPress={handleNextSlide}
                buttonStyle={currentSlide === slides.length - 1 ? styles.nextButtonGreen : styles.nextButtonBlue}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  if (currentPhase === 'dislike') {
    return (
      <DislikeStep
        onNext={goToInitialScreen}
        token={token || ''}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        {currentRatedCount === 0 && (
          <Image
            source={imageIndex.appLogo}
            style={styles.headerImage}
            resizeMode="contain"
          />
        )}
        <>
          <Text style={styles.title}>Pick and Rate 6 Titles</Text>
          <Text style={styles.subtitle}>Your ratings guide us to titles that fit your taste.</Text>
        </>

        {currentRatedCount > 0 && (

          <View style={styles.slotsRow}>
            {slots.map((item: any, index: number) => {
              const posterUrl = item?.cover_image_url;
              return (
                <View style={{ width: slotWidth, height: slotHeight, marginRight: index < SLOT_COUNT - 1 ? SLOT_GAP : 0 }}>
                  <View key={`${item?.imdb_id || index}`} style={styles.slot}>
                    {posterUrl && (
                      <View>
                        <FastImage
                          source={{ uri: posterUrl }}
                          style={styles.slotPoster}
                          resizeMode={FastImage.resizeMode.stretch}
                        />
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => handleRemoveMovie(item)}
                        >
                          <Image
                            source={imageIndex.closeCircle}
                            style={styles.removeIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    )}


                  </View>
                  <View style={styles.slotPlaceholder}>
                    {Platform.OS === 'ios' ? (
                      <OutlineTextIOS text={String(index + 1)} fontSize={40} />
                    ) : (
                      <LayeredShadowText text={String(index + 1)} fontSize={40} marginRight={0} />
                    )}
                  </View>
                </View>
              )

            })}
          </View>
        )}
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBarCustom
            placeholder="Search movies, shows ..."
            onSearchChange={handleSearchChange}
            value={searchQuery}
          />
        </View>

        {/* Grid of Movies */}
        {isSearching || (suggestionLoading && displayMovies.length === 0) ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Color.primary} />
          </View>
        ) : (
          <FlatList
            data={displayMovies}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.imdb_id || String(Math.random())}
            numColumns={GRID_COLS}
            columnWrapperStyle={styles.gridColumnWrapper}
            contentContainerStyle={styles.gridContentContainer}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              (!searchQuery.trim() && suggestionLoading) ? <ActivityIndicator size="small" color={Color.primary} /> : null
            }
          />
        )}

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.bottomButton,
              isContinueEnabled ? styles.buttonEnabled : styles.buttonDisabled,
            ]}
            onPress={isContinueEnabled ? () => setCurrentPhase('dislike') : () => { }}
            activeOpacity={0.8}
          >
            {isContinueEnabled ? (
              <Text style={styles.buttonText}>
                {t('common.finished')} ({SLOT_COUNT}/{SLOT_COUNT})
              </Text>
            ) : (
              <View style={styles.buttonContent}>
                <Image
                  source={imageIndex.ranking}
                  style={styles.buttonIcon}
                  resizeMode="contain"
                  tintColor={'#FFF'}
                />
                <Text style={styles.buttonText}>
                  Rated ({currentRatedCount}/{SLOT_COUNT})
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  headerImage: {
    width: 60,
    height: 72,
    marginTop: 10,
    marginBottom: 0,
    alignSelf: 'center'
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    marginTop: 10,
    fontFamily: font.PoppinsBold,
    textAlign: 'center',
  },
  subtitle: {
    color: '#CDCDCD',
    fontSize: 13,
    marginTop: 4,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
    marginBottom: 20,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  slot: {
    width: slotWidth - 8,
    height: slotHeight,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  slotPoster: {
    width: '100%',
    height: '100%',
  },
  slotPlaceholder: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#333',
    // borderRadius: 8,
    position: 'absolute',
    // top: 0,
    // left: 0,
    right: 0,
    bottom: -5,
    zIndex: 10,
  },
  slotNumber: {
    color: '#A0A0A0',
    fontSize: 24,
    fontFamily: font.PoppinsBold,
  },
  searchContainer: {
    marginBottom: 10,
  },
  gridContentContainer: {
    paddingBottom: 80,
  },
  gridColumnWrapper: {
    justifyContent: 'flex-start',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  gridItem: {
    width: gridItemWidth,
    height: gridItemHeight,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridItemRated: {
    borderWidth: 1.5,
    borderColor: '#00E5FF',
  },
  gridPoster: {
    width: '100%',
    height: '100%',
  },
  rankingOverlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: HORIZONTAL_PADDING,
    right: HORIZONTAL_PADDING,
  },
  bottomButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonEnabled: {
    backgroundColor: '#00A8F5',
  },
  buttonDisabled: {
    backgroundColor: '#2D2D2E',
  },
  buttonIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  buttonText: {
    color: '#FFF',
    fontFamily: font.PoppinsMedium,
    fontSize: 15,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 240,
  },
  /* original slides styles */
  posterWrapper: {
    position: 'absolute',
    width: width + columnWidth,
    height: '100%',
    top: -120,
    left: -(columnWidth / 2),
    flexDirection: 'row',
  },
  column: {
    position: 'absolute',
    width: columnWidth,
    alignItems: 'center',
  },
  bgPoster: {
    width: '100%',
    height: posterHeight,
    marginBottom: posterGap,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    zIndex: 10,
    paddingBottom: 72,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 90 : 55,
  },
  poster: {
    width: width * 0.9,
    height: height * 0.5,
    resizeMode: 'stretch',
  },
  bottomContainerSlides: {
    alignItems: 'center',
    marginTop: 20,
  },
  playBtn: {
    width: 69,
    height: 69,
  },
  textBox: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  titleSlides: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: font.PoppinsBold,
  },
  descSlides: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: font.PoppinsRegular,
  },
  btnWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  step1Wrap: {
    flex: 1,
  },
  nextButtonBlue: {
    backgroundColor: '#00A8F5',
    borderRadius: 8,
  },
  nextButtonGreen: {
    backgroundColor: '#35C75A',
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
    zIndex: 20,
  },
  removeIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFF',
  },
  /* Dislike Screen Styles */
  dislikeContainer: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  dislikeHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  dislikeLogo: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  dislikeTitle: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: font.PoppinsBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  dislikeSubtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 20,
  },
  inlineDislikeIcon: {
    width: 16,
    height: 16,
    tintColor: '#A0A0A0',
  },
  dislikeGridItem: {
    width: gridItemWidth,
    height: gridItemHeight,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: GRID_GAP,
  },
  dislikeIconBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dislikeIconBadgeActive: {
    backgroundColor: 'rgba(255,59,48,0.2)',
    borderColor: '#FF3B30',
  },
  dislikeSmallIcon: {
    width: 14,
    height: 14,
  },
});
