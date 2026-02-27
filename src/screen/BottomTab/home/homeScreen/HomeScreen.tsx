import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { CustomStatusBar } from '@components';
import imageIndex from '@assets/imageIndex';
import styles from './style';
import ScreenNameEnum from '@routes/screenName.enum';
import useHome from './useHome';
import { Color } from '@theme/color';
import Notification from './Notification/Notification';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@redux/store';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvatarShimmer from '@components/ShimmerCom/AvatarShimmer';
import MemoFeedCardHome from '@components/card/feedCard/MemoFeedCardHome';
import FeedCardShimmer from '@components/card/feedCard/FeedCardShimmer';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';
import NetInfo from '@react-native-community/netinfo';
import { errorToast } from '@utils/customToast';
import RecentUsersList from './components/RecentUsersList';
import DiscoverPeopleSection from './components/DiscoverPeopleSection';
import HomeHeader from './components/HomeHeader';
import {
  fetchHomeFeed,
  fetchHomeRecentUsers,
  fetchHomeSuggestedFriends,
  fetchHomeTrending,
  fetchHomeRecommend,
  fetchHomeBookmarks,
  resetHomeFeedPagination,
} from '@redux/feature/homeSlice';



const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const autoPlayEnabled = useSelector(
    (state: RootState) => state.auth.userGetData?.autoplay_trailer ?? true
  );
  const isMuted = false;
  const { navigation, setIsVisible } = useHome();

  const {
    feedData,
    feedPage,
    feedHasMore,
    loadingFeed,
    loadingMoreFeed,
    recentUsers,
    suggestedFriends,
    trendingData,
    recommendData,
    bookmarkData,
    loadingRecentUsers: userloading,
    loadingTrending,
    loadingRecs,
    loadingBookmark,
  } = useSelector((state: RootState) => state.home);

  const [notificationModal, setNotificationModal] = useState(false);

  // scroll states
  const [hasScrolled, setHasScrolled] = useState(false);
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);

  const isFocused = useIsFocused();
  const restoredRef = useRef(false);
  const lastPlayedIndexRef = useRef<number | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const prevOnlineRef = useRef(true);
  const flatListRef = useRef<FlatList>(null);
  const onRefreshRef = useRef<(() => Promise<void>) | null>(null);
  const initialFeedFetchedRef = useRef(false);

  // Refresh function: all home APIs via Redux
  const onRefresh = useCallback(async () => {
    if (!isOnline) {
      errorToast('No Internet! \n Please check your network connection');
      return;
    }
    setRefreshing(true);
    try {
      dispatch(resetHomeFeedPagination());
      await Promise.all([
        dispatch(fetchHomeFeed({ reset: true })).unwrap().catch(() => {}),
        dispatch(fetchHomeTrending()).unwrap().catch(() => {}),
        dispatch(fetchHomeRecommend()).unwrap().catch(() => {}),
        dispatch(fetchHomeBookmarks()).unwrap().catch(() => {}),
        dispatch(fetchHomeRecentUsers()).unwrap().catch(() => {}),
        dispatch(fetchHomeSuggestedFriends()).unwrap().catch(() => {}),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, dispatch]);

  onRefreshRef.current = onRefresh;
 
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      if (prevOnlineRef.current === false && online === true) {
        onRefreshRef.current?.();
      }
      prevOnlineRef.current = online;
    });
    return () => unsubscribe();
  }, []);

  const combinedData = useMemo(() => {
     return [
      { type: 'profileStatus' },
      { type: 'header' },
      // ...discoverItem,
      ...feedData.map((item: object) => ({ ...item, type: 'feed' })),
    ];
  }, [feedData, loadingFeed]);

  const compareHook = useCompareComponent(token);

  // refs for scroll management
  const playIndexRef = useRef<number | null>(null);
  const currentVisibleIndexRef = useRef<number>(0);
  const isFocusedRef = useRef<boolean>(false);

  // sync refs when states change
  useEffect(() => {
    playIndexRef.current = playIndex;
  }, [playIndex]);

  useEffect(() => {
    currentVisibleIndexRef.current = currentVisibleIndex;
  }, [currentVisibleIndex]);

  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 90,
    minimumViewTime: 250
  });

  // Stable onViewableItemsChanged handler
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: (object | string | null | number)[] }) => {
    if (!isFocusedRef.current) return;

    if (!viewableItems || viewableItems?.length === 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (playIndexRef.current !== null) {
        setPlayIndex(null);
        playIndexRef.current = null;
      }
      return;
    }

    const headerOrProfileVisible = viewableItems.some(
      v => v?.item?.type === 'header' || v?.item?.type === 'profileStatus'
    );

    if (headerOrProfileVisible) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (playIndexRef.current !== null) {
        setPlayIndex(null);
        playIndexRef.current = null;
      }
      lastPlayedIndexRef.current = null;
      return;
    }

    const firstVisible = viewableItems[0];
    const index = firstVisible?.index ?? 0;

    const isFeedCardVisible = viewableItems.some(
      item => item?.item?.movie && item?.item?.user
    );

    if (!isFeedCardVisible) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (playIndexRef.current !== null) {
        setPlayIndex(null);
        playIndexRef.current = null;
        lastPlayedIndexRef.current = 0;
      }
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      const target = index - 1;
      if (playIndexRef.current !== target) {
        currentVisibleIndexRef.current = index;
        setCurrentVisibleIndex(index);
        playIndexRef.current = target;
        setPlayIndex(target);
        lastPlayedIndexRef.current = target;
      }
      timeoutRef.current = null;
    }, 800);
  }).current;

  // Initial load: all home APIs via Redux
  useEffect(() => {
    if (!token) return;
    dispatch(fetchHomeTrending());
    dispatch(fetchHomeRecommend());
    dispatch(fetchHomeBookmarks());
    dispatch(fetchHomeRecentUsers());
    dispatch(fetchHomeSuggestedFriends());
  }, [token, dispatch]);

  // Feed: first page on mount when token exists
  useEffect(() => {
    if (!token || initialFeedFetchedRef.current) return;
    initialFeedFetchedRef.current = true;
    dispatch(fetchHomeFeed({ reset: true }));
  }, [token, dispatch]);

  // Focus effect for restoring index
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const restoreIndex = async () => {
        try {
          const savedIndex = await AsyncStorage.getItem('homeIndex');
          if (savedIndex !== null && isActive && !restoredRef.current) {
            const index = parseInt(savedIndex, 10);
            setCurrentVisibleIndex(index + 1);
            setPlayIndex(index);
            restoredRef.current = true;
          }
        } catch (err) {
        }
      };

      restoreIndex();

      return () => {
        isActive = false;
      };
    }, [])
  );

   useFocusEffect(
    useCallback(() => {
      if (!token) return;
      dispatch(fetchHomeFeed({ reset: true, silent: true }));
      dispatch(fetchHomeBookmarks({ silent: true }));
      dispatch(fetchHomeRecentUsers({ silent: true }));
      dispatch(fetchHomeSuggestedFriends({ silent: true }));
      dispatch(fetchHomeTrending({ silent: true }));
      dispatch(fetchHomeRecommend({ silent: true }));
    }, [token, dispatch])
  );

  // Save index
  useEffect(() => {
    const saveIndex = async () => {
      let indexForVideo = currentVisibleIndex - 1;
      try {
        await AsyncStorage.setItem('homeIndex', indexForVideo.toString());
      } catch (err) {
      }
    };

    if (currentVisibleIndex !== null) {
      saveIndex();
    }
  }, [currentVisibleIndex]);

  const [feedReached, setFeedReached] = useState(false);

  const renderFooter = useCallback(() => {
    if (loadingFeed && combinedData.length <= 50) {
      return <FeedCardShimmer />;
    }

    if (loadingFeed && combinedData.length > 50) {
      return (
        <View style={{ paddingVertical: 20, paddingBottom: 90 }}>
          <Text style={{ textAlign: "center", color: "gray" }}>
            {t("emptyState.pleasewait")}
          </Text>
          <ActivityIndicator
            size="small"
            color={Color.primary}
            style={{ marginTop: 8 }}
          />
        </View>
      );
    }

    if (loadingMoreFeed) {
      return (
        <View style={{ paddingVertical: 20, paddingBottom: 90 }}>
          <ActivityIndicator size="small" color={Color.primary} style={{ marginTop: 8 }} />
        </View>
      );
    }

    if (!feedHasMore && combinedData.length > 0) {
      return (
        <View style={{ paddingVertical: 20, paddingBottom: 90 }}>
          <Text style={{ textAlign: "center", color: "gray" }} />
        </View>
      );
    }

    return <FeedCardShimmer />;
  }, [loadingFeed, loadingMoreFeed, feedHasMore, combinedData.length]);

  const handleUserPress = useCallback(
    (item: { username?: string; id?: string | number; avatar?: string }) => {
      navigation.navigate(ScreenNameEnum.OtherProfile as never, { item } as never);
    },
    [navigation]
  );

  const handleFollowSuggested = useCallback(
    (username: string) => {
      dispatch(fetchHomeFeed({ silent: true }));
      dispatch(fetchHomeRecentUsers({ silent: true }));
      dispatch(fetchHomeSuggestedFriends({ silent: true }));
    },
    [dispatch]
  );

  const handleFeedReached = useCallback(() => setFeedReached(true), []);

  const handleRankPress = useCallback(() => setIsVisible(true), [setIsVisible]);

  const handleCloseNotification = useCallback(() => setNotificationModal(false), []);

  const handleSeeAllSuggested = useCallback(() => {
    navigation.navigate(ScreenNameEnum.Followers as never, { tabToOpen: 2, type: 'Suggested' } as never);
  }, [navigation]);

  const MemoFeedCardRender = useCallback((item, index, avatarUri, posterUri) => {
    return (
      <MemoFeedCardHome
        avatar={{ uri: avatarUri }}
        poster={{ uri: posterUri }}
        activity={item?.activity}
        key={item.movie?.imdb_id}
        user={item.user?.name || item.user?.username}
        username={item.user?.username}
        title={item.movie?.title}
        comment={item.comment}
        release_year={item?.movie?.release_year?.toString()}
        videoUri={item.movie?.trailer_url}
        imdb_id={item.movie?.imdb_id}
        isMuted={isMuted}
        token={token}
        rankPress={handleRankPress}
        ranked={item?.rec_score}
        created_date={item?.created_date}
        shouldAutoPlay={autoPlayEnabled}
        isVisible={index === currentVisibleIndex}
        videoIndex={index}
        scoreType='Friend Score'
        shouldPlay={index - 1 === playIndex}
        isPaused={index - 1 !== playIndex}
        is_bookMark={item?.is_bookmarked}
        screenName='Home__Screen'
      />
    );
  }, [playIndex, currentVisibleIndex, autoPlayEnabled, token, isMuted, handleRankPress]);

  const renderItem = useCallback(({ item, index }) => {
    if (item?.type === 'profileStatus') {
      if (userloading) {
        return <AvatarShimmer count={7} />;
      } else {
        return <RecentUsersList users={recentUsers} onUserPress={handleUserPress} />;
      }
    }

    if (item?.type === 'header') {
      const bookmarkKey = Array.isArray(bookmarkData)
        ? `${bookmarkData.length}-${(bookmarkData[0] as { imdb_id?: string })?.imdb_id ?? ''}`
        : '0';
      return (
        <HomeHeader
          key={`header-${bookmarkKey}`}
          trendingData={trendingData}
          recommendData={recommendData}
          bookmarkData={bookmarkData}
          loadingTrending={loadingTrending}
          loadingBookmark={loadingBookmark}
          loadingRecs={loadingRecs}
          onFeedReached={handleFeedReached}
        />
      );
    }

    if (item?.type === 'discoverPeople') {
      return (
        <DiscoverPeopleSection
          users={suggestedFriends}
          onFollow={handleFollowSuggested}
          onSeeAll={handleSeeAllSuggested}
        />
      );
    }

    if (!item.movie || !item.user) return null;

    const avatarUri = `${BASE_IMAGE_URL}${item.user?.avatar}`;
    const posterUri = item.movie?.horizontal_poster_url;

    return MemoFeedCardRender(item, index, avatarUri, posterUri);
  }, [
    userloading,
    recentUsers,
    navigation,
    trendingData,
    recommendData,
    bookmarkData,
    loadingTrending,
    loadingBookmark,
    loadingRecs,
    MemoFeedCardRender,
    suggestedFriends,
    handleUserPress,
    handleFollowSuggested,
    handleFeedReached,
    handleSeeAllSuggested,
  ]);
  const goToSearchScreen = useCallback(() => {
    navigation.navigate(ScreenNameEnum.WoodsScreen, {
      type: 'movie',
    });
  }, [navigation]);

  const handleEndReached = useCallback(() => {
    if (feedHasMore && !loadingFeed && !loadingMoreFeed) {
      dispatch(fetchHomeFeed({ reset: false }));
    }
  }, [feedHasMore, loadingFeed, loadingMoreFeed, dispatch]);

  const keyExtractor = useCallback((item: unknown, index: number) => {
    if (item == null || typeof item !== 'object') return `index-${index}`;
    const o = item as Record<string, unknown>;
    if (o.id != null) return String(o.id);
    const movie = o.movie as { imdb_id?: string } | undefined;
    if (movie?.imdb_id) return movie.imdb_id;
    if (o.type) return `${o.type}-${index}`;
    return `index-${index}`;
  }, []);

  const listContentStyle = useMemo(() => ({ marginTop: 10, paddingBottom: 90 }), []);

  const handleScrollBeginDrag = useCallback(() => {
    if (!hasScrolled) setHasScrolled(true);
  }, [hasScrolled]);
 
  const processedFeedData = useMemo(() => {
    const result: (object | string | null | number)[] = [];
    const feedMap = new Map();

    combinedData?.forEach(item => {
      // Step 1: Pass through non-feed items (header, profileStatus, etc.)
      if (item?.type !== "feed") {
        result.push(item);
        return;
      }

      const imdbId = item?.movie?.imdb_id;

      // Step 2: Skip invalid feed items
      if (!imdbId || !item.activity || item.rec_score === -1) {
        return;
      }

      // Step 3: Handle first occurrence of this movie
      if (!feedMap.has(imdbId)) {
        feedMap.set(imdbId, {
          ...item,
          _activities: new Set([item.activity]),
        });
        return;
      }

      // Step 4: Merge duplicate - combine activities
      const existing = feedMap.get(imdbId);
      existing._activities.add(item.activity);

      if (item.is_bookmarked === true) {
        existing.is_bookmarked = true;
      }
    });

    // Step 5: Finalize merged feed items
    feedMap.forEach(item => {
      const activityOrder = ["ranked", "bookmarked"];

      // Combine activities in priority order
      item.activity = activityOrder
        .filter(a => item._activities.has(a))
        .join(", ");

      // Remove internal tracking property
      delete item._activities;
      result.push(item);
    });

    return result;
  }, [combinedData])


  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar />
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={imageIndex.reelRecsHome}
            resizeMode='cover'
            style={{
              height: 43,
              width: 133
            }}
          />
        </View>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => setNotificationModal(true)}>
            <Image source={imageIndex.normalNotification} style={styles.backArrowImg} />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToSearchScreen}>
            <Image source={imageIndex.search} style={styles.backArrowImg} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={processedFeedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        extraData={`${bookmarkData?.length ?? 0}-${trendingData?.length ?? 0}-${recommendData?.length ?? 0}`}
        onEndReached={handleEndReached}
        contentContainerStyle={listContentStyle}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        initialNumToRender={2}
        maxToRenderPerBatch={6}
        removeClippedSubviews={true}
        windowSize={8}
        decelerationRate={0.86}
        onScrollBeginDrag={handleScrollBeginDrag}
        ref={flatListRef}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Color.primary]}
            tintColor={Color.primary}
          />
        }
        ListFooterComponent={renderFooter}
        viewabilityConfigCallbackPairs={useRef([{
          viewabilityConfig: viewabilityConfigRef.current,
          onViewableItemsChanged,
        }]).current}
      />

      <CompareModals token={token} useCompareHook={compareHook} />
      <Notification
        visible={notificationModal}
        onClose={handleCloseNotification}
        bgColor={false}
      />
    </SafeAreaView>
  );
};

export default React.memo(App);