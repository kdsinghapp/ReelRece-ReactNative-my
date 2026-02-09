import { ActivityIndicator, Dimensions, FlatList, Image, Keyboard, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenNameEnum from '@routes/screenName.enum'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Color } from '@theme/color'
import font from '@theme/font'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { deleteUserSubscriptions, getUniquePlatforms, getUserSubscriptions, registerUserSubscriptions } from '@redux/Api/SettingApi'
import debounce from 'lodash/debounce'
import FastImage from 'react-native-fast-image'
import ButtonCustom from '@components/common/button/ButtonCustom'
import { SafeAreaView } from 'react-native-safe-area-context'
import imageIndex from '@assets/imageIndex'
import { CustomStatusBar, HeaderCustom } from '@components/index'
import { t } from 'i18next'
import NetInfo from '@react-native-community/netinfo';


const numColumns = 4;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns - 25;

const StreamService = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const route = useRoute();
  const { fromSignUp } = route.params || {};
  const navigation = useNavigation() 
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<| 'popular' | 'more'>('popular');
  const [platefromdata, setPlatefromdata] = useState([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [allPlatforms, setAllPlatforms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);        // first load
  const [isLoadingMore, setIsLoadingMore] = useState(false);// pagination loading
  const [isRefreshing, setIsRefreshing] = useState(false);  // pull to refresh
  const isFetchingRef = useRef(false);                      // prevent duplicate requests
  const onEndReachedCalledDuringMomentum = useRef(true);    // avoid multiple onEndReached
  const [platformData, setPlatformData] = useState<object | string | null | number[]>([]); // current loaded items
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1)
  const [filteredPlatforms, setFilteredPlatforms] = useState(allPlatforms);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  /** ---- Fetch User Subscriptions ---- */
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      try {
        const response = await getUserSubscriptions(token);
        const results = response.data || [];
        const subs = results.map((item) => item?.subscription);
        setSelectedPlatforms(subs);
      } catch (e) {
      }
    };
    if (token) fetchUserSubscriptions();
  }, [token]);


  /** ---- Fetch Platforms ---- */
  const fetchPlatformsPage = async ({
    pageToLoad = 1,
    query = '',
    replace = false,
    signal,
  }: {
    pageToLoad?: number;
    query?: string;
    replace?: boolean;
    signal?: AbortSignal;
  }) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (pageToLoad === 1) {
        setIsRefreshing(true);
        setIsLoading(true); // initial / search load 
      }
      else setIsLoadingMore(true);

      setIsLoading(true);

      const resp = await getUniquePlatforms({
        token,
        country: 'US',
        query,
        page: pageToLoad,
        signal,
      }); 
      const results =
        (resp?.results || []).map((item) => ({
          ...item,
          image_url: fixImageUrl(item?.image_url),
        })) ?? [];

      setPlatformData((prev) =>
        pageToLoad === 1 ? results : [...prev, ...results]
      );
      // setAllPlatforms((prev) =>
      //   pageToLoad === 1 ? results : [...prev, ...results]
      // );
      if (!query) {
        setAllPlatforms((prev) =>
          pageToLoad === 1 ? results : [...prev, ...results]
        );
      }
      setPage(pageToLoad);
      setTotalPages(resp?.total_pages ?? resp?.totalPages ?? 1);
    } catch (err) {
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    fetchPlatformsPage({
      pageToLoad: 1,
      query: debouncedSearch,
      replace: true,
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [token, debouncedSearch]);

  useEffect(() => {

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true)
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false)
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [])

  /** ---- Helpers ---- */
  const fixImageUrl = (imageUrl: string): string => {
    try {
  
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.pop();
      const encodedFileName = encodeURIComponent(fileName ?? '');
      return [...urlParts, encodedFileName].join('/');
    } catch (e) {
      return imageUrl;
    }
  };

  useEffect(() => {
    if (searchQuery && filterMode !== 'more') {
      setFilterMode('more'); // ✅ auto set to "more" when search active
    }
  }, [searchQuery]);

  
  const getFilteredData = () => {
    let data = [...platformData];

    if (searchQuery) {
      data = data.filter((item) =>
        item?.supported_platform?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      data = data.sort((a, b) => (a.popular === b.popular ? 0 : a.popular ? -1 : 1));
    } else {
      if (filterMode === 'popular') {
        data = data.filter((item) => item?.popular === true);
      } else if (filterMode === 'more') {
        data = data.sort((a, b) => (a.popular === b.popular ? 0 : a.popular ? -1 : 1));
      }
    }

    return data;
  };




  /** ---- Selection Handling ---- */
  const toggleSelection = async (platform: string) => {
    const isAlreadySelected = selectedPlatforms.includes(platform);
    const updatedSelection = isAlreadySelected
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform];

    setSelectedPlatforms(updatedSelection);

    try {
      if (isAlreadySelected) {
        await deleteUserSubscriptions(token, [platform]);
      } else {
        await registerUserSubscriptions(token, updatedSelection);
      }
    } catch (error) {
    }
  };

  const removeSelectedItem = async (platform: string) => {
    try {
      await deleteUserSubscriptions(token, [platform]);
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } catch (error) {
    }
  };

  const getSelectedItems = () => {
    return allPlatforms.filter((item) =>
      selectedPlatforms.includes(item?.supported_platform)
    );
  };




  useEffect(() => {
    getFilteredData()
  }, [selectedPlatforms,])


  // Add network listener useEffect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isConnected && state.isConnected;
      setIsConnected(state.isConnected);

      // Auto-reload when reconnecting and no platforms loaded
      if (wasOffline && platformData.length === 0) {
        fetchPlatformsPage({
          pageToLoad: 1,
          query: debouncedSearch,
          replace: true
        });
      }
    });

    return () => unsubscribe();
  }, [isConnected, platformData.length]);

  /** ---- Search Debounce ---- */
  const handleSearchDebounce = debounce((text: string) => {
    setDebouncedSearch(text);
    // fetchPlatformsPage({ pageToLoad: 1, query: text, replace: true });
  }, 1000);

  useEffect(() => {
    handleSearchDebounce(searchQuery);
  }, [searchQuery]);

  const goToRankingScreen = () => {
    // navigation.reset(ScreenNameEnum.OnboardingScreen);
    navigation.reset({
      index: 0,
      routes: [
        { name: ScreenNameEnum.OnboardingScreen }
      ],
    });



    // navigation.reset({
    //   index: 0,
    //   routes: [
    //     {
    //       name: ScreenNameEnum.TabNavigator,
    //       state: {
    //         index: 0,
    //         routes: [
    //           {
    //             name: ScreenNameEnum.RankingTab,
    //             state: {
    //               index: 0,
    //               routes: [
    //                 {
    //                   name: ScreenNameEnum.RankingScreen,
    //                   params: { openTooltipModal: true },
    //                 },
    //               ],
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // });
  };



  const renderItem = ({ item }) => {
    const isSelected = selectedPlatforms.includes(item?.supported_platform.toString());
    return (
      <TouchableOpacity
        onPress={() => toggleSelection(item?.supported_platform)}
        activeOpacity={0.7}
        style={[styles.item, isSelected && styles.selectedItemGlow]}
      >
        <FastImage
          source={{
            uri: item?.image_url,
            priority: FastImage.priority.low,
            cache: FastImage.cacheControl.web
          }}
          // style={styles.image}
          style={[styles.image, isSelected && styles.imageActive]}

          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    );
  };
  useEffect(() => {
  }, [platefromdata])

  const renderSelectedItem = ({ item }) => (
    <View style={styles.selectedItemContainer}>
      <TouchableOpacity
        onPress={() => removeSelectedItem(item?.supported_platform.toString())}
        style={styles.selectedItem}
      >
        {/* <Image
          // source={item.logo}
          source={{ uri: item?.image_url }}
          style={styles.selectedImage}
          resizeMode="contain"
        /> */}


        <FastImage
          style={styles.selectedImage}
          source={{
            uri: item?.image_url,
            priority: FastImage.priority.low,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.ItemCloseContainer}
        onPress={() => removeSelectedItem(item?.supported_platform.toString())}
      >
        <Image
          source={imageIndex.closeWhite}
          style={styles.ItemClose}
          resizeMode='contain'
        />
      </TouchableOpacity>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor={Color.grey} />

      <View style={{ flex: 1 }}>
        <View style={styles.streamHeader} >
          <HeaderCustom
            title={(t("home.streamingservices"))}
            backIcon={fromSignUp ? null : imageIndex.backArrow}
            rightIcon={false}
            onRightPress={() => navigation.navigate(ScreenNameEnum.OtherTaingPrfofile)}
          />
          <Text style={styles.selectText} >{(t("home.selectyour"))}</Text>
          <View style={styles.serviceCountComntainer}>
            {/* <Text style={styles.serviceCountText}>{platformData.length} Services.</Text> */}
            <Text style={[styles.serviceSelectText, { fontSize: 14 }]}>
              {selectedPlatforms?.length} <Text style={styles.serviceSelectText}>{(t("discover.selected"))}</Text>
            </Text>
          </View>

          {/* Selected Items Header */}
          {selectedPlatforms.length > 0 ? (
            <View style={styles.selectedItemsContainer}>
              {/* <Text style={styles.selectedItemsTitle}>Selected Services:</Text> */}
              <FlatList
                horizontal
                data={getSelectedItems()}
                renderItem={renderSelectedItem}
                keyExtractor={(item) => item?.supported_platform.toString()}
                contentContainerStyle={styles.selectedItemsList}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={20}
                maxToRenderPerBatch={28}
                windowSize={18}
                removeClippedSubviews

              />
            </View>
          ) :
            <View style={{ paddingHorizontal: 14 }} >
              <Text style={styles.streamAllText} >

                {(t("discover.simplily"))}
              </Text>
            </View>
          }
        </View>
        {/* search bar */}
        <View style={styles.searchContainer} >
          <View style={{ flexDirection: 'row', alignItems: 'center' }} >
            <Image source={imageIndex.search} style={styles.searchImg} resizeMode='contain' />
            <TextInput
              placeholder={(t("discover.searchStreaming"))}
              placeholderTextColor={Color.whiteText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.inputStyle}
            />
          </View>
          <TouchableOpacity onPress={() => setSearchQuery('')} >
            <Image source={imageIndex.closeWhite} style={styles.crossImg} resizeMode='contain' />
          </TouchableOpacity>
        </View>
        <View style={styles.dataSelectContainer}>
          <TouchableOpacity
            style={[
              styles.mostPopularContainer,
              filterMode === 'popular' && { backgroundColor: Color.primary } // active state
            ]}
            onPress={() => setFilterMode('popular')}
          >
            <Text style={[styles.mostPopularText, { fontFamily: filterMode === 'popular' ? font.PoppinsBold : font.PoppinsRegular }]}>{t("setting.streaming.mostPopular")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mostPopularContainer,
              filterMode === 'more' && { backgroundColor: Color.primary } // active stat
            ]}
            onPress={() => setFilterMode('more')}
          >
            <Text style={[styles.mostPopularText, { fontFamily: filterMode === 'more' ? font.PoppinsBold : font.PoppinsRegular }]}>{t("setting.streaming.allPlatforms")}</Text>

          </TouchableOpacity>
        </View>
        {/* <View style={styles.dataSelectContainer} >
  <TouchableOpacity style={styles.mostPopularContainer}  >
    <Text style={styles.mostPopularText} >Most Popular</Text>
  </TouchableOpacity>

   <TouchableOpacity style={styles.mostPopularContainer}  >
    <Text style={styles.mostPopularText} >More</Text>
  </TouchableOpacity>
</View> */}
        {/* Stream data */}
        <View style={{ alignSelf: 'center', flex: 1 }}>

          <FlatList
            data={getFilteredData()}
            keyExtractor={(item) => item?.supported_platform.toString()}
            numColumns={numColumns}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 8, }}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews
            // ListEmptyComponent={
            //   <Text style={styles.noResultsText}>No services found</Text>
            // }

            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchPlatformsPage({
                  pageToLoad: 1,
                  query: searchQuery,
                  replace: true
                })}
                colors={[Color.primary]}
                tintColor={Color.primary}
              />
            }
            ListEmptyComponent={() => {
              if (isLoading || isRefreshing) {
                return <ActivityIndicator style={{ margin: 12 }} />;
              }
              if (!isLoading && platformData.length === 0 && debouncedSearch?.length > 0) {
                return <Text style={styles.noResultsText}>{t("setting.streaming.noServicesFound")}</Text>;
              }
              return null;
            }}
            onEndReachedThreshold={0.4}
            onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false; }}

            onEndReached={() => {
              if (onEndReachedCalledDuringMomentum.current) return;
              if (!isLoadingMore && page < totalPages) {
                fetchPlatformsPage({ pageToLoad: page + 1, query: debouncedSearch, replace: false });
              }
              onEndReachedCalledDuringMomentum.current = true;
            }}
            ListFooterComponent={() => (isLoadingMore ? <ActivityIndicator style={{ margin: 12 }} /> : null)}
            refreshing={isRefreshing}
            onRefresh={() => fetchPlatformsPage({ pageToLoad: 1, query: searchQuery, replace: true })}
          />
        </View>



        {fromSignUp ? (
          !isKeyboardVisible && (
            <ButtonCustom
              title={(t("login.next"))}
              buttonStyle={styles.buttonStyle}
              onPress={goToRankingScreen}
            />
          )
        ) : (
          searchQuery.length > 0 && !isKeyboardVisible && (
            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.btnText}>{(t("home.back"))}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  streamHeader: {
    backgroundColor: Color.grey,
    marginHorizontal: 6,
    paddingTop: 14,
  },
  streamHeading: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 22,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
  },
  item: {
    width: imageSize,
    height: imageSize,
    marginHorizontal: 6,
    marginVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
  },
  selectedItemGlow: {
    shadowColor: Color.orang,
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 3,
    // backgroundColor: Color.primary,
    // borderWidth: 2,
    // borderColor: `${Color.primary}100`,
    // Platform-specific optimizations
    ...Platform.select({
      ios: {
        shadowRadius: 40,
        shadowOpacity: 1
      },
      android: {
        elevation: 4
      }
    })
  },
  dataSelectContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mostPopularContainer: {
    width: '34%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.grey,
    borderRadius: 20,
    marginHorizontal: 8,
    marginBottom: 10,

  },
  mostPopularText: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: font.PoppinsRegular,
    color: Color.whiteText

  },
  image: {
    width: '97%',
    height: '97%',
    borderRadius: 16,
    // borderColor:Color.red
  },
  imageActive: {
    borderWidth: 2,
    borderColor: Color.primary
  },
  selectedItemsContainer: {
    // marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  selectedItemsTitle: {
    color: Color.whiteText,
    fontFamily: font.PoppinsMedium,
    marginBottom: 5,
  },
  streamAllText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsMedium,
    fontSize: 12,
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 10,
    // flex:1,

  },
  selectedItemsList: {
    paddingVertical: 5,
  },
  selectedItem: {
    width: 45,
    height: 45,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Color.primary,
    // borderRadius: 20,

  },
  selectedItemContainer: {
    position: 'relative',
    marginRight: 10,
  },
  ItemCloseContainer: {
    backgroundColor: Color.orang,
    position: 'absolute',
    height: 16,
    width: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    top: -4,
    right: 1,
    zIndex: 22,
  },
  ItemClose: {
    height: 10,
    width: 10,
    // marginRight:10,

  },
  searchContainer: {
    marginHorizontal: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 30,
    backgroundColor: Color.grey,
    alignItems: 'center',
    marginVertical: 16,

  },
  searchImg: {
    height: 20,
    width: 20,
    marginRight: 6,
  },
  inputStyle: {
    color: Color.whiteText,
    fontFamily: font.PoppinsMedium,
    width: '85%',
    height: 45,
  },
  crossImg: {
    height: 14,
    width: 14,
  },
  selectedImage: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
  },
  selectText: {
    fontSize: 14,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
    // marginBottom:4,
    alignSelf: 'center',
  },
  serviceCountComntainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    // marginTop: 10,
    marginBottom: 4,
  },
  serviceCountText: {
    fontSize: 12,
    color: Color.whiteText,
    marginRight: 8,
    fontFamily: font.PoppinsMedium
  },
  serviceSelectText: {
    fontSize: 12,
    color: Color.primary,
    marginRight: 8,
    fontFamily: font.PoppinsMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: Color.whiteText,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    fontFamily: font.PoppinsMedium,
  },
  btnContainer: {
    marginHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Color.whiteText,
    borderRadius: 6,
    marginBottom: 12,
    marginTop: 12,


  },
  btnText: {
    fontSize: 16,
    fontFamily: font.PoppinsMedium,
    color: Color.whiteText,
    marginVertical: 8,
  },
  buttonStyle: {
    marginHorizontal: 18,
    marginVertical: 16,
  },
})

export default React.memo(StreamService)