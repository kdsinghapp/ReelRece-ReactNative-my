
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform, Alert, } from 'react-native';
import { BottomSheet, ComparisonModal, CustomStatusBar, FeedbackModal, HeaderCustom, ProfileOther, SearchBarCustom, StepProgressModal } from '@components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import styles from './style';
import { Color } from '@theme/color';
import LayeredShadowText from '@components/common/LayeredShadowText/LayeredShadowText';
import { useCompareContext } from '../../../../context/CompareContext';
import { useBookmarks } from '@hooks/useBookmark';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { useDispatch } from 'react-redux';
import { getAllRatedMovies, getCommonBookmarks, getOtherUserRatedMovies, getRatedMovies } from '@redux/Api/movieApi';
import { fetchHomeBookmarks } from '@redux/feature/homeSlice';
import FastImage from 'react-native-fast-image';
import { getHistoryApi } from '@redux/Api/ProfileApi';
import OutlineTextIOS from '@components/NumbetTextIOS';
import imageIndex from '@assets/imageIndex';
import { t } from 'i18next';
import { RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import font from '@theme/font';
import { useNetworkStatus } from '@hooks/useNetworkStatus';


const OtherWatchingProfile = () => {
  const dispatch = useDispatch();
  const [bottomModal, setBottomModal] = useState(false)
  const [lovedImageMap, setLovedImageMap] = useState<{ [key: string]: boolean }>({});

  const route = useRoute();
  const { title, datamovie, username, imageUri, token, disableBottomSheet = false, my_profile = false, user_name } = route?.params

  const navigation = useNavigation();
  const { isBookmarked, toggleBookmark } = useBookmarks(token);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [movies, setMovies] = useState([])

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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setMovies([]); // Clear data
    pageRef.current = 1; // Reset pagination
    hasMoreRef.current = true;
    bothBookMovie(1, false).finally(() => setRefreshing(false));
  }, []);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isConnected && state.isConnected;
      setIsConnected(state.isConnected);

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

        response = await getHistoryApi(token, user_name || username, pageToLoad);
      } else if (my_profile) {

        setLoading(false);
        response = await getRatedMovies(token, pageToLoad);
      } else {
        setLoading(false);
        response = await getOtherUserRatedMovies(token, user_name || username, pageToLoad);
      }

      const next = response?.next !== null;
      const newResults = (response?.results || []).filter(r => r != null);
      setMovies(prev => append ? [...prev, ...newResults] : newResults);

      setHasMore(next);
      setLoading(false);

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
  }, [token, user_name, username]);

  const handleLoadMore = () => {
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
      const newStatus = !currentMovie?.is_bookmarked;
      await toggleBookmark(imdb_id);

      setMovies(prevMovies =>
        prevMovies.map(movie =>
          movie.imdb_id === imdb_id
            ? { ...movie, is_bookmarked: newStatus }
            : movie
        )
      );
      dispatch(fetchHomeBookmarks({ silent: true }));
    } catch (error) {
    }
  };

  const compareHook = useCompareContext();
  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
  };

  const handleNavigation = (imdb_id: string, token: string) => {
    const index = Array.isArray(movies) ? movies.findIndex(m => m?.imdb_id === imdb_id) : -1;
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
      imdb_idData: imdb_id,
      token: token,
      movieList: movies,
      initialIndex: index >= 0 ? index : 0,
      source: 'otherWatchingProfile',
      filterGenreString: '',
      platformFilterString: '',
      selectedSimpleFilter: '1',
      selectedSortId: null,
      contentSelect: null,
      currentPage: 1,
      totalPages: 1,
    });
  };


  const renderMovie = useCallback(({ item, index }) => {
    if (!item) return null;

    return (
      <View style={[styles.movieCard, { paddingHorizontal: 0 }]} >
        <TouchableOpacity activeOpacity={0.8} onPress={() => handleNavigation(item?.imdb_id, token)} >
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

        <TouchableOpacity activeOpacity={0.8} onPress={() => handleNavigation(item?.imdb_id, token)} style={styles.info}>
          <View style={{ flexDirection: "row", }}>
            <Text numberOfLines={2} style={[styles.title]}>{item?.title}</Text>

          </View>
          <Text style={styles.year}>{item?.release_year}</Text>

          {title == "History" ?
            null
            :
            <>
              {Platform.OS == 'ios' ?
                <View style={{ alignItems: 'flex-start', right: index ? 8 : 16.5 }} >
                  <OutlineTextIOS text={(index + 1)} fontSize={60} />
                </View>
                :
                <View style={{ alignItems: 'flex-start', }} >

                  <LayeredShadowText fontSize={60} text={`${index + 1}`} />
                </View>
              }
            </>
          }


        </TouchableOpacity>


        <View style={styles.icons}>
          <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }} >
            <RankingWithInfo
              score={item?.rec_score}
              title={t("discover.friendscore")}
              description={t("discover.frienddes")}
            />
          </View>

          <View style={{
            flexDirection: 'row', marginTop: 18,

          }} >
            <TouchableOpacity style={[styles.iconprimary, {
              alignItems: "center"
            }]}
              onPress={() =>
                handleRankingPress({
                  imdb_id: item?.imdb_id,
                  title: item?.title,
                  release_year: item?.release_year,
                  cover_image_url: item?.cover_image_url || '',
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
                source={item.is_bookmarked ? imageIndex.save : imageIndex.saveMark}
                style={{ height: 20, width: 20 }}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    )
  }, [token, handleToggleLovedImage, lovedImageMap, isSaved, movies]);
  const isOnline = useNetworkStatus();
  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={styles.maincontainer}>
      <CustomStatusBar />
      <View style={styles.container}>

        <HeaderCustom
          title={username}
          backIcon={imageIndex.backArrow}
          headerColor={Color.headerTransparent}
        />
        <FlatList
          showsVerticalScrollIndicator={false}
          data={movies}
          ListEmptyComponent={() => (
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
                fontSize: 14,
                fontFamily: font.PoppinsMedium,
                color: Color.textGray,
              }}
            >
              {t("emptyState.nousers")}
            </Text>
          )}

          keyExtractor={(item, index) => `${item?.imdb_id}-${index}`}
          renderItem={renderMovie}
          ListHeaderComponent={() => (
            <>
              <View style={{ alignItems: 'center', marginBottom: 10 }} >
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
          contentContainerStyle={{ paddingBottom: 70, marginHorizontal: 18, marginTop: 0 }}
          ListFooterComponent={() =>
            loading ? <ActivityIndicator size="large" color={Color.primary} style={{ marginVertical: 16 }} /> : null
          }
        />
      </View>

      {!disableBottomSheet && (
        <BottomSheet
          visible={bottomModal}
          options={BottomData}
          onClose={() => setBottomModal(false)}
          onSelect={(option) => option.action()}
        />
      )}
    </SafeAreaView>
  );
};
export default memo(OtherWatchingProfile);
