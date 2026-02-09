
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity,   ActivityIndicator, Platform, } from 'react-native';
 import { BottomSheet, ComparisonModal, CustomStatusBar, FeedbackModal, HeaderCustom, ProfileOther, SearchBarCustom, StepProgressModal } from '@components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import styles from './style';
import { Color } from '@theme/color';
  import LayeredShadowText from '@components/common/LayeredShadowText/LayeredShadowText';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import { useBookmarks } from '@hooks/useBookmark';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { getAllRatedMovies, getCommonBookmarks, getOtherUserRatedMovies, getRatedMovies } from '@redux/Api/movieApi';
import FastImage from 'react-native-fast-image';
import { getHistoryApi } from '@redux/Api/ProfileApi';
import OutlineTextIOS from '@components/NumbetTextIOS';
import imageIndex from '@assets/imageIndex';
import { t } from 'i18next';
import { RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';


const OtherTaingPrfofile = () => {
  const [bottomModal, setBottomModal] = useState(false)
  const [lovedImageMap, setLovedImageMap] = useState<{ [key: string]: boolean }>({});

  const route = useRoute();
  const { title, datamovie, username, imageUri, token, disableBottomSheet = false , my_profile=false } = route?.params
  const navigation = useNavigation();
  const { isBookmarked, toggleBookmark } = useBookmarks(token);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [movies, setMovies] = useState([])

const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);



  // 🔁 Refs to prevent stale closure
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const BottomData = useMemo(() => {
    return isFollowing
      ? [
        { name: t("common.unfollow"), action: () => { setIsFollowing(false); setBottomModal(false); } },
        { name: t("common.cancel"), action: () => setBottomModal(false) }
      ]
      : [
        { name: t("common.follow"), action: () => { setIsFollowing(true); setBottomModal(false); } },
        { name: t("common.cancel"), action: () => setBottomModal(false) }
      ];
  }, [isFollowing]);

  // const bothBookMovie = async (pageToLoad = 1, append = false) => {
  //    if (loading) return; // Prevent multiple calls
  // setLoading(true);
   //   try {
  //     let response = []
      
  //      if( title == "History" && my_profile ) {
  //      response =  await getHistoryApi(token, username, pageToLoad);
  //     } else if (my_profile) {
  //      response = await getRatedMovies(token, pageToLoad);
  //     }  

  //     else {
  //      response = await getOtherUserRatedMovies(token,username,pageToLoad);
  //     };

  //        const newResults = response?.results || [];

  //     // const response = await getRatedMovies(token,);
  //     // setMovies(response?.results)
  //     setMovies(prev => append ? [...prev , ...newResults] : newResults)
  //     setHasMore(response?.next !== null);
   //   } catch (error) {
   //   };
  // };

  
  // useEffect(() => {
  // setPage(1);
  // bothBookMovie(1, false);
   // }, [token])

const [refreshing, setRefreshing] = useState(false);

// Add this function
const onRefresh = useCallback(() => {
  setRefreshing(true);
  setMovies([]); // Clear data
  pageRef.current = 1; // Reset pagination
  hasMoreRef.current = true;
  bothBookMovie(1, false).finally(() => setRefreshing(false));
}, []);
const [isConnected, setIsConnected] = useState(true);

// Add this useEffect for network detection
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    const wasOffline = !isConnected && state.isConnected;
    setIsConnected(state.isConnected);
    
    // Auto-reload when coming online and no data
    if (wasOffline && movies.length === 0) {
      setMovies([]);
      bothBookMovie(1, false);
    }
  });
  
  return () => unsubscribe();
}, [isConnected, movies.length]);

  const bothBookMovie = async (pageToLoad = 1, append = false) => {
    if (loadingRef.current) return; // ✅ prevent duplicate API calls
    loadingRef.current = true;
    setLoading(true);

    try {
      let response;

      if (title === "History" && my_profile) {
                  setLoading(false);

        response = await getHistoryApi(token, username, pageToLoad);
      } else if (my_profile) {
          setLoading(false);
        response = await getRatedMovies(token, pageToLoad);
      } else {
                  setLoading(false);

        response = await getOtherUserRatedMovies(token, username, pageToLoad);
      }

      // const newResults = response?.results || [];
      const next = response?.next !== null;
const newResults = (response?.results || []).filter(r => r != null);
setMovies(prev => append ? [...prev, ...newResults] : newResults);

      // setMovies(prev => (append ? [...prev, ...newResults] : newResults));
      setHasMore(next);
          setLoading(false);

      // update refs
      hasMoreRef.current = next;
      pageRef.current = pageToLoad;

     } catch (err) {
                setLoading(false);

     } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
     bothBookMovie(1, false);
  }, [token, username]);

  const handleLoadMore = () => {
    // if (loadingRef.current || !hasMoreRef.current) {
    //    return;
    // }
    const nextPage = pageRef.current + 1;
     bothBookMovie(nextPage, true);
  };

  const handleToggleLovedImage = useCallback((movieId: string) => {
    setLovedImageMap(prev => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  }, [])

 

const handleToggleBookmark = async (imdb_id: string) => {
  try {
    const currentMovie = movies.find(m => m.imdb_id === imdb_id);
    const newStatus = !currentMovie?.is_bookmarked; // ✅ flip manually first
    await toggleBookmark(imdb_id); // ✅ API call

    setMovies(prevMovies =>
      prevMovies.map(movie =>
        movie.imdb_id === imdb_id
          ? { ...movie, is_bookmarked: newStatus }
          : movie
      )
    );
  } catch (error) {
   }
};




   const compareHook = useCompareComponent(token);
  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
   };


const handleNavigation = (imdb_id: string, token: string) => {
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, { imdb_idData: imdb_id, token: token })
    // Alert.alert(imdb_id, token)
  };


  const renderMovie = useCallback(({ item, index }) => {
    if (!item) return null; 
    // setIsSaved(item?.is_bookmarked ?? false)
 
    return (
      <View style={[styles.movieCard, { paddingHorizontal: 0 }]} >
        <TouchableOpacity  activeOpacity={0.8}   onPress={() => handleNavigation(item?.imdb_id, token)} >
      <FastImage
          style={styles.poster}
          source={{
           uri: item?.cover_image_url ,
            priority: FastImage.priority.low, // 👈 Low priority (since profile image small)
            cache: FastImage.cacheControl.immutable, // 👈 Cache permanently
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        </TouchableOpacity>



        <TouchableOpacity  activeOpacity={0.8}    onPress={() => handleNavigation(item?.imdb_id, token)}  style={styles.info}>
          <View style={{ flexDirection: "row", }}>
            <Text numberOfLines={2} style={[styles.title]}>{item?.title}</Text>


          </View>
          <Text style={styles.year}>{item?.release_year}</Text>

          {title == "History" ?
            null
            :
            // <View style={{ alignItems: 'flex-start' }} >
            //   <LayeredShadowText fontSize={60} text={`${index + 1}`} />

            // </View>
               <>
            {Platform.OS == 'ios' ?
             <View style={{ alignItems: 'flex-start' , right:index ? 8: 16.5}} >
                <OutlineTextIOS text={(index + 1)} fontSize={60} />
                </View>
                 :
                              <View style={{ alignItems: 'flex-start' , }} >

                <LayeredShadowText fontSize={60} text={`${index + 1}`} />
                </View>
              }
            </>
          }

            
        </TouchableOpacity>


        <View style={styles.icons}>
          <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }} >
            {/* <RankingCard ranked={item?.rec_score} /> */}
            <RankingWithInfo
              score={item?.rec_score}
              title= {t("discover.friendscore")}
               description= {t("discover.frienddes")}
              //  {

              //   "This score shows the rating from your friend for this title."
              // }
            />
          </View>

          <View style={{ flexDirection: 'row', marginTop: 18, 

            }} >
            {/* <TouchableOpacity style={styles.iconprimary}
            onPress={() => { setIsVisible(true) }}
          > */}
            <TouchableOpacity style={[styles.iconprimary,{
              alignItems:"center"
            }]}
              onPress={() =>
                handleRankingPress({
                  imdb_id: item?.imdb_id,
                  title: item?.title,
                  release_year: item?.release_year, // or dynamic if available
                  cover_image_url: item?.cover_image_url || '', // ensure string URL is passed
                })
              }
            >
              <Image source={imageIndex.mdRankings} style={{ height: 20, width: 20, right: 10 }}
                resizeMode='contain'
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconprimary, {
              justifyContent: "space-between",
              alignItems: "center",
            }]}
              onPress={() => handleToggleBookmark(item?.imdb_id)}
            >
              <Image
                source={item.is_bookmarked  ? imageIndex.save : imageIndex.saveMark}
                // source={isSaved ? imageIndex.save : imageIndex.saveMark}
                style={{ height: 20, width: 20 }}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>

        </View>





      </View>
    )
  }, [token, handleToggleLovedImage, lovedImageMap, isSaved, movies]);

  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomStatusBar />
      <View style={styles.container}>
       
        <HeaderCustom
          title={username}
          backIcon={imageIndex.backArrow}
          // rightIcon={title === "History" ? null : imageIndex.menu}
          // onRightPress={() => !disableBottomSheet && setBottomModal(true)}
          headerColor={Color.headerTransparent}
        // onBackPressW={() => navigation.goBack()}
        />
        <FlatList
          showsVerticalScrollIndicator={false}
          data={movies}
          keyExtractor={(item, index) => `${item?.imdb_id}-${index}`}
          renderItem={renderMovie}
          // initialScrollIndex={5}
          // windowSize={5}
          ListHeaderComponent={() => (
            <>
              <View style={{ alignItems: 'center',  marginBottom: 10 }} >
                <ProfileOther
                  imageSource={imageUri}
                  label={title}
                   onPress={() => navigation.navigate(ScreenNameEnum.ProfileScreen)}

                />
              </View>

              {title == "History" ?
                <Text style={styles.todayText} >{t("home.today")}</Text>
                :
                null
              }
            </>
          )}
           refreshControl={
    <RefreshControl 
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[Color.primary]}
      tintColor={Color.primary}
    />
  }
          onEndReachedThreshold={0.3}
          onEndReached={handleLoadMore}
          initialNumToRender={10}
          // removeClippedSubviews={true}
          contentContainerStyle={{ paddingBottom: 70, marginHorizontal: 18, marginTop: 0 }}
  //         onEndReached={() => {
  //   if (hasMore && !loading) {
   //     const nextPage = page + 1;
  //     setPage(nextPage);
  //     bothBookMovie(nextPage, true);
  //   }
  // }}
  ListFooterComponent={() =>
    loading ? <ActivityIndicator size="large" color={Color.primary} style={{ marginVertical: 16 }} /> : null
  }
        />
      </View>
      <CompareModals token={token} useCompareHook={compareHook} />
      {!disableBottomSheet && (
        <BottomSheet
          visible={bottomModal}
          options={BottomData}
          onClose={() => setBottomModal(false)}
          // onSelect={() => setBottomModal(false)}
          onSelect={(option) => option.action()}
        // onSelect={(option) => setBottomModal(option)}
        />
      )}
      {/* <CompareModals token={token} useCompareHook={compareHook} /> */}
    </SafeAreaView>
  );
};
export default memo(OtherTaingPrfofile);

// PROFILE1 MOVOIE 1





