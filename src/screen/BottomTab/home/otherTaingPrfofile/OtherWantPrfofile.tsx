// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import FastImage from "react-native-fast-image";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { BottomSheet, CustomStatusBar, HeaderCustom, ProfileOther } from '@components';
// import imageIndex from '@assets/imageIndex";
// import styles from "./style";
// import ScreenNameEnum from '@routes/screenName.enum";
// import { useCompareComponent } from "../../ranking/rankingScreen/useCompareComponent";
// import { useBookmarks } from '@hooks/useBookmark";
// import { getCommonBookmarks, getOtherUserBookmarks } from '@redux/Api/movieApi";
// import { ActivityIndicator as RNActivityIndicator } from "react-native";

// const OtherWantProfile = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { title, username, imageUri, token, disableBottomSheet = false, my_profile = false } = route.params;

//   const [movies, setMovies] = useState([]);
//   const [bottomModal, setBottomModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);

//   const { toggleBookmark } = useBookmarks(token);
//   const compareHook = useCompareComponent(token);

//   const loadingRef = useRef(false);
//   const hasMoreRef = useRef(true);
//   const pageRef = useRef(1);

//   // 🔹 Fetch API (Paginated)
//   const fetchBookmarks = async (pageToLoad = 1, append = false) => {
//     if (loadingRef.current) return;
//     loadingRef.current = true;
//     setLoading(true);

//     try {
//       let response;

//       if (my_profile) {
//         response = await getCommonBookmarks(token, pageToLoad);
//       } else {
//         response = await getOtherUserBookmarks(token, username, pageToLoad);
//       }

//       const newResults = response?.results || [];
//       const hasNext = response?.next !== null;

//       setMovies(prev =>
//         append ? [...prev, ...newResults] : newResults
//       );
//       setHasMore(hasNext);
//       hasMoreRef.current = hasNext;
//       pageRef.current = pageToLoad;

//     } catch (error) {
//     } finally {
//       loadingRef.current = false;
//       setLoading(false);
//     }
//   };

//   // 🔹 Initial load
//   useEffect(() => {
//     setMovies([]);
//     setPage(1);
//     fetchBookmarks(1, false);
//   }, [token, username]);

//   // 🔹 Infinite Scroll
//   const handleLoadMore = () => {
//     if (loadingRef.current || !hasMoreRef.current) return;
//     const nextPage = pageRef.current + 1;
//     fetchBookmarks(nextPage, true);
//   };

//   // 🔹 Bookmark Toggle (save/unsave + UI update)
//   const handleToggleBookmark = async (imdb_id) => {
//     try {
//       await toggleBookmark(imdb_id);
//       setMovies(prevMovies =>
//         prevMovies.map(movie =>
//           movie.imdb_id === imdb_id
//             ? { ...movie, is_bookmarked: !movie.is_bookmarked }
//             : movie
//         )
//       );
//     } catch (error) {
//     }
//   };

//   // 🔹 Navigate to Movie Detail
//   const handleNavigation = (imdb_id) => {
//     navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
//       imdb_idData: imdb_id,
//       token,
//     });
//   };

//   // 🔹 Render each movie card
//   const renderMovie = useCallback(
//     ({ item }) => (
//       <View style={styles.movieCard}>
//         <TouchableOpacity onPress={() => handleNavigation(item.imdb_id)}>
//           <FastImage
//             style={styles.poster}
//             source={
//               typeof item?.cover_image_url === "string"
//                 ? {
//                     uri: item.cover_image_url,
//                     priority: FastImage.priority.low,
//                     cache: FastImage.cacheControl.immutable,
//                   }
//                 : imageIndex.profile1
//             }
//             resizeMode={FastImage.resizeMode.cover}
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.info]}
//           onPress={() => handleNavigation(item.imdb_id)}
//         >
//           <Text style={styles.title}>{item?.title}</Text>
//           <Text style={styles.year}>{item?.release_year}</Text>
//         </TouchableOpacity>

//         <View style={styles.icons}>
//           {/* Ranking Button */}
//           <TouchableOpacity
//             style={styles.iconprimary}
//             onPress={() =>
//               compareHook.openFeedbackModal({
//                 imdb_id: item.imdb_id,
//                 title: item.title,
//                 release_year: item.release_year,
//                 cover_image_url: item.cover_image_url,
//               })
//             }
//           >
//             <Image
//               source={imageIndex.mdRankings}
//               style={{ height: 20, width: 20, marginBottom: 20 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           {/* Bookmark Button */}
//           <TouchableOpacity
//             onPress={() => handleToggleBookmark(item.imdb_id)}
//             style={[
//               styles.iconprimary,
//               { justifyContent: "space-between", alignItems: "center" },
//             ]}
//           >
//             <Image
//               source={item.is_bookmarked ? imageIndex.save : imageIndex.saveMark}
//               style={{ height: 20, width: 20 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     ),
//     [compareHook]
//   );

//   return (
//     <SafeAreaView style={styles.maincontainer}>
//       <CustomStatusBar />
//       <View style={styles.container}>
//         <HeaderCustom
//           title={username}
//           backIcon={imageIndex.backArrow}
//           rightIcon={imageIndex.menu}
//           onRightPress={() => !disableBottomSheet && setBottomModal(true)}
//         />

//         <FlatList
//           data={movies}
//           renderItem={renderMovie}
//           keyExtractor={(item, index) => `${item.imdb_id}-${index}`}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 70 }}
//           onEndReached={handleLoadMore}
//           onEndReachedThreshold={0.3}
//           ListHeaderComponent={() => (
//             <View style={{ marginTop: 8 }}>
//               <ProfileOther
//                 imageSource={imageUri}
//                 label={title}
//                 onPress={() => navigation.navigate(ScreenNameEnum.ProfileScreen)}
//               />
//             </View>
//           )}
//           ListFooterComponent={
//             loading ? (
//               <ActivityIndicator
//                 size="large"
//                 color="#FF5733"
//                 style={{ marginVertical: 20 }}
//               />
//             ) : null
//           }
//         />
//       </View>

//       {!disableBottomSheet && (
//         <BottomSheet
//           visible={bottomModal}
//           onClose={() => setBottomModal(false)}
//           options={[
//             { name: "Follow", action: () => setBottomModal(false) },
//             { name: "Cancel", action: () => setBottomModal(false) },
//           ]}
//           onSelect={(option) => option.action()}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default OtherWantProfile;






import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import styles from './style';
import { getOtherUserBookmarks, toggleBookmark } from '@redux/Api/ProfileApi';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import { useBookmarks } from '@hooks/useBookmark';
import { getCommonBookmarks } from '@redux/Api/movieApi';
import FastImage from 'react-native-fast-image';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import { BottomSheet, CustomStatusBar, HeaderCustom, ProfileOther } from '@components/index';
import useHome from '../homeScreen/useHome';
import { t } from 'i18next';
import { RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';


const OtherWantPrfofile = () => {
  const route = useRoute();
  const { title, datamovie, username, imageUri, token, disableBottomSheet = false, my_profile = false } = route?.params
  const { navigation, isVisible, setIsVisible, modalVisible, setModalVisible } = useHome();
  // const { isBookmarked: save, toggle: handleBookmarkToggle } = useBookmark(token,imdb_id);
  const { isBookmarked, toggleBookmark } = useBookmarks(token);
  const [isSaved, setIsSaved] = useState(my_profile);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [movies, setMovies] = useState([]
    // datamovie.map((item) => ({
    //   ...item,
    //   saved: true
    // }))

  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 1; // Reset to first page
    hasMoreRef.current = true; // Reset pagination
    setMovies([]); // Clear existing data
    bothBookMovie(1, false).finally(() => setRefreshing(false));
  }, []);

  const [isConnected, setIsConnected] = useState(true);

  // Add this useEffect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isConnected && state.isConnected;
      setIsConnected(state.isConnected);

      // Auto-refresh when coming back online AND no data exists
      if (wasOffline && movies.length === 0) {
        bothBookMovie(1, false);
      }
    });

    return () => unsubscribe();
  }, [movies.length]);

  const bothBookMovie = async (pageToLoad = 1, append = false) => {
    let response = []
    if (loadingRef.current) return;
    loadingRef.current = true;
    // setLoading(true);
    try {
      if (my_profile) {
        // response = await getCommonBookmarks(token);
        response = await getCommonBookmarks(token, pageToLoad);

      } else {
        // response = await getOtherUserBookmarks(token, username);
        response = await getOtherUserBookmarks(token, username, pageToLoad);

      }
      const newResults = response.results || []
      const hasNext = response?.next !== null;
      setMovies(prev => (append ? [...prev, ...newResults] : newResults));
      //  setHasMore(hasNext);

      pageRef.current = pageToLoad;
      hasMoreRef.current = hasNext;

      // response = await getCommonBookmarks(token );
      setMovies(response?.results)
    } catch (error) {
    } finally {
      loadingRef.current = false;
      // setLoading(false);
    }
  };
  useEffect(() => {
    setMovies([]);
    // setPage(1);
    pageRef.current = 1
    bothBookMovie(1, false);
  }, [token,]);


  const handleLoadMore = () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    bothBookMovie(nextPage, true);
  };


  const [bottomModal, setBottomModal] = useState(false)
  // const token = useSelector((state: RootState) => state.auth.token);
  const [isFollowing, setIsFollowing] = useState(false);

  let changeMovie = 1;

  const BottomData = isFollowing
    ? [
      { name: t("common.unfollow"), action: () => { setIsFollowing(false); setBottomModal(false); } },
      { name: t("common.cancel"), action: () => setBottomModal(false) }
    ]
    : [
      { name: t("common.follow"), action: () => { setIsFollowing(true); setBottomModal(false); } },
      { name: t("common.cancel"), action: () => setBottomModal(false) }
    ];

  const compareHook = useCompareComponent(token);
  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
  };

  // const handleToggleBookmark = async (imdb_id: string) => {
  //   try {
  //     const newStatus = await toggleBookmark(imdb_id);
  //     if (!newStatus) {
  //       setMovies(prevMovies => prevMovies.filter(movie => movie.imdb_id !== imdb_id));
  //       changeMovie = 2
  //     }
  //   } catch (error) {
  //   }
  // };


  // const { toggleBookmark } = useBookmarks(token);

  const handleToggleBookmark = async (imdb_id: string) => {
    try {
      const newStatus = await toggleBookmark(imdb_id);
      if (!newStatus) {
        changeMovie = 2
        // removed successfully → update UI
        setMovies(prev => prev.filter(movie => movie.imdb_id !== imdb_id));
      }
    } catch (err) {
    }
  };


  const handleNavigation = (imdb_id: string, token: string) => {
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, { imdb_idData: imdb_id, token: token })
    // Alert.alert(imdb_id, token)
  };
  const renderMovie = useCallback(({ item }) => {
    // setIsSaved(item?.is_bookmarked ?? false)
    return (
      <View style={styles.movieCard}>
        <TouchableOpacity onPress={() => handleNavigation(item?.imdb_id, token)}>
          {/* <Image source={{ uri : item?.cover_image_url}} style={styles.poster} /> */}
          {/* <Image
          source={
            typeof item?.cover_image_url === 'string'
              ? { uri: item.cover_image_url }
              : imageIndex.profile1 // fallback image
          }
          style={styles.poster}
        /> */}
          <FastImage
            style={styles.poster}
            source={
              typeof item?.cover_image_url === 'string'
                ? {
                  uri: item.cover_image_url,
                  priority: FastImage.priority.low, // 👈 image loading priority
                  cache: FastImage.cacheControl.immutable, // 👈 cached image use karega
                }
                : imageIndex.profile1 // 👈 fallback local image
            }
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.info]} onPress={() => handleNavigation(item?.imdb_id, token)} >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Text style={styles.title}>{item?.title}</Text>
          </View>
          <Text style={styles.year}>{item?.release_year}</Text>
        </TouchableOpacity>
        <View style={styles.icons}>

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
              style={{ height: 20, width: 20, marginBottom: 20 }}
              resizeMode='contain'
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleToggleBookmark(item?.imdb_id)}
            style={[styles.iconprimary, {
              justifyContent: "space-between",
              alignItems: "center",
            }]}

          >
            <Image
              //  source={isBookmarked(item.imdb_id)  ? imageIndex.save : imageIndex.saveMark}
              source={item.is_bookmarked ? imageIndex.save : imageIndex.saveMark}
              style={{ height: 20, width: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }, [isBookmarked, navigation, isVisible]);

  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomStatusBar />
      <View style={styles.container}>
        <HeaderCustom
          title={username}
          backIcon={imageIndex.backArrow}
        // rightIcon={imageIndex.menu}
        // onRightPress={() => !disableBottomSheet && setBottomModal(true)}  
        />

        <FlatList
          showsVerticalScrollIndicator={false}
          data={movies}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Color.primary]}
              tintColor={Color.primary}
            // title="Pull to refresh"
            />
          }

          ListHeaderComponent={() => (
            <View style={{ marginTop: 8 }}>
              <ProfileOther
                imageSource={imageUri}
                label={title}
                onPress={() => navigation.navigate(ScreenNameEnum.ProfileScreen)}
              />
            </View>)}
          keyExtractor={(item) => item.imdb_id.toString()}
          renderItem={renderMovie}
          initialNumToRender={10}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          contentContainerStyle={{ paddingBottom: 20, marginTop: 3 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingRef.current ? (
              <ActivityIndicator size="large" color={Color.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      </View>
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

      <CompareModals token={token} useCompareHook={compareHook} />
    </SafeAreaView>
  );
};
export default OtherWantPrfofile;