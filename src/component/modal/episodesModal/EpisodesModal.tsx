import React, { Activity, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import CustomText from '@components/common/CustomText/CustomText';
 
interface Episode {
  id: number;
  title: string;
  duration: string;
  image: string;
}

interface SessionItem {
  id: number;
  session: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  episodes: Episode[];
  selectedId: number;
  onSelect: (id: number) => void;
  token: string;
  imdb_id: string;
  sessionList: SessionItem[];
  onFetchEpisodes: (seasonId: number) => void;
  bagImges: string;
  EpisodesLoder: boolean;
}





export const sessionData = [
  {
    id: 1,
    session: "Session 1",

  },
  {
    id: 2,
    session: "Session 2",

  },
  {
    id: 3,
    session: "Session 3",

  },
 

]



const EpisodesModal: React.FC<Props> = ({
  visible,
  onClose,
  episodes,
  selectedId,
  onSelect,
  token,
  imdb_id,
  sessionList,
  onFetchEpisodes,
  bagImges,
  EpisodesLoder,
}) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const [sessionOption, setSessionOption] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<SessionItem | null>(null);
  const [selectedSortId, setSelectedSortId] = useState(sessionData[0]?.session || "session 1");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible && sessionList?.length > 0) {
      const defaultSeason = sessionList[0];
      setSelectedSortId(defaultSeason.session);
      onFetchEpisodes(defaultSeason.id);
    }
    if (visible == false) {
      setSelectedSortId(sessionData[0]?.session);
    }
  }, [visible, sessionList]);

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

  const renderItem = ({ item, index }: { item: Episode; index: number }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={styles.episodeContainer}
        onPress={() => onSelect(item?.id)}
      >
        <Image
          source={{ uri: bagImges }}
          resizeMode='stretch'
          style={styles.thumbnail}
        />
        <View style={styles.textContainer}>
          <CustomText
            numberOfLines={2}
            size={14}
            color={Color.whiteText}
            style={[
              styles.title,
              {
                fontFamily: font.PoppinsMedium,
              }
            ]}
            font={font.PoppinsBold}
          >
            {item?.title}
          </CustomText>
          <CustomText
            size={14}
            color={Color.placeHolder}
            style={styles.duration}
            font={font.PoppinsRegular}
          >
            Ep. {index + 1} – {item.duration}
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  const GenreButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity
      style={styles.genreButton}
      onPress={() => { onPress(); setSessionOption(false); }}
    >
      <CustomText
        size={14}
        color={Color.whiteText}
        style={styles.genreText}
        font={font.PoppinsRegular}
      >
        {title?.session}
      </CustomText>
      <View style={styles.genreUnderline} />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.mainContainer}>
        {/* This empty view represents the 40% video area */}
        <View style={styles.videoAreaPlaceholder} />
        
        {/* Modal overlay that takes remaining space */}
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            Platform.OS === 'android' && styles.androidModalOverlay
          ]}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={[
              styles.modalContent,
              {
                height: getModalHeight(),
                paddingBottom: getModalBottomPadding(),
              }
            ]}
          >
            <View style={styles.header}>
              <View style={styles.emptySpace} />
              <CustomText
                size={16}
                color={Color.whiteText}
                style={styles.headerText}
                font={font.PoppinsBold}
              >
                Episodes
              </CustomText>
              <TouchableOpacity onPress={onClose}>
                <Image
                  source={imageIndex.closeimg}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.sectionHeader}
              onPress={() => setSessionOption(!sessionOption)}
            >
              <View style={styles.emptySpace} />
              <CustomText
                size={16}
                color={Color.whiteText}
                style={styles.sectionTitle}
                font={font.PoppinsBold}
              >
                {selectedSortId}
              </CustomText>
              {sessionOption ? (
                <Image source={imageIndex.arrowUp} style={styles.arrowStyle} />
              ) : (
                <Image source={imageIndex.arrowDown} style={styles.arrowStyle} />
              )}
            </TouchableOpacity>

            {EpisodesLoder ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={Color.primary} size="large" />
              </View>
            ) : (
              <>
                {sessionOption ? (
                  <FlatList
                    data={sessionList}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <GenreButton
                        title={item}
                        onPress={() => {
                          setSelectedSortId(item?.session);
                          onFetchEpisodes(item?.id);
                          setSessionOption(false);
                        }}
                      />
                    )}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={12}
                    removeClippedSubviews
                  />
                ) : (
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    style={styles.episodesList}
                    data={episodes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[
                      styles.listContent,
                      episodes?.length === 0 && styles.emptyList
                    ]}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyContainer}>
                        <CustomText
                          size={15.5}
                          color={Color.grey200}
                          style={styles.emptyText}
                          font={font.PoppinsMedium}
                        >
                          No Episodes found
                        </CustomText>
                      </View>
                    )}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    removeClippedSubviews
                  />
                )}
              </>
            )}
          </View>
          {/* Add a transparent view at the bottom for gestures */}
      
        {Platform.OS === 'android' && insets.bottom > 0 && (
                  <View style={[styles.gestureSafeArea, { height: insets.bottom + 10 }]} />
                )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  videoAreaPlaceholder: {
    height: '39%', 
  },
  modalOverlay: {
    flex: 1, 
  },
  androidModalOverlay: {
    marginBottom: Platform.select({
      android: 0,
      ios: 0,
    }),
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
    marginBottom: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  headerText: {
    color: Color.whiteText,
  },
  emptySpace: {
    height: 24,
    width: 24,
  },
  closeIcon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: Color.grey,
    borderRadius: 10,
    alignItems: 'center',
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
    resizeMode: 'contain',
    tintColor: Color.primary,
  },
  episodesList: {
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 15.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    marginVertical: 3,
  },
  thumbnail: {
    width: 100,
    height: 72,
    borderRadius: 10,
  },
  textContainer: {
    paddingLeft: 8,
    flex: 1,
  },
  title: {
    // Title styles
  },
  duration: {
    marginTop: 2,
  },
  genreButton: {
    alignItems: 'center',
    paddingTop: 10,
  },
  genreText: {
    marginBottom: 18,
  },
  genreUnderline: {
    borderBottomWidth: 1,
    borderColor: Color.whiteText,
    width: 156,
  },
  gestureSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});

export default EpisodesModal;