import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions, TextInput, Keyboard } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import FastImage from 'react-native-fast-image';
import { postComment } from '@redux/Api/commentService';
import { fileLogger } from '@utils/FileLogger';
import CustomText from '@components/common/CustomText/CustomText';
import CustomReviewInput from '@components/common/inputField/CustomReviewInput';
import { t } from 'i18next';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  movieTitle: string;
  movieYear: string;
  poster: string;
  imdb_id: string;
  token: string;
  setFeedbackVisible?: (visible: boolean) => void;
  onSubmit: (
    preference: 'love' | 'like' | 'dislike',
  ) => void;

  onOpenSecondModal?: () => void;
  isLoading?: boolean;
  // check_has_rated?:boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  // onLovedIt,
  // onOkay,
  // onDidntLike,
  movieTitle,
  movieYear,
  poster,
  imdb_id,
  onSubmit,
  token,
  selectedMovie,
  setFeedbackVisible,
  onOpenSecondModal,
  // check_has_rated,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const modalContentAnim = useRef(new Animated.Value(-screenWidth)).current;
  const actionsContainerAnim = useRef(new Animated.Value(-screenWidth)).current;
  const [lovedImge, setlovedImge] = useState(false);
  const [itsokImge, setItsokImge] = useState(false);
  const [notLike, setNotLike] = useState(false);


  // const [preference, setPreference] = useState<'love' | 'like' | 'dislike' | null>(null);
  // const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>('');
  const [modalMarginTop, setModalMarginTop] = useState(70); // default marginTop
  const [text, setText] = useState(""); // input value track karne ke liye
  const [preference, setPreference] = useState<'love' | 'like' | 'dislike' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [preferenceMsg, setPreferenceMsg] = useState<boolean>(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setModalMarginTop(-110)
    } // Adjust marginTop when keyboard is shown
    );// Adjust marginTop when keyboard is shown})

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setModalMarginTop(90)
    } // Reset marginTop when keyboard is hidden
    );// Reset marginTop when keyboard is hidden})  

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    }
  }, [])

  useEffect(() => {
    if (visible) {
      setSelectedOption(null);
      setShowFeedback(false);
      setlovedImge(false);
      setItsokImge(false);
      setNotLike(false);

      Animated.parallel([
        Animated.timing(modalContentAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(actionsContainerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalContentAnim.setValue(-screenWidth);
      actionsContainerAnim.setValue(-screenWidth);
    }
  }, [visible]);



  // Loved it
  const handleLovedIt = useCallback(() => {
    fileLogger.info('User selected: Love It');
    setPreference('love');
    setSelectedOption('lovedIt');
    setShowFeedback(true);
  }, []);

  // Okay
  const handleOkay = useCallback(() => {
    fileLogger.info('User selected: It Was Okay');
    setPreference('like');
    setSelectedOption('okay');
    setShowFeedback(true);
  }, []);

  // Didn't like
  const handleDidntLike = useCallback(() => {
    fileLogger.info('User selected: Didnt Like It');
    setPreference('dislike');
    setSelectedOption('notLike');
    setShowFeedback(true);
  }, []);








  const handleCloseRating = () => {
    // try {
    // await rollbackPairwiseDecisions(userToken, selectedImdbId);
    // Flow close kar do
    setFeedbackVisible(false); // ya navigate back
    // } catch (error) {
    // }
  };

  const nextPress = async () => {
    fileLogger.info('FeedbackModal nextPress START', {
      preference,
      hasText: !!text.trim(),
      movieTitle,
      movieYear,
      imdbId: imdb_id
    });

    Keyboard.dismiss();

    if (preference) {
      fileLogger.info('Preference selected', { preference });
      try {
        if (text.trim() !== '') {
          fileLogger.info('Posting comment', {
            movieId: selectedMovie?.imdb_id,
            textLength: text.length
          });
          //  API Call
          const response = await postComment(token, selectedMovie?.imdb_id, text);
          fileLogger.info('Comment posted successfully', { response });
        } else {
          fileLogger.info('Comment text empty, skipping post');
        }

        fileLogger.info('Calling onSubmit callback', { preference });
        // ✅ Callback & UI updates
        onSubmit(preference);

        fileLogger.info('Closing feedback modal');
        onClose();

        fileLogger.info('Opening second modal if available');
        onOpenSecondModal?.();

        fileLogger.info('Resetting text');
        setText("");

        fileLogger.info('nextPress COMPLETE - success');

      } catch (error) {
        fileLogger.error('Error in nextPress', {
          error: String(error),
          message: error?.message,
          stack: error?.stack
        });
        setFeedbackVisible(false); // Added semicolon
      }
    } else {
      fileLogger.warn('No preference selected, showing warning');
      setPreferenceMsg(true)
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback>
        <View style={styles.overlay}>
          {/* <View style={styles.modalContent}> */}
          <TouchableOpacity style={{ alignSelf: 'flex-end', right: 22, position: 'absolute', top: 55, zIndex: 777 }}
            onPress={handleCloseRating}
          >
            <Image source={imageIndex.closeCircle} style={{ height: 24, width: 24, tintColor: Color.placeHolder, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <View style={[styles.modalContent, { marginTop: modalMarginTop }]}>

            <Animated.View style={[{ transform: [{ translateX: modalContentAnim }] }]}>

              <CustomText
                size={21}
                color={Color.whiteText}
                style={styles.heading}
                font={font.PoppinsBold}
              >
                {t("modal.howWasIt")}

              </CustomText>
            </Animated.View>

            <View style={{ width: 170 }} >
              <FastImage
                source={{
                  uri: poster?.uri,
                  priority: FastImage.priority.low,
                  cache: FastImage.cacheControl.web
                }}
                style={styles.poster}
                resizeMode={FastImage.resizeMode.stretch}
              />

              {/* <Image source={poster} style={styles.poster} resizeMode="cover" /> */}
              <CustomText
                size={16}
                color={Color.whiteText}
                style={styles.movieTitle}
                font={font.PoppinsMedium}
              >
                {movieTitle}
              </CustomText>
              <CustomText
                size={14}
                color={Color.placeHolder}
                style={styles.movieYear}
                font={font.PoppinsRegular}
              >
                {movieYear}
              </CustomText>

            </View>

            {preferenceMsg &&
              (
                <View>
                  <Text style={styles.continueAlert} >{t("errorMessage.pickOneContinue")}</Text>
                </View>
              )}



            <Animated.View style={[styles.actionsContainer, { transform: [{ translateX: actionsContainerAnim }] }]}>

              {/* Loved It */}
              <View style={styles.lovedIt}>
                <TouchableOpacity onPress={handleLovedIt}>
                  <Image
                    source={selectedOption === 'lovedIt' ? imageIndex.acrtivePlay : imageIndex.stopPlay}
                    resizeMode='contain'
                    style={styles.icon}
                  />
                </TouchableOpacity>



                <CustomText
                  size={14}
                  color={Color.lightGrayText}
                  style={[
                    styles.actionText,
                    { fontFamily: selectedOption === 'lovedIt' ? font.PoppinsBold : font.PoppinsRegular }
                  ]}
                  font={font.PoppinsRegular}
                >

                  {t("modal.loveIt")}
                </CustomText>
              </View>

              {/* It Was Okay */}
              <View style={styles.lovedIt}>
                <TouchableOpacity onPress={handleOkay}>
                  <Image
                    source={selectedOption === 'okay' ? imageIndex.modalitWasPoster : imageIndex.play}
                    resizeMode='contain'
                    style={styles.icon}
                  />
                </TouchableOpacity>


                <CustomText
                  size={14}
                  color={Color.lightGrayText}
                  style={[
                    styles.actionText,
                    { fontFamily: selectedOption === 'okay' ? font.PoppinsBold : font.PoppinsRegular }
                  ]}
                  font={font.PoppinsRegular}
                >

                  {t("modal.itWasOkay")}
                </CustomText>
              </View>

              {/* Didn't Like It */}
              <View style={styles.lovedIt}>
                <TouchableOpacity onPress={handleDidntLike}>
                  <Image
                    source={selectedOption === 'notLike' ? imageIndex.redCloseActive : imageIndex.redClose}
                    resizeMode='contain'
                    style={styles.icon}
                  />
                </TouchableOpacity>



                <CustomText
                  size={14}
                  color={Color.lightGrayText}
                  style={[
                    styles.actionText,
                    { fontFamily: selectedOption === 'notLike' ? font.PoppinsBold : font.PoppinsRegular }
                  ]}
                  font={font.PoppinsRegular}
                >

                  {t("modal.didntLikeIt")}
                </CustomText>
              </View>

            </Animated.View>


            <Animated.View style={[{ width: Dimensions.get('window').width * 0.95, marginTop: 10, transform: [{ translateX: actionsContainerAnim }] }]}>
              <TouchableOpacity style={styles.reviewConatainer} >
                <CustomReviewInput
                  placeholder={t("modal.writeReview")}
                  text={text}
                  setText={setText}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { nextPress() }}>
                <CustomText
                  size={14}
                  color={Color.primary}
                  style={styles.nextText}
                  font={font.PoppinsRegular}
                >
                  {t("common.next")}

                </CustomText>
              </TouchableOpacity>



            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FeedbackModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '85%',
    marginTop: 90,
  },
  heading: {
    color: Color.whiteText,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  poster: {
    width: 170,
    height: 240,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  movieTitle: {
  },
  movieYear: {
    marginBottom: 10,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginLeft: 22,
  },
  lovedIt: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 50,
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: Color.lightGrayText,
    marginTop: 6,
  },
  icon: { height: 40, width: 40 },
  reviewConatainer: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    // backgroundColor: Color.darkGrey,
    paddingHorizontal: 10,
    justifyContent: 'center',
    // marginTop: 20,
  },
  nextText: {
    textAlign: 'center',
    // color: Color.primary,
    // fontSize:14,
    // fontFamily: font.PoppinsRegular,
    marginTop: 22,
    lineHeight: 18,

  },
  continueAlert: {
    color: Color.yellow,
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 12,
    textAlign: 'center',
    // flex:1,
    fontFamily: font.PoppinsBold,

  },
});


