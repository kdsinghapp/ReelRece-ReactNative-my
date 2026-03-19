import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, ViewToken } from 'react-native';
import styles from './style';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import HorizontalMovieList from '@components/common/HorizontalMovieList/HorizontalMovieList';
import font from '@theme/font';
import useProfile from './useProfile';
import LoadingModal from '@utils/Loader';
import { getHistoryApi, getUserBookmarks } from '@redux/Api/ProfileApi';
import { RootState } from '@redux/store';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { setRefetchProfileActivity } from '@redux/feature/modalSlice/modalSlice';
import { getRatedMovies } from '@redux/Api/movieApi';
import useUserFeed from '@components/card/feedCard/useUserFeed';
import { getSuggestedFriends } from '@redux/Api/followService';
import SuggestedFriendCard from '@components/common/SuggestedFriendCard/SuggestedFriendCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedCardShimmer from '@components/card/feedCard/FeedCardShimmer';
import MemoFeedCardHome from '@components/card/feedCard/MemoFeedCardHome';
import imageIndex from '@assets/imageIndex';
import { CustomStatusBar, HeaderCustom, ProfileCard } from '@components/index';
import useHome from '@screens/BottomTab/home/homeScreen/useHome';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';
import { RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { errorToast } from '@utils/customToast';

type ViewableListItem = { type?: string; movie?: object; user?: object };

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { token, userGetData, avatar, autoPlayEnabled, isMuted, email_da_data } = useSelector(
    (state: RootState) => ({
      token: state.auth.token,
      userGetData: state.auth.userGetData,
      avatar: state.auth.userGetData?.avatar,
      autoPlayEnabled: state.auth.userGetData?.autoplay_trailer ?? true,
      isMuted: state.auth.userGetData?.videos_start_with_sound,
      email_da_data: state.auth.userGetData,
    }),
    shallowEqual
  );
  const refetchProfileActivity = useSelector((state: RootState) => state.modal?.refetchProfileActivity ?? false);
  const restoredRef = useRef(false);
  const {
    loading,
    userProfile,
    // userProfileDate,
    getAgain,
    refetchUserProfile,
    setGetAgain
  } = useProfile();
  const page = "1";
  ;
  const {
    feedData,
    fetchFeed,
    loadingFeed,
    loadingMore,
    hasMore,
  } = useUserFeed(token);
  const { navigation,
    isVisible, setIsVisible,
    modalVisible, setModalVisible,
  } = useHome()
  const [suggestedFriend, setSuggestedFriend] = useState([]);
  const listRef = useRef<FlatList>(null);
  const ITEM_HEIGHT = useMemo(() => Math.round(Dimensions.get('window').height * 0.65), []);
  const [savedMovies, setSavedMovies] = useState([]);
  const [historyMovies, setHistoryMovies] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [rankingMovie, setRankingMovie] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  // scroll
  const [hasScrolled, setHasScrolled] = useState(false);
  const [playIndex, setPlayIndex] = useState<number | null>(null); // this controls when to autoplay after 2 seconds
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const lastPlayedIndexRef = useRef<number | null>(null);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingBookmark, setLoadingBookmark] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const prevOnlineRef = useRef(true);
  const handleRefreshRef = useRef<(() => Promise<void>) | null>(null);
  const focusFetchRef = useRef<{
    fetchBookmarks: () => Promise<void>;
    fetchHistory1: () => Promise<void>;
  } | null>(null);
  const refreshFnsRef = useRef<{
    refetchUserProfile: () => Promise<void>;
    fetchBookmarks: () => Promise<void>;
    fetchRatedMovies: () => Promise<void>;
    fetchHistory1: () => Promise<void>;
    fetchFeed: (source: string, username?: string, force?: boolean) => Promise<void>;
    fetchSuggestedFriends: () => Promise<void>;
  } | null>(null);
  const onViewableItemsChangedRef = useRef<(info: { viewableItems: ViewToken<ViewableListItem>[] }) => void>(() => { });
  const playIndexRef = useRef<number | null>(null);

  const handleRefresh = useCallback(async () => {
    if (!isOnline) {
      errorToast('No Internet! \n Please check your network connection');
      return;
    }
    setRefreshing(true);
    const ref = refreshFnsRef.current;
    try {
      if (ref) {
        await Promise.allSettled([
          ref.refetchUserProfile(),
          ref.fetchBookmarks(),
          ref.fetchRatedMovies(),
          ref.fetchHistory1(),
          ref.fetchFeed('profile', email_da_data?.username, true),
          ref.fetchSuggestedFriends(),
        ]);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, email_da_data?.username]);

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
  //   const combinedData = useMemo(() => {
  //   return [{ type: 'header' }, ...feedData.map(item => ({ ...item, type: 'feed' }))];
  // }, [feedData]);

  const combinedData = useMemo(() => {
    return [
      { type: 'profileCard' },
      { type: 'header' },
      ...feedData.filter(Boolean).map(item => ({ ...item, type: 'feed' })),
    ];
  }, [feedData]);


  useFocusEffect(
    useCallback(() => {
      if (token && !userProfile) {
        refetchUserProfile();
      }
    }, [token, userProfile])
  );

  // ✅ Safety timeout to prevent infinite loading
  useEffect(() => {
    // Reset timeout flag when loading starts
    if (loading) {
      setLoadingTimeout(false);
    }

    const timeout = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds max

    return () => clearTimeout(timeout);
  }, [loading]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const restoreIndex = async () => {
        try {
          const savedIndex = await AsyncStorage.getItem('profileIndex');
          if (savedIndex !== null && isActive && !restoredRef.current) {
            // if (savedIndex !== null && isActive) {
            const index = parseInt(savedIndex, 10);
            setCurrentVisibleIndex(index + 1); // scroll to last index
            setPlayIndex(index); // play previous video
            restoredRef.current = true;
          }
        } catch (err) {
        }
      };

      restoreIndex();

      return () => {
        isActive = false;
        restoredRef.current = false;
      };
    }, [])
  );


  useEffect(() => {
    const saveIndex = async () => {
      let indexForVideo = currentVisibleIndex - 1
      try {
        await AsyncStorage.setItem('profileIndex', indexForVideo.toString());
      } catch (err) {
      }
    };

    if (currentVisibleIndex !== null) {
      saveIndex();
    }
  }, [currentVisibleIndex]);

  // fetch feed data
  // feed api 

  // scroll
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 90,
    minimumViewTime: 250
  });

  useEffect(() => {
    playIndexRef.current = playIndex;
  }, [playIndex]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken<ViewableListItem>[] }) => {
    if (!isFocused) return;

    const headerVisible = viewableItems.some(item => item?.item?.type === 'header');
    if (headerVisible) {
      setPlayIndex(null);
      setCurrentVisibleIndex(-1); // no feed item visible when header is in view
      lastPlayedIndexRef.current = null;
      return;
    }
    if (viewableItems.length > 0) {
      const firstVisible = viewableItems[0];
      const index = firstVisible?.index ?? 0;
      const nonFeedVisible = viewableItems.some(item =>
        item?.item?.type === 'header' || item?.item?.type === 'profileStatus'
      );
      if (nonFeedVisible) {
        setPlayIndex(null);
        setCurrentVisibleIndex(-1);
        return;
      }
      const isFeedCardVisible = viewableItems.some(
        item => item?.item?.movie && item?.item?.user
      );
      if (!isFeedCardVisible) {
        setPlayIndex(null);
        setCurrentVisibleIndex(-1);
        lastPlayedIndexRef.current = 0;
        return;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (playIndexRef.current !== index - 1) {
          setCurrentVisibleIndex(index);
          setPlayIndex(index - 1);
          lastPlayedIndexRef.current = index - 1;
        }
      }, 800);
    } else {
      setPlayIndex(null);
      setCurrentVisibleIndex(-1);
    }
  }, [isFocused]);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoadingBookmark(true);
      const bookmarks = await getUserBookmarks(token);
      setSavedMovies(bookmarks?.results || []);
    } catch (err) {
    } finally {
      setLoadingBookmark(false);
    }
  }, [token]);
  useEffect(() => {
    if (!token) return;
    fetchBookmarks();
  }, [token, fetchBookmarks]);


  // -------------------------
  // RATED MOVIES FETCH
  // -------------------------
  const fetchRatedMovies = useCallback(async () => {
    try {
      setLoadingTrending(true);
      const rated = await getRatedMovies(token);
      await AsyncStorage.setItem('profileIndex', '0');
      setRankingMovie(rated?.results || []);
    } catch (err) {
    } finally {
      setLoadingTrending(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchRatedMovies();
  }, [token, fetchRatedMovies]);


  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchHistory = async () => {
      try {
        if (isMounted) setLoadingRecs(true);

        const history = await getHistoryApi(token);

        if (isMounted) {
          setHistoryMovies(history?.results || []);
        }
      } catch (err) {
        if (isMounted) {
        }
      } finally {
        if (isMounted) setLoadingRecs(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const fetchHistory1 = useCallback(async () => {
    try {
      setLoadingRecs(true);
      const history = await getHistoryApi(token);
      setHistoryMovies(history?.results || []);
    } catch (err) {
    } finally {
      setLoadingRecs(false);
    }
  }, [token]);

  focusFetchRef.current = { fetchBookmarks, fetchHistory1 };

  // On focus: refetch bookmarks, history, and Recent Activity so profile reflects latest actions (e.g. after rank/bookmark on another tab).
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const ref = focusFetchRef.current;
      if (!ref) return () => { isActive = false; };
      const fetchData = async () => {
        if (!isActive) return;
        try {
          await ref.fetchBookmarks();
          await ref.fetchHistory1();
        } catch (error) {
        }
      };
      fetchData();
      return () => {
        isActive = false;
      };
    }, [token, email_da_data?.username, fetchFeed])
  );




  useEffect(() => {
    if (hasMore && !loadingFeed) {
      // fetchFeed("home");
      fetchFeed("profile", email_da_data?.username);

    }
  }, [token]);

  // Fetch suggested friends
  const fetchSuggestedFriends = useCallback(async () => {
    if (!token) {
      setSuggestedFriend([]);
      return;
    }
    try {
      const response = await getSuggestedFriends(token);
      const safeSuggested = Array.isArray(response?.results) ? response.results : [];
      setSuggestedFriend(safeSuggested);
    } catch (error) {
      setSuggestedFriend([]);
    }
  }, [token]);

  useEffect(() => {
    fetchSuggestedFriends();
  }, [token, fetchSuggestedFriends]);

  useEffect(() => {
    refreshFnsRef.current = {
      refetchUserProfile,
      fetchBookmarks,
      fetchRatedMovies,
      fetchHistory1,
      fetchFeed,
      fetchSuggestedFriends,
    };
  }, [refetchUserProfile, fetchBookmarks, fetchRatedMovies, fetchHistory1, fetchFeed, fetchSuggestedFriends]);

  // When user taps Follow/Unfollow: update suggested list only (no recent activity refetch)
  const handleFollowCallback = useCallback((username: string, isFollowing: boolean) => {
    if (isFollowing) {
      setSuggestedFriend(prev =>
        prev.map(friend => {
          const f = friend as { username?: string; is_following?: boolean };
          return f.username === username ? { ...f, is_following: true } : f;
        })
      );
    } else {
      setSuggestedFriend(prev =>
        prev.map(friend => {
          const f = friend as { username?: string; is_following?: boolean };
          return f.username === username ? { ...f, is_following: false } : f;
        })
      );
    }
  }, []);

  // When user rates or bookmarks elsewhere: refetch Recent Activity + Ranked + Want to Watch so profile reflects latest actions
  useEffect(() => {
    if (!refetchProfileActivity || !token || !email_da_data?.username) return;
    fetchFeed('profile', email_da_data.username, true, true); // Silent update
    fetchBookmarks();
    fetchRatedMovies();
    dispatch(setRefetchProfileActivity(false));
  }, [refetchProfileActivity, token, email_da_data?.username, fetchFeed, fetchBookmarks, dispatch]);


  useEffect(() => {
    if (!token) {
      setHistoryMovies([]);
      return;
    }

    const historymoviedata = async () => {
      const data = await getHistoryApi(token);
      const safeHistory = Array.isArray(data?.results) ? data.results : [];
      setHistoryMovies(safeHistory);
    };

    historymoviedata();
  }, [token, navigation, getAgain]);



  onViewableItemsChangedRef.current = onViewableItemsChanged;
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: viewabilityConfigRef.current,
      onViewableItemsChanged: (info: { viewableItems: ViewToken<ViewableListItem>[] }) => {
        onViewableItemsChangedRef.current?.(info);
      },
    },
  ]);
  const avatarUrl = avatar ? `${BASE_IMAGE_URL}${avatar}` : undefined;

  const userNameFollow = userProfile?.name;
  const user_name = userProfile?.username;

  const handleSeeAllSuggested = useCallback(() => {
    navigation.navigate(ScreenNameEnum.Followers as never, {
      tabToOpen: 2,
      type: 'Suggested',
      userName: userNameFollow,
      user_name: user_name,
      followersCount: userProfile?.followers_count ?? (userProfile as unknown as Record<string, unknown>)?.followers as number | undefined,
      followingCount: userProfile?.following_count ?? (userProfile as unknown as Record<string, unknown>)?.following as number | undefined,
    } as never);
  }, [navigation, userNameFollow, user_name, userProfile?.followers_count, userProfile?.following_count, userProfile]);

  const suggestedKeyExtractor = useCallback(
    (item: { username?: string; id?: string }, index: number) =>
      item?.username ?? item?.id?.toString() ?? `suggested-${index}`,
    []
  );

  const suggestedListEmpty = useCallback(
    () => (
      <Text
        style={{
          color: Color.whiteText,
          marginLeft: 11,
          fontSize: 14,
          fontFamily: font.PoppinsMedium,
          textAlign: 'center',
        }}
      >
        {t('emptyState.noSuggestedMembers')}
      </Text>
    ),
    []
  );

  const renderSuggestedItem = useCallback(
    ({ item }: { item: { username?: string; avatar?: string; name?: string | null } }) =>
      item ? (
        <SuggestedFriendCard
          item={item}
          BASE_IMAGE_URL={BASE_IMAGE_URL}
          onFollow={handleFollowCallback}
        />
      ) : null,
    [handleFollowCallback]
  );

  const renderHeader = () => {
    return (
      <>

        <View style={{ paddingHorizontal: 15, marginTop: 20 }} >
          <HorizontalMovieList
            title={t("profile.ranked")}
            data={rankingMovie}
            username={userProfile?.name}
            imageUri={avatarUrl}
            token={token}
            my_profile={true}
            navigateTo={ScreenNameEnum.OtherWatchingProfile}
            disableBottomSheet={true}
            loading={loadingTrending}
            emptyData={t("emptyState.noratingsyet")}
            scoreType='Rec'
          />
          {/* second */}
          <HorizontalMovieList
            title={t("profile.wantToWatch")}
            data={savedMovies}
            token={token}
            my_profile={true}

            username={userProfile?.name}
            imageUri={avatarUrl}
            navigateTo={ScreenNameEnum.OtherWantProfile}
            disableBottomSheet={true}
            loading={loadingRecs}

            emptyData={t("emptyState.nobookmarks")}
            scoreType='Rec'

          />
          <HorizontalMovieList
            title={t("profile.history")}
            token={token}
            data={historyMovies} //  Fix applied here
            // data={savedMovies}
            // data={history}
            username={userProfile?.name}
            imageUri={avatarUrl}
            my_profile={true}
            navigateTo={ScreenNameEnum.OtherWatchingProfile}
            disableBottomSheet={true}
            loading={loadingBookmark}

            emptyData={t("emptyState.nohistoryyet")}
            scoreType='Rec'

          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 1, alignContent: 'center' }}>
            <Text style={styles.sectionTitle}>{t("profile.suggestedMembers")}</Text>
            <TouchableOpacity onPress={handleSeeAllSuggested}>
              <Image source={imageIndex.rightArrow} style={styles.listArrow} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 5, paddingVertical: 10 }}>
          <FlatList
            horizontal
            data={suggestedFriend}
            keyExtractor={suggestedKeyExtractor}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            ListEmptyComponent={suggestedListEmpty}
            removeClippedSubviews
            updateCellsBatchingPeriod={50}
            renderItem={renderSuggestedItem}
          />
        </View>

        <View style={{ paddingHorizontal: 15, paddingBottom: 20 }}  >

          <Text style={styles.sectionTitle}>{t("home.recentactivities")}</Text>
        </View>
      </>
    )
  }

  const memoizedHeader = useMemo(() => renderHeader(), [
    rankingMovie,
    savedMovies,
    historyMovies,
    suggestedFriend,
    userProfile?.name,
    avatarUrl,
    loadingTrending,
    loadingRecs,
    loadingBookmark,
    token,
    handleSeeAllSuggested,
    suggestedKeyExtractor,
    suggestedListEmpty,
    renderSuggestedItem,
  ]);

  const keyExtractor = useCallback(
    (item: { id?: string; type?: string; movie?: { imdb_id?: string } }, index: number) =>
      item?.type === 'feed' && item?.movie?.imdb_id
        ? String(item.movie.imdb_id)
        : item?.id?.toString?.() ?? `header-${index}`,
    []
  );

  const listContentStyle = useMemo(() => ({ paddingBottom: 90 }), []);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingFeed && !loadingMore) fetchFeed('profile', email_da_data?.username);
  }, [hasMore, loadingFeed, loadingMore, email_da_data?.username, fetchFeed]);

  const handleScrollBeginDrag = useCallback(() => {
    if (!hasScrolled) setHasScrolled(true);
  }, [hasScrolled]);

  const handleRankPress = useCallback(() => setIsVisible(true), [setIsVisible]);

  const renderItem = useCallback(({ item, index }: { item: { type?: string; movie?: object; user?: object;[k: string]: unknown }; index: number }) => {
    if (!item) return null;
    if (item.type === 'profileCard') {
      return (
        <ProfileCard
          imageUri={avatarUrl}
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
          name={userProfile?.name ? userProfile?.name : userProfile?.username}
          username={userProfile?.username}
          rank={`${userProfile?.ranked}`}
          rankscreenData={rankingMovie}
          followers={`${userProfile?.followers_count ?? (userProfile as unknown as Record<string, unknown>)?.followers ?? 0}`}
          following={`${userProfile?.following_count ?? (userProfile as unknown as Record<string, unknown>)?.following ?? 0}`}
          butt={false}
          bio={userProfile?.bio}
          onFollow={() => navigation.navigate(ScreenNameEnum.Followers as never, { tabToOpen: 0, type: 'Followers', userName: userNameFollow, user_name: user_name, followersCount: userProfile?.followers_count ?? (userProfile as unknown as Record<string, unknown>)?.followers as number | undefined, followingCount: userProfile?.following_count ?? (userProfile as unknown as Record<string, unknown>)?.following as number | undefined } as never)}
          onFollowing={() =>
            navigation.navigate(ScreenNameEnum.Followers as never, { tabToOpen: 1, type: 'Following', userName: userNameFollow, user_name: user_name, followersCount: userProfile?.followers_count ?? (userProfile as unknown as Record<string, unknown>)?.followers as number | undefined, followingCount: userProfile?.following_count ?? (userProfile as unknown as Record<string, unknown>)?.following as number | undefined } as never)
          }
          onSuggested={() =>
            navigation.navigate(ScreenNameEnum.Followers as never, { id: 2, type: 'Suggested', userName: userNameFollow, user_name: user_name, followersCount: userProfile?.followers_count ?? (userProfile as unknown as Record<string, unknown>)?.followers as number | undefined, followingCount: userProfile?.following_count ?? (userProfile as unknown as Record<string, unknown>)?.following as number | undefined } as never)
          }
          onFollowPress={() =>
            navigation.navigate(ScreenNameEnum.EditProfile, {
              avatar: `${BASE_IMAGE_URL}${avatar}`,
            })
          }
        />
      );
    }
    if (item.type === 'header') {
      return memoizedHeader;
    }
    if (item.type === 'feed') {
      if (!item.movie || !item.user) return null;

      const avatarUri = item.user.avatar ? `${BASE_IMAGE_URL}${item.user.avatar}` : null;
      const avatarSource = avatarUri ? { uri: avatarUri } : imageIndex.profileImg;
      const posterUri = item.movie.horizontal_poster_url;
      const posterSource = posterUri ? { uri: posterUri } : null;

      return (
        <MemoFeedCardHome
          key={item.movie?.imdb_id}
          avatar={avatarSource}
          poster={posterSource}
          activity={item.activity}
          user={item.user?.name || item.user?.username}
          username={item.user?.username}
          title={item.movie?.title}
          comment={item.comment}
          release_year={item.movie?.release_year?.toString()}
          videoUri={item.movie?.trailer_url}
          imdb_id={item.movie?.imdb_id}
          isMuted={isMuted}
          token={token}
          rankPress={handleRankPress}
          ranked={item?.rec_score}
          shouldAutoPlay={autoPlayEnabled}
          isVisible={index === currentVisibleIndex}
          scoreType='Rec'
          videoIndex={index + 1}
          shouldPlay={index === currentVisibleIndex}
          isPaused={index - 1 !== playIndex}
          is_bookMark={item?.is_bookmarked}
          onBookmarkSuccess={fetchBookmarks}
          created_date={item?.created_date}
        />
      );
    }
    return null;
  }, [
    avatarUrl,
    imageLoading,
    userProfile,
    rankingMovie,
    userNameFollow,
    token,
    autoPlayEnabled,
    isMuted,
    currentVisibleIndex,
    playIndex,
    memoizedHeader,
    handleRankPress,
  ]);

  const renderFooter = useCallback(() => {
    // 🟢 Normal loading
    if (loadingFeed && combinedData.length <= 50) {
      return <FeedCardShimmer />;
    }

    // 🟡 Heavy UI load
    if (loadingFeed && combinedData.length > 50) {
      return (
        <View style={{ paddingVertical: 20, paddingBottom: 90 }}>
          <Text style={{ textAlign: "center", color: "gray" }}>
            Loading more content... please wait
          </Text>
          <ActivityIndicator
            size="small"
            color={Color.primary}
            style={{ marginTop: 8 }}
          />
        </View>
      );
    }

    // Load more (next page)
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 20, paddingBottom: 90 }}>
          <ActivityIndicator size="small" color={Color.primary} style={{ marginTop: 8 }} />
        </View>
      );
    }

    // 🔴 No more data
    if (!hasMore && combinedData?.length > 0) {
      return (
        <View style={{ paddingVertical: 20, paddingBottom: 90 }}>
          <Text style={{ textAlign: "center", color: "gray" }}>
            {t("emptyState.nomore")}
          </Text>
        </View>
      );
    }

    // Default shimmer
    return (
      <View>
        <FeedCardShimmer />
      </View>
    );
  }, [loadingFeed, loadingMore, hasMore, combinedData.length]);


  const fiter = useMemo(() => {
    const data = combinedData ?? [];
    const result: typeof data = [];
    const feedMap = new Map<string, { _activities: Set<string>;[k: string]: unknown }>();

    data.forEach((item: { type?: string; movie?: { imdb_id?: string }; activity?: string; rec_score?: number; is_bookmarked?: boolean }) => {
      if (item?.type !== 'feed') {
        result?.push(item as never);
        return;
      }
      const imdbId = item?.movie?.imdb_id;
      if (!imdbId || !item?.activity || item?.rec_score === -1) return;
      if (!feedMap.has(imdbId)) {
        feedMap.set(imdbId, { ...item, _activities: new Set([item?.activity]) } as never);
        return;
      }
      const existing = feedMap.get(imdbId)!;
      existing?._activities?.add(item?.activity);
      if (item?.is_bookmarked === true) (existing as { is_bookmarked?: boolean }).is_bookmarked = true;
    });

    feedMap.forEach((item) => {
      const activityOrder = ['ranked', 'bookmarked'];
      (item as { activity?: string }).activity = activityOrder
        .filter((a) => item?._activities.has(a))
        .join(', ');
      delete item?._activities;
      result?.push(item as never);
    });
    return result;
  }, [combinedData]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Color.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Color.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={styles.container}>
      <CustomStatusBar />
      <LoadingModal visible={(loading && !loadingTimeout) || (!userProfile && !loadingTimeout)} />
      <View style={{ paddingTop: 18, flex: 1 }}>
        {/* <Text style={{fontSize:22, color:'red'}} >{userProfile.name}</Text> */}
        <HeaderCustom
          title={userProfile?.name ?? userProfile?.username ?? ''}
          rightIcon={imageIndex.settings}
          onRightPress={() => navigation.navigate(ScreenNameEnum.MainSetting)}
        />
        <FlatList
          data={fiter}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={listContentStyle}
          ListFooterComponent={renderFooter}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Color.primary]}
              tintColor={Color.primary}
              title={isOnline ? 'Pull to refresh' : 'Offline - Pull when connected'}
              titleColor={Color.grey700}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          initialNumToRender={2}
          maxToRenderPerBatch={6}
          windowSize={10}
          decelerationRate={0.86}
          updateCellsBatchingPeriod={50}
          onScrollBeginDrag={handleScrollBeginDrag}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        //  viewabilityConfigCallbackPairs={useRef([{
        //    viewabilityConfig: viewabilityConfigRef.current,
        //    onViewableItemsChanged, //  Directly pass this
        //  }]).current}
        />
      </View>
    </SafeAreaView>
  );
};
// export default ProfileScreen;
export default React.memo(ProfileScreen);

