import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import { useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import { BASE_IMAGE_URL } from '@redux/Api/axiosInstance';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import FastImage from 'react-native-fast-image';
import RankingWithInfo from '@components/ranking/RankingWithInfo';

interface Review {
  id: number;
  name: string;
  avatar: string;
  date: string;
  rating: number;
  message: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  reviews: string[];
  type: 'review' | 'react';
  headaing: string;
  groupActivity: string[];
  ranking_react: string;
}

const FriendthinkModal: React.FC<Props> = ({ visible, onClose, reviews, type, headaing, groupActivity, ranking_react }) => {
   const navigation = useNavigation();
    const { token, userGetData } = useSelector((state: RootState) => state.auth);
    const isUserName_Login = useSelector((state: RootState) => state.auth.userGetData?.username);
     const email_da_data = useSelector((state: RootState) => state.auth.userGetData);
   
   const renderItem = ({ item }: { item }) => {
     return (
      <View style={[
        styles.modalContent,
        {
          // backgroundColor: type === "react" ? "transparent" : Color.modalBg,
          backgroundColor: type === "react" ? "transparent" : Color.modalBg,
          minHeight:64,
          maxHeight:64,
          // flex: 3,

        }
      ]}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            onClose();
            navigation.navigate(ScreenNameEnum.OtherProfile ,{item:item});
          }}
        >
          <TouchableOpacity style={styles.avatarContainer}>

            {/* <Image source={{ uri: `${BASE_IMAGE_URL}${type === 'review' ? item?.user?.avatar : item?.avatar}` }} style={styles.avatar} /> */}
              <FastImage
          style={styles.avatar}
          source={{
            uri: `${BASE_IMAGE_URL}${type === 'review' ? item?.user?.avatar : item?.avatar}`,
            priority: FastImage.priority.low, // 👈 Low priority (since profile image small)
            cache: FastImage.cacheControl.web // 👈 Cache permanently
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
            {type === "react" &&
              <View style={[styles.onlineIndicator, { backgroundColor:  item?.preference ? (item?.preference == "like" ? Color.green : Color.red ) : Color.TransperantColor}]} >
                {item?.preference ?  (item?.preference == "like" ?
                  <Image source={imageIndex?.like} style={styles.thumpstyle} /> :
                  <Image source={imageIndex?.disLike} style={styles.thumpstyle} />):
                  null
                };
  
              </View>}
          </TouchableOpacity>

          <View style={styles.info}>
            <Text style={styles.name}>
              {type === 'review' ? item.user?.name : item?.name}{' '}
              <Text style={styles.rankText}>
                {/* {type === 'review'
                  ? 'ranked'
                  : item.react
                    ? 'liked this'
                    : 'didn’t like this'} */}
              </Text>
            </Text>
            {type === 'review' && <Text style={styles.date}>{item?.created_date}</Text>}
          </View>
          <View style={[styles.ratingBadge]}>
               <RankingWithInfo
      score={item?.rec_score}
      title={ item?.username == isUserName_Login ?  "Rec Score" : "Friend Score"}
      description={item?.username == isUserName_Login ?
        "This score shows the rating from your friend for this title."
      
          : "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
         
      }
    />
            {/* <RankingCard ranked={item?.rec_score} /> */}
          </View>
        </TouchableOpacity>

        {type === 'review' && (
          <Text numberOfLines={4} style={styles.message}>
            {item?.comment}{' '}
            {item.comment.length > 100 && (
              <Text style={styles.seeMore}>See more</Text>
            )}

          </Text>
        )}

        {type === "review" && <View style={styles.divider} />}
      </View>
    );
  };
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} >
      <TouchableOpacity style={styles.overlay} onPress={() => onClose()}>
        <TouchableWithoutFeedback onPress={() => {}}>

        <View style={[styles.modalContent, { backgroundColor: type === "react" ? Color.modalTransperant : Color.modalBg }]}   >
          <View style={styles.header}>
            <Text style={styles.headerText}></Text>
            <Text style={styles.headerText}>
              {headaing}
            </Text>
            <TouchableOpacity onPress={() => onClose()}>
              <Image
                source={imageIndex.closeimg}
                style={{ height: 24, width: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {type === "react" &&
            <TouchableOpacity style={styles.rankingContainer}  >
              {/* <RankingCard ranked={ranking_react} /> */}
              
                <RankingWithInfo
      score={ranking_react}
      title={"Friend Score"}
      description={
      
          // ? "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
         "This score shows the rating from your friend for this title."
      }
    />
              <Text style={{ fontSize: 12, color: Color.whiteText, fontFamily: font.PoppinsBold, marginLeft: 12, }} >Group Score</Text>
            </TouchableOpacity>
          }


          {type === "react" && (
            <View style={{
              borderBottomWidth: 1, borderBottomColor: Color.whiteText,
              marginTop: 10, marginBottom: 6,
            }} />
          )}

          {reviews?.length === 0 && (
            <Text style={styles.emptyText}>
              No reactions for this video yet.
            </Text>
          )}

          <FlatList
            data={reviews}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews

          />



        </View>
        </TouchableWithoutFeedback>

        {/* <View style={[ styles.closeBtnContainer, { backgroundColor: type === "react" ? Color.modalTransperant : Color.modalBg }]} >
         <TouchableOpacity style={[styles.closeBtnBox,{ backgroundColor: type === "react" ? Color.modalTransperant : Color.modalBg } ]} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                      </TouchableOpacity>
        </View> */}



      </TouchableOpacity>

    </Modal>
  );
};
export default FriendthinkModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    // paddingBottom:60,
  },
  modalContent: {
    backgroundColor: Color.modalTransperant,
    borderTopRightRadius: 16, borderTopLeftRadius: 16,
    // borderRadius: 16,
    padding: 16,
    // flex: 2,
     maxHeight:Dimensions.get('window').height * 0.66,
    minHeight:Dimensions.get('window').height * 0.66,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    // fontWeight: '700',
    fontFamily:font.PoppinsBold,
    lineHeight:22,
    color: Color.whiteText,
  },
  reviewContainer: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  // avatar: {
  //   width: 60,
  //   height: 60,
  //   borderRadius: 60,
  //   marginRight: 12,
  // },
  info: {
    flex: 1,
  },
  name: {
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    fontSize: 14,
    marginLeft: 5,
  },
  rankText: {
    // fontWeight: '400',
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    fontSize: 16
  },
  date: {
    fontSize: 14,
    color: Color.whiteText,
    marginTop: 2,
    fontWeight: "400"
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontWeight: '600',
    fontSize: 13,
    color: Color.whiteText,
  },
  message: {
    color: Color.whiteText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 15
  },
  seeMore: {
    color: Color.whiteText,
    fontSize: 12,
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: '#333',
  },
  rankingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    // backgroundColor:'red',
    // marginRight: SPACING / 2,
  },

  closeText: {
    fontSize: 16,
    color: Color.lightGrayText,
    fontFamily: font.PoppinsRegular,

  },
  reviewStyle: {
    backgroundColor: Color.modalBg
  },
  modalReactStyle: {

    backgroundColor: 'rgba(35, 35, 35, 0.5)',
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    // position: 'relative',
  },
  avatar: {
    width: 50,  // adjust as needed
    height: 50, // adjust as needed
    borderRadius: 25, // half of width/height to make it circular
    marginRight: 12,

  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 24,
    height: 24,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',

  },
  thumpstyle: {
    height: 12,
    width: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  closeBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width * 1,
    backgroundColor: Color.modalTransperant,
  },
  closeBtnBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Color.placeHolder,
    paddingHorizontal: 35,
    paddingVertical: 10,
    marginBottom: 30,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: Color.whiteText,
    fontSize: 14,
    marginVertical: 20,
    fontFamily: font.PoppinsMedium,
  },
});