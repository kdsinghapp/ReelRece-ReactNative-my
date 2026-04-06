import React, { useEffect, useRef, useState } from 'react';
import {
  View, 
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image, 
} from 'react-native';
import { filters } from './DisCoverData';
import { Color } from '@theme/color';
import PlatformModals from './PlatformModals';
import { getUniqueGenres } from '@redux/Api/movieApi';
import { getUniquePlatforms } from '@redux/Api/SettingApi';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import CustomText from '@components/common/CustomText/CustomText';
import font from '@theme/font';
import { GenreModal } from '@components/index';

const FilterBar = ({ isSelectList,
  setFilterGenreString,
  filterGenreString,
  setPlatformFilterString,
  selectedSimpleFilter, setSelectedSimpleFilter,
  platformFilterString,
  token, }: boolean | string | object | number | null) => {
  const [selectedGenres, setSelectedGenres] = useState([]);  // main genre state
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const selectedCountry = useSelector((state: RootState) => state?.auth?.selectedCountry) || 'US';
  const [genreModalVisible, setGenreModalVisible] = useState(false);
  const [platformModalVisible, setPlatformModalVisible] = useState(false);
  const [plateFromItemName, setPlateFromItemName] = useState(false);
  const [tempPlatforms, setTempPlatforms] = useState([]); 
  const [platformsData, setPlatformsData] = useState([]);

  const [tempGenres, setTempGenres] = useState([]);             // modal internal state
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (isSelectList && ['1', '2', '5'].includes(isSelectList)) {
      setSelectedSimpleFilter(isSelectList);
    }
  }, [isSelectList]);

  // Auto-scroll filter bar so the selected tab is in view. First tab stays at start (no scroll) so "Recs for you" is not half-hidden.
  useEffect(() => {
    if (!selectedSimpleFilter || !['1', '2', '5'].includes(selectedSimpleFilter)) return;
    const index = filters.findIndex(f => f.id === selectedSimpleFilter);
    if (index < 0) return;
    const t = setTimeout(() => {
      try {
        if (index === 0) {
          // Keep first tab (Recs for you) fully visible at start; don't center it
          flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
        } else {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }
      } catch (_) {
        flatListRef.current?.scrollToOffset?.({ offset: index * 120, animated: true });
      }
    }, 100);
    return () => clearTimeout(t);
  }, [selectedSimpleFilter]);

  useEffect(() => {
    if (platformModalVisible) {
      setTempPlatforms([...selectedPlatforms]);
    }
  }, [platformModalVisible]);



  useEffect(() => {
    if (genreModalVisible) {
      setTempGenres([...selectedGenres]);  // backup current selection
    }
  }, [genreModalVisible]);


  const handlePress = (item) => {
    if (item.id === '3') {
      setGenreModalVisible(true);
    } else if (item.id === '4') {
      setPlatformModalVisible(true);
    } else {
      setSelectedSimpleFilter(item.id);
    }
  };

  const FILTER_ITEM_WIDTH = 130;
  const getItemLayout = (_, index) => ({
    length: FILTER_ITEM_WIDTH,
    offset: FILTER_ITEM_WIDTH * index,
    index,
  });

  const isSelected = (item) => {
    if (['1', '2', '5'].includes(item.id)) {
      return selectedSimpleFilter === item.id;
    }

    if (item.id === '3') return selectedGenres.length > 0;
    if (item.id === '4') return selectedPlatforms.length > 0;
    return false;
  };

  const selectedServices = selectedPlatforms.filter(id => {
    const platform = platformsData.find(p => p.id === id);
    return platform && !platform.isTelecom;
  }).length;


  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const handleUniqueGenres = async () => {
      try {
        const response = await getUniqueGenres(token, { signal: controller.signal });
        if (!isActive) return;

        const results = response?.unique_genres || [];
        setAvailableGenres(results);
      } catch (error) {
        if (controller.signal.aborted) return;
      }
    };

    if (token && genreModalVisible) {
      handleUniqueGenres();
    }

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [genreModalVisible, token]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const fetchPlatforms = async () => {
      try {
        const data = await getUniquePlatforms({
          token,
          country: selectedCountry,
          signal: controller.signal,
        });

        if (!isActive) return;

        const platforms = (data?.results || [])
          .filter((p: any) => {
            const name = String(p?.supported_platform || '');
            const isNumeric = /^\d+$/.test(name);
            const isUnknown = name.includes('_Unknown') || name.toLowerCase() === 'unknown';
            const isNotSet = name.toUpperCase() === 'NOT_SET';
            return name && !isNumeric && !isUnknown && !isNotSet;
          })
          .map((p: any) => {
            const fixedUrl = fixImageUrl(p?.image_url || '');
            return {
              ...p,
              icon: fixedUrl
            };
          })
          .filter((item: any, index: number, self: any[]) =>
            index === self.findIndex((p: any) =>
              String(p?.supported_platform || '').toLowerCase() ===
              String(item?.supported_platform || '').toLowerCase()
            )
          );

        setPlatformsData(platforms);
      } catch (error) {
        if (controller.signal.aborted) return;
      }
    };

    if (platformModalVisible && token) {
      fetchPlatforms();
    }

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [platformModalVisible, token]);

  const fixImageUrl = (imageUrl: string): string => {
    try {
      if (!imageUrl || typeof imageUrl !== 'string') return '';

      imageUrl = imageUrl.replace(/\\/g, '');

      const urlParts = imageUrl.split('/');
      const fileName = urlParts.pop();
      const encodedFileName = encodeURIComponent(fileName ?? '');
      return [...urlParts, encodedFileName].join('/');
    } catch (e) {
      return imageUrl;
    }
  };

  const renderItem = ({ item }) => {
    const selected = isSelected(item);
    const selectedPlatformItems = platformsData.filter((p) =>
      selectedPlatforms.includes(p.supported_platform)
    );
    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={[
          styles.filterItem,
          selected && styles.selectedItem,
        ]}
      >
        {item.id === '3' && selectedGenres.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <CustomText
              size={14}
              color={Color.lightGrayText}
              style={[styles.filterText, selected && styles.selectedText]}
              font={font.PoppinsRegular}
            >
              {selectedGenres.length} {item?.title}
            </CustomText>

            {item.img && (
              <Image
                source={item.img}
                style={[styles.chevron, selected && { tintColor: Color.primary }]}
              />
            )}
          </View>
        ) : item.id === '4' && selectedPlatformItems.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 2 }}>
            <View style={{ flexDirection: 'row', marginRight: 6 }}>
              {selectedPlatformItems.slice(0, 5).map((p, index) => (
                <View
                  key={p.supported_platform}
                  style={{
                    marginLeft: index === 0 ? 0 : -8,
                    zIndex: selectedPlatformItems.length + index,
                  }}
                >
                  <Image
                    source={{ uri: p?.icon }}
                    // source={require('../../../../assets/images/profile.png')}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: 'white',
                    }}
                    resizeMode="contain"
                  />

                </View>

              ))}

            </View>
            {selectedPlatformItems?.length && (
              <View style={styles.platefromCount} >


                <CustomText
                  size={10}
                  color={Color.lightGrayText}
                  style={{}}
                  font={font.PoppinsRegular}
                >
                  {selectedPlatformItems?.length}
                </CustomText>

              </View>
            )}
            <Image source={item?.img} style={styles.chevron}
              tintColor={selectedPlatformItems?.length > 0 ? Color.primary : Color.whiteText}
            />
          </View>
        ) : (
          <>
            {/* <Text style={[styles.filterText, selected && styles.selectedText]}>
              {item.title}
            </Text> */}

            <CustomText
              size={14}
              color={Color.lightGrayText}
              style={[styles.filterText, selected && styles.selectedText]}
              font={font.PoppinsMedium}
            >
              {item?.title}
            </CustomText>
            {item?.img && (
              <Image
                source={item?.img}
                style={[styles.chevron, selected && { tintColor: Color.primary }]}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={filters}
        horizontal
        keyExtractor={(item) => item?.id ?? String(item?.title)}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={false}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={() => { }}
      />
      {/* GENRE MODAL */}
      {genreModalVisible &&
        <GenreModal
          isVisible={genreModalVisible}
          onClose={() => setGenreModalVisible(false)}
          reset={() => {
            setTempGenres([]);
            setSelectedGenres([]);
            setFilterGenreString('');
            setGenreModalVisible(false);
          }}
          genres={availableGenres}
          selectedGenres={tempGenres}
          setSelectedGenres={setTempGenres}
          onApply={() => {
            const genreString = tempGenres.join(',');
            setSelectedGenres([...tempGenres]);
            setFilterGenreString(genreString);
            setGenreModalVisible(false);
          }}
        />
      }

      {platformModalVisible &&
        <PlatformModals
          visible={platformModalVisible}
          platformsData={platformsData}
          // platformsData={availablePlatforms}
          selectedPlatforms={tempPlatforms}
          setSelectedPlatforms={setTempPlatforms}
          onApply={() => {
            const selectedNames = platformsData
              .filter(p => tempPlatforms?.includes(p?.supported_platform))
              .map(p => p.supported_platform);

            setSelectedPlatforms([...tempPlatforms]);
            setPlateFromItemName(selectedNames);
            setPlatformFilterString(selectedNames.join(','));
            setPlatformModalVisible(false);
          }}
          reset={() => {
            setTempPlatforms([]);
            setSelectedPlatforms([]);
            setPlateFromItemName([]);
            setPlatformFilterString('');
            setPlatformModalVisible(false);
          }}
          onClose={() => setPlatformModalVisible(false)}
        />
      }
    </View>
  );
};
export default React.memo(FilterBar);


const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  flatListContent: {
  },
  filterItem: {
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.darkGrey,
    minHeight: 36,
  },
  selectedItem: {
    borderWidth: 1,

    borderColor: Color.primary,
  },
  filterText: {
    color: Color.lightGrayText,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: font.PoppinsRegular,
  },
  selectedText: {
    color: Color.primary,
    fontFamily: font.PoppinsMedium,
    fontSize: 13,
    lineHeight: 16,

  },
  chevron: {
    width: 16,
    height: 16,
    marginLeft: 8,
    tintColor: Color.lightGrayText,
  },

  platefromCount: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.grey,
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -14,
    zIndex: 999,
  },
});
