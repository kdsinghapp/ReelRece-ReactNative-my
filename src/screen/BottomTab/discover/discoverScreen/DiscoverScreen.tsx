import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { t } from 'i18next';

import ScreenNameEnum from '@routes/screenName.enum';
import styles from './style';
import useDiscover from './useDiscover';
import { sortByData, contentType } from './DisCoverData';
import { Color } from '@theme/color';
import font from '@theme/font';

import imageIndex from '@assets/imageIndex';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { Trending_without_Filter } from '@redux/Api/movieApi';

// ✅ update this import path if needed
// import FilterBar from './FilterBar';
// import SortByModal from './SortByModal';
  
 import CustomText from '@components/common/CustomText/CustomText';

// ✅ adjust RootState import to your project
import { RootState } from '@redux/store';
import SortbyModal from '@components/modal/SortbyModal/SortbyModal';
import FilterBar from './FilterBar';
import { CustomStatusBar } from '@components/index';

type MovieItem = {
  imdb_id?: string;
  id?: string | number;
  title?: string;
  release_date?: string;
  release_year?: number;
  cover_image_url?: string;
  rec_score?: number;
};

const TabPaginationScreen = () => {
  const flatListRef = useRef<FlatList<MovieItem>>(null);

  const {
    navigation,
    sortByModal,
    setSortByModal,
    contantFilter,
    contentSelect,
    trending,
    setTrending,
    selectedSortId,
    setSelectedSortId,
  } = useDiscover();

  const route = useRoute();
  const token = useSelector((state: RootState) => state?.auth?.token);

  const { isSelectList } = route?.params || {};

  const [filterGenreString, setFilterGenreString] = useState('');
  const [platformFilterString, setPlatformFilterString] = useState('');
  const [selectedSimpleFilter, setSelectedSimpleFilter] = useState('1');

  // Pagination states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Guards
  const isFetchingRef = useRef(false);
  const shouldLoadMoreRef = useRef(true);
  const filterFingerprintRef = useRef('');

  const goToSearchScreen = useCallback(() => {
    navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' });
  }, [navigation]);

  const goToDetail = useCallback(
    (item: MovieItem) => {
      if (!item?.imdb_id) return;
      navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
        imdb_idData: item.imdb_id,
        token,
      });
    },
    [navigation, token]
  );

  const getFilterTitle = useCallback((id: number | null) => {
    const filter = sortByData.find(f => f.id === id);
    return filter ? filter.label : 'Rec Score';
  }, []);

  const getSortParam = useCallback((id: number | null) => {
    const filter = sortByData.find(f => f.id === id);
    return filter?.param || 'rec_score';
  }, []);

  const getMediaTypeParam = useCallback((id: number | null) => {
    const typeObj = contentType.find(f => f.id === id);
    return typeObj?.params || null;
  }, []);

  const buildUrl = useCallback(
    (page: number) => {
      let baseEndpoint = '';

      // your endpoints
      if (selectedSimpleFilter === '1') baseEndpoint = '/recommend-movies?sort_by=rec_score';
      else if (selectedSimpleFilter === '2') baseEndpoint = '/trending';
      else if (selectedSimpleFilter === '5') baseEndpoint = '/bookmarks';

      // if baseEndpoint already has ?, then use &
      const urlStarts = baseEndpoint.includes('?')
        ? `${baseEndpoint}&country=US&page=${page}`
        : `${baseEndpoint}?country=US&page=${page}`;

      let url = urlStarts;

      if (filterGenreString) url += `&genres=${filterGenreString}`;
      if (platformFilterString) url += `&platforms=${platformFilterString}`;

      const sortParam = getSortParam(selectedSortId ?? null);
      if (sortParam) url += `&sort_by=${sortParam}`;

      const mediaTypeParam = getMediaTypeParam(contentSelect ?? null);
      if (mediaTypeParam) url += `&media_type=${mediaTypeParam}`;

      return url;
    },
    [
      selectedSimpleFilter,
      filterGenreString,
      platformFilterString,
      selectedSortId,
      contentSelect,
      getSortParam,
      getMediaTypeParam,
    ]
  );

  const fetchMovies = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (isFetchingRef.current) return;

      if (!token) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setHasMore(false);
        return;
      }

      isFetchingRef.current = true;
      shouldLoadMoreRef.current = false;

      if (reset) {
        setLoading(true);
        setHasMore(true);
        setCurrentPage(1);
        setTrending([]); // clear list for UX
      } else {
        setLoadingMore(true);
      }

      try {
        const url = buildUrl(page);
        const params = { token, url };
        const result = await Trending_without_Filter(params);

        const safeResults: MovieItem[] = Array.isArray(result?.results) ? result.results : [];

        if (reset) {
          setTrending(safeResults);
        } else if (safeResults.length > 0) {
          setTrending(prev => {
            const prevArr = Array.isArray(prev) ? prev : [];
            const existingIds = new Set(prevArr.map(m => m?.imdb_id).filter(Boolean) as string[]);
            const newResults = safeResults.filter(m => m?.imdb_id && !existingIds.has(m.imdb_id));
            return [...prevArr, ...newResults];
          });
        }

        const currentPageNum = Number(result?.current_page ?? page);
        const totalPagesNum = Number(result?.total_pages ?? 1);

        const hasMoreData = safeResults.length > 0 && currentPageNum < totalPagesNum;

        setCurrentPage(currentPageNum);
        setTotalPages(totalPagesNum);
        setHasMore(hasMoreData);
      } catch (e) {
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        isFetchingRef.current = false;
        shouldLoadMoreRef.current = true;
      }
    },
    [token, buildUrl, setTrending]
  );

  // initial load
  useEffect(() => {
    fetchMovies(1, true);
  }, [fetchMovies]);

  // filters change => reset and fetch page 1
  useEffect(() => {
    const currentFingerprint = `${selectedSimpleFilter}-${filterGenreString}-${platformFilterString}-${selectedSortId}-${contentSelect}`;
    if (filterFingerprintRef.current !== currentFingerprint) {
      filterFingerprintRef.current = currentFingerprint;
      fetchMovies(1, true);
    }
  }, [
    selectedSimpleFilter,
    filterGenreString,
    platformFilterString,
    selectedSortId,
    contentSelect,
    fetchMovies,
  ]);

  const handleEndReached = useCallback(() => {
    if (loading || refreshing) return;
    if (isFetchingRef.current || loadingMore || !hasMore || !shouldLoadMoreRef.current) return;

    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      fetchMovies(nextPage, false);
    }
  }, [loading, refreshing, loadingMore, hasMore, currentPage, totalPages, fetchMovies]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMovies(1, true);
  }, [fetchMovies]);

  const safeKeyExtractor = useCallback((item: MovieItem, index: number) => {
    if (item?.imdb_id) return String(item.imdb_id);
    if (item?.id !== undefined) return String(item.id);
    if (item?.title) return `${item.title}-${index}`;
    return `discover-${index}`;
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MovieItem }) => {
      if (!item) return null;

      const coverSource = item?.cover_image_url?.trim()
        ? {
            uri: item.cover_image_url,
            priority: FastImage.priority.low,
            cache: FastImage.cacheControl.immutable,
          }
        : imageIndex.SingleMovie5;

      return (
        <TouchableOpacity
          onPress={() => goToDetail(item)}
          style={styles.card}
          activeOpacity={0.7}
        >
          <FastImage
            style={styles.image}
            source={coverSource}
            resizeMode={FastImage.resizeMode.stretch}
          />
          <View style={styles.rating}>
            <RankingWithInfo
              score={item?.rec_score}
              title={t('discover.recscore')}
              description={t('discover.recscoredes')}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [goToDetail]
  );

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={{ color: Color.textGray, marginTop: 8 }}>
            {t('discover.loading')} {currentPage + 1}/{totalPages}
          </Text>
        </View>
      );
    }

    if (!hasMore && (trending?.length ?? 0) > 0) {
      return (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: Color.textGray }}>
            {t('discover.noMore') || 'No more movies available'}
          </Text>
        </View>
      );
    }

    return null;
  }, [loadingMore, hasMore, trending?.length, currentPage, totalPages]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return null;
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 260,
        }}
      >
        <Text style={{ color: Color.textGray, fontSize: 16 }}>
          {t('emptyState.noMoviesFound')}
        </Text>
      </View>
    );
  }, [loading]);

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={imageIndex.reelRecsHome}
            resizeMode="cover"
            style={{ height: 43, width: 130, right: 4.2 }}
          />
        </View>

        <TouchableOpacity onPress={goToSearchScreen}>
          <Image source={imageIndex.search} style={{ height: 20, width: 20 }} />
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 16, flex: 1 }}>
        {/* Filter Bar */}
        <View style={{ marginBottom: 10, width: '100%' }}>
          <FilterBar
            isSelectList={isSelectList}
            setFilterGenreString={setFilterGenreString}
            filterGenreString={filterGenreString}
            setPlatformFilterString={setPlatformFilterString}
            platformFilterString={platformFilterString}
            selectedSimpleFilter={selectedSimpleFilter}
            setSelectedSimpleFilter={setSelectedSimpleFilter}
            token={token}
          />
        </View>

        {/* Content type + Sort */}
        <View style={styles.rowWrapper}>
          <View style={styles.contentTypeWrapper}>
            {contentType?.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => contantFilter(item)}
                style={[
                  styles.contentTypeButton,
                  contentSelect === item?.id && styles.contentTypeButtonActive,
                ]}
              >
                <CustomText
                  size={12}
                  color={Color.whiteText}
                  style={[
                    styles.contentTypeText,
                    contentSelect === item.id && styles.contentTypeTextActive,
                  ]}
                  font={font.PoppinsRegular}
                >
                  {item.type}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSortByModal(true)}
            style={styles.sortByWrapper}
          >
            <Image
              source={imageIndex.sortBy}
              style={[styles.sortIcon, styles.sortByIcon]}
              resizeMode="contain"
            />
            <CustomText
              size={12}
              color={Color.whiteText}
              style={styles.sortByLabel}
              font={font.PoppinsRegular}
            >
              {t('discover.sortby')}
            </CustomText>

            <View style={styles.sortByValueWrapper}>
              <CustomText
                size={12}
                color={Color.whiteText}
                style={styles.sortByValueText}
                font={font.PoppinsRegular}
              >
                {getFilterTitle(selectedSortId ?? null)}
              </CustomText>
            </View>
          </TouchableOpacity>
        </View>

        {sortByModal && (
          <SortbyModal
            visible={sortByModal}
            onClose={() => setSortByModal(false)}
            Data={sortByData}
            selectedSortId={selectedSortId}
            onSelectSort={(id: number) => {
              setSelectedSortId(id);
              setSortByModal(false);
            }}
          />
        )}

        {/* List */}
        <View style={{ marginTop: 15, flex: 1 }}>
          {loading && (trending?.length ?? 0) === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Color.primary} />
              <Text style={{ marginTop: 8 }}>{t('discover.loading')}</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={trending}
              numColumns={2}
              renderItem={renderItem}
              keyExtractor={safeKeyExtractor}
              contentContainerStyle={[
                styles.list,
                (trending?.length ?? 0) === 0 && { flexGrow: 1 },
              ]}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListFooterComponent={renderFooter}
              // perf
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews
              extraData={{ loadingMore, hasMore }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TabPaginationScreen;
