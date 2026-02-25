

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StatusBar, Image, ActivityIndicator, Platform, LayoutAnimation, UIManager, Animated, PanResponder, Dimensions, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import styles from './style';
import ScreenNameEnum from '@routes/screenName.enum';
import { RootState, AppDispatch } from '@redux/store';
import { recordPairwiseDecision1 } from '@redux/Api/movieApi';
import {
  fetchRankingRatedMovies,
  fetchRankingSuggestionMovies,
  resetSuggestionPagination,
  reorderRatedMovies,
  updateRatedMovieScores,
  rollbackRatedMovieOrder,
} from '@redux/feature/rankingSlice';
import { fetchHomeRecommend } from '@redux/feature/homeSlice';
import NormalMovieCard from '@components/common/NormalMovieCard/NormalMovieCard';
import StepProgressBar from '@components/modal/stepProgressModal/StepProgressBar';
import LayeredShadowText from '@components/common/LayeredShadowText/LayeredShadowText';
import { useCompareComponent, STEPPER_VALUE } from './useCompareComponent';
import CompareModals from './CompareModals';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import font from '@theme/font';
import CustomText from '@components/common/CustomText/CustomText';
import { setModalClosed } from '@redux/feature/modalSlice/modalSlice';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import NormalMovieCardShimmer from '@components/common/NormalMovieCard/NormalMovieCardShimmer';
import OutlineTextIOS from '@components/NumbetTextIOS';
import {
  CustomStatusBar,
  SearchBarCustom,
  SlideInTooltipModal
} from '@components/index';
import ButtonCustom from '@components/common/button/ButtonCustom';
import { t } from 'i18next';
import { RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { errorToast } from '@utils/customToast';

const ITEM_HEIGHT = 180; // Adjust based on your movie card height

const rankingItemStyles = StyleSheet.create({
  row: { left: 0, right: 0 },
  rowActive: { height: ITEM_HEIGHT, position: 'absolute' as const },
  rowInactive: { height: ITEM_HEIGHT, position: 'relative' as const },
  posterTouch: { marginTop: 2 },
  iconUpDown: { height: 24, width: 24 },
  iconDisabled: { opacity: 0.5 },
  iconEnd: { alignSelf: 'flex-end' as const },
});
const rankingIconDisabledStyle = [rankingItemStyles.iconUpDown, rankingItemStyles.iconDisabled];

// Frontend pagination (API returns all data; we window for performance)
const RANKING_INITIAL_SIZE = 10;
const RANKING_LOAD_MORE_SIZE = 10;
const SUGGESTION_INITIAL_SIZE = 10;
const SUGGESTION_LOAD_MORE_SIZE = 10;

type RankingMovie = {
  imdb_id: string;
  title?: string;
  release_year?: string | number;
  cover_image_url?: string;
  rec_score?: number;
  [k: string]: unknown;
};

type RankingListItemProps = {
  itemId: string;
  index: number;
  movie: RankingMovie;
  isActive: boolean;
  isSwapping: boolean;
  totalCount: number;
  token: string | null;
  animatedPosition: Animated.Value;
  scale: Animated.Value;
  zIndexVal: Animated.Value;
  zeroAnimatedValue: Animated.Value;
  panHandlers: Record<string, unknown>;
  onNavigate: (imdbId: string, t: string | null) => void;
  onSwap: (id: string, direction: 'up' | 'down') => void;
  onStartDrag: (id: string, y: number) => void;
};

const RankingListItem = React.memo(
  function RankingListItem({
    itemId,
    index,
    movie,
    isActive,
    isSwapping,
    totalCount,
    token,
    animatedPosition,
    scale,
    zIndexVal,
    zeroAnimatedValue,
    panHandlers,
    onNavigate,
    onSwap,
    onStartDrag,
  }: RankingListItemProps) {
    const translateY = isActive ? animatedPosition : zeroAnimatedValue;
    const iconStyle = isSwapping || isActive ? rankingIconDisabledStyle : rankingItemStyles.iconUpDown;
    return (
      <Animated.View
        style={[
          rankingItemStyles.row,
          isActive ? rankingItemStyles.rowActive : rankingItemStyles.rowInactive,
          { transform: [{ translateY }, { scale }], zIndex: isActive ? 999 : index },
        ]}
      >
        <TouchableOpacity
          {...panHandlers}
          style={[styles.movieCard]}
          activeOpacity={0.7}
          onLongPress={() => onStartDrag(itemId, 0)}
        >
          <TouchableOpacity
            style={rankingItemStyles.posterTouch}
            onPress={() => onNavigate(itemId, token)}
            activeOpacity={0.8}
            disabled={isSwapping || isActive}
          >
            {movie?.cover_image_url?.trim() ? (
              <FastImage
                source={{
                  uri: movie.cover_image_url,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.poster}
                resizeMode={FastImage.resizeMode.stretch}
              />
            ) : (
              <View style={[styles.poster, { backgroundColor: '#000' }]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate(itemId, token)}
            style={styles.info}
            disabled={isSwapping || isActive}
          >
            <CustomText
              size={16}
              color={Color.whiteText}
              style={[styles.title]}
              font={font.PoppinsMedium}
              numberOfLines={2}
            >
              {movie.title}
            </CustomText>
            <CustomText
              size={14}
              color={Color.placeHolder}
              style={styles.year}
              font={font.PoppinsRegular}
            >
              {movie.release_year}
            </CustomText>
            <View style={[styles.iconprimary, rankingItemStyles.iconEnd]}>
              {Platform.OS === 'ios' ? (
                <OutlineTextIOS text={index + 1} fontSize={60} />
              ) : (
                <LayeredShadowText text={index + 1} fontSize={60} marginRight={12} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.icons}>
            <View style={rankingItemStyles.iconEnd}>
              <RankingWithInfo
                score={movie?.rec_score}
                title={t('discover.recscore')}
                description={t('discover.recscoredes')}
              />
            </View>
            <View style={styles.centerContainer}>
              <View style={styles.iconprimary}>
                {index > 0 && (
                  <TouchableOpacity
                    onPress={() => onSwap(itemId, 'up')}
                    disabled={isSwapping || isActive}
                  >
                    <Image
                      source={imageIndex.chevronUp}
                      style={iconStyle}
                      tintColor={Color.textGray}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                {index < totalCount - 1 && (
                  <TouchableOpacity
                    onPress={() => onSwap(itemId, 'down')}
                    disabled={isSwapping || isActive}
                  >
                    <Image
                      source={imageIndex.downDown}
                      resizeMode="contain"
                      style={iconStyle}
                      tintColor={Color.textGray}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.itemId === next.itemId &&
    prev.index === next.index &&
    prev.isActive === next.isActive &&
    prev.isSwapping === next.isSwapping &&
    prev.totalCount === next.totalCount &&
    prev.token === next.token &&
    prev.movie?.imdb_id === next.movie?.imdb_id &&
    prev.movie?.rec_score === next.movie?.rec_score
);

const RankingScreen = () => {
  const token = useSelector((state: RootState) => state?.auth?.token);
  const compareHook = useCompareComponent(token);
  const { currentStep, setCurrentStep, refreshStepCount } = compareHook;
  const route = useRoute()
  const navigation = useNavigation();
  const { openTooltipModal } = route?.params ?? {};
  const ratedMovie = useSelector((state: RootState) => state.ranking.ratedMovies);
  const suggestionMoviesFromRedux = useSelector((state: RootState) => state.ranking.suggestionMovies);
  const suggestionPage = useSelector((state: RootState) => state.ranking.suggestionPage);
  const suggestionHasMore = useSelector((state: RootState) => state.ranking.suggestionHasMore);
  const loadingRated = useSelector((state: RootState) => state.ranking.loadingRated);
  const suggestionLoading = useSelector((state: RootState) => state.ranking.loadingSuggestion);
  const [filteredMovies, setFilteredMovies] = useState(suggestionMoviesFromRedux);

  const [flatlistTop, setFlatlistTop] = useState(null);
  const [firstRankIconPosition, setFirstRankIconPosition] = useState<{ x: number; y: number } | null>(null);
  const listRef = useRef(null);
  const totalSteps = STEPPER_VALUE;
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const [TooltipModal, setTooltipModal] = useState<boolean>(openTooltipModal || false);
  const [displayMovies, setDisplayMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const ratedMovieRef = useRef(ratedMovie);
  useEffect(() => { ratedMovieRef.current = ratedMovie; }, [ratedMovie]);

  const dispatch = useDispatch<AppDispatch>();
  const isModalClosed = useSelector((state: RootState) => state?.modal?.isModalClosed);

  useEffect(() => {
    setFilteredMovies(suggestionMoviesFromRedux);
    if (suggestionMoviesFromRedux.length === 0) {
      setSuggestionVisibleCount(SUGGESTION_INITIAL_SIZE);
    }
  }, [suggestionMoviesFromRedux]);

  const [rankingRenderedCount, setRankingRenderedCount] = useState(0);
  const [isRankingFullyRendered, setIsRankingFullyRendered] = useState(false);

  const checkSuggestScrollRef = useRef(false);
  const pageref = useRef(false);

  // Drag and Drop State
  const [order, setOrder] = useState<string[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const orderRef = useRef<string[]>([]);
  orderRef.current = order;
  const animatedPositions = useRef<Record<string, Animated.Value>>({}).current;
  const activeScale = useRef<Record<string, Animated.Value>>({}).current;
  const activeZIndex = useRef<Record<string, Animated.Value>>({}).current;

  const dragState = useRef({
    id: null,
    offsetY: 0,
    startTop: 0,
    longPressTimer: null,
    currentIndex: -1,
    scrollOffset: 0,
    isDragging: false,
    startY: 0,
  }).current;
  const [visibleCount, setVisibleCount] = useState(RANKING_INITIAL_SIZE);

  const loadMoreItems = useCallback(() => {
    setVisibleCount(prev =>
      ratedMovie?.length ? Math.min(prev + RANKING_LOAD_MORE_SIZE, ratedMovie.length) : prev
    );
  }, [ratedMovie?.length]);

  // Frontend pagination for suggestion list (show window, grow on scroll)
  const [suggestionVisibleCount, setSuggestionVisibleCount] = useState(SUGGESTION_INITIAL_SIZE);
  const flatListRef = useRef(null);
  const panRespondersRef = useRef<Record<string, ReturnType<typeof PanResponder.create>>>({});
  const zeroAnimatedValue = useRef(new Animated.Value(0)).current;
  // const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const prevOnlineRef = useRef(true);
  const handleRefreshRef = useRef<(() => Promise<void>) | null>(null);

  const handleRefresh = useCallback(async () => {
    if (!isOnline) {
      errorToast('No Internet! \n Please check your network connection');
      return;
    }
    setRefreshing(true);
    setSuggestionVisibleCount(SUGGESTION_INITIAL_SIZE);
    try {
      dispatch(resetSuggestionPagination());
      await Promise.all([
        dispatch(fetchRankingRatedMovies()).unwrap(),
        dispatch(fetchRankingSuggestionMovies(1)).unwrap(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, dispatch]);

  handleRefreshRef.current = handleRefresh;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      if (prevOnlineRef.current === false && online === true) {
        handleRefreshRef.current?.();
      }
      prevOnlineRef.current = online;
    });
    NetInfo.fetch().then(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      prevOnlineRef.current = online;
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const ratedMovieLengthRef = useRef(0);
  // Initialize animated values when ratedMovie changes
  useEffect(() => {
    // ✅ Guard: Ensure ratedMovie is an array with items
    if (Array.isArray(ratedMovie) && ratedMovie.length > 0) {
      // Initialize order with imdb_ids
      const newOrder = ratedMovie.map(movie => movie?.imdb_id).filter(Boolean);
      setOrder(newOrder);
      if (ratedMovie.length !== ratedMovieLengthRef.current) {
        ratedMovieLengthRef.current = ratedMovie.length;
        setVisibleCount(RANKING_INITIAL_SIZE);
      }

      // Initialize animated values with safety checks
      ratedMovie.forEach((movie, index) => {
        if (!movie || !movie.imdb_id) return; // ✅ Skip invalid movies

        const id = movie.imdb_id;
        if (!animatedPositions[id]) {
          animatedPositions[id] = new Animated.Value(index * ITEM_HEIGHT);
        }
        if (!activeScale[id]) {
          activeScale[id] = new Animated.Value(1);
        }
        if (!activeZIndex[id]) {
          activeZIndex[id] = new Animated.Value(1);
        }
      });
    }
  }, [ratedMovie]);

  const getStepFromStorage = async () => {
    try {
      const value = await AsyncStorage.getItem('currentStep');
      if (value !== null) {
        const step = Number(value);
        setCurrentStep(step);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    getStepFromStorage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        dispatch(resetSuggestionPagination());
        dispatch(fetchRankingSuggestionMovies(1));
        checkSuggestScrollRef.current = true;
        refreshStepCount();
      }
    }, [token, refreshStepCount, dispatch])
  );

  const markTooltipSeen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenTooltip', 'true');
      setHasSeenTooltip(true);
    } catch (e) {
    }
  };

  const getCurrentStep = async () => {
    try {
      const value = await AsyncStorage.getItem('currentStep');
      if (value !== null) {
        return Number(value);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const fetchStep = async () => {
      const step = await getCurrentStep();
      if (typeof step === 'number') setCurrentStep(step);
    };
    fetchStep();
  }, [isModalClosed, setCurrentStep]);

  const goToSearchScreen = useCallback(() => {
    navigation.navigate(ScreenNameEnum.WoodsScreen, {
      type: 'movie',
      title: 'Search Movies',
    });
  }, [navigation]);

  const handleLayout = useCallback((event: { nativeEvent: { layout: { y: number } } }) => {
    const { y } = event.nativeEvent.layout;
    setFlatlistTop(y + (StatusBar.currentHeight ?? 0));
  }, []);

  useEffect(() => {
    if (!token) return;
    const init = async () => {
      dispatch(resetSuggestionPagination());
      await dispatch(fetchRankingRatedMovies());
      await dispatch(fetchRankingSuggestionMovies(1));
      checkSuggestScrollRef.current = true;
    };
    init();
  }, [token, dispatch]);

  useEffect(() => {
    if (isModalClosed) {
      dispatch(fetchRankingRatedMovies({ silent: true }));
      dispatch(setModalClosed(false));
    }
  }, [isModalClosed, dispatch]);

  const handleRemoveMovie = useCallback((imdb_id: string) => {
    setDisplayMovies(prev => prev.filter(m => m?.imdb_id !== imdb_id));
  }, []);

  const handleNavigation = useCallback(
    (imdb_id: string, navToken: string | null) => {
      navigation.navigate(ScreenNameEnum.MovieDetailScreen as never, { imdb_idData: imdb_id, token: navToken } as never);
    },
    [navigation]
  );

  const handleRankingPress = useCallback(
    (movie: { imdb_id?: string }) => {
      compareHook.openFeedbackModal(movie);
    },
    [compareHook]
  );

  const renderMovie = useCallback(
    ({ item, index }: { item: object | string; index: number }) => {
      if (!item || typeof item !== 'object' || !(item as { imdb_id?: string }).imdb_id) return null;
      const imdbId = (item as { imdb_id: string }).imdb_id;
      return (
        <NormalMovieCard
          token={token}
          item={item}
          onPressClose={() => handleRemoveMovie(imdbId)}
          onPressRanking={() => handleRankingPress(item as { imdb_id?: string })}
          flatlistTop={flatlistTop}
          imdb_id={imdbId}
          isFirstItem={index === 1}
          onFirstRankIconMeasure={index === 1 ? (x: number, y: number) => setFirstRankIconPosition({ x, y }) : undefined}
        />
      );
    },
    [token, flatlistTop, handleRemoveMovie, handleRankingPress]
  );

  // Helper functions for loading states
  const addLoadingIds = (ids: (string | undefined)[]) =>
    setLoadingIds(prev => Array.from(new Set([...prev, ...ids.filter(Boolean) as string[]])));

  const removeLoadingIds = (ids: (string | undefined)[]) =>
    setLoadingIds(prev => prev.filter(id => ids.includes(id) === false));

  const indexOf = useCallback((id: string) => orderRef.current.indexOf(id), []);

  const moveItemToIndex = useCallback(
    (id: string, newIndex: number) => {
      const currentOrder = orderRef.current;
      const from = currentOrder.indexOf(id);
      if (from === -1 || newIndex === from) return;

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const next = [...currentOrder];
      next.splice(from, 1);
      next.splice(newIndex, 0, id);
      setOrder(next);
      orderRef.current = next;

      next.forEach((itemId, idx) => {
        if (itemId === dragState.id) return;
        if (animatedPositions[itemId]) {
          Animated.timing(animatedPositions[itemId], {
            toValue: idx * ITEM_HEIGHT,
            duration: 180,
            useNativeDriver: true,
          }).start();
        }
      });

      dispatch(reorderRatedMovies({ fromIndex: from, toIndex: newIndex }));
      updatePairwiseDecisionRef.current?.(id, from, newIndex);
    },
    [dispatch, animatedPositions]
  );

  const swapItems = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const currentOrder = orderRef.current;
      const currentIndex = currentOrder.indexOf(id);
      let newIndex: number;
      if (direction === 'up' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < currentOrder.length - 1) {
        newIndex = currentIndex + 1;
      } else {
        return;
      }
      moveItemToIndex(id, newIndex);
    },
    [moveItemToIndex]
  );

  const updatePairwiseDecisionRef = useRef<(id: string, fromIndex: number, toIndex: number) => void>(() => {});
  const updatePairwiseDecision = async (id: string, fromIndex: number, toIndex: number) => {
    const fromMovie = ratedMovie[fromIndex];
    const toMovie = ratedMovie[toIndex];

    if (!fromMovie?.imdb_id || !toMovie?.imdb_id) return;
    if (loadingIds.includes(fromMovie.imdb_id) || loadingIds.includes(toMovie.imdb_id)) return;

    addLoadingIds([fromMovie.imdb_id, toMovie.imdb_id]);

    const winnerId = fromIndex > toIndex ? fromMovie?.imdb_id : toMovie?.imdb_id;
    const preference = toMovie?.preference ?? fromMovie?.preference ?? "like";

    try {
      const payload = {
        imdb_id_1: fromMovie.imdb_id,
        imdb_id_2: toMovie.imdb_id,
        winner: winnerId,
        preference,
      };

      const res = await recordPairwiseDecision1(token, payload);

      if (res && typeof res === 'object') {
        setTimeout(() => dispatch(updateRatedMovieScores(res as Record<string, number>)), 300);
        dispatch(fetchHomeRecommend({ silent: true }));
      }
    } catch (err) {
      setTimeout(() => {
        const rollbackOrder = [...orderRef.current];
        const [movedItem] = rollbackOrder.splice(toIndex, 1);
        rollbackOrder.splice(fromIndex, 0, movedItem);
        setOrder(rollbackOrder);
        orderRef.current = rollbackOrder;
        dispatch(rollbackRatedMovieOrder({ fromIndex: toIndex, toIndex: fromIndex }));
      }, 100);
    } finally {
      setTimeout(() => {
        removeLoadingIds([fromMovie.imdb_id, toMovie.imdb_id]);
      }, 400);
    }
  };
  updatePairwiseDecisionRef.current = updatePairwiseDecision;

  const onMoveDrag = (id: string, dy: number) => {
    if (dragState.id !== id) return;

    const newTop = dragState.startTop + dy;
    const currentIndex = Math.round(newTop / ITEM_HEIGHT);

    // Clamp to valid range
    const clampedIndex = Math.max(0, Math.min(orderRef.current.length - 1, currentIndex));

    if (clampedIndex !== dragState.currentIndex) {
      // moveItemToIndex(id, clampedIndex);
      // dragState.currentIndex = clampedIndex;
    }

    // Update position of dragged item
    if (animatedPositions[id]) {
      animatedPositions[id].setValue(newTop);
    }
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    dragState.scrollOffset = offsetY;

    // Update positions for all items based on scroll
    if (!dragState.isDragging) {
      orderRef.current.forEach((id, idx) => {
        if (animatedPositions[id]) {
          animatedPositions[id].setValue(idx * ITEM_HEIGHT - offsetY);
        }
      });
    }
  };
  const [showList, setShowList] = useState(true);


  const onStartDragStable = useCallback((id: string, y: number) => {
    const index = orderRef.current.indexOf(id);
    if (index === -1) return;
    dragState.id = id;
    setActiveDragId(id);
    dragState.startY = y;
    dragState.startTop = index * ITEM_HEIGHT;
    dragState.currentIndex = index;
    dragState.isDragging = true;
    if (activeScale[id]) {
      Animated.timing(activeScale[id], {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    if (activeZIndex[id]) {
      Animated.timing(activeZIndex[id], {
        toValue: 999,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const onEndDragStable = useCallback((id: string) => {
    if (dragState.id !== id) return;
    const finalIndex = dragState.currentIndex;
    const finalTop = finalIndex * ITEM_HEIGHT;
    if (animatedPositions[id]) {
      Animated.timing(animatedPositions[id], {
        toValue: finalTop,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    Animated.timing(activeScale[id], {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(activeZIndex[id], {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    dragState.id = null;
    setActiveDragId(null);
    dragState.isDragging = false;
    dragState.currentIndex = -1;
  }, []);

  const getPanResponder = useCallback((id: string) => {
    if (!panRespondersRef.current[id]) {
      panRespondersRef.current[id] = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
        onPanResponderGrant: (_, gestureState) => onStartDragStable(id, gestureState.y0),
        onPanResponderMove: (_, gestureState) => onMoveDrag(id, gestureState.dy),
        onPanResponderRelease: () => onEndDragStable(id),
        onPanResponderTerminate: () => onEndDragStable(id),
      });
    }
    return panRespondersRef.current[id].panHandlers as Record<string, unknown>;
  }, [onStartDragStable, onEndDragStable]);

  useEffect(() => {
    if (ratedMovie.length > 0 && rankingRenderedCount >= ratedMovie.length) {
      setIsRankingFullyRendered(true);
    }
  }, [rankingRenderedCount, ratedMovie.length]);

  const onViewableItemsChanged = useRef(({ viewableItems, changed }: string | object) => {
    const renderedCount = viewableItems.length;
    setRankingRenderedCount(renderedCount);
  }).current;
  useEffect(() => {
    setDisplayMovies(filteredMovies.slice(0, suggestionVisibleCount));
  }, [filteredMovies, suggestionVisibleCount]);

  const getRankingItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const rankingData = useMemo(
    () => order.slice(0, visibleCount),
    [order, visibleCount]
  );

  const rankingKeyExtractor = useCallback((id: string, index: number) => id || `ranking-${index}`, []);

  const rankingExtraData = useMemo(
    () => [activeDragId, loadingIds],
    [activeDragId, loadingIds]
  );

  const renderRankingItem = useCallback(
    ({ item: id, index }: { item: string; index: number }) => {
      const movie = ratedMovieRef.current.find((m: { imdb_id?: string }) => m.imdb_id === id);
      if (!movie) return null;
      const itemId = movie.imdb_id as string;
      if (!animatedPositions[itemId]) {
        animatedPositions[itemId] = new Animated.Value(index * ITEM_HEIGHT);
      }
      if (!activeScale[itemId]) activeScale[itemId] = new Animated.Value(1);
      if (!activeZIndex[itemId]) activeZIndex[itemId] = new Animated.Value(1);
      return (
        <RankingListItem
          itemId={itemId}
          index={index}
          movie={movie as RankingMovie}
          isActive={activeDragId === itemId}
          isSwapping={loadingIds.includes(itemId)}
          totalCount={ratedMovieRef.current.length}
          token={token}
          animatedPosition={animatedPositions[itemId]}
          scale={activeScale[itemId]}
          zIndexVal={activeZIndex[itemId]}
          zeroAnimatedValue={zeroAnimatedValue}
          panHandlers={getPanResponder(itemId)}
          onNavigate={handleNavigation}
          onSwap={swapItems}
          onStartDrag={onStartDragStable}
        />
      );
    },
    [activeDragId, loadingIds, token, getPanResponder, handleNavigation, swapItems, onStartDragStable]
  );

  const handleSuggestionEndReached = useCallback(() => {
    if (suggestionVisibleCount < filteredMovies.length) {
      setSuggestionVisibleCount(prev => Math.min(prev + SUGGESTION_LOAD_MORE_SIZE, filteredMovies.length));
    } else if (suggestionHasMore && !suggestionLoading) {
      dispatch(fetchRankingSuggestionMovies(suggestionPage + 1));
    }
  }, [suggestionVisibleCount, filteredMovies.length, suggestionHasMore, suggestionLoading, suggestionPage, dispatch]);

  const suggestionKeyExtractor = useCallback((item: { imdb_id?: string }, index: number) => {
    return item?.imdb_id ?? `suggestion-${index}`;
  }, []);

  const suggestionListFooter = useCallback(
    () => (suggestionLoading ? <ActivityIndicator size="large" color={Color.primary} /> : null),
    [suggestionLoading]
  );

  const rankingListFooter = useCallback(
    () => (
      <ButtonCustom
        title={t('discover.dis_cover')}
        onPress={() =>
          navigation.navigate(ScreenNameEnum.DiscoverTab as never, {
            screen: ScreenNameEnum.DiscoverScreen,
            params: { type: 'recs' },
          } as never)
        }
        textStyle={{ color: Color.whiteText }}
        buttonStyle={{ marginTop: 5 }}
      />
    ),
    [navigation]
  );

  const handleCloseTooltip = useCallback(() => {
    setTooltipModal(false);
    markTooltipSeen();
  }, []);

  const extraDataSuggestion = useMemo(
    () => [suggestionLoading, suggestionHasMore],
    [suggestionLoading, suggestionHasMore]
  );

  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomStatusBar />

      <View style={styles.container}>
        <TouchableOpacity onPress={goToSearchScreen} activeOpacity={1}>
          <View pointerEvents="none" style={{ marginBottom: 10 }}>
            <SearchBarCustom
              placeholder={(t("discover.searchmovies"))}
              placeholderTextColor={Color.textGray}
              editable={false}
            />
          </View>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Color.primary]}
              tintColor={Color.primary}
              title={isOnline ? "Pull to refresh" : "Offline - Pull when connected"}
              titleColor={Color.grey700}
            // enabled={isOnline} // Disable when offline
            />
          }
        //  contentContainerStyle={{ flexGrow: 1 }}
        >
          {currentStep <= STEPPER_VALUE && (
            <StepProgressBar
              totalSteps={totalSteps}
              showwithStepCount={true}
              disable={true}
              currentStepModal={currentStep}
            />
          )}


          {/* Rated Movies Section */}
          {currentStep > STEPPER_VALUE && (
            loadingRated ? (
              <View style={{ paddingHorizontal: 10, marginTop: 14 }}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <NormalMovieCardShimmer key={index.toString()} />
                ))}
              </View>
            ) : (
              // <Animated.FlatList
              //   ref={flatListRef}
              //   data={order}
              //   showsVerticalScrollIndicator={false}
              //   renderItem={({ item: id, index }) => {
              //     const movie = ratedMovie.find(m => m.imdb_id === id);
              //     if (!movie) return null;
              //     return RankingMovieList({ item: movie, index });
              //   }}
              //   keyExtractor={(id) => id}
              //   extraData={[ratedMovie, loadingIds, order]}
              //   contentContainerStyle={{ paddingBottom: 20 }}
              //   refreshing={refreshing}
              //   onRefresh={fetchRatedMovies}
              //   onScroll={handleScroll}
              //   scrollEventThrottle={16}
              //   initialNumToRender={8}
              //   maxToRenderPerBatch={10}
              //   windowSize={5}
              //   removeClippedSubviews={Platform.OS === 'android'}
              //   getItemLayout={(data, index) => ({
              //     length: ITEM_HEIGHT,
              //     offset: ITEM_HEIGHT * index,
              //     index,
              //   })}
              //   onViewableItemsChanged={onViewableItemsChanged}
              //   viewabilityConfig={{ itemVisiblePercentThreshold: 100 }}
              //   ListFooterComponent={
              //     loading ? <NormalMovieCardShimmer /> : null
              //   }
              // />

              <Animated.FlatList
                ref={flatListRef}
                data={rankingData}
                renderItem={renderRankingItem}
                keyExtractor={rankingKeyExtractor}
                getItemLayout={getRankingItemLayout}
                extraData={rankingExtraData}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={8}
                updateCellsBatchingPeriod={50}
                windowSize={5}
                removeClippedSubviews={true}
                onEndReachedThreshold={0.2}
                onEndReached={loadMoreItems}
                ListFooterComponent={rankingListFooter}
              />
            )
          )}



          {(!showList || loadingRated || (ratedMovie.length > 0 && visibleCount < ratedMovie.length)) ? null : (
            <>
              <>
                {/* <ButtonCustom
                      title="Discover"
                      onPress={() => navigation.navigate(ScreenNameEnum.DiscoverTab, {
                        screen: ScreenNameEnum.DiscoverScreen,
                        params: { type: 'recs' },
                      })}
                      textStyle={
                        {
                          color: Color.whiteText
                        }
                      }
                      buttonStyle={{
                        marginTop: 5
                      }}
                    />   */}


              </>



              {/* {(t("login.next"))}  */}
              <Text style={styles.heading}>
                {(t("discover.haveyou"))} {"\n"}
                <Text style={{ color: Color.whiteText }}>
                  {(t("discover.wed"))}
                </Text>
              </Text>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={displayMovies}
                keyExtractor={suggestionKeyExtractor}
                ref={listRef}
                onLayout={handleLayout}
                renderItem={renderMovie}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={8}
                contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
                onEndReached={handleSuggestionEndReached}
                onEndReachedThreshold={0.2}
                extraData={extraDataSuggestion}
                ListFooterComponent={suggestionListFooter}
              />
            </>
          )}


          {/* { refreshing  ?  null: displayMovies?.length  > 0 ? null    : <>
                  
                 </>} 
   <FlatList
    showsVerticalScrollIndicator={false}
    data={displayMovies}
    keyExtractor={(item, index) =>
      `${index}-${String(item?.imdb_id ?? index)}`
    }
    ref={listRef}
    onLayout={handleLayout}
    renderItem={renderMovie}
    initialNumToRender={10}
    maxToRenderPerBatch={10}
    windowSize={8}
    contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
    onEndReached={() => {
      if (suggestionHasMore && !suggestionLoading) {
        dispatch(fetchRankingSuggestionMovies(suggestionPage + 1));
      }
    }}
    onEndReachedThreshold={0.2}
    extraData={[filteredMovies, suggestionLoading, suggestionHasMore]}
    ListFooterComponent={
      suggestionLoading ? (
        <ActivityIndicator size="large" color={Color.primary} />
      ) : null
    }
  /> */}
          {/* )} */}


        </ScrollView>
      </View>

      <CompareModals token={token} useCompareHook={compareHook} />
      <SlideInTooltipModal
        visible={TooltipModal && firstRankIconPosition != null}
        onClose={handleCloseTooltip}
        flatlistTop={flatlistTop}
        firstRankIconPosition={firstRankIconPosition}
      />

    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  cardContainer: {
    // position: 'absolute',
    left: 0,
    right: 0,
  },
});

export default React.memo(RankingScreen);