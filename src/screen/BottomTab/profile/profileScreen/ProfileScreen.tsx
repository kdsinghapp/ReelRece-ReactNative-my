import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, VirtualizedList, Dimensions } from 'react-native';
import styles from './style';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import HorizontalMovieList from '@components/common/HorizontalMovieList/HorizontalMovieList';
import font from '@theme/font';
import useProfile from './useProfile';
import LoadingModal from '@utils/Loader';
import { getHistoryApi, getUserBookmarks, toggleBookmar } from '@redux/Api/ProfileApi';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
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

const ProfileScreen = () => {

  const { token, userGetData } = useSelector((state: RootState) => state.auth);
  const avatar = userGetData?.avatar;
  const autoPlayEnabled = userGetData?.autoplay_trailer ?? true;
  const isMuted = userGetData?.videos_start_with_sound;
  const restoredRef = useRef(false);

  // const token = useSelector((state: RootState) => state.auth.token); // ✅ outside  condition
  // const userprofile = useSelector((state: RootState) => state.auth.userGetData.avatar); // ✅ outside  condition
  const email_da_data = useSelector((state: RootState) => state?.auth?.userGetData);
  const userprofile = useSelector((state: RootState) => state.auth.userGetData?.avatar);
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
    hasMore,
    getUserFeed,
  } = useUserFeed(token);
  const { navigation,
    isVisible, setIsVisible,
    modalVisible, setModalVisible,
  } = useHome()
  const [suggestedFriend, setSuggestedFriend] = useState([]);
  const listRef = useRef<FlatList>(null);
  const ITEM_HEIGHT = Math.round(Dimensions.get('window').height * 0.65);
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

  // Add this useEffect after your other effects
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);

      // Auto-reload when coming back online
      if (prevOnlineRef.current === false && online === true) {
        console.log('Network restored - auto-refreshing profile data');
        handleRefresh();
      }

      prevOnlineRef.current = online;
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      prevOnlineRef.current = online;
    });

    return () => unsubscribe();
  }, []);

  // Add this function before your return statement
  const handleRefresh = useCallback(async () => {
    if (!isOnline) {
      errorToast('No Internet! \n Please check your network connection')

      return;
    }

    setRefreshing(true);

    try {
      // Refresh all data in parallel
      await Promise.allSettled([
        // User profile
        refetchUserProfile(),

        // Bookmarks
        fetchBookmarks(),

        // Rated movies
        fetchRatedMovies(),

        // History
        fetchHistory1(),

        // Feed data
        fetchFeed("profile", email_da_data?.username, true), // true = force refresh

        // Suggested friends
        fetchSuggestedFriends(),
      ]);

      console.log('Profile screen refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, token, email_da_data?.username]);
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


  // const combinedData = useMemo(() => feedData.map(item => ({ ...item, type: 'feed' })), [feedData]);




  // ✅ Refetch profile when screen is focused AND token exists but no profile
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
  // scroll
  // const onViewableItemsChanged = useCallback(({ viewableItems }) => {
  //   if (!isFocused) return;
  //   if (viewableItems.length > 0) {
  //     const firstVisible = viewableItems[0];
  //     const index = firstVisible?.index ?? 0;

  //     if (firstVisible?.item?.type === 'header') {
  //       setPlayIndex(null);
  //       return;
  //     }

  //     const isFeedCardVisible = viewableItems.some(
  //       item => item?.item?.movie && item?.item?.user
  //     );

  //     if (!isFeedCardVisible) {
  //       setPlayIndex(null);
  //       return;
  //     }

  //     if (timeoutRef.current) clearTimeout(timeoutRef.current);

  //     timeoutRef.current = setTimeout(() => {
  //       if (playIndex !== index - 1) { // only update if changed
  //         setCurrentVisibleIndex(index);
  //         setPlayIndex(index - 1);
  //         lastPlayedIndexRef.current = index - 1;
  //       }
  //     }, 800);
  //   } else {
  //     setPlayIndex(null);
  //   }
  // }, [isFocused]);


  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (!isFocused) return;

    const headerVisible = viewableItems.some(item => item?.item?.type === 'header');

    if (headerVisible) {
      setPlayIndex(null);
      lastPlayedIndexRef.current = null;
      return;
    }
    if (viewableItems.length > 0) {
      const firstVisible = viewableItems[0];
      const index = firstVisible?.index ?? 0;
      // If header or profileStatus is visible, stop video
      const nonFeedVisible = viewableItems.some(item =>
        item?.item?.type === 'header' || item?.item?.type === 'profileStatus'
      );
      if (nonFeedVisible) {
        setPlayIndex(null);
        return;
      }

      const isFeedCardVisible = viewableItems.some(
        item => item?.item?.movie && item?.item?.user
      );

      if (!isFeedCardVisible) {
        setPlayIndex(null);
        lastPlayedIndexRef.current = 0;
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (playIndex !== index - 1) {
          setCurrentVisibleIndex(index);
          setPlayIndex(index - 1);
          lastPlayedIndexRef.current = index - 1;
        }
      }, 800);
    } else {
      setPlayIndex(null);

    }
  }, [isFocused, playIndex, isVisible]);





  const fetchBookmarks = async () => {
    try {
      setLoadingBookmark(true);
      const bookmarks = await getUserBookmarks(token);
      setSavedMovies(bookmarks?.results || []);
    } catch (err) {
    } finally {
      setLoadingBookmark(false);
    }
  };
  useEffect(() => {
    if (!token) return;

    fetchBookmarks();
  }, [token]);


  // -------------------------
  // RATED MOVIES FETCH
  // -------------------------
  const fetchRatedMovies = async () => {
    let videoNUllVideo = 0;

    try {
      setLoadingTrending(true);
      const rated = await getRatedMovies(token);
      await AsyncStorage.setItem('profileIndex', videoNUllVideo.toString());

      setRankingMovie(rated?.results || []);
    } catch (err) {
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchRatedMovies();
  }, [token]);


  // -------------------------
  // HISTORY MOVIES FETCH
  // -------------------------

  // const fetchHistory = async () => {
  //   try {
  //     setLoadingRecs(true);
  //     const history = await getHistoryApi(token);
  //     setHistoryMovies(history?.results || []);
  //   } catch (err) {
  //   } finally {
  //     setLoadingRecs(false);
  //   }
  // };
  // useEffect(() => {
  //   if (!token) return;

  //   fetchHistory();
  // }, [token]);

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

  const fetchHistory1 = async () => {
    try {
      setLoadingRecs(true);
      const history = await getHistoryApi(token);
      setHistoryMovies(history?.results || []);
    } catch (err) {
    } finally {
      setLoadingRecs(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          await fetchBookmarks();
          await fetchHistory1();
        } catch (error) {
        }
      };
      if (isActive) {
        fetchData();
      }

      // Cleanup when screen loses focus
      return () => {
        isActive = false;
      };
    }, [])
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
  }, [token]);

  // Handle follow/unfollow callback - refresh profile data
  const handleFollowCallback = useCallback((username: string, isFollowing: boolean) => {
    // Refresh profile to update following count
    refetchUserProfile();

    // Optionally remove from suggested list after following
    if (isFollowing) {
      setSuggestedFriend(prev => prev.filter(friend => friend.username !== username));
    }
  }, [refetchUserProfile]);


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



  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: viewabilityConfigRef.current,
      onViewableItemsChanged: onViewableItemsChanged,
    },
  ]);
  // const avatarUrl = useMemo(() => `${BASE_IMAGE_URL}${avatar}?t=${Date.now()}`, [avatar]);
  const avatarUrl = avatar ? `${BASE_IMAGE_URL}${avatar}` : undefined;



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
            navigateTo={ScreenNameEnum.OtherTaingPrfofile}
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
            navigateTo={ScreenNameEnum.OtherWantPrfofile}
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
            navigateTo={ScreenNameEnum.OtherTaingPrfofile}
            disableBottomSheet={true}
            loading={loadingBookmark}

            emptyData={t("emptyState.nohistoryyet")}
            scoreType='Rec'

          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 1, alignContent: 'center' }}>
            <Text style={styles.sectionTitle}>{t("profile.suggestedMembers")}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ScreenNameEnum.Followers, { tabToOpen: 2 })}
            >
              <Image source={imageIndex.rightArrow} style={styles.listArrow} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 5, paddingVertical: 10 }} >
          <FlatList
            horizontal
            data={suggestedFriend}
            keyExtractor={(item, index) =>
              item?.username ?? item?.id?.toString() ?? `suggested-${index}`
            }
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            ListEmptyComponent={() => (
              <Text
                style={{
                  color: Color.whiteText,
                  marginLeft: 11,
                  fontSize: 14,
                  fontFamily: font.PoppinsMedium,
                  textAlign: 'center',
                }}
              >
                {t("emptyState.noSuggestedMembers")}
              </Text>
            )}
            removeClippedSubviews
            updateCellsBatchingPeriod={50}
            renderItem={({ item }) =>
              item ? (
                <SuggestedFriendCard
                  item={item}
                  BASE_IMAGE_URL={BASE_IMAGE_URL}
                  onFollow={(username) => { }}
                />
              ) : null
            }
          />
        </View>

        <View style={{ paddingHorizontal: 15, paddingBottom: 20 }}  >

          <Text style={styles.sectionTitle}>{t("home.recentactivities")}</Text>
        </View>
        {/* <Text style={{fontSize:44,color:'red'}}>{savedMovies}</Text> */}

        {/* feedcard data */}
        {/* {renderFeedList} */}
        {/* </View> */}
      </>
    )
  }



  const userNameFollow = userProfile?.name;
  const renderItem = ({ item, index }) => {
    if (!item) return null;
    if (item.type === 'profileCard') {
      return (
        <ProfileCard
          imageUri={avatarUrl}
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
          name={userProfile?.name}
          rank={`${userProfile?.ranked}`}
          rankscreenData={rankingMovie}
          followers={`${userProfile?.followers}`}
          following={`${userProfile?.following}`}
          butt={false}
          bio={userProfile?.bio}
          onFollow={() => navigation.navigate(ScreenNameEnum.Followers, { tabToOpen: 0, type: 'Followers', userName: userNameFollow })}
          onFollowing={() =>
            // navigation.navigate('Followers', { tabToOpen: 1, type: 'Following', userName:userProfile?.name })
            navigation.navigate(ScreenNameEnum.Followers, { tabToOpen: 1, type: 'Following', userName: userNameFollow })
          }
          onSuggested={() =>
            navigation.navigate(ScreenNameEnum.Followers, { id: 2, type: 'Suggested', userName: userNameFollow })
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
      return renderHeader();
    }
    if (item.type === 'feed') {
      if (!item.movie || !item.user) return null;

      const avatarUri = item.user.avatar ? `${BASE_IMAGE_URL}${item.user.avatar}` : null;
      const avatarSource = avatarUri ? { uri: avatarUri } : imageIndex.profielImg;
      const posterUri = item.movie.horizontal_poster_url;
      const posterSource = posterUri ? { uri: posterUri } : imageIndex.SingleMovie5;

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
          rankPress={() => setIsVisible(true)}
          ranked={item?.rec_score}
          shouldAutoPlay={autoPlayEnabled}
          isVisible={index === currentVisibleIndex}
          scoreType='Rec'
          videoIndex={index + 1}
          shouldPlay={index === currentVisibleIndex}
          isPaused={index - 1 !== playIndex}
          is_bookMark={item?.is_bookmarked}
        />
      );
    }
    return null;
  };

  const renderFooter = useCallback(() => {
    // 🟢 Normal loading
    if (loadingFeed && combinedData.length <= 50) {
      return <FeedCardShimmer />;
    }

    // 🟡 Heavy UI load
    if (loadingFeed && combinedData.length > 50) {
      return (
        <View style={{ paddingVertical: 20, marginBottom: 90 }}>
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

    // 🔴 No more data
    if (!hasMore && combinedData.length > 0) {
      return (
        <View style={{ paddingVertical: 20 }}>
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
  }, [loadingFeed, hasMore, combinedData.length]);


  if (loading) {
    return (<View style={{ flex: 1, backgroundColor: Color.background, alignItems: 'center', justifyContent: 'center' }} >
      <ActivityIndicator size="large" color={Color.primary} />
    </View>)
  }


  {
    loading && (
      <View style={{ flex: 1, backgroundColor: Color.background, alignItems: 'center', justifyContent: 'center' }} >
        <ActivityIndicator size="large" color={Color.primary} />
      </View>)
  };


  function mergeFeedByImdbId(data = []) {
    const result = [];
    const feedMap = new Map();

    data.forEach(item => {
      // 1️⃣ Non-feed items
      if (item?.type !== "feed") {
        result.push(item);
        return;
      }

      const imdbId = item?.movie?.imdb_id;

      // 2️⃣ Invalid feed → skip
      if (!imdbId || !item.activity || item.rec_score === -1) {
        return;
      }

      // 3️⃣ First occurrence
      if (!feedMap.has(imdbId)) {
        feedMap.set(imdbId, {
          ...item,
          _activities: new Set([item.activity]),
        });
        return;
      }

      // 4️⃣ Merge
      const existing = feedMap.get(imdbId);

      existing._activities.add(item.activity);

      // // ranked has priority
      // if (item.activity === "ranked") {
      //   existing.rec_score = item.rec_score;
      //   existing.comment = item.comment;
      // }

      // bookmarked once → always bookmarked
      if (item.is_bookmarked === true) {
        existing.is_bookmarked = true;
      }
    });

    // 5️⃣ Finalize
    feedMap.forEach(item => {
      const activityOrder = ["ranked", "bookmarked"];

      item.activity = activityOrder
        .filter(a => item._activities.has(a))
        .join(", ");

      delete item._activities;
      result.push(item);
    });

    return result;
  }
  const fiter = mergeFeedByImdbId(combinedData)
  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar />
      <LoadingModal visible={(loading && !loadingTimeout) || (!userProfile && !loadingTimeout)} />
      <View style={{ paddingTop: 18, }}>
        {/* <Text style={{fontSize:22, color:'red'}} >{userProfile.name}</Text> */}
        <HeaderCustom
          title={userProfile?.name}
          rightIcon={imageIndex.settings}
          onRightPress={() => navigation.navigate(ScreenNameEnum.MainSetting)}
        />
        <FlatList
          data={fiter}
          // data={combinedData}
          renderItem={renderItem}
          //  keyExtractor={(item, index) => item?.id?.toString() || `index-${index}`}
          keyExtractor={(item, index) => item?.id?.toString?.() || `header-${index}`}
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
          onEndReached={() => {
            if (hasMore && !loadingFeed) fetchFeed("profile", email_da_data?.username);
            ;
          }}
          onEndReachedThreshold={0.2}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          initialNumToRender={2}
          maxToRenderPerBatch={6}
          // removeClippedSubviews={true} 
          windowSize={10}
          // removeClippedSubviews
          decelerationRate={0.86}
          // removeClippedSubviews={true} 

          //  windowSize={14}             
          updateCellsBatchingPeriod={50}
          //  ListFooterComponent={renderFooter}
          onScrollBeginDrag={() => {
            if (!hasScrolled) setHasScrolled(true);
          }}
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

