import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, VirtualizedList, Alert } from 'react-native';
 import styles from './style';
import { useFocusEffect, useIsFocused, useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
 import useHome from '../homeScreen/useHome';
import { Color } from '@theme/color';
import HorizontalMovieList from '@components/common/HorizontalMovieList/HorizontalMovieList';
import { getOthereUsers, getOtherUserBookmarks } from '@redux/Api/ProfileApi';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
 import { getCommonBookmarkOtherUser, getCommonBookmarks, getOtherUserRatedMovies } from '@redux/Api/movieApi';
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

const OtherProfile = () => {
  const token = useSelector((state: RootState) => state.auth?.token);
 
  const route = useRoute();
  const { item } = route?.params || {};
  let othr_user_name = item?.username;
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
  } = useUserFeedWithName(token);

  const [bottomModal, setBottomModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [otherUserData, setOtherUserData] = useState([]);
  const [otherUserRankingMovie, setOtherUserRankingMovie] = useState([]);
  const [commonUserRankingMovie, setCommonUserRankingMovie] = useState([]);
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
      ...feedData.map(item => ({ ...item, type: 'feed' })),
    ];
  }, [feedData]);
  const [followLoading, setFollowLoading] = useState(false);
  //  const avatar = useSelector((state: RootState) => state.auth.userGetData?.avatar);
  //  const avatar = useSelector((state: RootState) => state.auth.userGetData?.avatar);
  const handleFollowUnfollow = async () => {
    setFollowLoading(true);
    setLoadingFollow(true)
    try {
      if (isFollowing) {
        await unfollowUser(token, otherUserData?.username);
       } else {
        await followUser(token, otherUserData?.username);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
    } finally {
      setFollowLoading(false);
      // setFollowLoading(false);
      setLoadingFollow(false)
    }
  };
  const BottomData = useMemo(() => [
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
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: (object | string | null | number)[] }) => {
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
    const headerOrProfileVisible = viewableItems.some(v => v?.item?.type === 'header' || v?.item?.type === 'profileStatus');
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
    const index = firstVisible?.index ?? 0;

    // ensure it's a feed card (has movie + user)
    const isFeedCardVisible = viewableItems.some(item => item?.item?.movie && item?.item?.user);
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
    let videoNUllVideo = 0;
 
    try {
      const res = await getOthereUsers(token, item?.username);
      await AsyncStorage.setItem('otherProfileIndex', videoNUllVideo.toString());
      setOtherUserData(res?.data)
       setIsFollowing(res.data?.following_bool)
      } catch (err) {
     }
  };

  useEffect(() => {
    fetchOtherUserDetails();
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90,
  };
  const [userBookmarks, setUserBookmarks] = useState([]);


 

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
    if (hasMore && !loadingFeed && otherUserData?.username) {
      // fetchFeed("home", otherUserData?.username);
      fetchFeed("otherprofile", othr_user_name);
       // Alert.alert(otherUserData?.username, "wotherprofile feed")
    }
  }, [token]);
  const avatarUrl = useMemo(() => `${BASE_IMAGE_URL}${otherUserData?.avatar}?t=${Date.now()}`, [otherUserData]);

  const renderHeader = useCallback(() => (



    <View style={{ marginHorizontal: 14, }}>

      {/* first list */}
      <HorizontalMovieList
        title={t("home.rankings",)}
        data={otherUserRankingMovie}
        loading={loadingRanked}
        username={otherUserData?.username}
        token={token}
        imageUri={avatarUrl}
        my_profile={false}

        // navigateTo={{ScreenNameEnum.OtherTaingPrfofile, scoreType :'Friend'}}
        // OtherTaingPrfofile
        navigateTo={ScreenNameEnum.OtherTaingPrfofile}
         scoreType={t("home.friend",)}
        emptyData={t("emptyState.noratingsyet",)}

      />
      {/* second list */}
      <HorizontalMovieList
        title= {t("home.wantwatch",)}  
        data={userBookmarks}
        username={otherUserData?.username}
        otheruser
        token={token}
        imageUri={avatarUrl}
        loading={loadingBookmarks}
        my_profile={false}

        navigateTo={ScreenNameEnum.OtherWantPrfofile}
        emptyData= {t("emptyState.nobookmarks",)} 
        scoreType={t("home.friend",)}


      />

      {/* thrid list */}
      <HorizontalMovieList
        title={t("home.moviesshows",)}
        data={commonUserRankingMovie}
        imageUri={avatarUrl}
        loading={loadingCommon}
        username={otherUserData?.username}
        token={token}
        my_profile={false}
        navigateTo={ScreenNameEnum.WatchSaveUser}
        emptyData={t("emptyState.nohistoryyet",)}
        scoreType={t("home.friend",)}
      />
      <Text style={styles.sectionTitle}>{t("home.recentactivities",)}</Text>
    </View>

  ), [avatarUrl, loadingFollow, handleFollowUnfollow, imageLoading, otherUserData, isFollowing,]);


  const MemoFeedCardRender = useCallback((item, index, avatarUri, posterUri) => {
     return (
      // <MemoFeedCard
      //   key={item.movie?.imdb_id} // <-- unique key per video

      //   avatar={{ uri: avatarUri }}         //  string
      //   poster={{ uri: posterUri }}        //  string
      //   user={item.user?.name}
      //   title={item.movie?.title}
      //   comment={item.comment}
      //   release_year={item?.movie?.release_year?.toString()}
      //   videoUri={item.movie?.trailer_url}
      //   imdb_id={item.movie?.imdb_id}
      //   isMuted={isMuted}
      //   token={token} rankPress={() => setIsVisible(true)}
      //   ranked={item?.rec_score}
      //   scoreType='Friend'
      //   shouldAutoPlay={autoPlayEnabled}
      //   isVisible={index === currentVisibleIndex}
      //   videoIndex={index} // FIX HERE
      //   username={otherUserData?.username}
      //   // shouldPlay={index - 1 === playIndex}
      //   shouldPlay={index - 1 === playIndex}
      //   isPaused={index - 1 !== playIndex}
      //   is_bookMark={item?.is_bookmarked}
      //   //   videoIndex={index } // FIX HERE
      //   // username={otherUserData?.username}
      //   // // shouldPlay={index - 1 === playIndex}
      //   // shouldPlay={index -1 === currentVisibleIndex}
      //   // isPaused={index - 1 !== playIndex}
      //   // is_bookMark={item?.is_bookmarked}

      //   screenName='OtherProfile__Screen'
      // />
        <MemoFeedCardHome
        key={item.movie?.imdb_id} // <-- unique key per video
activity={item?.activity}
        avatar={{ uri: avatarUri }}         //  string
        poster={{ uri: posterUri }}        //  string
        // user={item.user?.name}
                user={item.user?.name ||item.user?.username}

        title={item.movie?.title}
        comment={item.comment}
        release_year={item?.movie?.release_year?.toString()}
        videoUri={item.movie?.trailer_url}
        imdb_id={item.movie?.imdb_id}
        isMuted={isMuted}
        token={token} rankPress={() => setIsVisible(true)}
        ranked={item?.rec_score}
        scoreType='Friend'
        shouldAutoPlay={autoPlayEnabled}
        isVisible={index === currentVisibleIndex}
        videoIndex={index} // FIX HERE
        username={otherUserData?.username}
        // shouldPlay={index - 1 === playIndex}
        shouldPlay={index - 1 === playIndex}
        isPaused={index - 1 !== playIndex}
        is_bookMark={item?.is_bookmarked}
        //   videoIndex={index } // FIX HERE
        // username={otherUserData?.username}
        // // shouldPlay={index - 1 === playIndex}
        // shouldPlay={index -1 === currentVisibleIndex}
        // isPaused={index - 1 !== playIndex}
        // is_bookMark={item?.is_bookmarked}

        screenName='OtherProfile__Screen'
      />
    );
  }, [])


  const renderItem = useCallback(({ item, index }) => {
     if (item.type === 'profileCard') {
      return (
        <View style={styles.profileCardContainer}>
          <ProfileCard
            imageUri={avatarUrl}
            loaderFollow={loadingFollow}
            // butt={true}
            // onFollowPress={() => setBottomModal(true)}
            onFollowPress={handleFollowUnfollow}
            imageLoading={imageLoading}
            setImageLoading={setImageLoading}
            name={otherUserData?.name}
            rank={`${otherUserData?.ranked ?? ''}`}
            followers={`${otherUserData?.followers ?? ''}`}
            following={`${otherUserData?.following ?? ""}`}
            butt={true}
            bio={otherUserData?.bio}
            onFollow={() => navigation.navigate(ScreenNameEnum.Followers)}
            onFollowing={() =>
              // navigation.navigate('Followers', { tabToOpen: 1, type: 'Following', userName:otherUserData?.name })
              navigation.navigate(ScreenNameEnum.Followers, { tabToOpen: 1, type: 'Following', userName: otherUserData?.name })
            }
            onSuggested={() =>
              navigation.navigate(ScreenNameEnum.Followers, { id: 2, type: 'Suggested', userName: otherUserData?.name })
            }
            isFollowing={isFollowing}

          />
        </View>
      )
    }
    if (item.type === 'header') {
      return renderHeader(); // 🔁 same function as before
    }

     if (!item?.movie || !item?.user) return null;
    const avatarUri = `${BASE_IMAGE_URL}${item.user?.avatar}`;
    const posterUri = item.movie?.horizontal_poster_url;
    //     return (
    //       <MemoFeedCard
    //         key={item.movie?.imdb_id} // <-- unique key per video

    //         avatar={{ uri: avatarUri }}         //  string
    //         poster={{ uri: posterUri }}        //  string
    //         user={item.user?.name}
    //         title={item.movie?.title}
    //         comment={item.comment}
    //         release_year={item?.movie?.release_year?.toString()}
    //         videoUri={item.movie?.trailer_url}
    //         imdb_id={item.movie?.imdb_id}
    //         isMuted={isMuted}
    //         token={token} rankPress={() => setIsVisible(true)}
    //         ranked={item?.rec_score}
    //         scoreType='Friend'
    //         shouldAutoPlay={autoPlayEnabled}
    //         isVisible={index === currentVisibleIndex}
    //         videoIndex={index } // FIX HERE
    //         username={otherUserData?.username}
    //         // shouldPlay={index - 1 === playIndex}
    //         shouldPlay={index -1 === playIndex}
    //         isPaused={index - 1 !== playIndex}
    //         is_bookMark={item?.is_bookmarked}
    //         //   videoIndex={index } // FIX HERE
    //         // username={otherUserData?.username}
    //         // // shouldPlay={index - 1 === playIndex}
    //         // shouldPlay={index -1 === currentVisibleIndex}
    //         // isPaused={index - 1 !== playIndex}
    //         is_bookMark={item?.is_bookmarked}

    //  screenName = 'OtherProfile__Screen'
    //       />
    //     );

    return MemoFeedCardRender(item, index, avatarUri, posterUri)

  }, [renderHeader, playIndex, currentVisibleIndex, autoPlayEnabled]);

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
const filteredData = useMemo(() => {
  return combinedData.filter((item, index, self) => {
    if (item.type !== 'feed') return true;

    return (
      index ===
      self.findIndex(
        (t) =>
          t.type === 'feed' &&
          t.movie?.imdb_id === item.movie?.imdb_id
      )
    );
  });
}, [combinedData]); 

   return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar />
      <HeaderCustom
        title={item?.name || item?.username ||t("home.userProfile")}  
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
        keyExtractor={(item, index) => item?.id?.toString() || `index-${index}`}
        onEndReached={() => {
          if (hasMore && !loadingFeed) fetchFeed("otherprofile", othr_user_name);
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
          onViewableItemsChanged, //  Directly pass this
        }]).current}

      // 👇 Footer Loader + UI Heavy Condition
      // ListFooterComponent={() => {
      //  { 
      //   // 🟢 Condition 1: Normal loading when fetching more data
      //   if (loadingFeed && combinedData.length <= 50) {
      //     return (
      //       <FeedCardShimmer   />
      //     );
      //   }
      //   // 🟡 Condition 2: When too much data already loaded (UI heavy)
      //   else if (loadingFeed && combinedData.length > 50) {
      //     return (
      //       <View style={{ paddingVertical: 20, marginBottom: 90 }}>
      //         <Text style={{ textAlign: "center", color: "gray" }}>
      //           Loading more content... please wait
      //         </Text>
      //         <ActivityIndicator
      //           size="small"
      //           color={Color.primary}
      //           style={{ marginTop: 8 }}
      //         />
      //       </View>
      //     );
      //   }

      //   // 🔴 Condition 3: When no more data
      //   else if (!hasMore && combinedData.length > 0) {
      //     return (
      //       <View style={{ paddingVertical: 20 }}>
      //         <Text style={{ textAlign: "center", color: "gray" }}>
      //           No more data available
      //         </Text>
      //       </View>
      //     );
      //   }

      //   // Default case: nothing to show
      //   else {
      //     return (
      //        <View>
      //     <FeedCardShimmer />
      //     </View>
      //     )
      //     ;
      //   }}





      // }
      // }


      />
      <BottomSheet
        visible={bottomModal}
        options={BottomData}
        onClose={() => setBottomModal(false)}
        onSelect={(option) => option.action?.()}
      />
    </SafeAreaView>
  );
};
export default React.memo(OtherProfile);
