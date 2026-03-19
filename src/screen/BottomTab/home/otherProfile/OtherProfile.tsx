import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from './style';
import { useFocusEffect, useIsFocused, useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import useHome from '../homeScreen/useHome';
import { Color } from '@theme/color';
import HorizontalMovieList from '@components/common/HorizontalMovieList/HorizontalMovieList';
import { getOthereUsers, getOtherUserBookmarks } from '@redux/Api/ProfileApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { fetchHomeFeed, fetchHomeRecentUsers } from '@redux/feature/homeSlice';
import { getCommonBookmarkOtherUser, getOtherUserRatedMovies } from '@redux/Api/movieApi';
import { followUser, unfollowUser } from '@redux/Api/followService';
import useUserFeedWithName from '@components/card/feedCard/useUserFeedWithName';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedCardShimmer from '@components/card/feedCard/FeedCardShimmer';
import MemoFeedCardHome from '@components/card/feedCard/MemoFeedCardHome';
import { BottomSheet, CustomStatusBar, HeaderCustom, ProfileCard } from '@components/index';
import imageIndex from '@assets/imageIndex';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';
import { User } from '../../../../types/api.types';
import { AxiosResponse } from 'axios';
import { useNetworkStatus } from '@hooks/useNetworkStatus';

/** Other profile screen route params */
type OtherProfileParams = { item?: User & { name?: string; username?: string } };

/** Extended user data returned by profile API */
type OtherUserProfile = User & {
  following_bool?: boolean;
  ranked?: number;
  /** Prefer followers_count from API; followers for backward compatibility */
  followers?: number;
  following?: number;
  followers_count?: number;
  following_count?: number;
  bio?: string;
};

/** Bottom sheet option with optional action */
type BottomSheetOption = { name: string; action?: () => void };

const OtherProfile = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth?.token);

  const route = useRoute();
  const params = (route?.params || {}) as OtherProfileParams;
  const item = params?.item;
  const othr_user_name = item?.username ?? '';
  const {
    navigation,
    isVisible,
    setIsVisible,
    modalVisible,
    setModalVisible,
  } = useHome();

  const {
    feedData,
    fetchFeed,
    loadingFeed,
    hasMore,
  } = useUserFeedWithName(token ?? '');

  const [bottomModal, setBottomModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [otherUserData, setOtherUserData] = useState<OtherUserProfile | null>(null);
  const [otherUserRankingMovie, setOtherUserRankingMovie] = useState<unknown[]>([]);
  const [commonUserRankingMovie, setCommonUserRankingMovie] = useState<unknown[]>([]);
  const [loadingRanked, setLoadingRanked] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingCommon, setLoadingCommon] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
    const lastPlayedIndexRef = useRef<number | null>(null);

  const userData = useSelector((state: RootState) => state.auth?.userGetData);
   
  // const autoPlayEnabled = useSelector((state: RootState) => state.auth.userGetData?.autoplay_trailer);
  const autoPlayEnabled = useSelector(
    (state: RootState) => state.auth.userGetData?.autoplay_trailer ?? true // default to true
  );

  const isMuted = useSelector((state: RootState) => state.auth.userGetData?.videos_start_with_sound);


  // scroll
  const [hasScrolled, setHasScrolled] = useState(false);
  const [loadingMovieLists, setLoadingMovieLists] = useState(true);
  const [playIndex, setPlayIndex] = useState<number | null>(null); // this controls when to autoplay after 2 seconds
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFocused = useIsFocused();
  const restoredRef = useRef(false);


  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  //   const combinedData = useMemo(() => {
   //   return [{ type: 'header' }, ...feedData.map(item => ({ ...item, type: 'feed' }))];
  // }, [feedData]);


  const combinedData = useMemo(() => {
    return [
      { type: 'profileCard' },
      { type: 'header' },
      ...feedData.map((feedItem: unknown) => ({ ...(feedItem as Record<string, unknown>), type: 'feed' })),
    ];
  }, [feedData]);
  const [followLoading, setFollowLoading] = useState(false);
  //  const avatar = useSelector((state: RootState) => state.auth.userGetData?.avatar);
  //  const avatar = useSelector((state: RootState) => state.auth.userGetData?.avatar);
  const handleFollowUnfollow = async () => {
    if (!token || !otherUserData?.username) return;
    setFollowLoading(true);
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowUser(token, otherUserData.username);
      } else {
        await followUser(token, otherUserData.username);
      }
      setIsFollowing(!isFollowing);
      dispatch(fetchHomeFeed({ silent: true }));
      dispatch(fetchHomeRecentUsers({ silent: true }));
    } catch (error) {
    } finally {
      setFollowLoading(false);
      setLoadingFollow(false);
    }
  };

  const handleEditProfile = useCallback(() => {
    const avatar = userData?.avatar ?? '';
    (navigation as { navigate: (s: string, p?: object) => void }).navigate(ScreenNameEnum.EditProfile, {
      avatar: `${BASE_IMAGE_URL}${avatar}`,
    });
  }, [navigation, userData?.avatar]);

  const isOwnProfile = otherUserData?.username === userData?.username;

  const BottomData: BottomSheetOption[] = useMemo(() => [
    {
      name: isFollowing ? t("common.unfollow") : t("common.follow"),
      action: async () => {
        await handleFollowUnfollow();
        setBottomModal(false);
      },
    },
    { name: t("common.cancel"), action: () => setBottomModal(false) },
  ], [isFollowing, handleFollowUnfollow]);



  // scroll

  // refs
  const playIndexRef = useRef<number | null>(null);
  const currentVisibleIndexRef = useRef<number>(0);
  const isFocusedRef = useRef<boolean>(false);

  // timeoutRef already exists in your file; ensure it's null-initialized
  // const timeoutRef = useRef<NodeJS.Timeout | null>(null); // you already have this

  // sync refs when states change
  useEffect(() => { playIndexRef.current = playIndex; }, [playIndex]);
  useEffect(() => { currentVisibleIndexRef.current = currentVisibleIndex; }, [currentVisibleIndex]);
  useEffect(() => { isFocusedRef.current = isFocused; }, [isFocused]);

  // cleanup on unmount: clear timeout
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


  // 2) Stable onViewableItemsChanged handler (useRef .current pattern)
  type ViewableItem = { item?: { type?: string; movie?: unknown; user?: unknown }; index?: number | null };
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewableItem[] }) => {
    // guard: do nothing if screen not focused
    if (!isFocusedRef.current) return;

    // safe empty-check
    if (!viewableItems || viewableItems.length === 0) {
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

    // stop if header/profileStatus visible
    const headerOrProfileVisible = viewableItems.some((v: ViewableItem) => v?.item?.type === 'header' || v?.item?.type === 'profileStatus');
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

    // find first visible index
    const firstVisible = viewableItems[0];
    const index = firstVisible?.index != null ? firstVisible.index : 0;

    // ensure it's a feed card (has movie + user)
    const isFeedCardVisible = viewableItems.some((vi: ViewableItem) => vi?.item?.movie && vi?.item?.user);
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

    // reset pending timeout and debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // debounce: wait 800ms of stable view state before switching playIndex
    timeoutRef.current = setTimeout(() => {
      const target = index - 1; // your logic uses index-1
      if (playIndexRef.current !== target) {
        // update both ref & state (state used to re-render playing card)
        currentVisibleIndexRef.current = index;
        setCurrentVisibleIndex(index);

        playIndexRef.current = target;
        setPlayIndex(target);

        lastPlayedIndexRef.current = target;
        // optional debug log
       }
      timeoutRef.current = null;
    }, 800);

  }).current;

  // 3) Use this in your viewabilityConfigCallbackPairs:
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: viewabilityConfigRef.current,
      onViewableItemsChanged: onViewableItemsChanged,
    },
  ]);

  // scroll
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const restoreIndex = async () => {
        try {
          const savedIndex = await AsyncStorage.getItem('otherProfileIndex');
           if (savedIndex !== null && isActive && !restoredRef.current) {
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
  const saveIndex = async (currentVisibleIndex: number) => {
    let indexForVideo = currentVisibleIndex - 1
    try {
      await AsyncStorage.setItem('otherProfileIndex', indexForVideo.toString());
     } catch (err) {
     }
  };
  // 🧠 Component ke andar useEffect
  useEffect(() => {
    if (currentVisibleIndex !== null && currentVisibleIndex !== undefined) {
      saveIndex(currentVisibleIndex);
    }
  }, [currentVisibleIndex]);


  // SCROLL END

  const fetchOtherUserDetails = async () => {
    const username = item?.username;
    if (!token || !username) return;
    const videoNUllVideo = 0;
    try {
      const res = await getOthereUsers(token, username);
      await AsyncStorage.setItem('otherProfileIndex', videoNUllVideo.toString());
      const data = Array.isArray(res) ? res[0] : (res as AxiosResponse<User>)?.data;
      const profile = data as OtherUserProfile | undefined;
      if (profile) {
        setOtherUserData(profile);
        setIsFollowing(profile.following_bool ?? false);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchOtherUserDetails();
  }, [token, item?.username]);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90,
  };
  const [userBookmarks, setUserBookmarks] = useState<unknown[]>([]);


 

  // Fetch rated movies
  useEffect(() => {
    const fetchRatedMovies = async () => {
      if (!token || !otherUserData?.username) return;

      setLoadingRanked(true);
      try {
        const res = await getOtherUserRatedMovies(token, otherUserData.username);
        setOtherUserRankingMovie(res?.results || []);
      } catch (err) {
       } finally {
        setLoadingRanked(false);
      }
    };

    fetchRatedMovies();
  }, [token, otherUserData?.username]);

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!token || !otherUserData?.username) return;

      setLoadingBookmarks(true);
      try {
        const res = await getOtherUserBookmarks(token, otherUserData.username);
        setUserBookmarks(res?.results || []);
      } catch (err) {
       } finally {
        setLoadingBookmarks(false);
      }
    };

    fetchBookmarks();
  }, [token, otherUserData?.username]);

  // Fetch common bookmarks
  useEffect(() => {
    const fetchCommonBookmarks = async () => {
      if (!token || !otherUserData?.username) return;

      setLoadingCommon(true);
      try {
        const res = await getCommonBookmarkOtherUser(token, otherUserData?.username);
        setCommonUserRankingMovie(res?.results || []);
      } catch (err) {
       } finally {
        setLoadingCommon(false);
      }
    };

    fetchCommonBookmarks();
  }, [token, otherUserData?.username]);


  useEffect(() => {
    if (hasMore && !loadingFeed && otherUserData?.username && othr_user_name) {
      fetchFeed("otherprofile", othr_user_name);
    }
  }, [token, hasMore, loadingFeed, otherUserData?.username, othr_user_name]);
  const avatarUrl = useMemo(() => (otherUserData?.avatar ? `${BASE_IMAGE_URL}${otherUserData.avatar}?t=${Date.now()}` : undefined), [otherUserData]);

  const renderHeader = useCallback(() => (



    <View style={{ marginHorizontal: 14, }}>

      {/* first list */}
      <HorizontalMovieList
        title={t("home.rankings",)}
        data={otherUserRankingMovie}
        loading={loadingRanked}
        username={otherUserData?.username ?? undefined}
        token={token}
        imageUri={avatarUrl}
        my_profile={false}
        navigateTo={ScreenNameEnum.OtherWatchingProfile}
        scoreType={'Friend' as const}
        emptyData={t("emptyState.noratingsyet",)}

      />
      {/* second list */}
      <HorizontalMovieList
        title= {t("home.wantwatch",)}  
        data={userBookmarks}
        username={otherUserData?.username ?? undefined}
        otheruser
        token={token}
        imageUri={avatarUrl}
        loading={loadingBookmarks}
        my_profile={false}
        navigateTo={ScreenNameEnum.OtherWantProfile}
        emptyData={t("emptyState.nobookmarks",)}
        scoreType={'Friend' as const}


      />

      {/* thrid list */}
      <HorizontalMovieList
        title={t("home.moviesshows",)}
        data={commonUserRankingMovie}
        imageUri={avatarUrl}
        loading={loadingCommon}
        username={otherUserData?.username ?? undefined}
        token={token}
        my_profile={false}
        navigateTo={ScreenNameEnum.WatchSaveUser}
        emptyData={t("emptyState.nohistoryyet",)}
        scoreType={'Friend' as const}
      />
      <Text style={styles.sectionTitle}>{t("home.recentactivities",)}</Text>
    </View>

  ), [avatarUrl, loadingFollow, handleFollowUnfollow, imageLoading, otherUserData, isFollowing,]);


  type FeedItemShape = {
    movie?: { imdb_id?: string; title?: string; release_year?: number; trailer_url?: string; horizontal_poster_url?: string };
    user?: { name?: string; username?: string; avatar?: string };
    activity?: string;
    comment?: string;
    rec_score?: number;
    is_bookmarked?: boolean;
    created_date?: string;
  };
  const MemoFeedCardRender = useCallback((feedItem: FeedItemShape, index: number, avatarUri: string, posterUri: string) => {
    return (
        <MemoFeedCardHome
          key={feedItem.movie?.imdb_id}
          activity={feedItem?.activity}
          avatar={{ uri: avatarUri }}
          poster={{ uri: posterUri }}
          user={feedItem?.user?.name || feedItem?.user?.username}
          title={feedItem?.movie?.title}
          comment={feedItem?.comment}
          release_year={feedItem?.movie?.release_year?.toString()}
          videoUri={feedItem?.movie?.trailer_url}
          imdb_id={feedItem?.movie?.imdb_id}
          created_date={feedItem?.created_date}
          token={token ?? ''}
          rankPress={() => setIsVisible(true)}
          ranked={feedItem?.rec_score}
          scoreType="Friend"
          shouldAutoPlay={autoPlayEnabled}
          isVisible={index === currentVisibleIndex}
          videoIndex={index}
          username={otherUserData?.username}
          shouldPlay={index - 1 === playIndex}
          isPaused={index - 1 !== playIndex}
          is_bookMark={feedItem?.is_bookmarked}
          screenName="OtherProfile__Screen"
        />
    );
  }, [currentVisibleIndex, playIndex, autoPlayEnabled, otherUserData?.username, token, isVisible, setIsVisible]);

  type ListItem = { type: string; id?: number; movie?: FeedItemShape['movie']; user?: FeedItemShape['user'] } & FeedItemShape;
  const renderItem = useCallback(({ item, index }: { item: ListItem; index: number }) => {
    if (item.type === 'profileCard') {
      return (
        <View style={styles.profileCardContainer}>
          <ProfileCard
            imageUri={avatarUrl}
            loaderFollow={loadingFollow}
            onFollowPress={isOwnProfile ? handleEditProfile : handleFollowUnfollow}
            imageLoading={imageLoading}
            setImageLoading={setImageLoading}
            name={otherUserData?.name || otherUserData?.username}
            username={otherUserData?.username}
            rank={`${otherUserData?.ranked ?? ''}`}
            followers={`${otherUserData?.followers_count ?? otherUserData?.followers ?? 0}`}
            following={`${otherUserData?.following_count ?? otherUserData?.following ?? 0}`}
            butt={!isOwnProfile}
            bio={otherUserData?.bio}
            onFollow={() => (navigation as { navigate: (s: string, p?: object) => void }).navigate(ScreenNameEnum.Followers, { tabToOpen: 0, type: 'Followers', userName: otherUserData?.name, user_name: otherUserData?.username, followersCount: otherUserData?.followers_count ?? otherUserData?.followers, followingCount: otherUserData?.following_count ?? otherUserData?.following })}
            onFollowing={() => (navigation as { navigate: (s: string, p?: object) => void }).navigate(ScreenNameEnum.Followers, { tabToOpen: 1, type: 'Following', userName: otherUserData?.name, user_name: otherUserData?.username, followersCount: otherUserData?.followers_count ?? otherUserData?.followers, followingCount: otherUserData?.following_count ?? otherUserData?.following })}
            onSuggested={() => (navigation as { navigate: (s: string, p?: object) => void }).navigate(ScreenNameEnum.Followers, { id: 2, type: 'Suggested', userName: otherUserData?.name, user_name: otherUserData?.username, followersCount: otherUserData?.followers_count ?? otherUserData?.followers, followingCount: otherUserData?.following_count ?? otherUserData?.following })}
            isFollowing={isFollowing}
          />
        </View>
      );
    }
    if (item.type === 'header') {
      return renderHeader();
    }

    if (!item?.movie || !item?.user) return null;
    const avatarUri = `${BASE_IMAGE_URL}${item.user?.avatar ?? ''}`;
    const posterUri = item.movie?.horizontal_poster_url ?? '';
      return MemoFeedCardRender(item as FeedItemShape, index, avatarUri, posterUri);
  }, [renderHeader, playIndex, currentVisibleIndex, autoPlayEnabled, otherUserData, userData, avatarUrl, imageLoading, loadingFollow, isFollowing, handleFollowUnfollow, handleEditProfile, isOwnProfile, navigation]);

  const renderFooter = useCallback(() => {
     if (loadingFeed && combinedData.length <= 50) {
      return <FeedCardShimmer />;
    }

    // 🟡 Heavy UI load
    if (loadingFeed && combinedData.length > 50) {
      return (
        <View style={{ paddingVertical: 20, marginBottom: 90 }}>
          <Text style={{ textAlign: "center", color: "gray" }}>
           {t("discover.loading",)}
          </Text>
          <ActivityIndicator
            size="small"
            color={Color.primary}
            style={{ marginTop: 8 }}
          />
        </View>
      );
    }
    //  No more data
    if (!hasMore && combinedData.length > 0) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ textAlign: "center", color: "gray" }}>
              {t("emptyState.nomore",)}
            
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
  }, [loadingFeed, hasMore, combinedData.length]);
  type CombinedItem = { type: string; id?: number; movie?: { imdb_id?: string }; [key: string]: unknown };
  const filteredData = useMemo(() => {
    return (combinedData as CombinedItem[]).filter((item, index, self) => {
      if (item.type !== 'feed') return true;
      return (
        index ===
        self.findIndex(
          (elem) =>
            elem.type === 'feed' &&
            elem.movie?.imdb_id === item.movie?.imdb_id
        )
      );
    });
  }, [combinedData]); 
const isOnline = useNetworkStatus();
   return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={styles.container}>
      <CustomStatusBar />
      <HeaderCustom
        title={item?.name ?? item?.username ?? t("home.userProfile")}  
        backIcon={imageIndex.backArrow}
        // rightIcon={imageIndex.menu}
        headerColor={Color.headerTransparent}
        onRightPress={() => {
          setBottomModal(true);

        }}
        onBackPressW={() => {
          saveIndex(0)
          navigation.goBack()
         }}
      />
      <FlatList
        data={filteredData}
        // data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item: CombinedItem, index: number) => item?.id?.toString() ?? `index-${index}`}
        onEndReached={() => {
          if (hasMore && !loadingFeed && othr_user_name) fetchFeed("otherprofile", othr_user_name);
        }}
        onEndReachedThreshold={0.7}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        initialNumToRender={2}
        maxToRenderPerBatch={6}
        // windowSize={14}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        windowSize={8}
        decelerationRate={0.82}
        ListFooterComponent={renderFooter}
        onScrollBeginDrag={() => {
          if (!hasScrolled) setHasScrolled(true);
        }}
        //       viewabilityConfigCallbackPairs={useRef([{
        //   viewabilityConfig: viewabilityConfigRef.current,
        //   onViewableItemsChanged: onViewRef.current,
        // }]).current}
        viewabilityConfigCallbackPairs={useRef([{
          viewabilityConfig: viewabilityConfigRef.current,
          onViewableItemsChanged,
        }]).current}

      />
      <BottomSheet
        visible={bottomModal}
        options={BottomData}
        onClose={() => setBottomModal(false)}
        onSelect={(option) => (option as BottomSheetOption).action?.()}
      />
    </SafeAreaView>
  );
};
export default React.memo(OtherProfile);
