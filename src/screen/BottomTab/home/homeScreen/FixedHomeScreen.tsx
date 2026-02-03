import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert
} from 'react-native';
 
import imageIndex from '@assets/imageIndex';
import styles from './style';
import ScreenNameEnum from '@routes/screenName.enum';
import useHome from './useHome';
import { Color } from '@theme/color';
import Notification from './Notification/Notification';
import HorizontalMovieList from '@components/common/HorizontalMovieList/HorizontalMovieList';
import { getMatchingMovies, getRecentActiveUsers } from '@redux/Api/ProfileApi';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
 import useUserFeed from '@components/card/feedCard/useUserFeed';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
 import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
 import MemoFeedCard from '@components/card/feedCard/MemoFeedCard';
import CustomText from '@components/common/CustomText/CustomText';
import font from '@theme/font';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { homeDiscoverApi, Trending_without_Filter } from '@redux/Api/movieApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import CacheManagerUI from '@utils/NewCache/CacheManagerUI';
import FeedCardShimmer from '@components/card/feedCard/FeedCardShimmer';
import { BASE_IMAGE_URL } from '@config/api.config';
import { ComparisonModal, CustomStatusBar } from '@components/index';
import { t } from 'i18next';

const FixedHomeScreen = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userData = useSelector((state: RootState) => state.auth?.userGetData);
  const autoPlayEnabled = useSelector(
    (state: RootState) => state.auth.userGetData?.autoplay_trailer ?? true
  );
  const isMuted = false;

  const {
    navigation,
    isVisible, setIsVisible,
    modalVisible, setModalVisible,
    stepsModal, setStepsModal,
  } = useHome();

  const {
    feedData,
    fetchFeed,
    loadingFeed,
    hasMore,
  } = useUserFeed(token);

  const [notificationModal, setNotificationModal] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingData, setTrendingData] = useState([]);
  const [recommendData, setRecommendData] = useState([]);
  const [bookmarkData, setBookmarkData] = useState([]);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [loadingMovieLists, setLoadingMovieLists] = useState(true);
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [feedReached, setFeedReached] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingBookmark, setLoadingBookmark] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const isFocused = useIsFocused();

  // Fetch data when token is available
  useEffect(() => {
    if (token) {
      fetchInitialData();
    }
  }, [token]);

  const fetchInitialData = async () => {
    if (!token) {
       Alert.alert('Debug', 'No token available');
      return;
    }

    setLoading(true);
    try {

      // Fetch all data in parallel - FIXED: Pass token to all API calls
      const [users, trending, recommend, bookmarks] = await Promise.all([
        getRecentActiveUsers(token),
        homeDiscoverApi(token, '/trending?country=US'),
        homeDiscoverApi(token, '/recommend-movies?country=US'),
        homeDiscoverApi(token, '/bookmarks?country=US')
      ]);

      // Debug logging to check API response structure
      const debugInfo = {
        trending: trending ? Object.keys(trending) : 'null',
        trendingCount: trending?.results?.length || trending?.movies?.length || 0,
        recommend: recommend ? Object.keys(recommend) : 'null',
        recommendCount: recommend?.results?.length || recommend?.movies?.length || 0,
        bookmarks: bookmarks ? Object.keys(bookmarks) : 'null',
        bookmarksCount: bookmarks?.results?.length || bookmarks?.movies?.length || 0,
      };

 
      // Show debug alert with API response info
      Alert.alert('API Debug',
        `Trending: ${debugInfo.trendingCount} items\n` +
        `Recommend: ${debugInfo.recommendCount} items\n` +
        `Bookmarks: ${debugInfo.bookmarksCount} items\n` +
        `Keys: ${trending ? Object.keys(trending).join(', ') : 'null'}`
      );

      // Log first item to see structure
      if (trending?.results?.[0]) {
       } else if (trending?.movies?.[0]) {
       }

      // FIXED: Use correct response structure based on actual API response
      // Check both .results and .movies properties
      setRecentUsers(users?.data?.results || []);
      setTrendingData(trending?.results || trending?.movies || []);
      setRecommendData(recommend?.results || recommend?.movies || []);
      setBookmarkData(bookmarks?.results || bookmarks?.movies || []);
    } catch (error) {
       // Show error in alert
      Alert.alert('API Error', `${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingTrending(false);
      setLoadingRecs(false);
      setLoadingBookmark(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInitialData();
  }, []);

  const goToSearchScreen = () => {
    navigation.navigate(ScreenNameEnum.WoodsScreen);
  };

  // FIXED: Recent users as a simple horizontal ScrollView, NOT a FlatList
  const RecentUsersSection = React.memo(() => {
    if (!recentUsers || recentUsers.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.avatarList}
      >
        {recentUsers.map((item) => {
          const avatarUri = `${BASE_IMAGE_URL}${item?.avatar}`;
          return (
            <TouchableOpacity
              key={item?.username}
              onPress={() =>
                navigation.navigate(ScreenNameEnum.OtherProfile, { item })
              }
              style={{ alignItems: 'center', marginRight: 12 }}
            >
              <Image
                source={{ uri: avatarUri }}
                style={{ height: 60, width: 60, borderRadius: 60 }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  });

  // FIXED: Header section as a regular component, not inside FlatList
  const HeaderSection = React.memo(() => (
    <View style={{ marginBottom: 10 }}>
      {/* Recent Users */}
      <RecentUsersSection />

      <View
        style={{
          borderWidth: 0.5,
          borderColor: Color.textGray,
          marginVertical: 8,
          marginHorizontal: 14,
        }}
      />

      {/* Movie Lists */}
      <View style={{ paddingHorizontal: 10 }}>
        <HorizontalMovieList
          title={t("home.trending")}
          data={trendingData}
          navigateTo={ScreenNameEnum.DiscoverTab}
          isSelectList="2"
          type="Trending"
          loading={loadingTrending}
          emptyData={t("emptyState.noTrending")}
          scoreType="Rec"
        />
        <HorizontalMovieList
          title={t("home.recsForYou")}
          data={recommendData}
          navigateTo={ScreenNameEnum.DiscoverTab}
          isSelectList="1"
          type="Recs"
          loading={loadingRecs}
          emptyData={t("emptyState.noRecsForYou")}
          scoreType="Rec"
        />
        <HorizontalMovieList
          title={t("home.wantwatch")}
          data={bookmarkData}
          navigateTo={ScreenNameEnum.DiscoverTab}
          isSelectList="5"
          type="wantWatch"
          loading={loadingBookmark}
          emptyData={t("emptyState.nobookmarks")}
          scoreType="Rec"
        />
      </View>

      <Text
        allowFontScaling={false}
        style={styles.sectionTitle}
      >
        {t("home.yourFeed")}
      </Text>
    </View>
  ));

  // Render feed item
  const renderFeedItem = useCallback(({ item, index }) => {
    if (loading) {
      return <FeedCardShimmer key={`shimmer-${index}`} />;
    }

    if (!item.movie || !item.user) return null;

    const avatarUri = `${BASE_IMAGE_URL}${item.user?.avatar}`;
    const posterUri = item.movie?.horizontal_poster_url;

    return (
      <MemoFeedCard
        avatar={{ uri: avatarUri }}
        poster={{ uri: posterUri }}
        key={item.movie?.imdb_id}
        user={item.user?.name}
        title={item.movie?.title}
        comment={item.comment}
        release_year={item?.movie?.release_year?.toString()}
        videoUri={item.movie?.trailer_url}
        imdb_id={item.movie?.imdb_id}
        isMuted={isMuted}
        token={token}
        rankPress={() => setIsVisible(true)}
        ranked={item?.rec_score}
        created_date={item?.created_date}
        shouldAutoPlay={autoPlayEnabled}
        isVisible={index === currentVisibleIndex}
        videoIndex={index}
        scoreType='Rec'
        shouldPlay={index === playIndex}
        isPaused={index !== playIndex}
        is_bookMark={item?.is_bookmarked}
      />
    );
  }, [autoPlayEnabled, playIndex, isFocused, loading, currentVisibleIndex, token, isMuted]);

  const renderFooter = useCallback(() => {
    if (loadingFeed && feedData.length <= 50) {
      return <FeedCardShimmer />;
    }

    if (loadingFeed && feedData.length > 50) {
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

    if (!hasMore && feedData.length > 0) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ textAlign: "center", color: "gray" }}>
          
                 {t("emptyState.nodata",)}
          </Text>
        </View>
      );
    }

    return <FeedCardShimmer />;
  }, [loadingFeed, hasMore, feedData.length]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <CustomStatusBar />

      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={imageIndex.appLogo} style={{
            height: 24,
            width: 22
          }} />
          <CustomText
            size={20}
            color={Color.whiteText}
            style={styles.logo}
            font={font.PoppinsMedium}
          >
               {t("login.appText",)}
          </CustomText>
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

      {/* FIXED: Single FlatList with ListHeaderComponent */}
      <FlatList
        ref={flatListRef}
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={(item, index) => item?.id?.toString() || `feed-${index}`}
        ListHeaderComponent={HeaderSection}
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (hasMore && !loadingFeed) fetchFeed("home");
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={2}
        maxToRenderPerBatch={6}
        windowSize={10}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        decelerationRate={0.86}
        onScrollBeginDrag={() => {
          if (!hasScrolled) setHasScrolled(true);
        }}
      />

      {/* Modals */}
      {notificationModal && (
        <Notification
          isVisible={notificationModal}
          onClose={() => setNotificationModal(false)}
        />
      )}
      {isVisible && (
        <ComparisonModal
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default React.memo(FixedHomeScreen);