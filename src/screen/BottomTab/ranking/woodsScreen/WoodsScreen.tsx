import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const WoodsScreen = () => {
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

  // const {
  //   togglePlatform,
  //   isVisible, setIsVisible,
  //   modalVisible, setModalVisible,
  //   lovedImge, setlovedImge,
  //   selectedPlatforms,
  //   filteredItems, setFilteredItems,
  //   searchFromAPI,
  //   searchGroupFromApi,
  //   loading,
  // } = useWoodScreen();
  const [searchQuery, setSearchQuery] = useState('');

  const token = useSelector((state: RootState) => state?.auth?.token); // ✅ outside  condition
  const compareHook = useCompareComponent(token);


  // const handleSearch = useCallback((query: string) => {
  //   const lowerQuery = query.toLowerCase();
  //   if (!lowerQuery.trim()) {
  //     setFilteredItems([]);
  //     return;
  //   }

  //   if (type === 'movie') {
  //     if (token) {
  //       searchFromAPI(lowerQuery, token); //  API based search
  //     } else {
  //     }
  //   };

  //   if (type === 'group') {
  //     if (token) {
  //       searchGroupFromApi(lowerQuery, token); // ✅ API based search
  //     } else {
  //     }
  //     // const results = watchTogetherGroups.filter((group) =>
  //     //   group.groupName.toLowerCase().includes(lowerQuery) )


  //     // setFilteredItems(results);
  //   }
  // }, [type, token, searchQuery]);


 
  const handleSearch = useCallback(
    (query: string, page: number = 1) => {
      if (!query.trim()) {
        setFilteredItems([]);
        return;
      }
      if (type === 'movie' && token) {
        searchFromAPI(query.toLowerCase().trim(), token, page);
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
    [runDebouncedSearch, setFilteredItems]
  );

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

  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomStatusBar />

      <View style={styles.searchHeaderContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={imageIndex.backArrow} style={styles.backImg} resizeMode='contain' />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          {/* {(t("discover.dis_cover"))}   */}
          <TextInput
            style={styles.input}
            placeholder={title ? title :   (t("discover.searchby"))  }
            placeholderTextColor={Color.textGray}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            returnKeyType="search"
            allowFontScaling={false}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => handleSearchInputChange('')}>
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
        <SearchMovieCom
          movieData={filteredItems}
          setSearchData={setFilteredItems}     //  Add this
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
          loadingMore={loadingMore} // ✅ Pass loadingMore for footer spinner
          onEndReached={loadMoreData} // ✅ Pass this to FlatList
        />
      )}

      {type === 'group' && (
        <GroupSearch groupData={groupsData}
          navigation={navigation} />
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
});

export default React.memo(WoodsScreen);
