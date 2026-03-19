import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useNavigation, useRoute } from '@react-navigation/native';
import useWoodScreen from './useWoodScreen';
import { Color } from '@theme/color';
import SearchMovieCom from '@components/searchmovieCom/searchmovieCom';
import font from '@theme/font';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { CustomStatusBar } from '@components/index';
import imageIndex from '@assets/imageIndex';
import { useCompareComponent } from '../rankingScreen/useCompareComponent';
import GroupSearch from '@screens/BottomTab/watch/watchScreen/GroupSearch';
import CompareModals from '../rankingScreen/CompareModals';
import { t } from 'i18next';

const SEARCH_DEBOUNCE_MS = 500;

/** Returns page numbers and 'ellipsis' to show, e.g. [1, 2, 3, 4, 5, 'ellipsis', 22] */
function getPaginationPages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 1) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);
  if (left > 2) pages.push('ellipsis');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

/** Memoized pagination bar to avoid re-renders when only modal/list state changes */
const PaginationBar = React.memo(({
  currentPage,
  totalPages,
  loading,
  searchQuery,
  onPageChange,
  styles: s,
}: {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  searchQuery: string;
  onPageChange: (page: number) => void;
  styles: Record<string, object>;
}) => {
  const pages = useMemo(() => getPaginationPages(currentPage, totalPages), [currentPage, totalPages]);
  const disabledPrev = currentPage <= 1 || loading;
  const disabledNext = currentPage >= totalPages || loading;
  return (
    <View style={s.paginationBar}>
      <TouchableOpacity style={s.paginationBtn} onPress={() => onPageChange(1)} disabled={disabledPrev}>
        <Text style={[s.paginationBtnText, disabledPrev && s.paginationBtnDisabled]}>{'\u00AB'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.paginationBtn} onPress={() => onPageChange(Math.max(1, currentPage - 1))} disabled={disabledPrev}>
        <Text style={[s.paginationBtnText, disabledPrev && s.paginationBtnDisabled]}>&lt;</Text>
      </TouchableOpacity>
      <View style={s.paginationNumbers}>
        {pages.map((item, idx) =>
          item === 'ellipsis' ? (
            <Text key={`ellipsis-${idx}`} style={s.paginationEllipsis}>{'\u2026'}</Text>
          ) : (
            <TouchableOpacity
              key={item}
              style={[s.paginationPageBtn, item === currentPage && s.paginationPageBtnActive]}
              onPress={() => onPageChange(item)}
              disabled={loading}
            >
              <Text style={[s.paginationPageText, item === currentPage && s.paginationPageTextActive]}>{item}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <TouchableOpacity style={s.paginationBtn} onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={disabledNext}>
        <Text style={[s.paginationBtnText, disabledNext && s.paginationBtnDisabled]}>&gt;</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.paginationBtn} onPress={() => onPageChange(totalPages)} disabled={disabledNext}>
        <Text style={[s.paginationBtnText, disabledNext && s.paginationBtnDisabled]}>{'\u00BB'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const WoodsScreen = () => {
  const isOnline = useNetworkStatus();
  const route = useRoute();
  const type = route?.params?.type;
  const title = route?.params?.title;


  const navigation = useNavigation();


  const {
    togglePlatform,
    isVisible, setIsVisible,
    modalVisible, setModalVisible,
    lovedImge, setlovedImge,
    selectedPlatforms,
    filteredItems, setFilteredItems,
    searchFromAPI,
    searchGroupFromApi,
    loading,
    groupsData, 
    loadingMore,
    currentPage,
    totalPages,
  } = useWoodScreen(); 
  const [searchQuery, setSearchQuery] = useState('');

  const token = useSelector((state: RootState) => state?.auth?.token); // ✅ outside  condition
  const compareHook = useCompareComponent(token);
  const insets = useSafeAreaInsets();
 
  const handleSearch = useCallback(
    (query: string, page: number = 1, replace: boolean = false) => {
      if (!query.trim()) {
        setFilteredItems([]);
        return;
      }
      if (type === 'movie' && token) {
        searchFromAPI(query.toLowerCase().trim(), token, page, replace);
      }
    },
    [type, token, searchFromAPI]
  );

  const searchRunRef = useRef(handleSearch);
  searchRunRef.current = handleSearch;
  const setFilteredItemsRef = useRef(setFilteredItems);
  setFilteredItemsRef.current = setFilteredItems;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedRunRef = useRef((query: string) => {
    if (!query.trim()) {
      setFilteredItemsRef.current([]);
      return;
    }
    searchRunRef.current(query, 1);
  });

  const runDebouncedSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      debouncedRunRef.current(query);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const handleSearchInputChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      // In group mode, only update the input; local filter is done via useMemo below
      if (type === 'group') return;
      if (!text.trim()) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        setFilteredItems([]);
        return;
      }
      runDebouncedSearch(text);
    },
    [type, runDebouncedSearch, setFilteredItems]
  );

  /** For group mode: filter groups locally by search query (groupName) */
  const filteredGroupsForSearch = useMemo(() => {
    if (type !== 'group' || !Array.isArray(groupsData)) return groupsData;
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return groupsData;
    return groupsData.filter(
      (g: { groupName?: string }) =>
        (g?.groupName ?? '').toLowerCase().includes(q)
    );
  }, [type, groupsData, searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  const loadMoreData = useCallback(() => {
    if (
      type !== 'movie' ||
      !searchQuery.trim() ||
      !token ||
      loading ||
      loadingMore ||
      currentPage >= totalPages
    ) {
      return;
    }
    handleSearch(searchQuery, currentPage + 1);
  }, [
    type,
    searchQuery,
    token,
    loading,
    loadingMore,
    currentPage,
    totalPages,
    handleSearch,
  ]);
  useEffect(() => {
    setSearchQuery('');
    setFilteredItems([]);
  }, [type]);

  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleClearSearch = useCallback(() => handleSearchInputChange(''), [handleSearchInputChange]);

  const movieSectionStyle = useMemo(
    () => [styles.movieSection, { paddingBottom:16}],
    [insets.bottom]
  );

  const handlePageChange = useCallback(
    (page: number) => handleSearch(searchQuery, page, true),
    [handleSearch, searchQuery]
  );

  return (
    <SafeAreaView style={styles.maincontainer}  edges={isOnline ? ['top'] : []}>
      <CustomStatusBar />

      <View style={styles.searchHeaderContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image source={imageIndex.backArrow} style={styles.backImg} resizeMode='contain' />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder={title ? title : (t("discover.searchby"))}
            placeholderTextColor={Color.textGray}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            returnKeyType="search"
            allowFontScaling={false}
            autoFocus
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Image source={imageIndex.closeimg} style={styles.clearIcon} resizeMode="contain" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {!!searchQuery && (
        <View style={styles.searchtResultContainer}>
          <Text style={styles.searchResdultTtile}>{(t("discover.searchresults"))}</Text>
          <Text style={styles.searchtTtile}>{searchQuery}</Text>
        </View>
      )}

      {type === 'movie' && (
        <View style={movieSectionStyle}>
          <View style={styles.movieListWrapper}>
            <SearchMovieCom
              movieData={filteredItems}
              setSearchData={setFilteredItems}
              token={token}
              navigation={navigation}
              togglePlatform={togglePlatform}
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              lovedImge={lovedImge}
              setlovedImge={setlovedImge}
              selectedPlatforms={selectedPlatforms}
              searchQuery={searchQuery}
              loading={loading}
              loadingMore={loadingMore}
              currentPage={currentPage}
              totalPages={totalPages}
              onEndReached={loadMoreData}
            />
          </View>
          {searchQuery.trim() && totalPages > 1 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              loading={loading}
              searchQuery={searchQuery}
              onPageChange={handlePageChange}
              styles={styles}
            />
          )}
        </View>
      )}

      {type === 'group' && (
        <GroupSearch
          groupData={Array.isArray(filteredGroupsForSearch) ? filteredGroupsForSearch : []}
          searchQuery={searchQuery ?? ''}
        />
      )}

      <CompareModals token={token} useCompareHook={compareHook} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: Color.background,
  },
  movieSection: {
    flex: 1,
  },
  movieListWrapper: {
    flex: 1,
  },
  searchHeaderContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },

  backImg: {
    height: 22,
    width: 22,
    tintColor: Color.whiteText,
    marginRight: 12,
  },

  searchContainer: {
    flex: 1,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center', // ensure center
    backgroundColor: Color.modalBg,
    borderRadius: 40,
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    paddingVertical: 0,     // Important
    includeFontPadding: false,
    textAlignVertical: 'center', // Works on Android
  },


  clearIcon: {
    height: 18,
    width: 18,
    tintColor: Color.textGray,
    marginLeft: 8,
  },
  searchtResultContainer: {
    flexDirection: 'row',
    marginLeft: 20,
    marginVertical: 16,
  },
  searchResdultTtile: {
    fontFamily: font.PoppinsBold,
    fontSize: 16,
    color: Color.whiteText,
  },
  searchtTtile: {
    fontFamily: font.PoppinsBold,
    fontSize: 16,
    color: Color.primary,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 6,
  },
  paginationBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationBtnText: {
    fontSize: 16,
    color: Color.primary,
    fontFamily: font.PoppinsMedium,
  },
  paginationBtnDisabled: {
    color: Color.placeHolder,
    opacity: 0.6,
  },
  paginationNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationPageBtn: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationPageBtnActive: {
    backgroundColor: Color.primary,
    borderColor: Color.primary,
  },
  paginationPageText: {
    fontSize: 14,
    color: Color.primary,
    fontFamily: font.PoppinsMedium,
  },
  paginationPageTextActive: {
    color: Color.whiteText,
  },
  paginationEllipsis: {
    fontSize: 14,
    color: Color.primary,
    fontFamily: font.PoppinsRegular,
    paddingHorizontal: 4,
    lineHeight: 36,
  },
});

export default React.memo(WoodsScreen);
