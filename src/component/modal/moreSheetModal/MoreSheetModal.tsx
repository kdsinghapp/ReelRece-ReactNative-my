import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
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
         } finally {
          setLoading(false);
        }
      };
      seeMoreLikeMovie();
    }
  }, [visible, imdb_idData, token]);

  if (!visible) return null;

  // Calculate modal height dynamically
  const modalHeight = height * 0.7;
  const maxModalHeight = height - insets.top - 20;
  const finalHeight = Math.min(modalHeight, maxModalHeight);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[
            styles.contentContainer,
            {
              height: finalHeight,
              paddingBottom: Math.max(insets.bottom + 12, 20),
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerPlaceholder} />
            <CustomText
              size={16}
              color={Color.whiteText}
              style={styles.headerTitle}
              font={font.PoppinsBold}
            >
              More Like This
            </CustomText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Image source={imageIndex.closeimg} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Color.primary} />
              <Text style={styles.loadingText}>Loading similar movies...</Text>
            </View>
          ) : moreMovie.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.gridContainer}>
                {moreMovie.map((item, index) => (
                  <TouchableOpacity
                    key={item.imdb_id || index.toString()}
                    activeOpacity={0.7}
                    onPress={() => goToDetail(item)}
                    style={styles.movieCard}
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
               <Text style={styles.emptyText}>No similar movies found</Text>
              <Text style={styles.emptySubText}>
                We couldn't find any movies similar to this one.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default MoreSheetModal;

// Responsive calculations
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const HORIZONTAL_PADDING = 16;
const CARD_GAP = isSmallDevice ? 8 : 10;
const NUM_COLUMNS = 3;

// Calculate card width to fit exactly 3 columns
const availableWidth = width - (HORIZONTAL_PADDING * 2);
const totalGapWidth = CARD_GAP * (NUM_COLUMNS - 1);
const CARD_WIDTH = (availableWidth - totalGapWidth) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // Standard movie poster ratio

const styles = StyleSheet.create({
  modalOverlay: {
  flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
      top:
      Platform.OS === 'android'
        ?  40
        : 57, // safe for iOS notch
 
  },
  contentContainer: {
 backgroundColor: Color.modalBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: HORIZONTAL_PADDING,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerPlaceholder: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: Color.whiteText,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: CARD_GAP,
  },
  movieCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
     backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  
     
 
  },
  movieImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: Color.lightGrayText,
    fontSize: 14,
    marginTop: 12,
    fontFamily: font.PoppinsRegular,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: Color.whiteText,
    fontSize: 18,
    fontFamily: font.PoppinsBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    color: Color.lightGrayText,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
