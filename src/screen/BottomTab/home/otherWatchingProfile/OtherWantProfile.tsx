import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import styles from './style';
import { getOtherUserBookmarks,   } from '@redux/Api/ProfileApi';
import { useCompareContext } from '../../../../context/CompareContext';
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
 import font from '@theme/font';
import { useNetworkStatus } from '@hooks/useNetworkStatus';


const OtherWantProfile = () => {
  const route = useRoute();
  const { title, datamovie, username, imageUri, token, disableBottomSheet = false, my_profile = false } = route?.params
  const { navigation, isVisible, setIsVisible, modalVisible, setModalVisible } = useHome();
  const { isBookmarked, toggleBookmark } = useBookmarks(token);
  const [isSaved, setIsSaved] = useState(my_profile);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [movies, setMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setMovies([]);
    bothBookMovie(1, false).finally(() => setRefreshing(false));
  }, []);

  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isConnected && state.isConnected;
      setIsConnected(state.isConnected);
      if (wasOffline && movies.length === 0) {
        bothBookMovie(1, false);
      }
    });
    return () => unsubscribe();
  }, [movies.length]);

  const bothBookMovie = async (pageToLoad = 1, append = false) => {
    let response = [];
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      if (my_profile) {
        response = await getCommonBookmarks(token, pageToLoad);
      } else {
        response = await getOtherUserBookmarks(token, username, pageToLoad);
      }
      const newResults = response.results || [];
      const hasNext = response?.next !== null;
      setMovies(prev => (append ? [...prev, ...newResults] : newResults));
      pageRef.current = pageToLoad;
      hasMoreRef.current = hasNext;
    } catch (error) {
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    setMovies([]);
    pageRef.current = 1;
    bothBookMovie(1, false);
  }, [token]);

  const handleLoadMore = () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    bothBookMovie(nextPage, true);
  };

  const [bottomModal, setBottomModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const BottomData = isFollowing
    ? [
      { name: t("common.unfollow"), action: () => { setIsFollowing(false); setBottomModal(false); } },
      { name: t("common.cancel"), action: () => setBottomModal(false) }
    ]
    : [
      { name: t("common.follow"), action: () => { setIsFollowing(true); setBottomModal(false); } },
      { name: t("common.cancel"), action: () => setBottomModal(false) }
    ];

  const compareHook = useCompareContext();
  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
  };

  const handleToggleBookmark = async (imdb_id: string) => {
    try {
      const newStatus = await toggleBookmark(imdb_id);
      if (!newStatus) {
        setMovies(prev => prev.filter(movie => movie.imdb_id !== imdb_id));
      }
    } catch (err) {
    }
  };

  const handleNavigation = (imdb_id: string, token: string) => {
    const index = Array.isArray(movies) ? movies.findIndex((m: any) => m?.imdb_id === imdb_id) : -1;
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
      imdb_idData: imdb_id,
      token: token,
      movieList: movies || [],
      initialIndex: index >= 0 ? index : 0,
      source: 'otherWantProfile',
      filterGenreString: '',
      platformFilterString: '',
      selectedSimpleFilter: '1',
      selectedSortId: null,
      contentSelect: null,
      currentPage: 1,
      totalPages: 1,
    });
  };

  const renderMovie = useCallback(({ item }) => {
    return (
      <View style={styles.movieCard}>
        <TouchableOpacity onPress={() => handleNavigation(item?.imdb_id, token)}>
          <FastImage
            style={styles.poster}
            source={
              typeof item?.cover_image_url === 'string'
                ? {
                  uri: item.cover_image_url,
                  priority: FastImage.priority.low,
                  cache: FastImage.cacheControl.immutable,
                }
                : imageIndex.profile1
            }
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.info]} onPress={() => handleNavigation(item?.imdb_id, token)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                release_year: item?.release_year,
                cover_image_url: item?.cover_image_url || '',
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
            style={[styles.iconprimary, { justifyContent: "space-between", alignItems: "center" }]}
          >
            <Image
              source={item.is_bookmarked ? imageIndex.save : imageIndex.saveMark}
              style={{ height: 20, width: 20 }}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [isBookmarked, navigation, isVisible]);
const isOnline = useNetworkStatus();
  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={styles.maincontainer}>
      <CustomStatusBar />
      <View style={styles.container}>
        <HeaderCustom title={username} backIcon={imageIndex.backArrow} />
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
              {t("emptyState.noMoviesFound")}
            </Text>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Color.primary]}
              tintColor={Color.primary}
            />
          }
          ListHeaderComponent={() => (
            <View style={{ marginTop: 8 }}>
              <ProfileOther
                imageSource={imageUri}
                label={title}
                onPress={() => navigation.navigate(ScreenNameEnum.ProfileScreen)}
              />
            </View>
          )}
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
              <ActivityIndicator size="small" color={Color.primary} style={{ marginVertical: 20 }} />
            ) : null
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
export default OtherWantProfile;
