import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import { Grayscale } from 'react-native-color-matrix-image-filters';
  import font from '@theme/font';
import FastImage from 'react-native-fast-image';
 import RankingWithInfo from '@components/ranking/RankingWithInfo';
import CustomText from '@components/common/CustomText/CustomText';
 
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
 


  useEffect(() => {
     if (comparisonMovies.length > 0 && currentIndex < comparisonMovies.length) {
      const current = comparisonMovies[currentIndex];

      const posterUrl = current?.poster?.uri || current?.poster || current?.cover_image_url;
      // const fixedPoster = posterUrl
      //   ? { uri: posterUrl }
      //   : require('../../../assets/images/profile1.png');


      setCurrentSecondMovie(secondMovie)

      // setCurrentSecondMovie({
      //   ...current,
      //   poster: fixedPoster,
      // });
    }
  }, [currentIndex, comparisonMovies, onSelectFirst, secondMovie, onSelectSecond]);

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

  const slideAndResetImages = (onBeforeSlide: () => void, onAfterSlide?: () => void) => {
    // ✅ Update image immediately *before* animation
    onBeforeSlide?.();

    Animated.parallel([
      Animated.timing(leftAnim, {
        toValue: screenWidth,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(rightAnim, {
        toValue: -screenWidth,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelected(null);

      // Reset position
      leftAnim.setValue(screenWidth);
      rightAnim.setValue(-screenWidth);

      // Animate back in with new data
      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAfterSlide?.();
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
      setSelected(null);
      setCurrentIndex(0);
      leftAnim.setValue(screenWidth / 2);
      rightAnim.setValue(-screenWidth / 2);

      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  {/* <TouchableOpacity onPress={() => handleSelection(firstMovie, true)} />
<TouchableOpacity onPress={() => handleSelection(currentSecondMovie, false)} /> */}
    return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback>
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
                      slideAndResetImages(() => {
                        onSelectFirst();
                      });
                    }, 700);
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

              {/* Second Movie (Animated) */}
              <Animated.View style={[styles.movieCard, { transform: [{ translateX: leftAnim }] }]}>

                <TouchableOpacity
                  disabled={!!selected}
                  onPress={() => {
                    setSelected('second');
                    // onSelectSecond(secondMovie);
                    setTimeout(() => {
                      slideAndResetImages(() => {
                        onSelectSecond(secondMovie);
                      });
                    }, 700);
                    // slideAndResetImages(() => {
                    //       // onSelectSecond();
                    //       onSelectSecond(secondMovie);

                    // });
                  }}
                >
                  <View>
                    <View style={styles.posterWrapper}>
                      <Grayscale
                        amount={selected === 'first' ? 1 : 0}
                        style={{ width: '100%', height: '100%' }}
                      >
                        {/* <Image
                          resizeMode="cover"
                          source={currentSecondMovie.poster}
                          style={[styles.poster, { borderWidth: selected === 'second' ? 1 : 0 }]}
                        /> */}

                        <FastImage
                          style={[
                            styles.poster,
                            {
                              borderWidth: selected === 'second' ? 1 : 0,
                              borderColor: selected === 'second' ? Color.primary : 'transparent',
                            },
                          ]}
                          source={{
                            ...currentSecondMovie?.poster,
                            priority: FastImage.priority.low,
                            cache: FastImage.cacheControl.web
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                        />

                        {currentSecondMovie.rating && (
                          <View style={styles.ratingBadge}>
                            {/* <RankingCard ranked={currentSecondMovie.rating} /> */}
                            <RankingWithInfo
                              score={currentSecondMovie?.rating}
                              title={"Rec Score"}
                              description={

                                "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                                //  "This score shows the rating from your friend for this title."
                              }
                            />
                          </View>
                        )}
                      </Grayscale>
                    </View>
                    {/* <Text style={styles.title}>{currentSecondMovie.title}</Text> */}
                    <CustomText
                      size={16}
                      color={Color.whiteText}
                      style={styles.title}
                      font={font.PoppinsMedium}
                    >
                      {currentSecondMovie.title}
                    </CustomText>

                    <CustomText
                      size={14}
                      color={Color.placeHolder}
                      style={styles.year}
                      font={font.PoppinsRegular}
                    >
                      {currentSecondMovie.year}
                    </CustomText>
                    {/* {currentSecondMovie.rating && (
                      <View style={styles.ratingBadge}>
                        <RankingCard ranked={currentSecondMovie.rating} />
                      </View>
                    )} */}
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
                Skip
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
    // marginTop:22,
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

