// import React, { memo, useCallback, useEffect, useState } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   Image,
//   ActivityIndicator,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import imageIndex from '@assets/imageIndex';
// import { Color } from '@theme/color';
// import font from '@theme/font';
// import { getMatchingMovies } from '@redux/Api/ProfileApi';
// import FastImage from 'react-native-fast-image';
// import { useNavigation } from '@react-navigation/native';
// import ScreenNameEnum from '@routes/screenName.enum';
// import RankingCard from '@components/ranking/RankingCard';
// import CustomText from '@components/common/CustomText/CustomText';
// import { hp } from '@utils/Constant';
 
// interface Movie {
//   id: string;
//   imdb_id: string;
//   cover_image_url: string;
//   rec_score: number;
//   title: string;
// }

// interface MoreSheetModalProps {
//   visible: boolean;
//   onClose: () => void;
//   token: string;
//   imdb_idData: string;
// }

// const MoreSheetModal: React.FC<MoreSheetModalProps> = ({
//   visible,
//   onClose,
//   token,
//   imdb_idData,
// }) => {
//   const [moreMovie, setMoreMovie] = useState<Movie[]>([]);
//   const [loading, setLoading] = useState(false);
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   const goToDetail = useCallback(
//     (item: Movie) => {
//        onClose();
//       setTimeout(() => {
//         navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
//           imdb_idData: item?.imdb_id,
//           token,
//         });
//       }, 250);
//     },
//     [navigation, token, onClose]
//   );

//   useEffect(() => {
//     if (visible && imdb_idData) {
//       const seeMoreLikeMovie = async () => {
//         try {
//           setLoading(true);
//           const response = await getMatchingMovies(token, imdb_idData);
//            setMoreMovie(response?.results || []);
//         } catch (error) {
//          } finally {
//           setLoading(false);
//         }
//       };
//       seeMoreLikeMovie();
//     }
//   }, [visible, imdb_idData, token]);

//   if (!visible) return null;

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent
//       onRequestClose={onClose}
//     >
//       <TouchableOpacity 
//         style={[styles.overlay, { paddingTop: insets.top }]}
//         disabled
//         onPress={onClose}
//       >
//         <View style={[
//           styles.modalContent,
//           {
//             maxHeight: height - insets.top - 20,
            
//             paddingBottom: Math.max(insets.bottom, 12),
//           }
//         ]}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.headerPlaceholder} />
//             <CustomText
//               size={16}
//               color={Color.whiteText}
//               style={styles.headerTitle}
//               font={font.PoppinsBold}
//             >
//               More Like This
//             </CustomText>
//             <TouchableOpacity onPress={onClose}>
//               <Image source={imageIndex.closeimg} style={styles.closeIcon} />
//             </TouchableOpacity>
//           </View>

//           {/* Content */}
//           {loading ? (
//             <View style={styles.loaderContainer}>
//               <ActivityIndicator size="large" color={Color.primary} />
//               <Text style={styles.loadingText}>Loading similar movies...</Text>
//             </View>
//           ) : moreMovie.length > 0 ? (
//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.scrollContent}
//             >
//               <View style={styles.gridContainer}>
//                 {moreMovie.map((item, index) => (
//                   <TouchableOpacity
//                     key={item.imdb_id || index.toString()}
//                     activeOpacity={0.7}
//                     onPress={() => goToDetail(item)}
//                     style={styles.movieCard}
//                   >
//                     <FastImage
//                       source={{
//                         uri: item?.cover_image_url,
//                         priority: FastImage.priority.normal,
//                         cache: FastImage.cacheControl.immutable,
//                       }}
//                       style={styles.movieImage}
//                       resizeMode={FastImage.resizeMode.cover}
//                     />
//                     <View style={styles.ratingBadge}>
//                       <RankingCard ranked={item?.rec_score} />
//                     </View>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </ScrollView>
//           ) : (
//             <View style={styles.emptyState}>
//                <Text style={styles.emptyText}>No similar movies found</Text>
//               <Text style={styles.emptySubText}>
//                 We couldn't find any movies similar to this one.
//               </Text>
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// export default MoreSheetModal;

// // Responsive calculations
// const { width, height } = Dimensions.get('window');
// const isSmallDevice = width < 375;
// const HORIZONTAL_PADDING = 16;
// const CARD_GAP = isSmallDevice ? 8 : 10;
// const NUM_COLUMNS = 3;

// // Calculate card width to fit exactly 3 columns
// const availableWidth = width - (HORIZONTAL_PADDING * 2);
// const totalGapWidth = CARD_GAP * (NUM_COLUMNS - 1);
// const CARD_WIDTH = (availableWidth - totalGapWidth) / NUM_COLUMNS;
// const CARD_HEIGHT = CARD_WIDTH * 1.5; // Standard movie poster ratio

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: Color.modalBg,
//     paddingTop: 16,
//     paddingHorizontal: 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: hp(58),
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   headerPlaceholder: {
//     height: 24,
//     width: 24,
//   },
//   headerTitle: {
//     color: Color.whiteText,
//   },
//   closeIcon: {
//     height: 24,
//     width: 24,
//     resizeMode: 'contain',
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'flex-start',
//     gap: CARD_GAP,
//   },
//   movieCard: {
//     width: CARD_WIDTH,
//     height: CARD_HEIGHT,
//      backgroundColor: '#1a1a1a',
//     overflow: 'hidden',
  
     
 
//   },
//   movieImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
//   ratingBadge: {
//     position: 'absolute',
//     bottom: 4,
//     left: 4,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   loadingText: {
//     color: Color.lightGrayText,
//     fontSize: 14,
//     marginTop: 12,
//     fontFamily: font.PoppinsRegular,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyIcon: {
//     fontSize: 64,
//     marginBottom: 16,
//   },
//   emptyText: {
//     color: Color.whiteText,
//     fontSize: 18,
//     fontFamily: font.PoppinsBold,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptySubText: {
//     color: Color.lightGrayText,
//     fontSize: 14,
//     fontFamily: font.PoppinsRegular,
//     textAlign: 'center',
//     paddingHorizontal: 32,
//     lineHeight: 20,
//   },
// });


import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import { getMatchingMovies } from '@redux/Api/ProfileApi';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import RankingCard from '@components/ranking/RankingCard';
import CustomText from '@components/common/CustomText/CustomText';
import { t } from 'i18next';

interface Movie {
  id: string;
  imdb_id: string;
  cover_image_url: string;
  rec_score: number;
  title: string;
}

interface MoreSheetModalProps {
  visible: boolean;
  onClose: () => void;
  token: string;
  imdb_idData: string;
}

const MoreSheetModal: React.FC<MoreSheetModalProps> = ({
  visible,
  onClose,
  token,
  imdb_idData,
}) => {
  const [moreMovie, setMoreMovie] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallDevice = screenHeight < 700;

  const goToDetail = useCallback(
    (item: Movie) => {
      onClose();
      setTimeout(() => {
        navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
          imdb_idData: item?.imdb_id,
          token,
        });
      }, 250);
    },
    [navigation, token, onClose]
  );

  useEffect(() => {
    if (visible && imdb_idData) {
      const seeMoreLikeMovie = async () => {
        try {
          setLoading(true);
          const response = await getMatchingMovies(token, imdb_idData);
          setMoreMovie(response?.results || []);
        } catch (error) {
          console.error('Error fetching similar movies:', error);
        } finally {
          setLoading(false);
        }
      };
      seeMoreLikeMovie();
    }
  }, [visible, imdb_idData, token]);


  const getModalHeight = () => {
    const videoHeight = screenHeight * 0.40;
    const availableHeight = screenHeight - videoHeight;
    
    let modalHeight = availableHeight  
    
    return Math.min(modalHeight, screenHeight * 0.65);
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

  // Responsive calculations
  const isSmallWidth = screenWidth < 375;
  const HORIZONTAL_PADDING = 16;
  const CARD_GAP = isSmallWidth ? 8 : 10;
  const NUM_COLUMNS = 3;

  // Calculate card width to fit exactly 3 columns
  const availableWidth = screenWidth - (HORIZONTAL_PADDING * 2);
  const totalGapWidth = CARD_GAP * (NUM_COLUMNS - 1);
  const CARD_WIDTH = (availableWidth - totalGapWidth) / NUM_COLUMNS;
  const CARD_HEIGHT = CARD_WIDTH * 1.5; // Standard movie poster ratio

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent={true}
      hardwareAccelerated={true}
      onRequestClose={onClose}
    >
      <View style={styles.mainContainer}>
        {/* Video area placeholder (40% of screen) */}
        <View style={[
          styles.videoAreaPlaceholder,
          // { height: screenHeight * (isSmallDevice ? 0.35 : 0.40) }
        ]} />
        
        {/* Modal overlay */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={[
              styles.modalContent,
              {
                height: getModalHeight(),
                paddingBottom: getModalBottomPadding(),
                // height: getModalHeight(),
                // paddingBottom: getModalBottomPadding(),
                // borderTopLeftRadius: isSmallDevice ? 15 : 20,
                // borderTopRightRadius: isSmallDevice ? 15 : 20,
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.emptySpace} />
              <CustomText
                size={isSmallDevice ? 15 : 16}
                color={Color.whiteText}
                style={styles.headerText}
                font={font.PoppinsBold}
              >
              
                  {t("movieDetail.morelike")}
              </CustomText>
              <TouchableOpacity onPress={onClose}>
                <Image
                  source={imageIndex.closeimg}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator 
                  color={Color.primary} 
                  size={isSmallDevice ? "small" : "large"}
                />
                <CustomText
                  size={14}
                  color={Color.lightGrayText}
                  style={styles.loadingText}
                  font={font.PoppinsRegular}
                >
                    {t("emptyState.similar")}
                   
                </CustomText>
              </View>
            ) : moreMovie.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={[
                  styles.gridContainer,
                  { gap: CARD_GAP }
                ]}>
                  {moreMovie.map((item, index) => (
                    <TouchableOpacity
                      key={item.imdb_id || index.toString()}
                      activeOpacity={0.7}
                      onPress={() => goToDetail(item)}
                      style={[
                        styles.movieCard,
                        { 
                          width: CARD_WIDTH,
                          height: CARD_HEIGHT 
                        }
                      ]}
                    >
                      <FastImage
                        source={{
                          uri: item?.cover_image_url,
                          priority: FastImage.priority.normal,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.movieImage}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                      <View style={styles.ratingBadge}>
                        <RankingCard ranked={item?.rec_score} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <CustomText
                  size={isSmallDevice ? 16 : 18}
                  color={Color.whiteText}
                  style={styles.emptyText}
                  font={font.PoppinsBold}
                >
                                      {t("emptyState.similarmovies")}

             
                </CustomText>
                <CustomText
                  size={isSmallDevice ? 13 : 14}
                  color={Color.lightGrayText}
                  style={styles.emptySubText}
                  font={font.PoppinsRegular}
                >
                     {t("common.moviesSimilar")}
                </CustomText>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Transparent area for Android gestures */}
        {Platform.OS === 'android' && insets.bottom > 0 && (
          <View style={[styles.gestureSafeArea, { height: insets.bottom + 10 }]} />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoAreaPlaceholder: {
     height: '39%', 
    // Height set dynamically
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Color.modalBg,
    paddingTop: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 12,
  },
  emptySpace: {
    width: 24,
    height: 24,
  },
  headerText: {
    color: Color.whiteText,
  },
  closeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  movieCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  movieImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  gestureSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});

export default memo(MoreSheetModal);