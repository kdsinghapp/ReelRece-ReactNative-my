import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  Keyboard,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import { Grayscale } from 'react-native-color-matrix-image-filters';
  import font from '@theme/font';
import FastImage from 'react-native-fast-image';
 import RankingWithInfo from '@components/ranking/RankingWithInfo';
import CustomText from '@components/common/CustomText/CustomText';
import { t } from 'i18next';
 
interface Movie {
  title: string;
  year: string;
  poster: { uri: string };
  rating?: string;
  imdb_id?: string;
}

interface ComparisonModalProps {
  visible: boolean;
  onSelectFirst: () => void;
  onSelectSecond: (movie: Movie) => void;
  onSkip: () => void;
  firstMovie: Movie;
  secondMovie: Movie;
  onClose: () => void;
  comparisonMovies: Movie[];
  onSkipSelect: () => void;
  // setComparisonVisible: () => void;
  handleCloseRating: () => void;
}

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  visible,
  onSelectFirst,
  onSelectSecond,
  onSkip,
  firstMovie,
  secondMovie,
  onClose,
  onSkipSelect,
  // setComparisonVisible,
  handleCloseRating,
  comparisonMovies = [],
}) => {
 
  const leftAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState<'first' | 'second' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSecondMovie, setCurrentSecondMovie] = useState(secondMovie);
 


  useLayoutEffect(() => {
    setCurrentSecondMovie(secondMovie);
  }, [secondMovie]);

  useEffect(() => {
    if (comparisonMovies.length > 0 && currentIndex < comparisonMovies.length) {
      setCurrentSecondMovie(secondMovie);
    }
  }, [currentIndex, comparisonMovies, secondMovie]);

  // const slideAndResetImages = (callback: () => void) => {
  //   Animated.parallel([
  //     Animated.timing(leftAnim, {
  //       toValue: screenWidth,
  //       duration: 400,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(rightAnim, {
  //       toValue: -screenWidth,
  //       duration: 400,
  //       useNativeDriver: true,
  //     }),
  //   ]).start(() => {
  //     setSelected(null);
  //     callback();

  //     // ✅ Reset animation position for next render
  //     leftAnim.setValue(screenWidth);
  //     rightAnim.setValue(-screenWidth);

  //     // Animate images back in for new comparison
  //     Animated.parallel([
  //       Animated.timing(leftAnim, {
  //         toValue: 0,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(rightAnim, {
  //         toValue: 0,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   });
  // };

  const slideAndResetImages = (
    onAfterSlideOut: () => void | Promise<void>,
    onAfterSlideIn?: () => void
  ) => {
    // 1. Slide current images out (user sees old images leave)
    Animated.parallel([
      Animated.timing(leftAnim, {
        toValue: screenWidth,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(rightAnim, {
        toValue: -screenWidth,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      setSelected(null);
      leftAnim.setValue(screenWidth);
      rightAnim.setValue(-screenWidth);

      // 2. Update parent (API + state) so next pair is ready; wait for it
      const result = onAfterSlideOut?.();
      await Promise.resolve(result);

      // 3. Let React commit new props (new firstMovie/secondMovie) before sliding back
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          Animated.parallel([
            Animated.timing(leftAnim, {
              toValue: 0,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(rightAnim, {
              toValue: 0,
              duration: 120,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onAfterSlideIn?.();
          });
        });
      });
    });
  };

  //   const handleCloseRating = async () => {
  //   try {
  //     await rollbackPairwiseDecisions(userToken, selectedImdbId);
  //     // Flow close kar do
  //     setFeedbackVisible(false); // ya navigate back
  //   } catch (error) {
   //   }
  // };

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      setSelected(null);
      setCurrentIndex(0);
      leftAnim.setValue(screenWidth / 2);
      rightAnim.setValue(-screenWidth / 2);

      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  {/* <TouchableOpacity onPress={() => handleSelection(firstMovie, true)} />
<TouchableOpacity onPress={() => handleSelection(currentSecondMovie, false)} /> */}
    return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={{ alignSelf: 'flex-end', right: 22, position: 'absolute', top: - screenHeight * 0.14, zIndex: 777 }}
              onPress={handleCloseRating}
            >
              <Image source={imageIndex.closeCircle
                
              } style={{ height: 24, width: 24, tintColor: Color.placeHolder, resizeMode: 'contain' }} />
            </TouchableOpacity>
            <CustomText
              size={20}
              color={Color.placeHolder}
              style={styles.heading}
              font={font.PoppinsBold}
            >
              Which do you prefer?
            </CustomText>
            {/* {comparisonMovies.length > 1 && (
              <Text style={styles.comparisonText}>
                {currentIndex + 1} of {comparisonMovies.length}
              </Text>
            )} */}
       <View style={styles.moviesContainer}>
              <View style={styles.movieCard}> 

                <TouchableOpacity
                  disabled={!!selected}
                  onPress={() => {
                    setSelected('first');
                    setTimeout(() => {
                      slideAndResetImages(() => onSelectFirst());
                    }, 200);
                    // slideAndResetImages(() => {
                    //   onSelectFirst();
                    // });
                  }}
                >

                  <View>
                    <View style={styles.posterWrapper}>
                      <Grayscale
                        amount={selected === 'second' ? 1 : 0}
                        style={{ width: '100%', height: '100%' }}
                      >

                        <FastImage
                          style={[
                            styles.poster,
                            { borderWidth: selected === 'first' ? 2 : 0 }
                          ]}
                          source={{
                            ...firstMovie?.poster,
                            priority: FastImage.priority.low,
                            cache: FastImage.cacheControl.web
                          }}
                          resizeMode={FastImage.resizeMode.stretch}
                        />

                      </Grayscale>
                    </View>
                    <CustomText
                      size={16}
                      color={Color.whiteText}
                      style={styles.title}
                      font={font.PoppinsMedium}
                    >
                      {firstMovie?.title}
                    </CustomText>
                   <CustomText
                      size={14}
                      color={Color.placeHolder}
                      style={styles.year}
                      font={font.PoppinsRegular}
                    >
                      {firstMovie?.year}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Second Movie (Animated) - key + secondMovie so content never sticks during animation */}
              <Animated.View
                key={secondMovie?.imdb_id ?? 'second'}
                style={[styles.movieCard, styles.movieCardAnimated, { transform: [{ translateX: leftAnim }] }]}
              >
                <TouchableOpacity
                  disabled={!!selected}
                  onPress={() => {
                    setSelected('second');
                    setTimeout(() => {
                      slideAndResetImages(() => onSelectSecond(secondMovie));
                    }, 200);
                  }}
                >
                  <View style={styles.movieCardInner} collapsable={false}>
                    <View style={styles.posterWrapper}>
                      <Grayscale
                        amount={selected === 'first' ? 1 : 0}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <FastImage
                          style={[
                            styles.poster,
                            {
                              borderWidth: selected === 'second' ? 1 : 0,
                              borderColor: selected === 'second' ? Color.primary : 'transparent',
                            },
                          ]}
                          source={{
                            ...(secondMovie?.poster ?? currentSecondMovie?.poster),
                            priority: FastImage.priority.low,
                            cache: FastImage.cacheControl.web
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                        />

                        {(secondMovie?.rating ?? currentSecondMovie?.rating) && (
                          <View style={styles.ratingBadge}>
                            <RankingWithInfo
                              score={secondMovie?.rating ?? currentSecondMovie?.rating}
                              title={"Rec Score"}
                              description={t("discover.recscoredes")}
                            />
                          </View>
                        )}
                      </Grayscale>
                    </View>
                    <CustomText
                      size={16}
                      color={Color.whiteText}
                      style={styles.title}
                      font={font.PoppinsMedium}
                      numberOfLines={2}
                    >
                      {secondMovie?.title ?? currentSecondMovie?.title ?? ''}
                    </CustomText>
                    <CustomText
                      size={14}
                      color={Color.placeHolder}
                      style={styles.year}
                      font={font.PoppinsRegular}
                      numberOfLines={1}
                    >
                      {secondMovie?.year ?? currentSecondMovie?.year ?? ''}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>


            {/* <TouchableOpacity style={styles.editContainer} onPress={() => setCommentModal(true)}>
              <Image
                source={imageIndex.editSpace}
                style={styles.editImage}
                resizeMode='contain'
              />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.skipButton}
              onPress={() => {
                 onSkipSelect()
              }}
            >
              <CustomText
                size={14}
                color={Color.lightGrayText}
                style={styles.skipText}
                font={font.PoppinsMedium}
              >
                {t("profile.skip")}
    
              </CustomText>
            </TouchableOpacity>
          </View>
          <View style={styles.orContainer}>
            <Image
              source={imageIndex.orCircle}
              style={styles.orImage}
              resizeMode='contain'
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* <CommentModal
        onClose={() => setCommentModal(false)}
        visible={commentModal}
      /> */}
    </Modal>
  );
};

export default ComparisonModal
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.80)',
  },
  modalContent: {
    padding: 14,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    marginBottom: 12,
    color: Color.whiteText,
  },
  comparisonText: {
    color: Color.lightGrayText,
    marginBottom: 10,
  },
  moviesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    width: '100%',
    // backgroundColor:'pink'
  },
  movieCard: {
    width: '48%',
    alignItems: 'center',
  },
  movieCardAnimated: {
    overflow: 'hidden',
  },
  movieCardInner: {
    width: '100%',
    overflow: 'hidden',
  },
  posterWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poster: {
    borderColor: Color.primary,
    borderRadius: 20,
    width: '100%',
    height: '100%',
  },
  ratingBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 8,
    marginLeft: 1
  },
  year: {
    marginTop: 6,
    marginLeft: 1
  },
  orContainer: {
    position: 'absolute',
    top: '43%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orImage: {
    height: 34,
    width: 34,
    resizeMode: "contain",
  },
  editContainer: {
    marginTop: 26,
    marginBottom: 12
  },
  editImage: {
    height: 22,
    width: 22,
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
    fontSize: 14
  },
  overlayGray: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgb(63, 56, 56)',
    zIndex: 10,
    borderRadius: 10,
    opacity: 0.8,
  },
});

