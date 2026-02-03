

import React, { useCallback, useEffect, useRef, useState, } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StatusBar, Image, ActivityIndicator, Platform, LayoutAnimation, UIManager, Animated, PanResponder, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import styles from './style';
import ScreenNameEnum from '@routes/screenName.enum';
import { RootState } from '@redux/store';
import { getAllRatedMovies, getRankingSuggestionMovie, recordPairwiseDecision, recordPairwiseDecision1 } from '@redux/Api/movieApi';
import NormalMovieCard from '@components/common/NormalMovieCard/NormalMovieCard';
import StepProgressBar from '@components/modal/stepProgressModal/StepProgressBar';
import LayeredShadowText from '@components/common/LayeredShadowText/LayeredShadowText';
import { useCompareComponent } from './useCompareComponent';
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


const ITEM_HEIGHT = 180; // Adjust based on your movie card height

const RankingScreen = () => {
  const token = useSelector((state: RootState) => state?.auth?.token);
  const { currentStep, setCurrentStep } = useCompareComponent(token);
  const route = useRoute()
  const navigation = useNavigation();
  const { openTooltipModal } = route?.params ?? {};
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [ratedMovie, setRatedMovie] = useState([]);

  const [flatlistTop, setFlatlistTop] = useState(null);
  const listRef = useRef(null);
  const totalSteps = 5;
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [TooltipModal, setTooltipModal] = useState<boolean>(openTooltipModal || false);
  const [suggestionPage, setSuggestionPage] = useState(1);
  const [suggestionHasMore, setSuggestionHasMore] = useState(true);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [displayMovies, setDisplayMovies] = useState([]);
  const pageRef = useRef(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const ratedMovieRef = useRef(ratedMovie);
  useEffect(() => { ratedMovieRef.current = ratedMovie; }, [ratedMovie]);

  const dispatch = useDispatch();
  const isModalClosed = useSelector((state: RootState) => state?.modal?.isModalClosed);

  const [loadingRated, setLoadingRated] = useState(true);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const [rankingRenderedCount, setRankingRenderedCount] = useState(0);
  const [isRankingFullyRendered, setIsRankingFullyRendered] = useState(false);

  const checkSuggestScrollRef = useRef(false);
  const pageref = useRef(false);

  // Drag and Drop State
  const [order, setOrder] = useState([]);
  const animatedPositions = useRef({}).current;
  const activeScale = useRef({}).current;
  const activeZIndex = useRef({}).current;

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
  const [visibleCount, setVisibleCount] = useState(180);

  const loadMoreItems = () => {
    if (visibleCount < ratedMovie?.length) {
      setVisibleCount(prev => prev + 20);
    }
  };
  const flatListRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Initialize animated values when ratedMovie changes
  useEffect(() => {
    // ✅ Guard: Ensure ratedMovie is an array with items
    if (Array.isArray(ratedMovie) && ratedMovie.length > 0) {
      // Initialize order with imdb_ids
      const newOrder = ratedMovie.map(movie => movie?.imdb_id).filter(Boolean);
      setOrder(newOrder);

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
        setFilteredMovies([]);
        setSuggestionPage(1);
        setSuggestionHasMore(true);
        fetchSuggestionMovies();
        checkSuggestScrollRef.current = true;
      }
    }, [token])
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
      setCurrentStep(step);
    };
    fetchStep();
  }, [isModalClosed]);

  const goToSearchScreen = useCallback(() => {
    navigation.navigate(ScreenNameEnum.WoodsScreen, {
      type: 'movie',
      title: 'Search Movies',
    });
  }, [navigation]);

  const handleLayout = (event) => {
    const { y } = event.nativeEvent.layout;
    const statusbar = y + StatusBar.currentHeight;
    setFlatlistTop(statusbar);
  };

  const fetchRatedMovies = async () => {
    if (!token) return;

    setLoading(true);
    setRefreshing(true);
    try {
      const res_All_Rated = await getAllRatedMovies(token);
      setRefreshing(false);
      const safeRated = Array.isArray(res_All_Rated?.results)
        ? res_All_Rated.results
        : [];
      setRatedMovie(safeRated);
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
    } finally {
      setLoading(false);
      setLoadingRated(false);
      setRefreshing(false);
    }
  };

  const fetchSuggestionMovies = async () => {
    if (!token || suggestionLoading || !suggestionHasMore) return;
    setSuggestionLoading(true);
    try {
      const res = await getRankingSuggestionMovie(token, pageRef.current);
      const safeResults = Array.isArray(res?.results) ? res.results : [];
      if (pageRef.current === 1) {
        setFilteredMovies(safeResults);
      } else {
        setFilteredMovies(prev => {
          const existingIds = new Set(prev.map(m => m?.imdb_id));
          const newResults = safeResults.filter(m => m && m.imdb_id && !existingIds.has(m.imdb_id));
          return [...prev, ...newResults];
        });
      }

      setTimeout(() => {
        pageRef.current += 1;
      }, 400);

      const totalPages = Number(res?.total_pages ?? 0);
      if (totalPages && pageRef.current > totalPages) {
        setSuggestionHasMore(false);
      }
    } catch (error) {
    } finally {
      setSuggestionLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      setLoadingRated(true)
      await fetchRatedMovies();
      setFilteredMovies([]);
      setSuggestionPage(1);
      setSuggestionHasMore(true);
      await fetchSuggestionMovies();
      checkSuggestScrollRef.current = true;
    }
    init()
  }, [token]);

  useEffect(() => {
    if (isModalClosed) {
      fetchRatedMovies();
      dispatch(setModalClosed(false));
    }
  }, [isModalClosed, dispatch]);

  const handleRemoveMovie = (imdb_id: string) => {
    setDisplayMovies((prevMovies) => prevMovies.filter((movie) => movie?.imdb_id !== imdb_id));
  };

  const handleNavigation = (imdb_id: string, token: string) => {
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, { imdb_idData: imdb_id, token: token })
  };

  const renderMovie = useCallback(({ item }: { item: object | string }) => {
    if (!item || typeof item !== 'object' || !item.imdb_id) return null;
    return (
      <NormalMovieCard
        token={token}
        item={item}
        onPressClose={() => handleRemoveMovie(item.imdb_id)}
        onPressRanking={() => handleRankingPress(item)}
        flatlistTop={flatlistTop}
        imdb_id={item.imdb_id}
      />
    );
  }, [flatlistTop, suggestionPage]);

  const compareHook = useCompareComponent(token);

  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
  };

  // Helper functions for loading states
  const addLoadingIds = (ids: (string | undefined)[]) =>
    setLoadingIds(prev => Array.from(new Set([...prev, ...ids.filter(Boolean) as string[]])));

  const removeLoadingIds = (ids: (string | undefined)[]) =>
    setLoadingIds(prev => prev.filter(id => ids.includes(id) === false));

  // Drag and Drop Functions
  const indexOf = (id) => order.indexOf(id);

  const animateTo = (id, toTop, duration = 180) => {
    if (animatedPositions[id]) {
      Animated.timing(animatedPositions[id], {
        toValue: toTop,
        duration,
        useNativeDriver: true,
      }).start();
    }
  };

  const moveItemToIndex = (id, newIndex) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const from = order.indexOf(id);
    if (from === -1 || newIndex === from) return;

    const next = [...order];
    next.splice(from, 1);
    next.splice(newIndex, 0, id);
    setOrder(next);

    // Animate all items except the dragged one
    next.forEach((itemId, idx) => {
      if (itemId === dragState.id) return;
      if (animatedPositions[itemId]) {
        animateTo(itemId, idx * ITEM_HEIGHT);
      }
    });

    // Update ratedMovie order
    setRatedMovie(prev => {
      const updated = [...prev];
      const [movedItem] = updated.splice(from, 1);
      updated.splice(newIndex, 0, movedItem);
      return updated;
    });

    // Update API for the swap
    updatePairwiseDecision(id, from, newIndex);
  };

  const updatePairwiseDecision = async (id, fromIndex, toIndex) => {
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
      // const res = await recordPairwiseDecision(token, payload);

      // Update scores
      setTimeout(() => {
        setRatedMovie(prev =>
          prev.map(m => ({
            ...m,
            rec_score: res?.[m.imdb_id] ?? m.rec_score,
          }))
        );
      }, 300);

    } catch (err) {

      // Rollback
      setTimeout(() => {
        const rollbackOrder = [...order];
        const [movedItem] = rollbackOrder.splice(toIndex, 1);
        rollbackOrder.splice(fromIndex, 0, movedItem);
        setOrder(rollbackOrder);

        setRatedMovie(prev => {
          const updated = [...prev];
          const [movedItem] = updated.splice(toIndex, 1);
          updated.splice(fromIndex, 0, movedItem);
          return updated;
        });
      }, 100);
    } finally {
      setTimeout(() => {
        removeLoadingIds([fromMovie.imdb_id, toMovie.imdb_id]);
      }, 400);
    }
  };

  const swapItems = (id, direction) => {
    const currentIndex = indexOf(id);
    let newIndex;

    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < order.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    moveItemToIndex(id, newIndex);
  };

  const onStartDrag = (id, y) => {
    const index = indexOf(id);
    if (index === -1) return;

    dragState.id = id;
    dragState.startY = y;
    dragState.startTop = index * ITEM_HEIGHT;
    dragState.currentIndex = index;
    dragState.isDragging = true;

    // Highlight dragged item
    Animated.timing(activeScale[id], {
      toValue: 1.05,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(activeZIndex[id], {
      toValue: 999,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const onMoveDrag = (id, dy) => {
    if (dragState.id !== id) return;

    const newTop = dragState.startTop + dy;
    const currentIndex = Math.round(newTop / ITEM_HEIGHT);

    // Clamp to valid range
    const clampedIndex = Math.max(0, Math.min(order.length - 1, currentIndex));

    if (clampedIndex !== dragState.currentIndex) {
      // moveItemToIndex(id, clampedIndex);
      // dragState.currentIndex = clampedIndex;
    }

    // Update position of dragged item
    if (animatedPositions[id]) {
      animatedPositions[id].setValue(newTop);
    }
  };

  const onEndDrag = (id) => {
    if (dragState.id !== id) return;

    const finalIndex = dragState.currentIndex;
    const finalTop = finalIndex * ITEM_HEIGHT;

    // Snap to final position
    if (animatedPositions[id]) {
      animateTo(id, finalTop, 150);
    }

    // Reset scale and z-index
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

    // Reset drag state
    dragState.id = null;
    dragState.isDragging = false;
    dragState.currentIndex = -1;
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    dragState.scrollOffset = offsetY;

    // Update positions for all items based on scroll
    if (!dragState.isDragging) {
      order.forEach((id, idx) => {
        if (animatedPositions[id]) {
          animatedPositions[id].setValue(idx * ITEM_HEIGHT - offsetY);
        }
      });
    }
  };
  const [showList, setShowList] = useState(true);


  // PanResponder for drag gesture
  const panResponder = (id) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderGrant: (_, gestureState) => {
      onStartDrag(id, gestureState.y0);
    },
    onPanResponderMove: (_, gestureState) => {
      onMoveDrag(id, gestureState.dy);
    },
    onPanResponderRelease: () => {
      onEndDrag(id);
    },
    onPanResponderTerminate: () => {
      onEndDrag(id);
    },
  });

  const RankingMovieList = useCallback(({ item, index }: { item: object | string; index: number }) => {
    if (!item || !item.imdb_id) return null;
    const itemId = item.imdb_id;
    const isSwapping = loadingIds.includes(itemId);
    const isActive = dragState.id === itemId;
    const animatedPosition =
      animatedPositions[itemId] ||
      (animatedPositions[itemId] = new Animated.Value(index * ITEM_HEIGHT));
    const translateY = isActive ? animatedPosition : new Animated.Value(0);
    const scale =
      activeScale[itemId] || (activeScale[itemId] = new Animated.Value(1));
    const zIndex =
      activeZIndex[itemId] || (activeZIndex[itemId] = new Animated.Value(1));
    return (
      <Animated.View
        style={[
          localStyles.cardContainer,
          {
            height: ITEM_HEIGHT,
            position: dragState.id === item.imdb_id ? 'absolute' : 'relative',
            left: 0,
            right: 0,
            transform: [
              { translateY: dragState.id === item.imdb_id ? animatedPositions[item.imdb_id] : 0 },
              { scale: scale }
            ],
            zIndex: isActive ? 999 : index,
          }
        ]}
      >
        <TouchableOpacity
          {...panResponder(itemId).panHandlers}
          style={[styles.movieCard]}
          activeOpacity={0.7}
          onLongPress={() => onStartDrag(item.imdb_id, 0)}
        >
          <TouchableOpacity
            style={[styles.rankingCardContainer, { marginTop: 2 }]}
            onPress={() => handleNavigation(item.imdb_id, token)}
            activeOpacity={0.8}
            disabled={isSwapping || isActive}
          >
            <Image
              source={
                item?.cover_image_url && item.cover_image_url.trim().length > 0
                  ? { uri: item.cover_image_url }
                  : imageIndex.SingleMovie5
              }
              style={styles.poster}
              resizeMode="stretch"
            />

          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigation(itemId, token)}
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
              {item.title}
            </CustomText>
            <CustomText
              size={14}
              color={Color.placeHolder}
              style={styles.year}
              font={font.PoppinsRegular}
            >
              {item.release_year}
            </CustomText>

            <View style={[styles.iconprimary, { alignSelf: 'flex-end' }]}>
              {Platform.OS == 'ios' ?
                <OutlineTextIOS text={(index + 1)} fontSize={60} /> :
                <LayeredShadowText text={(index + 1)} fontSize={60} marginRight={12} />
              }
            </View>
          </TouchableOpacity>

          <View style={styles.icons}>
            <View style={{ alignSelf: 'flex-end' }}>
              <RankingWithInfo
                score={item?.rec_score}
                title=  {(t("discover.recscore"))}   
                description={(t("discover.recscoredes"))}   
                // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
              />
            </View>

            <View style={styles.centerContainer}>
              <View style={styles.iconprimary}>
                {index > 0 && (
                  <TouchableOpacity
                    onPress={() => swapItems(itemId, 'up')}
                    disabled={isSwapping || isActive}
                  >
                    <Image
                      source={imageIndex.chevronUp}
                      style={{
                        height: 24,
                        width: 24,
                        opacity: isSwapping || isActive ? 0.5 : 1
                      }}
                      tintColor={Color.textGray}
                      resizeMode='contain'
                    />
                  </TouchableOpacity>
                )}
                {index < ratedMovie.length - 1 && (
                  <TouchableOpacity
                    onPress={() => swapItems(itemId, 'down')}
                    disabled={isSwapping || isActive}
                  >
                    <Image
                      source={imageIndex.downDown}
                      resizeMode='contain'
                      style={{
                        height: 24,
                        width: 24,
                        opacity: isSwapping || isActive ? 0.5 : 1
                      }}
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
  }, [token, ratedMovie, loadingIds, order, dragState.id]);

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
    setDisplayMovies(filteredMovies);
  }, [filteredMovies, visibleCount]);

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

        <ScrollView showsVerticalScrollIndicator={false}>


          {/* Rated Movies Section */}
          {currentStep >= 5 && (
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
                showsVerticalScrollIndicator={false}
                data={order.slice(0, visibleCount)}
                renderItem={({ item: id, index }) => {
                  const movie = ratedMovie.find(m => m.imdb_id === id);
                  if (!movie) return null;

                  return RankingMovieList({ item: movie, index });
                }}
                keyExtractor={(id, index) => id ?? `ranking-${index}`}

                initialNumToRender={10}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={7}
                removeClippedSubviews={true}

                onEndReachedThreshold={0.2}
                onEndReached={loadMoreItems}
                ListHeaderComponent={() =>
                
                <>
                
            

                </>
                }
                 
                ListFooterComponent={() =>
                  <>

     
              <ButtonCustom
                title= {(t("discover.dis_cover"))}  
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
              />



                   
                  </>
                }
              />
            )
          )}
      {TooltipModal && totalSteps == 5 && currentStep >= 0 && (
  <StepProgressBar
    totalSteps={totalSteps}
    disable={true}
   currentStepModal={currentStep}
  />
)}


          {!showList ? null : (
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
                    /> */}


              </>

              {/* {showList  && (
      <Text style={styles.heading}>
        Have you had a chance to watch these yet?{"\n"}
        <Text style={{ color: Color.whiteText }}>
          We'd like to know your thoughts!
        </Text>
      </Text>
    )} */}
              {/* {totalSteps == 5 && currentStep >= 0 && (
  <StepProgressBar
    totalSteps={totalSteps}
    disable={true}
    currentStepModal={currentStep}
  />
)} */}
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
                keyExtractor={(item, index) => index?.toString()}
                ref={listRef}
                onLayout={handleLayout}
                renderItem={renderMovie}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={8}
                contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
                onEndReached={() => {
                  if (suggestionHasMore && !suggestionLoading) {
                    fetchSuggestionMovies(suggestionPage + 1);
                  }
                }}
                onEndReachedThreshold={0.2}
                extraData={[filteredMovies, suggestionLoading, suggestionHasMore]}
                ListFooterComponent={
                  suggestionLoading ? (
                    <ActivityIndicator size="large" color={Color.primary} />
                  ) : null
                }
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
        fetchSuggestionMovies(suggestionPage + 1);
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
        visible={TooltipModal}
        onClose={() => {
          setTooltipModal(false);
          markTooltipSeen();
        }}
        flatlistTop={flatlistTop}
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