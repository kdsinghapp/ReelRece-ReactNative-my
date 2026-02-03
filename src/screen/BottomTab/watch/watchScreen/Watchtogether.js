import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import imageIndex from '@assets/imageIndex';
  import { Color } from '@theme/color';
 import font from '@theme/font';
 import { FriendthinkModal, MovieInfoModal } from '@components';
 import WatchNowModal from '@components/modal/WatchNowModal/WatchNowModal';
import { DescriptionWithReadMore } from '@components/common/DescriptionWithReadMore/DescriptionWithReadMore';
import FastImage from 'react-native-fast-image';
import { getGroupActivitiesAction, getMembersScores, recordGroupPreference } from '@redux/Api/GroupApi';
 import CustomText from '@components/common/CustomText/CustomText';
import { convertRuntime } from '@components/convertRuntime/ConvertRuntime';
import useMovie from '@screens/BottomTab/discover/movieDetail/useMovie';
 
const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.4;
const SPACING = 20

 
export default function Watchtogether({ token,
  setActiveIndex,
  activeIndex,
  groupId,
  groupRecommend,
  groupMembers }) {
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [watchNow, setWatchNow] = useState(false);
  const [selectedImdbId, setSelectedImdbId] = useState(null);
  const [watchModalLoad, setWatchModalLoad] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  // const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
   const { setInfoModal, InfoModal, thinkModal, setthinkModal } = useMovie();
   const [groupActivity, setGroupActivity] = useState([]);
  const groupActivityRef = useRef([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [recommgroupMemebrsScore, setRecommgroupMemebrsScore] = useState([]);
  const [scoreMovieRank, setScoreMovieRank] = useState('')
   const isScrollView = useRef(false)
const [delayActionPreference , setDelayActionPreference] = useState(false)
  const handlePreference = async ({
    type, // 'like' or 'dislike'
    imdbId,
    token,
    groupId,
    setLikes,
    setDislikes,
    likes,
    dislikes,
  }) => {
    const isLike = type === 'like';
    const newState = isLike ? !likes[imdbId] : !dislikes[imdbId];
     // Optimistic UI update
    if (isLike) {
      setLikes(prev => ({ ...prev, [imdbId]: newState }));
      setDislikes(prev => ({ ...prev, [imdbId]: false }));
    } else {
      setDislikes(prev => ({ ...prev, [imdbId]: newState }));
      setLikes(prev => ({ ...prev, [imdbId]: false }));
    }

    try {
     const responsedata =  await recordGroupPreference(token, groupId, imdbId, newState ? type : isLike ? 'dislike' : 'like');
     } catch (err) {
       // Rollback if failed
      if (isLike) {
        setLikes(prev => ({ ...prev, [imdbId]: !newState }));
      } else {
        setDislikes(prev => ({ ...prev, [imdbId]: !newState }));
      }
    }
  };


  useEffect(() => {
    const fetchGrouchActivities = async () => {
 
      const response = await getGroupActivitiesAction(token, groupId);

 
      if (response?.results?.length > 0) {
        response.results.forEach(item => {
          const imdbId = item.movie?.imdb_id;

          if (item.preference === "like") {
            setLikes(prev => ({ ...prev, [imdbId]: true }));
          } else if (item.preference === "dislike") {
            setDislikes(prev => ({ ...prev, [imdbId]: true }));
          }
        });
      }
    };

    fetchGrouchActivities();
  }, [ token]);

  useEffect(() => {
   }, [likes, dislikes]);
  useEffect(() => {
    const fetchActivity = async () => {
      setLoadingActivity(true);
      const result = await getGroupActivitiesAction(token, groupId, groupRecommend[activeIndex]?.imdb_id);
      // const result = await getGroupActivitiesAction(token, "wtg1003", "tt1877830");
      setGroupActivity(result?.results);
      groupActivityRef.current = result?.results;
       setLoadingActivity(false);
    };
    if (groupRecommend.length > 0) {
      fetchActivity();
    }
  }, [token, delayActionPreference]);
  // }, [groupId, groupRecommend, activeIndex, token, delayActionPreference]);

  useEffect(()=> {
    setTimeout(()=> {
setDelayActionPreference(!delayActionPreference)

    },500)
  },[activeIndex])

  const watchModalFunc = ({ imdb_id }) => {

     setSelectedImdbId(imdb_id)
    // Alert.alert(imdb_id)
    setWatchNow(true)
  }
   const getMembersScrocedata = async (token, groupId, groupRecommend, activeIndex, movie_ranked) => {
    const imdb_id = groupRecommend[activeIndex]?.imdb_id
     setScoreMovieRank(movie_ranked)
    setthinkModal(true);
    try {
      const response = await getMembersScores(token, groupId, imdb_id)
      const filteredResults = response?.results?.filter(member => member?.preference !== undefined);
    
    if(filteredResults){
      setRecommgroupMemebrsScore(filteredResults)

    }
     } catch (error) {
       throw error
    }
  }
  
  const onScroll = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  ), []);
// const movieCard = useMemo(()=> {
//  return        groupRecommend?.map((movie, index) => {
//            const inputRange = [
//             (index - 1) * (ITEM_WIDTH + SPACING),
//             index * (ITEM_WIDTH + SPACING),
//             (index + 1) * (ITEM_WIDTH + SPACING),
//           ];
//           const scale = scrollX.interpolate({
//             inputRange,
//             outputRange: [1, 1.13,1],
//             extrapolate: 'clamp',
//           });
 //           return (
//             //  <Animated.View key={index} style={[styles.cardContainers, { transform: [{ scale }] }]}>
//             <Animated.View key={index} style={[styles.cardContainer, { transform: [{ scale }] }]}>
//               <TouchableOpacity >
//                 <AnimatedFastImage
//                   source={{
//                     uri: movie?.cover_image_url,
//                     priority: FastImage.priority.low,
//                     cache: FastImage.cacheControl.immutable
//                   }}
//                   style={[styles.poster, { transform: [{ scale }] }]}
//                   resizeMode={FastImage.resizeMode.cover}

//                   onLoadStart={() => setImageLoading(true)}
//                   onLoad={() => setImageLoading(false)}
//                 />
//               </TouchableOpacity>
//               {/* </Animated.View> */}
//               {/* <Animated.View key={index} style={[styles.cardContainer, { transform: [{ scale }] }]}> */}
//               {/* {activeIndex === index && ( */}
//                 <View style={[styles.movieInfo,{
//                   opacity: activeIndex === index ? 1 : 0,
//       height: activeIndex === index ? 'auto' : 0,
//       overflow: 'hidden',
//                 }]}>
//                   {/* movie like  */}
//                   <View style={styles.thumpCard} >

//                     <TouchableOpacity
//                       onPress={() =>
//                         {handlePreference({
//                           type: 'like',
//                           imdbId: movie.imdb_id,
//                           token,
//                           groupId,
//                           setLikes,
//                           setDislikes,
//                           likes,
//                           dislikes,
//                         })
                        
//                       }

//                       }
//                       style={[
//                         styles.thumpContainer,
//                         { backgroundColor: likes[movie.imdb_id] ||  (groupActivity[0]?.preference || '') == 'like' ? Color.green : Color.grey },
//                       ]}
//                     >
//                       <Image source={imageIndex.thumpUP} style={styles.thumpImage} resizeMode='contain' />
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       onPress={() =>
//                         handlePreference({
//                           type: 'dislike',
                          
//                           imdbId: movie.imdb_id,
//                           token,
//                           groupId,
//                           setLikes,
//                           setDislikes,
//                           likes,
//                           dislikes,
//                         })
//                       }
//                       style={[
//                         styles.thumpContainer,
//                         { backgroundColor: dislikes[movie.imdb_id] || (groupActivity[0]?.preference || '') == 'dislike' ? Color.red : Color.grey },
//                       ]}
//                     >
//                       <Image source={imageIndex.thumpDown} style={styles.thumpImage} resizeMode='contain' />
//                     </TouchableOpacity>
//                   </View>


//                   {(groupActivity?.length ?? 0) > 0 && movie?.cover_image_url ? (
//                     <View style={{ height: 33 }}>
//                       <GroupActivityFeed groupActivity={groupActivity} />
//                     </View>
//                   ) : null}

//                   {/* movie avation , group action  */}

//                   <Text numberOfLines={2} style={styles.title}
//                     onTextLayout={(e) => {
//                       setLineCount(e.nativeEvent.lines.length);
//                     }}
//                   >
//                     {movie?.title}
//                   </Text>

//                   <TouchableOpacity style={styles.rankingContainer} onPress={() => {
//                     // setthinkModal(true);
//                     getMembersScrocedata(token, groupId, groupRecommend, activeIndex, movie?.rec_score)
//                   }} >
//                     {/* <RankingCard ranked={movie?.rec_score} /> */}
//                     <RankingWithInfo
//                       score={movie?.rec_score}
//                       title={"Friend Score"}
//                       description={

//                         // ? "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
//                         "This score shows the rating from your friend for this title."
//                       }
//                     />

//                     <CustomText
//                       size={14}
//                       color={Color.whiteText}

//                       style={{ marginLeft: 14, lineHeight:20 }}
//                       font={font.PoppinsMedium}
//                     >
//                       Group Score
//                     </CustomText>
//                   </TouchableOpacity>

//                   <View style={styles.movieDetailContainer}>
//                     {/* Year + Runtime same row */}
//                     {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}

//                     <CustomText
//                       size={14}
//                       color={Color.lightGrayText}
//                       style={{ paddingHorizontal: "2%" }}
//                       font={font.PoppinsRegular}
//                     >
//                       {groupRecommend[activeIndex]?.release_year} {` `}
//                       {convertRuntime(groupRecommend[activeIndex]?.runtime)} {` `}
//                       {groupRecommend[activeIndex]?.genres.map((detail, i) => (
//                         <Text
//                           allowFontScaling={false}
//                           key={i}
//                           style={{
//                             color: Color.lightGrayText,
//                             fontSize: 12,
//                             fontFamily: font.PoppinsRegular,
//                             paddingHorizontal: "2%",
//                             marginBottom: 4, // thoda gap niche ke liye
//                           }}>{detail} </Text>
//                       ))}
//                     </CustomText>
//                   </View>
//                   {/* <View pointerEvents="box-none"> */}

//                   {/* <TouchableOpacity onPress={() => setInfoModal(true)} > */}
//                   <TouchableOpacity  style={styles.descriptionContainer} onPress={handleDescription}>
//                     <DescriptionWithReadMore
//                       description={groupRecommend[activeIndex]?.description}
//                       descriptionStyle={{textAlign:'center'}}
//                       viewmoreStyle={{textAlign:'center'}}
//                       wordNo={88}
//                       titleLines={lineCount}
//                       onViewMore={() => setTimeout(() => {
//                         if (!isScrollView.current) {
//                           setInfoModal(true);
//                         }
//                       }, 200)}
//                     />
//                   </TouchableOpacity>

//                   {/* </TouchableOpacity> */}
//                   {/* </View> */}

//                   <TouchableOpacity style={styles.watchNowContainer} onPress={() => watchModalFunc({ imdb_id: movie.imdb_id })} >

//                     <Image style={styles.watchNowImg} source={imageIndex.puased} resizeMode='contain' />
//                     {/* <Text style={styles.watchNowText} >{movie.imdb_id}</Text> */}
//                     <CustomText
//                       size={14}
//                       color={Color.whiteText}
//                       style={styles.watchNowText}
//                       font={font.PoppinsBold}
//                     >
//                       Watch Now
//                     </CustomText>
//                   </TouchableOpacity>
//                 </View>
//               {/* )} */}
//             </Animated.View>
//             // </Animated.View>

//           );
//         })
// // }, [groupRecommend, activeIndex, likes, dislikes]);
// },  [groupRecommend, activeIndex, likes, dislikes, groupActivity ]);;
const ITEM_SIZE = ITEM_WIDTH + SPACING;
 

const renderMovieInfo = (movie) => {
  const imdbId = movie?.imdb_id;

  return (
    <>
      {/* LIKE / DISLIKE */}
      <View style={styles.thumpCard}>
        <TouchableOpacity
          onPress={() =>
            handlePreference({
              type: "like",
              imdbId,
              token,
              groupId,
              setLikes,
              setDislikes,
              likes,
              dislikes,
            })
          }
          style={[
            styles.thumpContainer,
            { backgroundColor: likes[imdbId] ? Color.green : Color.grey },
          ]}
        >
          <Image source={imageIndex.thumpUP} style={styles.thumpImage} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            handlePreference({
              type: "dislike",
              imdbId,
              token,
              groupId,
              setLikes,
              setDislikes,
              likes,
              dislikes,
            })
          }
          style={[
            styles.thumpContainer,
            { backgroundColor: dislikes[imdbId] ? Color.red : Color.grey },
          ]}
        >
          <Image source={imageIndex.thumpDown} style={styles.thumpImage} />
        </TouchableOpacity>
      </View>

      {/* TITLE */}
      <Text numberOfLines={2} style={styles.title}>
        {movie?.title}
      </Text>

      {/* META */}
      <CustomText
        size={12}
        color={Color.lightGrayText}
        style={{ textAlign: "center", marginVertical: 6 }}
        font={font.PoppinsRegular}
      >
        {movie?.release_year} • {convertRuntime(movie?.runtime)} •{" "}
        {movie?.genres?.join(", ")}
      </CustomText>

      {/* DESCRIPTION */}
       <DescriptionWithReadMore
        description={movie?.description}
        wordNo={70}
        descriptionStyle={{ textAlign: "center" }}
        viewmoreStyle={{ textAlign: "center" }}


         onViewMore={() =>
            setInfoModal(true)
          // setTimeout(() => {
          //               if (!isScrollView.current) {
          //                 setInfoModal(true);
          //               }
          //             }, 200)} 
         }
        
      />
       {/* WATCH NOW */}
      <TouchableOpacity
        style={styles.watchNowContainer}
        onPress={() => watchModalFunc({ imdb_id: imdbId })}
      >
        <Image source={imageIndex.puased} style={styles.watchNowImg} />
        <CustomText
          size={14}
          color={Color.whiteText}
          font={font.PoppinsBold}
        >
          Watch Now
        </CustomText>
      </TouchableOpacity>
    </>
  );
};


const movieCard = useMemo(() => {
  return groupRecommend?.map((movie, index) => {
    const inputRange = [
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
    ];

    // Poster scale
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 1.12, 1],
      extrapolate: "clamp",
    });

    // Info fade (KEY FIX)
    const infoOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={movie?.imdb_id || index}
        style={[styles.cardContainer, { transform: [{ scale }] }]}
      >
        {/* POSTER */}
        <FastImage
          source={{ uri: movie?.cover_image_url }}
          style={styles.poster}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* INFO – ALWAYS RENDERED, ANIMATED */}
        <Animated.View
          style={[
            styles.movieInfo,
            {
              opacity: infoOpacity,
              transform: [{ translateY }],
            },
          ]}
        >
          {renderMovieInfo(movie)}
        </Animated.View>
      </Animated.View>
    );
  });
}, [groupRecommend, likes, dislikes]);



  return (
    <View style={styles.container}>

      {/* <Text style={styles.header}>Let’s invite friends to watch together</Text> */}

{groupRecommend?.length === 0 ? (
   <View style={{ height: 100, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size={20} color={Color.primary} />
  </View>

) : (
  <Animated.ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    snapToInterval={ITEM_WIDTH + SPACING}
    pagingEnabled
    decelerationRate={0.8}
    contentContainerStyle={{
      paddingHorizontal: (width - ITEM_WIDTH) / 2.1,
      alignItems: "center",
      height: "50%",
    }}
    onScroll={onScroll}
    onMomentumScrollEnd={(event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (ITEM_WIDTH + SPACING));
      setActiveIndex(index);
      setTimeout(() => {
        isScrollView.current = false;
      }, 400);
    }}
    onScrollEndDrag={() => {
      setTimeout(() => {
        isScrollView.current = false;
      }, 400);
    }}
    scrollEventThrottle={16}
  >
    {movieCard}
  </Animated.ScrollView>
)}

        {InfoModal && 
      <MovieInfoModal
        visible={InfoModal}
        onClose={() => setInfoModal(false)}
        title={groupRecommend[activeIndex]?.title || "Movie Title"}
        synopsis={groupRecommend[activeIndex]?.description || "Movie Description"}
        releaseDate={groupRecommend[activeIndex]?.release_date || "Unknown"}
        genre={(groupRecommend[activeIndex]?.genres || []).join(', ')}
        groupMembers={groupMembers}
      />
        }
      {/* <FriendthinkModal visible={thinkModal} onClose={() => setthinkModal(false)} reviews={movieReact} /> */}
      {/* watch now modal  */}
      
      { watchNow &&
      <WatchNowModal
        visible={watchNow}
        token={token}
        watchNow={watchNow}
        selectedImdbId={selectedImdbId}
        watchModalLoad={watchModalLoad}
        setWatchModalLoad={setWatchModalLoad}
        onClose={() => setWatchNow(false)} />
      }


{ thinkModal &&
      <FriendthinkModal
        headaing={"Details"}
        visible={thinkModal}
        ranking_react={scoreMovieRank}
        onClose={() => setthinkModal(false)}
        reviews={recommgroupMemebrsScore}
        groupActivity={groupActivity}
        type="react"
      />
}
    </View>
  );
}


const styles = StyleSheet.create({


  container: {
    flex: 1,
    // backgroundColor: 'red',
    height: Dimensions.get('window').height * 1.2

  },


  cardContainer: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING / 2,
    // paddingTop: 30,
    position: 'relative',
    height: ITEM_WIDTH * 1.5, // Fix height to stop shifting
    // justifyContent: 'flex-start', // Or 'center'
  },
  movieInfo: {
    width: ITEM_WIDTH * 2.1,
    // marginLeft: ITEM_WIDTH / 20,
    marginRight: ITEM_WIDTH / 50,
    alignSelf: 'center',
    padding: 15,
    borderRadius: 8,
    height: ITEM_WIDTH * 1.2,
    bottom: 30,
    // backgroundColor:'green'
  },
  poster: {
    width: '88%',
    height: ITEM_WIDTH * 1.2,
    borderRadius: 12,
  },
  thumpCard:
  {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  thumpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: Color.whiteText,
    height: 33,
    width: 33,
    marginRight: 12,
    backgroundColor: Color.grey
  },
  thumpImage: {
    height: 16,
    width: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
  },


  rankingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: SPACING / 2,
    // marginBottom: 6,

  },


  watchNowContainer: {

    flexDirection: 'row',
    // marginVertical:'auto',
    marginTop: "8%",
    marginBottom: "auto",
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Color.primary,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width * 0.4,
    // paddingHorizontal:Dimensions.get('window').width * 0.05,
    borderRadius: 10,
    // marginBottom:14,

  },
  watchNowImg: {
    height: 14,
    width: 14,
    marginRight: 10,

  },
  watchNowText: {

  },
  movieDetailContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    // flexWrap:'wrap',
    // width:'90%',
    alignItems: 'center',
    alignSelf: 'center',
    // justifyContent:'center',
  },
  descriptionContainer:{
    alignSelf:'center',
    textAlign:"center",
  },

});

  
