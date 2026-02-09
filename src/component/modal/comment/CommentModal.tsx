
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Keyboard, KeyboardAvoidingView, Platform,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { TextInput } from 'react-native-gesture-handler';
import { getCommentsByMovie, postComment } from '@redux/Api/commentService';
import FastImage from 'react-native-fast-image';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { BASE_IMAGE_URL } from '@config/api.config';
import ShimmerReviewItem from '@components/common/ShimmerReviewItem/ShimmerReviewItem';
import { t } from 'i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
  reviews: string[];
  heading: string;
  token: string;
  imdb_id: string;
  rec_scoreComm?: number | string;
  showCommenRankingCheck?: () => void;
  has_rated_movie?: boolean;
  // commetText?:string;
  // setCommentText: (value: string) => void;

}

const CommentModal: React.FC<Props> = ({ visible, onClose, reviews,
  heading, token, imdb_id,
  rec_scoreComm, showCommenRankingCheck, has_rated_movie }) => {
  const navigation = useNavigation();
  let has_rated_movie_Ref = useRef(has_rated_movie)
  useEffect(() => {
    has_rated_movie_Ref.current = has_rated_movie;
  }, [has_rated_movie]);
  const [commetText, setCommentText] = useState('')
  const userData1 = useSelector((state: RootState) => state.auth.userGetData);
  const userData = useSelector((state: RootState) => state.auth?.userGetData);
  const [hasCommented, setHasCommented] = useState(false);

  // const avatarUrl = useMemo(() => `${BASE_IMAGE_URL}${userData?.avatar}?t=${Date.now()}`, [userData]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [usernameCom, setUsernameCom] = useState('')
  const checkMyCommRef = useRef(false)
  const isMyCommnetRef = useRef(false)
  const isMyCommnetCheck_Ref = useRef(false)
  const [page, setPage] = useState(1);       // Current page number
  const [hasMore, setHasMore] = useState(true); // Are there more comments to fetch
  const [loadingMore, setLoadingMore] = useState(false); // For lazy loading indicator
  const PAGE_SIZE = 20; // batch size per API call
  const [commmetLoad, setCommmetLoad] = useState<boolean>(false);

  // const [commetText, setCommentText] = useState('')

  const userprofile = useSelector(
    (state: RootState) => state.auth.userGetData?.username,
    shallowEqual
  );
  const lastFetchedImdbRef = useRef<string | null>(null);
  // const userData = useSelector((state: RootState) => state.auth.userGetData);
  // const userprofile = useSelector((state: RootState) => state. auth.userGetData?.username);
  // useEffect(() => {
  //   setUsernameCom(userprofile)
  // }, [imdb_id]);

  // useEffect(() => {
  //   if (visible) {

  //     setPage(1);
  //     setHasMore(true);
  //     fetchComments(1); // fetch first page
  //   }
  // }, [visible, imdb_id]);

  // new states
  // const currentUser = userprofile; // Example

  const normalizeComment = (c, idx: number) => ({
    ...c,
    id: c.id || c._id || c.comment_id || `local-${idx}-${c.user?.name}`,
    replies: Array.isArray(c.replies) ? c.replies : []
  });

  const [comments, setComments] = useState(
    () => (reviews || []).map((r, i) => normalizeComment(r, i))
  );

  // sync when modal opens / reviews change
  useEffect(() => {
    if (visible && reviews && comments.length === 0) {
      // setCommentText('')
      setComments((reviews || []).map((r, i) => normalizeComment(r, i)));
    }
  }, [visible, reviews]);

  useEffect(() => {
    if (visible) {
      setPage(1);
      setHasMore(true);
      fetchComments(1); // fetch first page
    }
  }, [visible, imdb_id]);



  const fetchComments = async (nextPage = 1) => {
    // if (!imdb_id || loadingMore || !hasMore) return;
    if (!imdb_id) return;

    setLoadingMore(true);
    setCommmetLoad(true)
    try {
      // API call with pagination params
      const data = await getCommentsByMovie(token, imdb_id, nextPage, PAGE_SIZE);


      // Normalize comment structure
      const mapped = (data.results || []).map((c, idx) => ({
        ...c,
        id: c.id || c._id || c.comment_id || `local-${nextPage}-${idx}-${c.user?.username}`,
        replies: c.replies || [],
      }));

      // Set comments: replace if first page, append otherwise
      setComments(prev => nextPage === 1 ? mapped : [...prev, ...mapped]);
      if (nextPage === 1) {
        isMyCommnetRef.current = data?.has_commented;
      };


      if (nextPage === 1) {
        // check karo kya mera comment list me hai
        const myComment = (data.results || []).find(
          c => c.user?.username === userData?.username
        );

        if (myComment) {
          isMyCommnetCheck_Ref.current = true;
          setHasCommented(true);        // UI ke liye
          setCommentText(myComment.comment); // agar edit karna ho to textInput me show ho
        } else {
          isMyCommnetCheck_Ref.current = false;
          setHasCommented(false);
        }
      }
      // Check if there are more pages - null-safe access
      setHasMore((data?.results?.length ?? 0) === PAGE_SIZE);

      // Increment page number
      setPage(nextPage + 1);


    } catch (e) {
    } finally {
      setCommmetLoad(false)
      setLoadingMore(false);
      setCommentText('')
    }
  };

  const handlePostComment = async (text_Touch?: boolean) => {
    if (!has_rated_movie_Ref.current) {
      showCommenRankingCheck()
      // text_Touch_ref.current  = true
      return
    }
    const trimmedComment = commetText.trim();
    if (!trimmedComment) return;



    const newComment = {
      comment: trimmedComment,
      date: "Today",
      user: {
        name: userData?.name,
        username: userData?.username,
        avatar: userData?.avatar,
      },
      rec_score: rec_scoreComm || 0,
      isLocal: true,
      replies: [],
    };

    setComments(prev => {
      // // Find if current user already has a comment
      // const userIndex = prev.findIndex(
      //   (c) => c.user?.username === userData?.username
      // );
      let userIndex = -1;

      if (userData?.username) {
        userIndex = prev.findIndex(c => c.user?.username === userData.username);
      }

      if (userIndex === -1 && isMyCommnetRef.current) {
        const updated = [...prev];
        // has_rated_movie_Ref.current = 
        updated[0] = {
          ...updated[0],
          comment: trimmedComment,
          date: "Today",
          rec_score: rec_scoreComm || updated[0].rec_score,
        };
        return updated;
      };

      if (userIndex !== -1) {
        // 1️ Update existing comment
        const updated = [...prev];
        updated[userIndex] = {
          ...updated[userIndex],
          comment: trimmedComment,
          date: "Today",
          rec_score: rec_scoreComm || updated[userIndex].rec_score,
        };
        isMyCommnetRef.current = true;
        return updated;
      }

      // 2️⃣ No comments yet → add new comment
      if (prev.length === 0) {
        isMyCommnetRef.current = true;
        return [newComment];
      }

      // 3️⃣ Other comments exist → add user's comment at top
      isMyCommnetRef.current = true;
      return [newComment, ...prev];
    });

    // Clear input
    setCommentText("");

    try {
      await postComment(token, imdb_id, trimmedComment);

    } catch (e) {
    } finally {
      has_rated_movie_Ref.current = true
    }
  };


  useEffect(() => {

    setCommentText('')
    setComments([])
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [imdb_id]);

  const renderItem = useCallback(
    ({ item, index }: { item; index: number }) => {
      // ✅ check karo ki mera comment hai kya aur 0 index par hai kya
      const isMyTopComment =
        index === 0 && item.user?.username === userData?.username;

      const scoreType = isMyTopComment ? "Rec" : "Friend";

      return (
        <View style={styles.reviewContainer}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              // onClose();
              // navigation.navigate(ScreenNameEnum.OtherProfile);
            }}
          >
            <TouchableOpacity
              onPress={() => {

                navigation.navigate(ScreenNameEnum.OtherProfile);
              }}
            >
              {/* <Image
            source={{ uri: `${BASE_IMAGE_URL}${item?.user?.avatar}` }}
            style={styles.avatar}
          /> */}

              <FastImage
                style={styles.avatar}
                source={{
                  uri: `${BASE_IMAGE_URL}${item?.user?.avatar}`,
                  priority: FastImage.priority.low, // 👈 Low priority (since profile image small)
                  cache: FastImage.cacheControl.web // 👈 Cache permanently
                }}
                resizeMode={FastImage.resizeMode.cover}
              />

            </TouchableOpacity>
            <View style={styles.info}>
              <TouchableOpacity
                onPress={() => {

                  navigation.navigate(ScreenNameEnum.OtherProfile);
                }}
              >
                <Text style={styles.name}>{item.user?.name}
                  <Text style={{ marginLeft: 18, fontSize: 16, fontFamily: font.PoppinsRegular }}>{t("profile.ranked")}</Text>

                </Text>
              </TouchableOpacity>
              {/* <Text style={styles.date}>{timeAgo(item?.created_date)}</Text> */}
              <Text style={styles.date}>{item?.date}</Text>
            </View>
            {/* <RankingCard ranked={item?.rec_score} /> */}
            <RankingWithInfo
              score={item?.rec_score}
              title={scoreType === "Rec" ? "Rec Score" : "Friend Score"}
              description={
                scoreType === "Rec"
                  ? t("discover.recscoredes")
                  : t("discover.frienddes")
                // ? "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                // : "This score shows the rating from your friend for this title."
              }
            />
          </TouchableOpacity>

          <Text numberOfLines={4} style={styles.message}>
            {item?.comment}
            {item.comment.length > 110 && (
              <Text style={styles.seeMore}>{t("common.seeMore")}</Text>
            )}
          </Text>
          <View style={styles.divider} />
        </View>
      );
    },
    [imdb_id, comments, userData?.username]
  );
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>

            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={[
                  styles.modalContent,
                  // {
                  //   maxHeight: isKeyboardVisible
                  //     ? Dimensions.get('window').height * 0.43
                  //     : Dimensions.get('window').height * 0.66
                  //                     },
                ]}
              >
                {/*  Header */}
                <View style={styles.header}>
                  <Text style={styles.headerText}>{heading}</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Image
                      source={imageIndex.closeimg}
                      style={{ height: 24, width: 24 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                {/*  Comment List */}
                {/* {   commmetLoad ? <ActivityIndicator size={'large'} color={Color.primary} /> : */}
                {commmetLoad ? <View style={{ flex: 1, }} >
                  {[1, 2]?.map(i => (
                    <ShimmerReviewItem key={i} />
                  ))}
                </View> :

                  !commmetLoad && comments.length === 0 ? (
                    <Text style={styles.emptyText}>{t("emptyState.noReviews")}</Text>
                  ) : (
                    <FlatList
                      data={comments}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={renderItem}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.listContent}
                      initialNumToRender={5}
                      maxToRenderPerBatch={8}
                      windowSize={7}
                      onEndReached={() => {
                        if (!loadingMore && hasMore) fetchComments(page)
                      }}
                      onEndReachedThreshold={0.5}
                      ListFooterComponent={
                        loadingMore ? <ActivityIndicator color={Color.primary} /> : null
                      }
                      removeClippedSubviews

                    />
                  )}
                <View style={styles.inputContainer}>
                  <TextInput
                    allowFontScaling={false}
                    placeholder={hasCommented ? t("common.editYour") : t("common.submitReview")}
                    placeholderTextColor={Color.placeHolder}
                    style={styles.input}
                    value={commetText}
                    onPress={() => { if (!has_rated_movie) handlePostComment() }}

                    onChangeText={setCommentText}
                  />

                  <TouchableOpacity style={styles.postButton}

                    // onPress={}
                    onPress={handlePostComment}

                  >
                    <Image
                      style={[
                        styles.postImage,
                        {
                          tintColor: commetText.trim()
                            ? Color.primary
                            : Color.placeHolder,
                        },
                      ]}
                      source={
                        commetText.trim()
                          ? imageIndex.sendComment
                          : imageIndex.commnet
                      }
                    />
                  </TouchableOpacity>
                  {/* </View> */}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
export default memo(CommentModal);
// export default CommentModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Color.modalBg,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    paddingTop: 16,
    maxHeight:
      Dimensions.get('window').height *
      (Platform.OS === 'ios' ? 0.63 : 0.58),

    // maxHeight: Dimensions.get('window').height * 0.63,
    height: Dimensions.get('window').height * 0.66,
    // maxHeight: Dimensions.get('window').height * 0.66,
    // minHeight: Dimensions.get('window').height * 0.66,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 18,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
    textAlign: 'center',
    flex: 1,
    marginLeft: 16,
  },
  reviewContainer: {
    marginBottom: 14,
    paddingHorizontal: 16,

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    fontSize: 16,
    marginRight: 10,
  },
  date: {
    fontSize: 14,
    color: Color.placeHolder,
    marginTop: 2,
    fontFamily: font.PoppinsRegular,
  },
  message: {
    color: Color.whiteText,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 10,
    fontFamily: font.PoppinsRegular,
  },
  seeMore: {
    color: Color.whiteText,
    fontSize: 12,
  },
  divider: {
    marginTop: 12,
    height: 1,
    backgroundColor: '#333',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyText: {
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1,
    color: Color.lightGrayText,
    fontSize: 14,
    marginVertical: 20,
    paddingHorizontal: 16,

    fontFamily: font.PoppinsMedium,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    maxHeight: 50,
    minHeight: 50,

    backgroundColor: Color.grey,
    // paddingVertical: 12,
    paddingHorizontal: 16,
    bottom: 0,
  },
  input: {
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    lineHeight: 24,
    maxHeight: 50,
    // backgroundColor:'red',
    paddingBottom: 4,
    minHeight: 50,
    width: '85%',

    // flex: 1,
  },
  postButton: {
    paddingHorizontal: 12,
    // paddingVertical: 6,
    //   backgroundColor: Color.primary,
    borderRadius: 8,
  },

  postImage: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  }
});




export const timeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // in seconds

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;

  return past.toLocaleDateString(); // fallback for old date
};