import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
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

const filterOptions = [
  { id: 1, option: 'All' },
  { id: 2, option: 'Subscription' },
  { id: 3, option: 'Rent' },
  { id: 4, option: 'Buy' },
  { id: 5, option: 'Free' },
];

const WatchNowModal = ({ visible, token, onClose, selectedImdbId, watchModalLoad, setWatchModalLoad, country = 'US' }) => {
  const [selectedSortOption, setSelectedSortOption] = useState('All');
  const [platforms, setPlatforms] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('')
  const [selectFilterOp, setSelectFilterOp] = useState('')
  // const filteredPlatforms =
  //   selectedSortOption === 'All'
  //     ? watchAvaibleData
  //     : watchAvaibleData.filter((item) => item.type === selectedSortOption);

   const fetchData = async () => {
    setWatchModalLoad(true)
    try {
      const data = await getMoviePlatforms({
        token,
        imdb_id: selectedImdbId,
        country,
        watch_type: selectFilterOp, // static

      });
      // setPlatforms(data.data);
      setPlatforms(Array.isArray(data?.data) ? data?.data : []);

     } catch (error) {
     } finally {
      setWatchModalLoad(false)
    }
  };
  useEffect(() => {
    if (selectedImdbId) {
      fetchData();
    }
  }, [selectedImdbId, selectFilterOp]);


  useEffect(() => {
    fetchData();
  }, [selectedImdbId]);

  const getWatchTypeLabel = (label) => {
    switch (label) {
      case 'Subscription':
        // Alert.alert("flatrate")
        return 'flatrate';
      case 'Rent':
        // Alert.alert("rent")

        return 'rent';
      case 'Buy':
        // Alert.alert("buy")

        return 'buy';
      case 'Free':
        // Alert.alert("Free")

        return 'free';
      default:
        return ''; // 'All' default case
    }
  };

 
  const renderPlatform = ({ item }) => {

    return (

      <View style={styles.platformRow}>
        
        
          <FastImage
            source={{
              uri: item?.image_url,
              priority: FastImage.priority.low,
              cache: FastImage.cacheControl.immutable
            }}
            resizeMode={FastImage.resizeMode.stretch}
            style={styles.platformLogo}
          />
     
          {/* <Image source={{ uri: item.image_url }} style={styles.platformLogo} resizeMode="contain" /> */}
   
            <Text style={styles.platformName}>{item?.supported_platform}</Text>
            {/* <Text style={styles.action}>{item?.watch_type}</Text> */}
         
     
        <TouchableOpacity
          style={[
            styles.watchBtn,
            {
              backgroundColor:
                item?.watch_type === "flatrate"
                  ? Color.primary


                  : Color.graybackGround,
            },
          ]}
        >
          <Text style={styles.watchBtnText}>▶ Watch Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

 
  
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <View style={{ width: 22 }} />
                <Text style={styles.headingTitle}>Watch Now</Text>
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
                      setSelectFilterOp(apiWatchType);
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
                  <ActivityIndicator color={Color.primary} size="large" />
                </View>
              ) : Array.isArray(platforms) && platforms.length === 0 ? (
                <View style={styles.loaderContainer}>
                  <Text style={styles.NotAvaibleText}>Not Available right now</Text>
                </View>
              ) : (
                <FlatList
                  data={platforms}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={renderPlatform}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  initialNumToRender={10}
                  showsVerticalScrollIndicator={false}
                  maxToRenderPerBatch={10}
                  windowSize={7}
                  removeClippedSubviews

                />
              )}

             
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default WatchNowModal;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 10,
  },
  headingTitle: {
    color: Color.primary,
    fontSize: 16,
    fontFamily: font.PoppinsBold,
    flex: 1,
    textAlign: 'center',
  },
  closeImg: {
    height: 22,
    width: 22,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Color.grey700,
    borderWidth: 1,
    borderColor: Color.grey,
  },
  activeFilter: {
    backgroundColor: Color.primary,
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
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  platformLogo: {
    height: 35,
    width: 35,
    marginRight: 12,
    borderRadius:6,
    // backgroundColor: '#901d1dff'
  },
  platformName: {
    color: Color.whiteText,
    flex: 1,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: font.PoppinsMedium,
  },

  action: {
    color: Color.whiteText,
    flex: 1,
    fontSize: 10,
    fontFamily: font.PoppinsRegular,
  },
  watchBtn: {
    backgroundColor: Color.graybackGround,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  watchBtnText: {
    color: Color.whiteText,
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 16,
    color: Color.grey700,
    fontFamily: font.PoppinsRegular
  },
});
