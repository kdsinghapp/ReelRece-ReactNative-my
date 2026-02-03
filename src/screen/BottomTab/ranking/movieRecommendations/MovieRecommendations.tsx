// import React, { useCallback, useEffect, useState } from 'react';
// import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, } from 'react-native';
// import imageIndex from '@assets/imageIndex';
// import { Color } from '@theme/color';
// import { ComparisonModal, CustomStatusBar, FeedbackModal, SearchBarCustom, SlideInTooltipModal, StepProgressModal } from '@components';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
// import ScreenNameEnum from '@routes/screenName.enum';
// import StepProgressBar from '@components/modal/stepProgressModal/StepProgressBar';
// import useMovieRecommendations from './useMovieRecommendations';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RankingCard from '@components/ranking/RankingCard';
// import LayeredShadowText from '@components/common/LayeredShadowText/LayeredShadowText';
// import font from '@theme/font';
// import NormalMovieCard from '@components/common/NormalMovieCard/NormalMovieCard';
// import { Trending_without_Filter } from '@redux/Api/movieApi';
// import { useSelector } from 'react-redux';
// import { RootState } from '@redux/store';
// import { getMatchingMovies } from '@redux/Api/ProfileApi';


// const MovieRecommendations = ({

// }) => {
//   const { navigation,
//     togglePlatform,
//     isVisible, setIsVisible,
//     TooltipModal, setTooltipModal,
//     modalVisible, setModalVisible,
//     lovedImge, setlovedImge,
//     selectedPlatforms, setSelectedPlatforms,
//     stepsModal, setStepsModal } = useMovieRecommendations()

//   const route = useRoute();
//   const token = useSelector((state: RootState) => state.auth.token);

//   const { rankingCurrentStep, selectedMovieId, setSelectedMovieId } = route.params || { currentStep: 1 };
//   const [currentStep, setCurrentStep] = useState(rankingCurrentStep);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [movies, setMovies] = useState([]);
//   const [selectedMovie, setSelectedMovie] = useState(null);
//   const [filteredMovies, setFilteredMovies] = useState([]);
//   const [matchingMovies, setMatchingMovies] = useState([]);

  //   const handleSearch = () => {
//     // Alert.alert(searchQuery)
//     if (searchQuery.trim().length > 0) {
//       const formattedQuery =
//         searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
//       navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' });
//     }
//   };
//   const handleStepProgress = () => {
//     setTimeout(() => {
//       setModalVisible(false)
//       // setStepsModal(true);

 //     }, 1500);
//   };
//   const [storedStep, setStoredStep] = useState(0);
  
//   const totalSteps = 6; // or jitne steps hai
//   const saveStepToStorage = async (step: number) => {
//     try {
//       await AsyncStorage.setItem('currentStep', JSON.stringify(step));
//       setStoredStep(step);
//       setCurrentStep(step);
//       // Alert.alert("step currentStep -  - " + currentStep)

//     } catch (e) {
 //     }
//   };
//   const getStepFromStorage = async () => {
//     try {
//       const step = await AsyncStorage.getItem('currentStep');
//       if (step !== null) {
//         const parsed = JSON.parse(step);
//         setStoredStep(parsed);
//         setCurrentStep(parsed);
//         // Alert.alert()
//       }
//     } catch (e) {
 //     }
//   };
//   useEffect(() => {
//     getStepFromStorage();
//   }, []); // Only run once on mount
//   const handleStepPress = (stepIndex: number) => {
//     setCurrentStep(stepIndex);
//     getStepFromStorage()
//     saveStepToStorage(stepIndex);
//     // Alert.alert("pasused set -  - " + stepIndex) 
//     // Alert.alert("pasused set -  - " + stepIndex)

//   };

//   useEffect(() => {
//     const matchmovie = async () => {
//       if (!selectedMovieId || !token) return;
//       try {
//         const res = await getMatchingMovies(token, selectedMovieId);
//         setMatchingMovies(res.results);
 //       } catch (error) {
 //       }
//     };

//     matchmovie();
//   }, [selectedMovieId, token]); // ✅ Correct dependency

//   useEffect(() => {
//     const recommendMovie = async () => {
//       try {
//         const url = "/recommend-movies?country=US";
//         const res = await Trending_without_Filter({ token, url });
//         if (res?.data?.results) {
//           setFilteredMovies(res.data?.results);
//         }
//       } catch (error) {
 //       }
//     };
//     if (token) recommendMovie();
//   }, [token]);

//   // useFocusEffect(
//   //   useCallback(() => {
//   //     const unsubscribe = navigation.addListener('beforeRemove', () => {
//   //       // setSelectedMovieId(null)
//   //       saveStepToStorage(1); //  set step to 1 on back
//   //     });

//   //     return () => unsubscribe();
//   //   }, [navigation])
//   // );

//   const RankingMovieList = useCallback(({ item, index }) => (

//     <View style={styles.movieCard} >

//       <TouchableOpacity
//         style={styles.movieCard}
//         onPress={() => navigation.navigate(ScreenNameEnum.MovieDetailScreen)}
//       >


//         <Image source={{ uri: item?.cover_image_url }} style={styles.poster} />
//       </TouchableOpacity>
//       <View style={styles.info}>
//         <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
//           <Text style={[styles.title]} numberOfLines={2} >{item?.title}</Text>


//         </View>
//         <Text style={styles.year}>{item?.release_year}</Text>
//       </View>

//       <View style={styles.icons}>
//         <View style={{ alignSelf: 'flex-end' }} >
//           <RankingCard ranked={item?.raT} />
//         </View>

//         <View style={styles.centerContainer} >
//           <TouchableOpacity style={styles.iconprimary}  >
//             { }
//             <LayeredShadowText text={(index + 1)} fontSize={60} marginRight={10} />


//           </TouchableOpacity>
//           {/* <View style={styles.iconprimary}> 
//            {item?.id !== "1" && (
//             <TouchableOpacity>
//   <Image source={imageIndex.chevronUp} style={{ height: 24, width: 24 }}  tintColor={Color.textGray} />

//               </TouchableOpacity>
// )}

// <TouchableOpacity>
//             <Image source={imageIndex.downDown} style={{ height: 24, width: 24 }} tintColor={Color.textGray} />
  
//   </TouchableOpacity> 
//            </View> */}


//           <View style={styles.iconprimary}>
//             {index > 0 && (
//               <TouchableOpacity onPress={() => swapItems(index, index - 1)}>
//                 <Image
//                   source={imageIndex.chevronUp}
//                   style={{ height: 24, width: 24 }}
//                   tintColor={Color.textGray}
//                   resizeMode='contain'

//                 />
//               </TouchableOpacity>
//             )}

//             {index < movies.length - 1 && (
//               <TouchableOpacity onPress={() => swapItems(index, index + 1)}>
//                 <Image
//                   source={imageIndex.downDown}
//                   resizeMode='contain'
//                   style={{ height: 24, width: 24 }}
//                   tintColor={Color.textGray}
//                 />
//               </TouchableOpacity>
//             )}
//           </View>


//         </View>
//       </View>
//     </View>

//   ), [navigation, movies]);




//   const renderNormalMovie = useCallback(({ item }) => {
//     const isSelected = selectedPlatforms?.includes(item?.id);
//     return (
//       <NormalMovieCard
//         item={item}
//         isSelected={isSelected}
//         onPressClose={() => { }}
//         onTogglePlatform={() => togglePlatform(item)}
//         imdb_id={item.imdb_id}
//       />
//     );
//   }, [selectedPlatforms, togglePlatform, navigation, setIsVisible]);
//   return (
//     <SafeAreaView style={styles.maincontainer}>
//       <CustomStatusBar />
//       <View style={{ marginTop: 5, marginBottom: 10, paddingHorizontal: 18, }} >
//         <SearchBarCustom
//           onpress={() => { navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' }) }}
//           editable={false}
//           placeholder="Search movies, shows ..."
//           value={searchQuery}
//           onSearchChange={setSearchQuery}
//           onSubmitSearch={handleSearch}
//         />
//       </View>
//       <ScrollView showsVerticalScrollIndicator={false} >
//         <View style={styles.container}>

//           <StepProgressBar
//             disable={true}

//             currentStepRanking={6}
//             totalSteps={6}
//           // onStepPress={handleStepPress}
//           />
//           <FlatList
//             data={matchingMovies}
//             renderItem={({ item, index }) => RankingMovieList({ item, index })}
//             keyExtractor={(item, index) => index.toString()}  // ✅ updated
//             contentContainerStyle={{ paddingBottom: 20 }}
//             extraData={movies} // ✅ optional but safe
//             initialNumToRender={8}
//             maxToRenderPerBatch={8}
//             windowSize={7}
//             removeClippedSubviews

//           />
//           {/* discover primary */}
//           {/* {currentStep == 6 && (
//             <TouchableOpacity onPress={() => navigation.navigate(ScreenNameEnum.DiscoverTab, {
//               screen: ScreenNameEnum.DiscoverScreen, params: { type: 'recs' },
//             })} style={styles.discoverprimaryContainer} >
//               <Text style={styles.discoverprimary} >Discover</Text>
//             </TouchableOpacity>
//           )} */}
//           <View style={{ marginTop: 16, marginLeft: 4 }} >
//             <Text style={styles.chanceText} >
//               Have you had a chance to watch these yet? We’d like to know your thoughts!
//             </Text>
//           </View>
//           <FlatList
//             showsVerticalScrollIndicator={false}
//             data={filteredMovies}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderNormalMovie}
//             contentContainerStyle={{ paddingBottom: 20, }}
//             initialNumToRender={10}
//             maxToRenderPerBatch={10}
//             windowSize={7}
//             removeClippedSubviews

//           />
//         </View>
//       </ScrollView>



//       {/* <FeedbackModal
//         visible={isVisible}
//         onClose={() => setIsVisible(false)}
//         onLovedIt={() => setIsVisible(false)}
//         onOkay={() => setIsVisible(false)}
//         onDidntLike={() => setIsVisible(false)}
//         onOpenSecondModal={() => setModalVisible(true)}
//         movieTitle='Resident Evil'
//         movieYear="2021"
//         poster={imageIndex.moviesPoster}
//       /> */}
//       {/* <ComparisonModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         onSelectFirst={() => {
 //           handleStepProgress();
 //         }}
//         onSelectSecond={() => {
 //           handleStepProgress();
//         }}
//         // onStepProgress={handleStepProgress} // Trigger StepProgressModal
//         onSkip={() => {
//         }}
//         firstMovie={{
//           title: 'Resident Evil  Death Island',
//           year: '2021',
//           poster: imageIndex.movieBag,
//         }}
//         secondMovie={{
//           title: 'Book Club: The Next Chapter',
//           year: '2021',
//           poster: imageIndex.bookBag,
//           rating: '9.8',
//         }}
//       /> */}

//       <StepProgressModal
//         visible={stepsModal}
//         screenRef={true}
//         currentStepModal={currentStep}
//         setCurrentStep={(step: number) => {

//           setCurrentStep(step);
//           saveStepToStorage(step);
//         }}
//         onClose={() => setStepsModal(false)}
//         onStepPress={(step: number) => {
//           // Run your custom function here
//           handleStepPress(step);  // Your existing logic (optional)
//           setCurrentStep(step);
//           getStepFromStorage()  // Update the state
//           saveStepToStorage(step); // Save step to storage
//           // myCustomFunction(step); // 🔁 Your function to run on click
//         }}

//       />
//       <SlideInTooltipModal visible={TooltipModal}
//         onClose={() => setTooltipModal(false)}
//       />
//     </SafeAreaView>
//   );
// };
// export default React.memo(MovieRecommendations);
// const styles = StyleSheet.create({
//   maincontainer: {
//     flex: 1,
//     backgroundColor: Color.background,
//   },
//   container: {
//     flex: 1,
//     marginHorizontal: 15,
//     paddingTop: 5,
//   },
//   centerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   movieCard: {
//     flexDirection: 'row',
//     marginTop: 16,
//   },

//   poster: {
//     width: 98,
//     height: 135,
//     borderRadius: 8,
//   },
//   info: {
//     flex: 1,
//     marginLeft: 15,
//   },
//   title: {
//     color: Color.whiteText,
//     fontSize: 16,
//     fontFamily: font.PoppinsMedium,

//   },
//   year: {
//     color: '#CDCDCD',
//     fontSize: 14,
//     marginTop: 5,
//     fontWeight: '400',
//   },
//   icons: {
//     gap: 8,
//   },
//   iconprimary: {
//     marginHorizontal: 2,
//   },
//   discoverprimaryContainer: {
//     backgroundColor: '#008ac9',
//     height: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // marginHorizontal: 20,
//     borderRadius: 10,
//     marginTop: 10,


//   },
//   discoverprimary: {
//     color: Color.whiteText,
//     fontSize: 16,
//     fontFamily: font.PoppinsBold,


//   },
//   chanceText: {
//     // marginTop:24,
//     fontSize: 16,
//     fontFamily: font.PoppinsBold,
//     color: Color.whiteText,

//   },
// });