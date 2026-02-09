import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import { useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import imageIndex from '@assets/imageIndex';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { followUser, unfollowUser } from '@redux/Api/followService';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import { BASE_IMAGE_URL } from '@config/api.config';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { t } from 'i18next';
import CustomText from '@components/common/CustomText/CustomText';
import { getMembersScores } from '@redux/Api/GroupApi';

interface members {
  avatar?: string,
  following?: boolean,
  name?: string,
  username?: string,
}

interface GroupScoreModalProps {
  visible?: boolean,
  onClose?: () => void,
  heading?: string,
  groupMembers: members[],
  token: string,
}

const GroupScoreModal: React.FC<GroupScoreModalProps> = ({ visible,
  onClose,
  heading,
  token,
  imdb_id,
  groupId,
  groupScore
}) => {

  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const ProfileUserName = useSelector((state: RootState) => state.auth.userGetData?.username);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState<string | null>(null)
  const [loadingUsername, setLoadingUsername] = useState<string | null>(null);
  useEffect(() => {
    // setMembers(groupMembers)
    getMembersScrocedata()
  }, [imdb_id])

  const filteredMembers = members?.filter(member =>
    (member?.name ?? member?.username)?.toLowerCase().includes(searchText.toLowerCase())
  );
  const currentUser = filteredMembers?.find(member => member?.username === ProfileUserName);
  const otherUsers = filteredMembers?.filter(member => member?.username !== ProfileUserName);
  const toggleFollow = async (username: string) => {
    setLoadingUsername(username)
    try {

      const isFollowing = members.find(m => m?.username === username)?.following;

      // API call
      if (isFollowing) {
        await unfollowUser(token, username);
      } else {
        await followUser(token, username);
      }

      // ui update
      const updatedMembers = members.map(member =>
        member.username === username
          ? { ...member, following: !member.following }
          : member
      );

      setMembers(updatedMembers);
    } catch (err) {
    } finally {
      setLoadingUsername(null); // ✅ reset

    }
  };
  const getMembersScrocedata = async () => {
    // const imdb_id = groupRecommend[activeIndex]?.imdb_id
    //  setScoreMovieRank(movie_ranked)
    // setthinkModal(true);
    try {
      const response = await getMembersScores(token, groupId, imdb_id)
      const filteredResults = response?.results?.filter(member => member?.preference !== undefined);

      if (filteredResults) {
        setMembers(filteredResults)
        console.log(filteredResults)
      }
    } catch (error) {
      throw error
    }
  }


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {/* <CustomStatusBar  backgroundColor={'black'}  translucent={true}/> */}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} >

        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 15}
          >

            <View style={{ flex: 1 }} >
              <TouchableOpacity
                style={styles.overlayTouchable}
                activeOpacity={1}
                onPress={onClose}
              />
              <View style={styles.modalContent}>


                <View style={styles.header}>
                  <View style={{
                    height: 20,
                    width: 20,
                  }} />
                  <Text style={styles.title}>{heading || 'Group Score'}</Text>
                  <TouchableOpacity onPress={() => onClose()} >

                    <Image style={styles.closeImg} source={imageIndex.closeimg} />

                  </TouchableOpacity>

                </View>

                {/* <BlurViewCom /> */}
                <TouchableOpacity
                  style={[styles.searchContaainer, {
                    // bottom: 22,
                    // marginBottom:22
                  }]}
                  disabled
                // onPress={() => groupScoreModalFunc({ imdb_id: imdbId })}
                >
                  {/* <Image source={imageIndex.puased} style={styles.watchNowImg} /> */}

                  <RankingWithInfo
                    score={groupScore}
                    title={t("discover.groupScore")}
                    description={t("discover.recscoredes")}
                  // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                  />
                  <CustomText size={14} color={Color.whiteText} font={font.PoppinsBold} style={{ marginLeft: 5 }}>
                    {t("discover.groupScore")}
                  </CustomText>
                </TouchableOpacity>
                {/* <View style={styles.searchContaainer} >
                  <Image source={imageIndex.search} resizeMode='contain' style={{ height: 20, width: 20, marginRight: 6, }} />
                  <TextInput
                    placeholder="Search members"
                    placeholderTextColor={Color.placeHolder}
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                  <TouchableOpacity onPress={() => setSearchText('')} >
                    {searchText.length > 0 && <Image source={imageIndex.closeimg} resizeMode='contain' style={{ height: 18, width: 18, }} />}

                  </TouchableOpacity>
                </View> */}
                <View style={{ height: 1, backgroundColor: '#fff', marginBottom: 15 }}></View>
                <View style={styles.listContainer}>

                  {currentUser && (
                    <View style={styles.memberItem}>
                      <View style={{ marginRight: 12 }}>
                        <View style={styles.avatarContainer}>
                          {/* <Image source={{ uri: `${BASE_IMAGE_URL}${currentUser?.avatar}` }} style={styles.avatar} /> */}
                          <FastImage
                            style={styles.avatar}
                            source={{
                              uri: `${BASE_IMAGE_URL}${currentUser?.avatar}`,
                              priority: FastImage.priority.low, // 👈 Low priority (since profile image small)
                              cache: FastImage.cacheControl.web // 👈 Cache permanently
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                          {currentUser?.preference &&
                            <View style={[styles.onlineIndicator, { backgroundColor: currentUser?.preference == 'dislike' ? '#CA462A' : '#35C75A' }]}>
                              <Image source={currentUser?.preference == 'dislike' ? imageIndex.disLike : imageIndex.like} style={{ height: 16, width: 16 }} />
                            </View>
                          }
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>You</Text>
                        {/* <Text style={styles.memberName}>{c?.name ? item?.name : item?.username}</Text> */}
                        {currentUser?.is_admin && <Text style={[styles.memberName, { color: 'grey' }]}>{"(Group Owner)"}</Text>
                        }
                      </View>
                      <RankingWithInfo
                        score={currentUser?.rec_score ?? '?'}
                        title={t("discover.recscore")}
                        description={t("discover.recscoredes")}
                      // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                      />
                    </View>
                  )}

                  {otherUsers?.length > 0 ? (
                    <FlatList
                      data={otherUsers}
                      keyExtractor={(item) => item.username}
                      renderItem={({ item }) => {

                        return (
                          <View style={styles.memberItem}>
                            <TouchableOpacity
                              style={{ marginRight: 12 }}
                              onPress={() => navigation.navigate(ScreenNameEnum.OtherProfile)}
                            >
                              <View style={styles.avatarContainer}>

                                {/* <Image source={{ uri: `${BASE_IMAGE_URL}${item.avatar}` }} style={styles.avatar} /> */}

                                <FastImage
                                  style={styles.avatar}
                                  source={{
                                    uri: `${BASE_IMAGE_URL}${item?.avatar}`,
                                    priority: FastImage.priority.low, // 👈 Low priority (since profile image small)
                                    cache: FastImage.cacheControl.web // 👈 Cache permanently
                                  }}
                                  resizeMode={FastImage.resizeMode.stretch}
                                />
                                {item?.preference &&
                                  <View style={[styles.onlineIndicator, { backgroundColor: item?.preference == 'dislike' ? '#CA462A' : '#35C75A' }]}>
                                    <Image source={item?.preference == 'dislike' ? imageIndex.disLike : imageIndex.like} style={{ height: 16, width: 16 }} />
                                  </View>
                                }
                                {/* {item?.preference && <View style={styles.onlineIndicator} />} */}
                              </View>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.memberName}>{item?.name ? item?.name : item?.username}</Text>
                              {item?.is_admin && <Text style={[styles.memberName, { color: 'grey' }]}>{"(Group Owner)"}</Text>
                              }
                            </View>





                            <RankingWithInfo
                              score={item?.rec_score ?? '?'}
                              title={t("discover.groupScore")}
                              description={t("discover.recscoredes")}
                            // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                            />


                          </View>
                        )
                      }}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={false}
                      initialNumToRender={8}
                      maxToRenderPerBatch={10}
                      windowSize={8}
                      removeClippedSubviews

                    />
                  ) : (
                    <View style={styles.noResultContainer}>
                      <Text style={styles.noResultText}>No user found</Text>
                    </View>
                  )}
                </View>


              </View>
            </View>
          </KeyboardAvoidingView>

        </View>
      </TouchableWithoutFeedback>

    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8 )',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'rgba(37, 37, 37, 0.9)',
    borderTopRightRadius: 22,
    borderTopLeftRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 30,
    flex: 1.8,  // ✅ use flex instead of maxHeight
    maxHeight: Dimensions.get('window').height * 0.7,
    minHeight: Dimensions.get('window').height * 0.7,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    // backgroundColor:'red'

    // flex:1,
  },

  searchContaainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: Color.grey,
    height: 50,
    // borderWidth: 1,
    // borderColor: Color.placeHolder,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginVertical: 14,
    alignSelf: 'center'
  },
  searchInput: {
    // height: 30,
    width: "85%",
    color: Color.whiteText,
    fontFamily: font.PoppinsRegular,
  },
  title: {
    fontSize: 16,
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    textAlign: 'center',
    flex: 1,
  },
  closeImg: {
    height: 20,
    width: 20,
    alignSelf: "flex-start"
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingBottom: 60,

  },
  memberItem: {

    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  memberName: {
    // flex: 1,
    fontSize: 14,
    color: Color.whiteText,
    fontFamily: font.PoppinsRegular,
  },

  followingButtonText: {
    fontSize: 12,
    color: Color.textGray, // Change text color when following
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    right: -8,
    top: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#35C75A',
    alignItems: 'center',
    justifyContent: 'center'
    // borderWidth: 2.5,
    // borderColor: Color.background,
  },

  noResultContainer: {
    height: Dimensions.get('window').height * 0.3,

    paddingVertical: 20,
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 16,
    color: Color.lightGrayText,
    fontFamily: font.PoppinsRegular,
  },
  followprimary: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Color.primary,
    borderRadius: 8,
    width: 116,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  followingprimary: {
    backgroundColor: Color.background,
    borderColor: Color.whiteText,
    borderWidth: 0.5,
  },
  // followText: { color: Color.whiteText,
  //    fontSize: 14,
  //     lineHeight:16,
  //      fontFamily:font.PoppinsBold },

  followingText: {
    color: Color.whiteText,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: font.PoppinsRegular
  },


  followButton: {
    backgroundColor: Color.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: 104,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: Color.darkGrey,
    borderRadius: 8,
    borderColor: Color.whiteText,
    borderWidth: 0.5
  },
  followText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    fontSize: 12,

    lineHeight: 16,
  },







});

export default GroupScoreModal;