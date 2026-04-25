import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import font from '@theme/font';
import FastImage from 'react-native-fast-image';
import { getMoviePlatforms } from '@redux/Api/ProfileApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from 'i18next';
const filterOptions = [
  //   { id: 1, option: 'All' },
  { id: 2, option: 'Subscription' },
  { id: 3, option: 'Rent' },
  { id: 4, option: 'Buy' },
  { id: 5, option: 'Free' },
];

export interface WatchPlatformItem {
  supported_platform?: string;
  display_name?: string;
  watch_type?: string;
  deeplink?: string;
  deeplink_ios?: string;
  web?: string;
  image_url?: string | null;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

type WatchNowModalProps = {
  visible: boolean;
  token: string;
  onClose?: () => void;
  selectedImdbId: string;
  watchModalLoad: boolean;
  setWatchModalLoad: (v: boolean) => void;
  country?: string;
};

const WatchNowModal = ({
  visible,
  token,
  onClose,
  selectedImdbId,
  watchModalLoad,
  setWatchModalLoad,
  country = 'US',
}: WatchNowModalProps) => {
  const [selectedSortOption, setSelectedSortOption] = useState('Subscription');
  const [platforms, setPlatforms] = useState<WatchPlatformItem[]>([]);


  const fetchData = async () => {
    if (!selectedImdbId) return;
    setWatchModalLoad(true);
    try {
      const response = await getMoviePlatforms({
        token,
        imdb_id: selectedImdbId,
        country,
        watch_type: undefined,
      });
      const raw = (response as { data?: unknown })?.data ?? response;

      const list = Array.isArray(raw)
        ? raw
        : (raw as { data?: unknown[]; platforms?: unknown[] })?.data ??
        (raw as { platforms?: unknown[] })?.platforms ??
        [];

      const filteredList = (Array.isArray(list) ? (list as WatchPlatformItem[]) : [])
        .filter((p: any) => {
          const name = String(p?.supported_platform || p?.display_name || '');
          const isNumeric = /^\d+$/.test(name);
          const isUnknown = name.includes('_Unknown') || name.toLowerCase() === 'unknown';
          const isNotSet = name.toUpperCase() === 'NOT_SET';
          return name && !isNumeric && !isUnknown && !isNotSet;
        });

      setPlatforms(filteredList);
    } catch (error) {
      setPlatforms([]);
    } finally {
      setWatchModalLoad(false);
    }
  };

  useEffect(() => {
    if (visible && selectedImdbId) {
      fetchData();
    }
  }, [selectedImdbId, visible]);

  const getWatchTypeLabel = (label: string) => {
    switch (label) {
      case 'Subscription':
        return 'flatrate';
      case 'Rent':
        return 'rent';
      case 'Buy':
        return 'buy';
      case 'Free':
        return 'free';
      default:
        return '';
    }
  };

  const normalizeWatchType = (watchType: string | undefined): string => {
    if (!watchType) return '';
    const t = String(watchType).trim().toLowerCase();
    if (t === 'flatrate' || t === 'subscription') return 'Subscription';
    if (t === 'rent') return 'Rent';
    if (t === 'buy') return 'Buy';
    if (t === 'free') return 'Free';
    return String(watchType).trim();
  };

  const filteredByType =
    selectedSortOption === 'All'
      ? platforms
      : platforms.filter((p) => {
        const normalized = normalizeWatchType(p?.watch_type);
        return normalized === selectedSortOption;
      });

  const filteredPlatforms = filteredByType
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            (p?.supported_platform ?? '').toLowerCase() ===
            (item?.supported_platform ?? '').toLowerCase()
        )
    )
    .sort((a, b) => ((a as any).popular === (b as any).popular ? 0 : (a as any).popular ? -1 : 1));

  const openDeeplink = async (item: WatchPlatformItem) => {
    const url =
      Platform.OS === 'ios'
        ? item?.deeplink_ios || item?.deeplink || item?.web
        : item?.deeplink || item?.deeplink_ios || item?.web;
    const toOpen = (url && String(url).trim()) || null;
    if (!toOpen) return;
    try {
      await Linking.openURL(toOpen);
      onClose?.();
    } catch (e) {
      // ignore (e.g. no app to handle scheme)
    }
  };
  const insets = useSafeAreaInsets();
  const getModalHeight = () => {
    const videoHeight = screenHeight * 0.38;
    const availableHeight = screenHeight - videoHeight;

    let modalHeight = availableHeight

    return Math.min(modalHeight, screenHeight * 0.75);
  };

  const getModalBottomPadding = () => {
    let bottomPadding = 0;

    if (Platform.OS === 'ios') {
      bottomPadding = Math.max(insets.bottom, 12);
    } else {
      // For Android with gesture navigation, add more padding
      bottomPadding = Math.max(insets.bottom + 10, 20);
    }

    return bottomPadding;
  };
  const renderPlatform = ({ item }: { item: WatchPlatformItem }) => {
    const hasUrl =
      (item?.deeplink && String(item.deeplink).trim()) ||
      (item?.deeplink_ios && String(item.deeplink_ios).trim()) ||
      (item?.web && String(item.web).trim());

    const platformDisplayName = item?.display_name || item?.supported_platform || '?';

    return (
      <View style={styles.platformRow}>
        {item?.image_url ? (
          <FastImage
            source={{
              uri: item.image_url,
              priority: FastImage.priority.low,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.contain}
            style={styles.platformLogo}
          />
        ) : (
          <View style={[styles.platformLogo, styles.platformLogoPlaceholder]}>
            <Text style={styles.platformLogoPlaceholderText} numberOfLines={1}>
              {platformDisplayName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.platformName} numberOfLines={1}>
            {platformDisplayName}
          </Text>
          <Text style={styles.action} numberOfLines={1}>
            {normalizeWatchType(item?.watch_type)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.watchBtn,
            { backgroundColor: hasUrl ? Color.primary : Color.grey },
          ]}
          onPress={() => hasUrl && openDeeplink(item)}
          disabled={!hasUrl}
        >
          <Image source={imageIndex.watchPlay} style={styles.watchPlayIcon} />
          <Text style={styles.watchBtnText}>{t('common.watchNow')}</Text>
        </TouchableOpacity>
      </View>
    );
  };



  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.mainContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>

        <View style={styles.overlay} pointerEvents="box-none">
          <View
            style={[
              styles.modalContent,
              {
                height: getModalHeight(),
                paddingBottom: getModalBottomPadding(),
              },
            ]}
          >
            <View style={styles.headerContainer}>
              <View style={{ width: 22 }} />
              <Text style={styles.headingTitle}>{t("common.watchNow")}</Text>
              <TouchableOpacity onPress={onClose}>
                <Image source={imageIndex.closeimg} style={styles.closeImg} />
              </TouchableOpacity>
            </View>



            {/* Top Filters */}
            <View style={styles.filterRow}>
              {filterOptions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.filterButton,
                    selectedSortOption === item.option && styles.activeFilter,
                  ]}
                  // onPress={() => setSelectedSortOption(item.option)}
                  onPress={() => {
                    const apiWatchType = getWatchTypeLabel(item.option);
                    // setSelectFilterOp(getWatchTypeLabel(item.option))
                    setSelectedSortOption(item.option);
                  }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedSortOption === item.option && styles.activeFilterText,
                    ]}
                  >
                    {item.option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Platform List */}
            {/* Platform List Section */}
            {watchModalLoad ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={Color.primary} size="small" />
              </View>
            ) : Array.isArray(filteredPlatforms) && filteredPlatforms.length === 0 ? (
              <View style={styles.loaderContainer}>
                <Text style={styles.NotAvaibleText}>{t("emptyState.noresults")}</Text>
              </View>
            ) : (
              <View style={styles.listWrapper}>
                <FlatList
                  data={filteredPlatforms}
                  keyExtractor={(item, index) =>
                    `${item?.supported_platform ?? ''}-${item?.watch_type ?? ''}-${index}`
                  }
                  renderItem={renderPlatform}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  initialNumToRender={10}
                  showsVerticalScrollIndicator={false}
                  maxToRenderPerBatch={10}
                  windowSize={7}
                  removeClippedSubviews={Platform.OS === 'android'}
                />
              </View>
            )}
          </View>
        </View>
        {Platform.OS === 'android' && insets.bottom > 0 && (
          <View style={[styles.gestureSafeArea, { height: insets.bottom + 10 }]} />
        )}
      </View>
    </Modal>
  );
};

export default WatchNowModal;


const styles = StyleSheet.create({
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  listWrapper: {
    flex: 1,
    minHeight: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Color.modalBg,
    maxHeight: Dimensions.get('window').height * 0.66,
    minHeight: Dimensions.get('window').height * 0.66,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headingTitle: {
    color: Color.primary,
    fontSize: 16,
    fontFamily: font.PoppinsSemiBold,
    flex: 1,
    textAlign: 'center',
    lineHeight: 19.2
  },
  closeImg: {
    height: 24,
    width: 24,
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#767676',
    paddingBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Color.gray,
    borderWidth: 1,
    borderColor: Color.grey,
  },
  gestureSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#00A8F599',
    borderWidth: 1,
    borderColor: Color.primary
  },
  filterText: {
    color: Color.whiteText,
    fontSize: 12,
    lineHeight: 14,
    fontFamily: font.PoppinsRegular,
    // marginHorizontal:8,
  },
  activeFilterText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsSemiBold,
    marginHorizontal: 10,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  platformLogo: {
    height: 40,
    width: 40,
    marginRight: 12,
    borderRadius: 4,
    backgroundColor: 'transparent'
  },
  platformLogoPlaceholder: {
    backgroundColor: Color.grey700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformLogoPlaceholderText: {
    color: Color.whiteText,
    fontSize: 10,
    fontFamily: font.PoppinsMedium,
  },
  platformName: {
    color: Color.whiteText,
    flex: 1,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: font.PoppinsSemiBold,
  },

  action: {
    color: Color.whiteText,
    flex: 1,
    fontSize: 12,
    fontFamily: font.PoppinsRegular,
  },
  watchBtn: {
    backgroundColor: Color.graybackGround,
    // paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  watchBtnText: {
    color: Color.whiteText,
    fontSize: 12,
    fontFamily: font.PoppinsSemiBold,
    // fontWeight: '600',
  },
  genreButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  genreText: {
    color: Color.whiteText,
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 5,
  },
  sectionHeader: {
    bottom: 0,
    // position:'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: Color.grey,
    borderRadius: 10,
    // marginHorizontal:20,
  },
  sectionTitle: {
    fontSize: 14,
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    textAlign: 'center',
    flex: 1,
  },
  arrowStyle: {
    height: 22,
    width: 22,
    resizeMode: "contain",
    // tintColor:Color.primary,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  NotAvaibleText: {
    fontSize: 14,
    color: Color.textGray,
    fontFamily: font.PoppinsRegular,
    textAlign: "center"
  },

  mainContainer: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  videoAreaPlaceholder: {
    height: '38%',
  },
  modalContent: {
    backgroundColor: Color.modalBg,
    paddingTop: 30,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  watchPlayIcon: {
    height: 11,
    width: 10,
    marginRight: 6,
    resizeMode: "contain",
    tintColor: Color.whiteText,
  },
});
