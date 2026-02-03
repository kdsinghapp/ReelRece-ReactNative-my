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
  const [sessionOption, setSessionOption] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<SessionItem | null>(null);
useEffect(() => {
  if (visible && sessionList?.length > 0) {
    const defaultSeason = sessionList[0]; // ✅ Season 1
    setSelectedSortId(defaultSeason.session);
    onFetchEpisodes(defaultSeason.id);
  } 
  if(visible == false) {
      setSelectedSortId(sessionData[0]?.session);
  }
    


}, [visible, sessionList]);

const { height } = Dimensions.get('window');

  const [selectedSortId, setSelectedSortId] = useState(sessionData[0]?.session || "session 1");
 
  const renderItem = ({ item, index }: { item: Episode; index: number }) => {

    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[styles.episodeContainer,]}
        onPress={() => onSelect(item?.id)}
      >

        <Image source={{ uri: bagImges }}

          resizeMode='stretch'
          style={styles.thumbnail} />

        <View style={[styles.textContainer, {
          flex: 1
        }]}>

          <CustomText
            numberOfLines={2}
            size={14}
            color={Color.whiteText}
            style={[
              styles.title,
              {
                color : Color.whiteText ,
                fontFamily:  font.PoppinsMedium  ,
                // color: item?.id === 2 ? Color.lightPrimary : Color.whiteText,
                // fontFamily: item?.id === 2 ? font.PoppinsBold : font.PoppinsMedium,


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
      style={[styles.genreButton]}
      onPress={() => { onPress(); setSessionOption(false) }}
    >
      <CustomText
        size={14}
        color={Color.whiteText}
        style={[styles.genreText,]}
        font={font.PoppinsRegular}
      >
        {title?.session}
      </CustomText>

      <View style={{
        borderBottomWidth: 1,
        borderColor: Color.whiteText,
        width: 156,
        // marginTop: 12,
        alignItems: "center",
        justifyContent: "center"
      }} />
    </TouchableOpacity>
  );



  return (
    <Modal animationType="slide" transparent visible={visible}
    style={{
     }}

      onRequestClose={onClose} >
      <TouchableOpacity style={[styles.overlay,{
 
 }]}

        disabled
        onPress={onClose} >
         
        <View style={styles.modalContent}>
          <View style={styles.header}>
            {/* <Text style={styles.headerText}></Text> */}
             <View style={{
                height: 24,
                width: 24,
             }}></View>
            <CustomText
              size={16}
              color={Color.whiteText}
              style={styles.headerText}
              font={font.PoppinsBold}
            >
              Episodes
            </CustomText>
            <TouchableOpacity onPress={onClose}>
              <Image source={imageIndex.closeimg} style={{
                height: 24,
                width: 24,
                resizeMode: "contain"
              }} />
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            activeOpacity={0.8} // Opacity when pressed

            style={styles.sectionHeader}
            onPress={() => setSessionOption(!sessionOption)}
          >
              <View style={{
                 height: 22,
    width: 22,
             }}></View>
            <CustomText
              size={16}
              color={Color.whiteText}
              style={styles.sectionTitle}
              font={font.PoppinsBold}
            >
              {selectedSortId}
            </CustomText>
            {sessionOption ? <Image source={imageIndex.arrowUp} style={styles.arrowStyle} /> : <Image source={imageIndex.arrowDown} style={styles.arrowStyle} />}


          </TouchableOpacity>

          {
            EpisodesLoder  ? (

              <ActivityIndicator color={Color.primary} />
            ) : (


              <>
                {sessionOption ? (
                  <FlatList
                  data={sessionList} // ✅ use dynamic list
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <GenreButton
                        title={item}
                        onPress={() => {
                          setSelectedSortId(item?.session);
                          onFetchEpisodes(item?.id);  // Fetch that season's episodes
                          setSessionOption(false);
                        }}
                        isSelected={selectedSortId === item?.session}
                      />
                    )}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={12}
                    removeClippedSubviews

                  />
                ) :
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{ marginTop: 12 }}
                    data={episodes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[
                      styles.list,
                      episodes?.length === 0 && { flex: 1 }
                    ]}
                    ListEmptyComponent={() => (
                      <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 50
                      }}>
                        <Text style={{
                          fontSize: 15.5,
                          color: Color.grey200 ,
                          fontFamily:font.PoppinsMedium
                        }}>No Episodes found</Text>
                      </View>
                    )}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    removeClippedSubviews
                  />

                }
              </>
            )
          }




        </View>
   
      </TouchableOpacity>
    </Modal>
  );
};
// good time to see
export default EpisodesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
   },
  modalContent: {
    backgroundColor: Color.modalBg,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // height:  Dimensions.get('window').height * 0.7,
maxHeight:
      Dimensions.get('window').height *
      (Platform.OS === 'ios' ? 0.63 : 0.62 ),    

    // maxHeight: Dimensions.get('window').height * 0.63,
    height: Dimensions.get('window').height * 0.66,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 12,
    alignItems:"center"

  },
  headerText: {
    color: Color.whiteText,
    
  },

  episodeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    marginVertical: 3
  },

  thumbnail: {
    width: 100,
    height: 72,
    borderRadius: 10
  },
  textContainer: {
    paddingLeft: 8,
    // justifyContent: 'center',
  },
  title: {
  },
  titleSelected: {
    color: Color.primary,
  },
  duration: {
    marginTop: 2
  },
  list: {
    paddingBottom: 16,
  },
  sectionHeader: {
     flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: Color.grey,
    borderRadius: 10,
      alignItems:"center"
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
    tintColor: Color.primary,
  },
  genreButton: {
    alignItems: 'center',
    paddingTop: 10,
  },
  genreText: {
    marginBottom: 18,
  },
});



