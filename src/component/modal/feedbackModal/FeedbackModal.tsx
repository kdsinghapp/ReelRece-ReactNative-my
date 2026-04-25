import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Keyboard,
  Easing,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import FastImage from 'react-native-fast-image';
import { Grayscale } from 'react-native-color-matrix-image-filters';
import LinearGradient from 'react-native-linear-gradient';
import { postComment } from '@redux/Api/commentService';
import { fileLogger } from '@utils/FileLogger';
import CustomText from '@components/common/CustomText/CustomText';
import CustomReviewInput from '@components/common/inputField/CustomReviewInput';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { t } from 'i18next';
import { wp } from '@utils/Constant';
import ButtonCustom from '@components/common/button/ButtonCustom';

export interface MovieForComparison {
  title: string;
  year: string;
  poster: { uri: string };
  rating?: string;
  imdb_id?: string;
}

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  movieTitle: string;
  movieYear: string;
  poster: { uri?: string };
  imdb_id: string;
  token: string;
  setFeedbackVisible?: (visible: boolean) => void;
  onSubmit: (preference: 'love' | 'like' | 'dislike') => void;
  onOpenSecondModal?: () => void;
  isLoading?: boolean;
  selectedMovie?: { imdb_id?: string;[key: string]: unknown };
  /** When 'comparison', show "Which do you prefer?" instead of "How was it?". Omit or 'feedback' for original behavior. */
  step?: 'feedback' | 'comparison';
  /** Called when user adds a review in the feedback step so parent can update comment count in real time. */
  onReviewAdded?: (imdb_id: string) => void;
  // Comparison step props (used when step === 'comparison')
  firstMovie?: MovieForComparison;
  secondMovie?: MovieForComparison;
  onSelectFirst?: () => void;
  onSelectSecond?: (movie: MovieForComparison) => void;
  onSkipSelect?: () => void;
  handleCloseRating?: () => void;
  comparisonMovies?: MovieForComparison[];
  isOnboarding?: boolean;
  hasComparisonsAvailable?: (pref: 'love' | 'like' | 'dislike') => boolean;
  initialPreference?: 'love' | 'like' | 'dislike' | null;
}


const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  movieTitle,
  movieYear,
  poster,
  imdb_id,
  onSubmit,
  token,
  selectedMovie,
  setFeedbackVisible,
  onOpenSecondModal,
  isLoading = false,
  step = 'feedback',
  onReviewAdded,
  firstMovie,
  secondMovie,
  onSelectFirst,
  onSelectSecond,
  onSkipSelect,
  handleCloseRating: handleCloseRatingProp,
  comparisonMovies = [],
  isOnboarding = false,
  hasComparisonsAvailable,
  initialPreference,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const modalContentAnim = useRef(new Animated.Value(-screenWidth)).current;
  const actionsContainerAnim = useRef(new Animated.Value(-screenWidth)).current;
  const centerPosterSlideAnim = useRef(new Animated.Value(0)).current;
  const [lovedImge, setlovedImge] = useState(false);
  const [itsokImge, setItsokImge] = useState(false);
  const [notLike, setNotLike] = useState(false);

  const [text, setText] = useState('');
  const [preference, setPreference] = useState<'love' | 'like' | 'dislike' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [preferenceMsg, setPreferenceMsg] = useState<boolean>(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Comparison: first image = main movie only (never change on select). Second = comparison candidates.
  const rightCardAnim = useRef(new Animated.Value(0)).current;
  const firstImageSlide = useRef(new Animated.Value(0)).current;
  const comparisonHeadingAnim = useRef(new Animated.Value(0)).current;
  const rightCardSlideInDoneRef = useRef(false);
  const [comparisonSelected, setComparisonSelected] = useState<'first' | 'second' | null>(null);
  const [leftMovie, setLeftMovie] = useState<MovieForComparison | undefined>(firstMovie);
  const [rightMovie, setRightMovie] = useState<MovieForComparison | undefined>(secondMovie);
  const reviewInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (showFeedback && visible && reviewInputRef.current) {
      const timer = setTimeout(() => {
        reviewInputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, visible]);

  useEffect(() => {
    if (!visible) {
      reviewInputRef.current?.blur();
      Keyboard.dismiss();
    } else {
      const keyboardShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        () => {
          setIsKeyboardVisible(true);
          if (showFeedback) {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      );
      const keyboardHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setIsKeyboardVisible(false);
        }
      );
      return () => {
        keyboardShowListener.remove();
        keyboardHideListener.remove();
      };
    }
  }, [visible, showFeedback]);

  const runRightCardSlideIn = useCallback(() => {
    rightCardAnim.setValue(screenWidth * 0.55);
    Animated.timing(rightCardAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) rightCardAnim.setValue(0);
    });
  }, [rightCardAnim, screenWidth]);

  const leftPosterSource = useMemo(
    () =>
      leftMovie?.poster?.uri
        ? { uri: leftMovie.poster.uri, priority: FastImage.priority.high, cache: FastImage.cacheControl.immutable }
        : null,
    [leftMovie?.poster?.uri]
  );

  useEffect(() => {
    if (secondMovie) setRightMovie(secondMovie);
  }, [secondMovie]);

  // Fallback: if FastImage onLoad doesn't fire (cached/slow), still slide in right card so it shows first time
  useEffect(() => {
    if (!visible || step !== 'comparison' || !rightMovie) return;
    const fallbackTimer = setTimeout(() => {
      if (!rightCardSlideInDoneRef.current) {
        rightCardSlideInDoneRef.current = true;
        runRightCardSlideIn();
      }
    }, 200);
    return () => clearTimeout(fallbackTimer);
  }, [visible, step, rightMovie, runRightCardSlideIn]);

  // Second card slides out to the right, then new card in from right. Don't wait for onAfterSlideOut (API) so slide-in feels instant.
  const slideAndResetImages = useCallback(
    (onAfterSlideOut: () => void | Promise<void>, onAfterSlideIn?: () => void) => {
      Animated.timing(rightCardAnim, {
        toValue: screenWidth,
        duration: 380,
        useNativeDriver: true,
      }).start(() => {
        setComparisonSelected(null);
        rightCardAnim.setValue(screenWidth);
        const result = onAfterSlideOut?.();
        if (result && typeof (result as Promise<unknown>)?.then === 'function') {
          (result as Promise<unknown>).catch(() => { });
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            Animated.timing(rightCardAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
              rightCardAnim.setValue(0);
              onAfterSlideIn?.();
            });
          });
        });
      });
    },
    [rightCardAnim, screenWidth]
  );

  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
  //     // setModalMarginTop(-110);
  //     setModalMarginTop(10);
  //   });
  //   const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
  //     setModalMarginTop(90);
  //   });
  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);

  // Keyboard related logic removed in favor of KeyboardAvoidingView
  useEffect(() => {
    if (visible) {
      if (initialPreference) {
        setPreference(initialPreference);
        setSelectedOption(initialPreference === 'love' ? 'lovedIt' : initialPreference === 'like' ? 'okay' : 'notLike');
        setShowFeedback(true);
      } else {
        setSelectedOption(null);
        setPreference(null);
        setShowFeedback(false);
      }
      setlovedImge(false);
      setItsokImge(false);
      setNotLike(false);
      setComparisonSelected(null);
      if (firstMovie) setLeftMovie(firstMovie);
      else if (poster && movieTitle != null) {
        const uri = typeof poster === 'object' ? poster?.uri : poster;
        if (uri) setLeftMovie({ title: movieTitle, year: String(movieYear ?? ''), poster: { uri }, imdb_id });
      }
      if (secondMovie) setRightMovie(secondMovie);
      if (step === 'comparison') {
        firstImageSlide.setValue(0);
        rightCardSlideInDoneRef.current = false;
        comparisonHeadingAnim.setValue(screenWidth * 0.25);
        Animated.timing(comparisonHeadingAnim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
        rightCardAnim.setValue(screenWidth * 0.55);
      } else {
        rightCardSlideInDoneRef.current = false;
        centerPosterSlideAnim.setValue(0);
        Animated.parallel([
          Animated.timing(modalContentAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(actionsContainerAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    } else {
      rightCardSlideInDoneRef.current = false;
      comparisonHeadingAnim.setValue(0);
      centerPosterSlideAnim.setValue(0);
      firstImageSlide.setValue(0);
      modalContentAnim.setValue(-screenWidth);
      actionsContainerAnim.setValue(-screenWidth);
    }
  }, [visible, step]);

  // Loved it
  const handleLovedIt = () => {
    fileLogger.info('User selected: Love It');
    setPreference('love');
    setSelectedOption('lovedIt');
    if (isOnboarding) {
      nextPress('love');
    } else {
      setShowFeedback(true);
    }
  };

  // Okay
  const handleOkay = () => {
    fileLogger.info('User selected: It Was Okay');
    setPreference('like');
    setSelectedOption('okay');
    if (isOnboarding) {
      nextPress('like');
    } else {
      setShowFeedback(true);
    }
  };

  // Didn't like
  const handleDidntLike = () => {
    fileLogger.info('User selected: Didnt Like It');
    setPreference('dislike');
    setSelectedOption('notLike');
    if (isOnboarding) {
      nextPress('dislike');
    } else {
      setShowFeedback(true);
    }
  };

  const handleCloseRating = useCallback(() => {
    if (step === 'comparison' && handleCloseRatingProp) {
      handleCloseRatingProp();
    } else {
      onClose();
    }
  }, [step, handleCloseRatingProp, onClose]);

  const nextPress = (selectedPref?: 'love' | 'like' | 'dislike') => {
    const activePref = selectedPref || preference;

    fileLogger.info('FeedbackModal nextPress START', {
      preference: activePref,
      hasText: !!text.trim(),
      movieTitle,
      movieYear,
      imdbId: imdb_id
    });

    Keyboard.dismiss();

    if (!activePref) {
      setPreferenceMsg(true);
      return;
    }

    const runAsync = async () => {
      try {
        if (text.trim() !== '' && selectedMovie?.imdb_id) {
          fileLogger.info('Posting comment', { movieId: selectedMovie.imdb_id, textLength: text.length });
          const response = await postComment(token, selectedMovie.imdb_id, text);
          fileLogger.info('Comment posted successfully', { response });
          onReviewAdded?.(selectedMovie.imdb_id);
        }
        setText('');
        fileLogger.info('Calling onSubmit callback', { preference: activePref });
        onSubmit(activePref);
        fileLogger.info('nextPress COMPLETE - success');
      } catch (error: unknown) {
        const err = error as { message?: string; stack?: string };
        fileLogger.error('Error in nextPress', { error: String(error), message: err?.message, stack: err?.stack });
        setFeedbackVisible?.(false);
      }
    };

    const hasComparisons = hasComparisonsAvailable?.(activePref) ?? true;

    if (!hasComparisons) {
      setTimeout(() => {
        runAsync();
      }, 200);
      return;
    }

    const CENTER_TO_LEFT_DURATION = 480;
    const comparisonLeftEdge = 14;
    const posterWidth = wp(45);
    const centerPosterLeftEdge = screenWidth / 2 - posterWidth / 2;
    const slideToX = comparisonLeftEdge - centerPosterLeftEdge;

    Animated.parallel([
      Animated.timing(centerPosterSlideAnim, {
        toValue: slideToX,
        duration: CENTER_TO_LEFT_DURATION,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(modalContentAnim, {
        toValue: -screenWidth,
        duration: CENTER_TO_LEFT_DURATION,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(actionsContainerAnim, {
        toValue: -screenWidth,
        duration: CENTER_TO_LEFT_DURATION,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(({ finished }) => {
      if (finished) runAsync();
    });
  };

  const lastStepRef = useRef<'feedback' | 'comparison'>(step);
  if (visible) lastStepRef.current = step;
  const displayStep = visible ? step : lastStepRef.current;
  const isComparison = displayStep === 'comparison';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.90)' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 0}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.overlay}>
              <TouchableOpacity
                style={{ alignSelf: 'flex-end', right: 22, position: 'absolute', top: 55, zIndex: 777 }}
                onPress={handleCloseRating}
              >
                <Image source={imageIndex.closeCircle} style={{ height: 24, width: 24, tintColor: Color.placeHolder, resizeMode: 'contain' }} />
              </TouchableOpacity>

              {/* Comparison Step */}
              {leftMovie && (
                <View
                  style={[
                    styles.comparisonModalContent,
                    !isComparison && styles.hiddenStep,
                  ]}
                  pointerEvents={isComparison ? 'auto' : 'none'}
                >
                  <Animated.View style={{ transform: [{ translateX: comparisonHeadingAnim }] }}>
                    <CustomText color={Color.placeHolder} style={styles.comparisonHeading}>
                      Which do you prefer?
                    </CustomText>
                  </Animated.View>
                  <View style={styles.moviesContainer}>
                    <Animated.View style={[styles.movieCardComparison, { transform: [{ translateX: firstImageSlide }] }]} collapsable={false}>
                      <TouchableOpacity
                        disabled={!!comparisonSelected}
                        onPress={() => {
                          setComparisonSelected('first');
                          setTimeout(() => slideAndResetImages(() => onSelectFirst?.()), 180);
                        }}
                      >
                        <View>
                          <View style={[styles.posterWrapper, styles.posterWrapperLeft]}>
                            <Grayscale amount={comparisonSelected === 'second' ? 1 : 0} style={{ width: '100%', height: '100%' }}>
                              {leftPosterSource && (
                                comparisonSelected === 'first' ? (
                                  <LinearGradient
                                    colors={['#00A8F5', '#A7E3FF', '#00A8F5']}
                                    locations={[0.2, 0.5, 0.8]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradientBorder}
                                  >
                                    <View style={styles.selectedPosterInner}>
                                      <FastImage
                                        style={styles.comparisonPoster}
                                        source={leftPosterSource}
                                        resizeMode={FastImage.resizeMode.stretch}
                                      />
                                    </View>
                                  </LinearGradient>
                                ) : (
                                  <FastImage
                                    style={styles.comparisonPoster}
                                    source={leftPosterSource}
                                    resizeMode={FastImage.resizeMode.stretch}
                                  />
                                )
                              )}
                            </Grayscale>
                          </View>
                          <CustomText size={16} color={Color.whiteText} style={styles.comparisonTitle} font={font.PoppinsMedium}>
                            {leftMovie.title}
                          </CustomText>
                          <CustomText size={14} color={Color.placeHolder} style={styles.comparisonYear} font={font.PoppinsRegular}>
                            {leftMovie.year}
                          </CustomText>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>

                    {/* Dynamic 'Or' Label */}
                    <View style={styles.orContainer}>
                      <Image source={imageIndex.orCircle} style={styles.orImage} resizeMode="contain" />
                    </View>

                    {rightMovie && (
                      <Animated.View key="comparison-right-card" style={[styles.movieCardComparison, { transform: [{ translateX: rightCardAnim }] }]}>
                        <TouchableOpacity
                          disabled={!!comparisonSelected}
                          onPress={() => {
                            setComparisonSelected('second');
                            setTimeout(() => slideAndResetImages(() => onSelectSecond?.(rightMovie)), 180);
                          }}
                        >
                          <View>
                            <View style={styles.posterWrapper}>
                              <Grayscale amount={comparisonSelected === 'first' ? 1 : 0} style={{ width: '100%', height: '100%' }}>
                                {comparisonSelected === 'second' ? (
                                  <LinearGradient
                                    colors={['#00A8F5', '#A7E3FF', '#00A8F5']}
                                    locations={[0.2, 0.5, 0.8]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradientBorder}
                                  >
                                    <View style={styles.selectedPosterInner}>
                                      <FastImage
                                        key={rightMovie.poster?.uri}
                                        style={styles.comparisonPoster}
                                        source={{ ...rightMovie.poster, priority: FastImage.priority.high, cache: FastImage.cacheControl.immutable }}
                                        resizeMode={FastImage.resizeMode.contain}
                                        onLoad={() => {
                                          if (!rightCardSlideInDoneRef.current) {
                                            rightCardSlideInDoneRef.current = true;
                                            runRightCardSlideIn();
                                          }
                                        }}
                                      />
                                    </View>
                                  </LinearGradient>
                                ) : (
                                  <FastImage
                                    key={rightMovie.poster?.uri}
                                    style={styles.comparisonPoster}
                                    source={{ ...rightMovie.poster, priority: FastImage.priority.high, cache: FastImage.cacheControl.immutable }}
                                    resizeMode={FastImage.resizeMode.contain}
                                    onLoad={() => {
                                      if (!rightCardSlideInDoneRef.current) {
                                        rightCardSlideInDoneRef.current = true;
                                        runRightCardSlideIn();
                                      }
                                    }}
                                  />
                                )}
                                {isOnboarding == false &&
                                  rightMovie.rating != null && (
                                    <View style={styles.ratingBadge}>
                                      <RankingWithInfo
                                        score={Number(rightMovie.rating)}
                                        title="Rec Score"
                                        description={t('discover.recscoredes')}
                                      />
                                    </View>
                                  )}
                              </Grayscale>
                            </View>
                            <CustomText size={16} color={Color.whiteText} style={styles.comparisonTitle} font={font.PoppinsMedium}>
                              {rightMovie.title}
                            </CustomText>
                            <CustomText size={14} color={Color.placeHolder} style={styles.comparisonYear} font={font.PoppinsRegular}>
                              {rightMovie.year}
                            </CustomText>
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    )}
                  </View>
                  <TouchableOpacity style={styles.skipButton} onPress={() => onSkipSelect?.()}>
                    <CustomText size={14} color={Color.lightGrayText} style={styles.skipText} font={font.PoppinsMedium}>
                      {t('profile.skip')}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              )}

              <View
                style={[
                  styles.modalContentWrapper,
                  isKeyboardVisible && { flex: 1 },
                  isComparison && styles.hiddenStep,
                ]}
                pointerEvents={isComparison ? 'none' : 'auto'}
              >
                <ScrollView
                  ref={scrollViewRef}
                  contentContainerStyle={[
                    styles.scrollContent,
                    {
                      justifyContent: isKeyboardVisible ? 'flex-end' : 'center',
                      paddingBottom: isKeyboardVisible ? (Platform.OS === 'ios' ? 70 : 10) : 70
                    }
                  ]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => {
                    if (showFeedback) {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }
                  }}
                >
                  {isKeyboardVisible && <View style={{ flex: 1 }} />}
                  <View style={[styles.modalContentInner]}>
                    <Animated.View style={[{ transform: [{ translateX: modalContentAnim }] }]}>
                      <CustomText size={16} color={Color.whiteText} style={styles.heading} font={font.PoppinsSemiBold}>
                        {t('modal.howWasIt')}
                      </CustomText>
                    </Animated.View>
                    <Animated.View style={[styles.movieCard, { transform: [{ translateX: centerPosterSlideAnim }] }]}>
                      <View>
                        <View style={[styles.posterWrapper, styles.posterWrapperLeft]}>
                          {poster?.uri ? (
                            <FastImage
                              source={{ uri: poster.uri, priority: FastImage.priority.high, cache: FastImage.cacheControl.immutable }}
                              style={styles.comparisonPoster}
                              resizeMode={FastImage.resizeMode.stretch}
                            />
                          ) : null}
                        </View>
                        <CustomText size={16} color={Color.whiteText} style={styles.comparisonTitle} font={font.PoppinsMedium}>
                          {movieTitle}
                        </CustomText>
                        <CustomText size={14} color={Color.placeHolder} style={styles.comparisonYear} font={font.PoppinsRegular}>
                          {movieYear}
                        </CustomText>
                      </View>
                    </Animated.View>
                    {preferenceMsg && (
                      <View>
                        <Text style={styles.continueAlert}>{t('errorMessage.pickOneContinue')}</Text>
                      </View>
                    )}
                    {showFeedback && isKeyboardVisible && Platform.OS !== 'ios' && <View style={{ flex: 1 }} />}

                    <Animated.View style={[{ width: '100%', transform: [{ translateX: actionsContainerAnim }] }]}>
                      {/* Icons */}
                      <View style={styles.actionsContainer}>
                        <View style={styles.lovedIt}>
                          <TouchableOpacity onPress={handleLovedIt}>
                            <Image source={selectedOption === 'lovedIt' ? imageIndex.acrtivePlay : imageIndex.stopPlay} resizeMode="contain" style={styles.icon} />
                          </TouchableOpacity>
                          <CustomText style={[styles.actionText, { fontFamily: selectedOption === 'lovedIt' ? font.PoppinsMedium : font.PoppinsRegular, color: selectedOption === 'lovedIt' ? Color.whiteText : Color.subText }]}>
                            {t('modal.loveIt')}
                          </CustomText>
                        </View>
                        <View style={styles.lovedIt}>
                          <TouchableOpacity onPress={handleOkay}>
                            <Image source={selectedOption === 'okay' ? imageIndex.modalitWasPoster : imageIndex.play} resizeMode="contain" style={styles.icon} />
                          </TouchableOpacity>
                          <CustomText style={[styles.actionText, { fontFamily: selectedOption === 'okay' ? font.PoppinsMedium : font.PoppinsRegular, color: selectedOption === 'okay' ? Color.whiteText : Color.subText }]}>
                            {t('modal.itWasOkay')}
                          </CustomText>
                        </View>
                        <View style={styles.lovedIt}>
                          <TouchableOpacity onPress={handleDidntLike}>
                            <Image source={selectedOption === 'notLike' ? imageIndex.redCloseActive : imageIndex.redClose} resizeMode="contain" style={styles.icon} />
                          </TouchableOpacity>
                          <CustomText style={[styles.actionText, { fontFamily: selectedOption === 'notLike' ? font.PoppinsMedium : font.PoppinsRegular, color: selectedOption === 'notLike' ? Color.whiteText : Color.subText }]}>
                            {t('modal.didntLikeIt')}
                          </CustomText>
                        </View>
                      </View>

                      {/* Input and Button */}
                      {!isOnboarding && showFeedback && (
                        <>
                          <View style={styles.reviewConatainer}>
                            <CustomReviewInput
                              key={visible ? 'active' : 'inactive'}
                              ref={reviewInputRef}
                              placeholder={t('modal.writeReview')}
                              text={text}
                              setText={setText}
                            />
                          </View>
                          <ButtonCustom
                            title={t('common.next')}
                            onPress={() => nextPress()}
                            buttonStyle={{ width: screenWidth * 0.90, marginTop: 22, alignSelf: 'center' }}
                          />
                        </>
                      )}
                    </Animated.View>
                  </View>
                </ScrollView>
              </View>


            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default FeedbackModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 10,
  },
  modalContentWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 70,
    width: Dimensions.get('window').width,
  },
  modalContentInner: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '85%',
    marginTop: 40,
  },
  hiddenStep: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heading: {
    color: Color.whiteText,
    marginBottom: 28,
  },
  poster: {
    width: wp(45),
    height: 255,
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
    // justifyContent: 'space-between',
    // gap: 7,
    width: '100%',

  },
  lovedIt: {
    paddingVertical: 10,
    // paddingHorizontal: 8,
    borderRadius: 50,
    alignItems: "center",
    // flex: 1,
    width: '33.3%'
  },
  actionText: {
    fontSize: 14,
    color: Color.whiteText,
    marginTop: 6,
    fontFamily: font.PoppinsMedium,
    textAlign: 'center'
  },
  icon: { height: 40, width: 40 },
  reviewConatainer: {
    width: '100%',
    minHeight: 50,
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
    fontFamily: font.PoppinsBold,
  },
  // Comparison step styles
  comparisonModalContent: {
    padding: 14,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  comparisonHeading: {
    marginBottom: 28,
    color: Color.whiteText,
    fontSize: 16,
    fontFamily: font.PoppinsSemiBold
  },
  moviesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  movieCard: {
    width: wp(45),
    alignItems: 'center',
  },
  movieCardComparison: {
    width: wp(45),
    // maxWidth: '48%',
    alignItems: 'center',
  },
  posterWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterWrapperLeft: {
    backgroundColor: 'rgba(28,28,28,0.95)',
  },
  comparisonPoster: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
  },
  gradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPosterInner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  comparisonTitle: {
    marginTop: 16,
    marginLeft: 1,
  },
  comparisonYear: {
    marginTop: 6,
    marginLeft: 1,
    textAlign: 'left'
  },
  orContainer: {
    position: 'absolute',
    top: ((wp(45) * 1.5) / 2),
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  orImage: {
    height: 34,
    width: 34,
    resizeMode: 'contain',
  },
  ratingBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 40,
    height: 40,
  },
  skipButton: {
    marginTop: 70,
    borderColor: Color.lightGrayText,
    borderWidth: 0.6,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  skipText: {
    color: Color.whiteText,
    fontWeight: '500',
    fontSize: 14,
  },
});


