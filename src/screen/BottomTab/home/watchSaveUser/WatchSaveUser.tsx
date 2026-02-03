import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, BackHandler } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import styles from './style';
 import { Color } from '@theme/color';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import FastImage from 'react-native-fast-image';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import { useBookmarks } from '@hooks/useBookmark';
    import { getCommonBookmarkOtherUser, getCommonBookmarks, getOtherUserRatedMovies } from '@redux/Api/movieApi';
import { getHistoryApi } from '@redux/Api/ProfileApi';
import imageIndex from '@assets/imageIndex';
import { BottomSheet, CustomStatusBar, HeaderCustom, ProfileOther } from '@components/index';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';


interface WatchSaveUserProps {
  disableBottomSheet?: boolean; // <-- extra prop
}


const WatchSaveUser = ({ disableBottomSheet = false }) => {
  const route = useRoute();
  const { title, datamovie, username, token, imageUri ,my_profile=false} = route.params;



   const navigation = useNavigation();
  const [movies, setMovies] = useState([]);
  // const [modalVisible, setModalVisible] = useState(false);
  const [bottomModal, setBottomModal] = useState(false)
  const loginUserName = useSelector((state: RootState) => state.auth.userGetData?.username);
  const { isBookmarked, toggleBookmark } = useBookmarks(token);
  const [isSaved, setIsSaved] = useState(true);
   const [isFollowing, setIsFollowing] = useState(false);
  const avatar = useSelector((state: RootState) => state.auth.userGetData?.avatar);
  const userAvatarUrl = useMemo(() => `${BASE_IMAGE_URL}${avatar}}`, [avatar]);
  //  const userAvatarUrl = useMemo(() => `${BASE_IMAGE_URL}${avatar}?t=${Date.now()}`, [avatar]);
   //  const avatar = userGetData?.avatar;
  const avatarUrl1 = avatar ? `${BASE_IMAGE_URL}${avatar}` : undefined;
 // ✅ pagination refs
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);


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

  const handleToggleBookmark = async (imdb_id: string) => {
    try {
      const newStatus = await toggleBookmark(imdb_id);
       if (!newStatus) {
        setMovies(prevMovies => prevMovies.filter(movie => movie.imdb_id !== imdb_id));
        changeMovie = 2
      }
    } catch (error) {
     }
  };

  // const bothBookMovie = async () => {
  //   let response = [];
  //   if (loadingRef.current || !hasMoreRef.current) return;
  //   loadingRef.current = true;

  //   try {
  //     if (my_profile) {
  //      response = await getHistoryApi(token);

  //     } else {
  //      response = await getCommonBookmarkOtherUser(token, username);

  //     }
  //     setMovies(response?.results)
   //   } catch (error) {
   //   }

  // }

  // useEffect(() => {
  //   bothBookMovie()
  // }, [token, username])


  
  // ✅ Fetch API with pagination
  const fetchMovies = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;

    try {
      let response;
      if (my_profile) {
        response = await getHistoryApi(token, pageRef.current);
      } else {
        response = await getCommonBookmarkOtherUser(token, username, pageRef.current);
      }

      const newResults = response?.results || [];

      if (pageRef.current === 1) {
        setMovies(newResults);
      } else {
        setMovies((prev) => [...prev, ...newResults]);
      }

      if (!response?.next) {
        hasMoreRef.current = false;
      } else {
        pageRef.current += 1;
      }
    } catch (error) {
     } finally {
      loadingRef.current = false;
    }
  };

   useEffect(() => {
    // reset when user changes
    pageRef.current = 1;
    hasMoreRef.current = true;
    fetchMovies();
  }, [username, token]);


  const renderMovie = useCallback(({ item }) => {
    // setIsSaved(item?.is_bookmarked ?? false)
     return (
      <>
        <View style={styles.movieCard}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }} >
            <TouchableOpacity onPress={() => navigation.navigate(ScreenNameEnum.MovieDetailScreen)}>
              {/* <Image source={{ uri: item.cover_image_url }} style={styles.poster} /> */}

              <FastImage
                style={styles.poster}
                source={{
                  uri: item?.cover_image_url,
                  priority: FastImage.priority.low,
                  cache: FastImage.cacheControl.immutable,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
            <View style={styles.info}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.title]}>{item?.title}</Text>

              </View>
              <Text style={styles.year}>{item?.release_year}</Text>
            </View>

          </View>
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
                style={{ height: 20, width: 20, }}
                resizeMode='contain'
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconprimary, { marginTop: 28, }]}
              onPress={() => handleToggleBookmark(item?.imdb_id)}
            // onPress={() => toggleBookmark(item?.imdb_id)}
            >
              <Image
                source={isSaved ? imageIndex.save : imageIndex.saveMark}
                style={{ height: 20, width: 20, }}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
        </View>
      </>
    )
  }, [navigation, isBookmarked, toggleBookmark, changeMovie]);

  // const { backnavigateTab, backnavigate } = route.params || {};
   return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomStatusBar />
      <View style={styles.container}>
        <HeaderCustom
          headerColor={Color.modalTransperant}

          title={username}
          multiplename={true}
          backIcon={imageIndex.backArrow}
          rightIcon={imageIndex.menu}
          onRightPress={() => !disableBottomSheet && setBottomModal(true)}  // <-- block opening

        />

        <FlatList
          showsVerticalScrollIndicator={false}
          data={movies}
          keyExtractor={item => item.id}
          renderItem={renderMovie}
 onEndReached={fetchMovies}
          onEndReachedThreshold={0.6}
          ListHeaderComponent={() => (
            <View style={{ marginTop: 65 }}>
              <ProfileOther
                imgStyle={{ width: 96, height: 96 }}
                // imageSource={userAvatarUrl}
                imageSource={avatarUrl1}

                // imageSource={'https://reelrecs.s3.us-east-1.amazonaws.com/static/users/avatar/sunny23.jpg?t=1755171448772'}
                imageSource2={imageUri}
                label={title}
                onPress={() => navigation.navigate(ScreenNameEnum.ProfileScreen)}
              />
            </View>
          )}
          initialNumToRender={5}
          removeClippedSubviews={true}
          contentContainerStyle={{ paddingBottom: 20, marginTop: 3, paddingHorizontal: 12 }}
        />
      </View>
      <BottomSheet
        visible={bottomModal}
        options={BottomData}
        onClose={() => setBottomModal(false)}
        // onSelect={() => setBottomModal(false)}
        onSelect={(option) => option.action()}
      // onSelect={(option) => setBottomModal(option)}
      />
      <CompareModals token={token} useCompareHook={compareHook} />
    </SafeAreaView>
  );
};
export default React.memo(WatchSaveUser);