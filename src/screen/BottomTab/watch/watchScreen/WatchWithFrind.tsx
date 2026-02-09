
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import FastImage from 'react-native-fast-image';

import { Color } from '@theme/color';
import font from '@theme/font';

import WatchNowModal from '@components/modal/WatchNowModal/WatchNowModal';
import { DescriptionWithReadMore } from '@components/common/DescriptionWithReadMore/DescriptionWithReadMore';
import CustomText from '@components/common/CustomText/CustomText';
import { convertRuntime } from '@components/convertRuntime/ConvertRuntime';
import {
  getGroupActivitiesAction,
  recordGroupPreference,
  getFilteredGroupMovies,
  getGroupRecommendedMovies,
  getGroupSearchMovies,
  getGroupMembers,
} from '@redux/Api/GroupApi';
import { RootState } from '@redux/store';
 import GroupMovieModal from '@components/modal/groupMovieModal/groupMovieModal';
import GroupMembersModal from '@components/modal/GroupMemberModal/GroupMemberModal';
import GroupSettingModal from '@components/modal/WatchGroupSetting/WatchGroupSetting';
import imageIndex from '@assets/imageIndex';
import { CustomStatusBar, FriendthinkModal, MovieInfoModal } from '@components/index';
import useMovie from '@screens/BottomTab/discover/movieDetail/useMovie';
import { t } from 'i18next';
import Notification from '@screens/BottomTab/home/homeScreen/Notification/Notification';
import { BlurView } from '@react-native-community/blur';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import GroupScoreModal from '@components/modal/GroupScoreModal/GroupScoreModal';
import { BASE_IMAGE_URL } from '@config/api.config';
import { Alert } from 'react-native';
import ScreenNameEnum from '@routes/screenName.enum';
const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.4;
const SPACING = 7.9;
const ITEM_SIZE = ITEM_WIDTH + SPACING;


// Custom Background Component - NO DELAY
const BackgroundImage = memo(({ imageUri }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [currentImage, setCurrentImage] = useState(imageUri);
  const [prevImage, setPrevImage] = useState(null);

  useEffect(() => {
    if (imageUri && imageUri !== currentImage) {
      // Immediately update current image
      setPrevImage(currentImage);
      setCurrentImage(imageUri);

      // Clear previous image after a very short time
      const timer = setTimeout(() => {
        setPrevImage(null);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [imageUri, currentImage]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none"> 
      {/* Previous image fading out */}
      {/* {prevImage && (
        <Animated.View style={StyleSheet.absoluteFill}>
          <FastImage
            source={{ uri: prevImage }}
            style={StyleSheet.absoluteFill}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
        </Animated.View>
      )} */}

      {/* Current image */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
        {currentImage ? (
          <FastImage
            source={{
              uri: currentImage,
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
            }}
            style={StyleSheet.absoluteFill}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Color.background }]} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
      </Animated.View>
    </View>
  );
});

// Main Component
const WatchWithFrind = () => {
  const route = useRoute()
  const token = useSelector((state: RootState) => state.auth.token);
  const navigation = useNavigation();
  const { groupProps: passedGroupProps, type, groupId, maxActivitiescnt } = route?.params || {};
  const [group, setGroup] = useState(passedGroupProps);
  const [group1, setgroup1] = useState();
  const fetchGroups = async () => {
    try {
      const groupsRes = await getGroupMembers(token, groupId);
      setgroup1(groupsRes); // ✅ state me set karo
    } catch (error) {
    }
  };

  const [watchTogetherGroups, setWatchTogetherGroups] = useState(passedGroupProps);
  const [comment, setcomment] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupMember, setGroupMember] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [groupSettingModal, setGroupSettingModal] = useState(false);
  const [totalFilterApply, setTotalFilterApply] = useState(0);
  const [groupRecommend, setGroupRecommend] = useState([]);
  const [groupRecommendCopyData, setGroupRecommendCopyData] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [watchNow, setWatchNow] = useState(false);
  const [groupScoreModal, setgroupScoreModal] = useState(false);
  const [selectedImdbId, setSelectedImdbId] = useState(null);
  const [selectedImdbScore, setSelectedImdbScore] = useState(null);

  const [watchModalLoad, setWatchModalLoad] = useState(null);
  const [groupActivity, setGroupActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [recommgroupMemebrsScore, setRecommgroupMemebrsScore] = useState([]);
  const [scoreMovieRank, setScoreMovieRank] = useState('');
  const [delayActionPreference, setDelayActionPreference] = useState(false);
  const [group_name, setGroup_name] = useState(group?.groupName || '');

  // Refs
  const scrollX = useRef(new Animated.Value(0)).current;
  const groupActivityRef = useRef([]);
  const searchTimeoutRef = useRef(null);
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  // Modals
  const { setInfoModal, InfoModal, thinkModal, setthinkModal } = useMovie();
  useEffect(() => {
    fetchGroups();

  }, [groupMember]); // 👈 modal open hone par trigger
  // Preload images function
  const preloadImages = useCallback((images) => {
    if (!images || images?.length === 0) return;

    const uris = images
      .filter(movie => movie?.cover_image_url)
      .map(movie => ({ uri: movie?.cover_image_url }));

    if (uris.length > 0) {
      FastImage.preload(uris);
    }
  }, []);

  useEffect(() => {
    const fetchStoredGroup = async () => {
      if (!passedGroupProps) {
        try {
          const storedGroup = await AsyncStorage.getItem('selected_group');
          if (storedGroup) {
            const parsedGroup = JSON.parse(storedGroup);
            setGroup(parsedGroup);
            setWatchTogetherGroups(parsedGroup);
          }
        } catch (error) {
        }
      }
    };
    fetchStoredGroup();
  }, [passedGroupProps]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (groupRecommend?.length > 0) {
      preloadImages(groupRecommend);
    }
  }, [groupRecommend, preloadImages]);

  // Preload images when searchResult changes
  useEffect(() => {
    if (searchResult.length > 0) {
      preloadImages(searchResult);
    }
  }, [searchResult, preloadImages]);

  // Preload adjacent images when activeIndex changes
  useEffect(() => {
    const movies = comment.trim() !== '' ? searchResult : groupRecommend;
    if (movies?.length === 0) return;

    const imagesToPreload = [];

    const current = movies[activeIndex];
    if (current?.cover_image_url) {
      imagesToPreload.push({ uri: current.cover_image_url });
    }

    // Preload next 2 images
    for (let i = 1; i <= 2; i++) {
      const nextIndex = activeIndex + i;
      if (nextIndex < movies.length && movies[nextIndex]?.cover_image_url) {
        imagesToPreload.push({ uri: movies[nextIndex].cover_image_url });
      }
    }

    if (imagesToPreload.length > 0) {
      FastImage.preload(imagesToPreload);
    }
  }, [activeIndex, groupRecommend, searchResult, comment]);

  useEffect(() => {
    fetchGroups();


  }, [notificationModal]);
  // Fetch group activities
  useEffect(() => {
    const fetchGrouchActivities = async () => {
      const response = await getGroupActivitiesAction(token, groupId);
      if (response?.results?.length > 0) {
        response.results.forEach(item => {
          const imdbId = item.movie?.imdb_id;
          if (item?.preference === "like") {
            setLikes(prev => ({ ...prev, [imdbId]: true }));
          } else if (item.preference === "dislike") {
            setDislikes(prev => ({ ...prev, [imdbId]: true }));
          }
        });
      }
    };
    fetchGrouchActivities();
  }, [token]);

  // Fetch group activities for active movie
  useEffect(() => {
    const fetchActivity = async () => {
      setLoadingActivity(true);
      const result = await getGroupActivitiesAction(
        token,
        groupId,
        groupRecommend[activeIndex]?.imdb_id
      );
      setGroupActivity(result?.results);
      groupActivityRef.current = result?.results;
      setLoadingActivity(false);
    };
    if (groupRecommend.length > 0) {
      fetchActivity();
    }
  }, [token, delayActionPreference, activeIndex]);

  useEffect(() => {
    fetchGroups();


  }, [notificationModal]);
  // Trigger preference update
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayActionPreference(prev => !prev);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // Fetch recommended movies
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoading(true);
        const response = await getGroupRecommendedMovies(token, groupId);
        setGroupRecommend(response.results);
        setGroupRecommendCopyData(response.results);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, [groupId]);

  // Search handler with debounce
  const debouncedSearch = useMemo(
    () =>
      debounce((text) => {
        getSreachGroupMovie(token, groupId, text);
      }, 500),
    [token, groupId]
  );

  const handleCommentChange = useCallback(
    (text: string) => {
      setcomment(text);
      if (text.trim() === '') {
        setSearchResult([]);
        setActiveIndex(0);
        return;
      }
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const getSreachGroupMovie = async (token: string, groupId: string, query: string) => {
    setIsSearchLoading(true);
    try {
      const response = await getGroupSearchMovies(token, groupId, query);
      setSearchResult(response || []);
      setActiveIndex(0);
    } catch {
      setSearchResult([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Filter movies
  const filterGroupMovie = async (
    token: string,
    groupId: string,
    selectedUsers?: string[],
    groupValue?: number
  ) => {
    try {
      const response = await getFilteredGroupMovies(token, groupId, groupValue, selectedUsers);
      if (totalFilterApply && response.results.length > 0) {
        setGroupRecommend(response.results);
        setActiveIndex(0);
      } else {
        setGroupRecommend(groupRecommendCopyData);
        setActiveIndex(0);
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (totalFilterApply.length == 0 || totalFilterApply == '') {
      setGroupRecommend(groupRecommendCopyData);
      setActiveIndex(0);
    }
  }, [modalVisible, totalFilterApply]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();
    };
  }, []);

  const handlePreference = async ({
    type,
    imdbId,
    token,
    groupId,
    setLikes,
    setDislikes,
    likes,
    dislikes,
  }) => {
    if (!imdbId) return;

    const isLike = type === "like";

    // 🔹 Previous state save (rollback ke liye)
    const prevLike = !!likes[imdbId];
    const prevDislike = !!dislikes[imdbId];

    // 🔹 New toggle state
    const newLikeState = isLike ? !prevLike : false;
    const newDislikeState = !isLike ? !prevDislike : false;

    // 🚀 OPTIMISTIC UI UPDATE (instant)
    setLikes(prev => ({
      ...prev,
      [imdbId]: newLikeState,
    }));

    setDislikes(prev => ({
      ...prev,
      [imdbId]: newDislikeState,
    }));

    // 🔹 Decide API action
    let apiAction = null;

    if (isLike) {
      apiAction = newLikeState ? "like" : "unlike";
    } else {
      apiAction = newDislikeState ? "dislike" : "undislike";
    }

    try {
      await recordGroupPreference(
        token,
        groupId,
        imdbId,
        apiAction
      );
    } catch (error) {

      // 🔁 ROLLBACK on failure
      setLikes(prev => ({
        ...prev,
        [imdbId]: prevLike,
      }));

      setDislikes(prev => ({
        ...prev,
        [imdbId]: prevDislike,
      }));
    }
  };

  // Watch now function
  const watchModalFunc = ({ imdb_id }) => {
    setSelectedImdbId(imdb_id);

    setWatchNow(true);
  };


  // Determine which movies to display
  const trimmedComment = comment.trim();
  const displayMovies = useMemo(() => {
    return trimmedComment !== '' ? searchResult : groupRecommend;
  }, [searchResult, groupRecommend, trimmedComment]);

  // Get current background image - NO DELAY
  const activeMovieImage = useMemo(() => {
    const movies = displayMovies;
    return movies?.[activeIndex]?.cover_image_url || null;
  }, [displayMovies, activeIndex]);

  // const groupScoreModalFunc = ({ imdb_id, score }) => {
  //   setSelectedImdbId(imdb_id);
  //   setSelectedImdbScore(score);

  //   setgroupScoreModal(true);
  // };

  const groupScoreModalFunc = useCallback(() => {
  const currentMovie = displayMovies[activeIndex];
  if (currentMovie) {
    setSelectedImdbId(currentMovie.imdb_id);
    setSelectedImdbScore(currentMovie.rec_score);
    setgroupScoreModal(true);
  }
}, [displayMovies, activeIndex]);
  // Scroll handler with background transition
  const onScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
          useNativeDriver: true,
          listener: (event) => {
            // Track scroll offset for immediate background update
            const offsetX = event?.nativeEvent?.contentOffset.x;
            scrollOffsetRef.current = offsetX;

            // Calculate current index based on scroll position
            const calculatedIndex = Math.round(offsetX / ITEM_SIZE);
            if (calculatedIndex !== activeIndex) {
              setActiveIndex(calculatedIndex);
            }
          }
        }
      ),
    [activeIndex]
  );

  // Handle scroll end to update active index
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_SIZE);
    setActiveIndex(index);
  };
  const [memberCount, setmemberCount] = useState()

  // Render movie info
  const renderMovieInfo = (movie: string | object | string | number) => {
    const imdbId = movie?.imdb_id;
    return (
      <>
        <View style={[styles.thumpCard ]}>
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
 
              {
                backgroundColor: dislikes[imdbId] ? Color.red : Color.grey,

              },
            ]}
          >
            <Image
              source={imageIndex.thumpDown} style={[styles.thumpImage, {
                marginTop: 0.5,


              }]} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity  
          onPress={()=>    navigation.navigate(ScreenNameEnum.MovieDetailScreen, { imdb_idData: imdbId, token: token })
}
         >
        <Text numberOfLines={1} style={[styles.title, {
          bottom: 20,
          lineHeight: 31

        }]}>
          {movie?.title}
        </Text>
</TouchableOpacity>
        <CustomText
          size={12}
          color={Color.lightGrayText}
          style={{
            textAlign: "center",
            marginVertical: 6,
            bottom: 22,

          }}
          font={font.PoppinsRegular}
          numberOfLines={1}          // limits to 1 line
          ellipsizeMode="tail"       // adds "..." if text is too long
        >
          {movie?.release_year} • {convertRuntime(movie?.runtime)} • {movie?.genres?.join(", ")}
        </CustomText>

        <TouchableOpacity
          style={[styles.groupScoreContainer, {
            bottom: 22,
            // marginBottom:22
          }]}
          onPress={() => groupScoreModalFunc({ imdb_id: imdbId, score: movie?.rec_score })}
        >
          {/* <Image source={imageIndex.puased} style={styles.watchNowImg} /> */}

          <RankingWithInfo
            score={movie?.rec_score ?? '?'}
            title={t("discover.groupScore")}
            description={t("discover.recscoredes")}
           />
          <CustomText size={14} color={Color.whiteText} font={font.PoppinsBold} style={{ marginLeft: 3 }}>
            {t("discover.groupScore")}
          </CustomText>
        </TouchableOpacity>

        <View 
     pointerEvents="box-none"
          style={{
            bottom: 18

          }}
        >

          <DescriptionWithReadMore
            description={movie?.description}
            wordNo={80}
            //      onViewMore={() =>
            //     setInfoModal(true)
            //   // setTimeout(() => {
            //   //               if (!isScrollView.current) {
            //   //                 setInfoModal(true);
            //   //               }
            //   //             }, 200)} 
            //  }
            descriptionStyle={{ textAlign: "center" }}
            viewmoreStyle={{ textAlign: "center" }}
          />
        </View>
        {/* <TouchableOpacity
          style={styles.watchNowContainer}
          onPress={() => watchModalFunc({ imdb_id: imdbId })}
        >
          <Image source={imageIndex.puased} style={styles.watchNowImg} />
          <CustomText size={14} color={Color.whiteText} font={font.PoppinsBold}>
            Watch Now
          </CustomText>
        </TouchableOpacity> */}
        <Pressable
          onPress={() => watchModalFunc({ imdb_id: imdbId })}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              backgroundColor: Color.primary,
              height: 42,
              alignItems: 'center',
              width: width * 0.4,
              borderRadius: 10,
              marginTop: Platform.OS === 'ios' ? 5 : 5,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          // Prevent ScrollView from stealing the touch on iOS
          delayLongPress={200}
        >
          <Image source={imageIndex.puased} style={styles.watchNowImg} />
          <CustomText
            size={14}
            color={Color.whiteText}
            font={font.PoppinsBold}
          >
            Watch Now
          </CustomText>
        </Pressable>
      </>
    );
  };
  const totalMembers = memberCount ?? group1?.results?.length ?? 0;
  // const remainingMembers = Math.max(totalMembers, 0);
  // const remainingMembers = totalMembers;
  const remainingMembers = Math.max(totalMembers - 1, 0);
  // Movie cards with animations
  const movieCard = useMemo(() => {
    // ✅ Guard: Ensure displayMovies is an array
    if (!Array.isArray(displayMovies) || displayMovies.length === 0) {
      return [];
    }

    return displayMovies.map((movie, index) => {
      // ✅ Skip invalid movies
      if (!movie) return null;

      const inputRange = [
        (index - 1) * ITEM_SIZE,
        index * ITEM_SIZE,
        (index + 1) * ITEM_SIZE,
      ];

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [1, 1.12, 1],
        extrapolate: "clamp",
      });

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
          key={movie?.imdb_id || `movie-${index}`}
          style={[styles.cardContainer, { transform: [{ scale }] }]}
        >
          <FastImage
            source={{
              uri: movie?.cover_image_url || '',
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
            }}
            style={[styles.poster, {
              bottom: 22.5
            }]}
            resizeMode={FastImage.resizeMode.cover}
          />

          <Animated.View
            collapsable={false}
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
    }).filter(Boolean); // ✅ Remove null entries
  }, [displayMovies, likes, dislikes, scrollX]);
  const cleanGroupName = group_name
    ?.replace(/\bnull\b/gi, '')             // remove "null"
    ?.replace(/\s{2,}/g, ' ')               // extra spaces
    ?.trim()
    ?.replace(/ ([^,]+)$/g, ' , $1');       // last word se pehle comma
  // ✅ Safe member data selection with array guards
  const membersData =
    (group?.members?.length || 0) >= (group1?.results?.length || 0)
      ? (Array.isArray(group?.members) ? group.members : [])
      : (Array.isArray(group1?.results) ? group1.results : []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'height' : undefined}
      style={{
        flex: 1,
        backgroundColor: "white"
      }}
    >
      {/* Background Image - NO DELAY */}
      <BackgroundImage imageUri={activeMovieImage} />
      {/* <BlurView
        style={styles.absolute}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="white"
        // overlayColor='transparent'
      /> */}
      <SafeAreaView style={[styles.mincontainer, { flex: 1 }]}>
        <CustomStatusBar translucent={true} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", }}>
            <TouchableOpacity onPress={() => {
              fetchGroups();      // call API
              navigation.goBack(); // navigate back
            }}>
              <Image source={imageIndex.backArrow} style={styles.backArrow} />
            </TouchableOpacity>
            <View style={[styles.backArrow, {
              marginRight: 0
            }]} >

            </View>
          </View>
          <CustomText
            size={16}
            color={Color.whiteText}
            style={styles.groupTitle}
            font={font.PoppinsBold}
            numberOfLines={1}
          >
            {/* {cleanGroupName} */}
            {group_name ?? 'Group Name'}

          </CustomText>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={() =>

              setNotificationModal(true)}>
              <Image source={imageIndex.normalNotification} style={styles.notificationIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGroupSettingModal(true)}>
              <Image source={imageIndex.menu} style={styles.menuIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Members */}
        <View>
          <TouchableOpacity
            onPress={() => setGroupMember(true)}
            style={[styles.membersContainer,
            {
              bottom: 6
            }
            ]}
          >
            {type === 'createGroup'
              ? membersData?.slice(0, 3).map((user, index) => (
                <FastImage
                  key={index}
                  style={styles.memberAvatar}
                  source={{
                    uri: `${BASE_IMAGE_URL}${user.avatar}`,
                    priority: FastImage.priority.low,
                    cache: FastImage.cacheControl.immutable,
                  }}
                />
              ))
              : membersData?.slice(0, 3).map((user, index) => (
                <FastImage
                  key={index}
                  style={styles.memberAvatar}
                  source={{
                    uri: `${BASE_IMAGE_URL}${user.avatar}`,
                    priority: FastImage.priority.low,
                    cache: FastImage.cacheControl.immutable,
                  }}
                />
              ))}

            <CustomText
              size={12}
              color={Color.whiteText}
              style={{ marginLeft: 10 }}
              font={font.PoppinsRegular}
              numberOfLines={1}
            >
              {type === 'createGroup'
                ? group1?.results[0]?.username || 'Unnamed'
                : group1?.results[0]?.username?.trim() || 'Unnamed'}
            </CustomText>
            {/* {group1?.result?.length > 1 && (
              <CustomText
                size={12}
                color={Color.whiteText}
                style={{ marginLeft: 2 }}
                font={font.PoppinsRegular}
                numberOfLines={1}
              >
                 {`and ${
    memberCount !== undefined && memberCount !== null
      ? memberCount
      : (group1?.result?.length || 1) - 1
  } members`}
                </CustomText>
            )} */}
            {remainingMembers > 0 && (
              <CustomText
                size={12}
                color={Color.whiteText}
                style={{ marginLeft: 2, flexShrink: 1 }}
                font={font.PoppinsRegular}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {`and ${remainingMembers} ${remainingMembers === 1 ? 'member' : 'members'
                  }`}
              </CustomText>
            )}

          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={[styles.searchFilterContainer, {
          bottom: 6
        }]}>
          <View style={styles.searchContainer}>
            <Image source={imageIndex.search} style={styles.searchImg} />
            <TextInput
              allowFontScaling={false}
              placeholder={t("discover.searchmovies")}
              placeholderTextColor="white"
              style={styles.input}
              onChangeText={handleCommentChange}
              value={comment}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {comment.length > 0 && (
              <TouchableOpacity onPress={() => {
                setcomment('');
                setSearchResult([]);
                setActiveIndex(0);
              }}>
                <Image source={imageIndex.closeimg} style={styles.closingImg} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={imageIndex.filterImg}
              style={[
                styles.filterIcon,
                totalFilterApply > 0 && { tintColor: Color.primary }
              ]}
            />
            {totalFilterApply > 0 && (
              <CustomText
                size={10}
                color={Color.whiteText}
                style={styles.filterBadge}
                font={font.PoppinsMedium}
              >
                {totalFilterApply}
              </CustomText>
            )}
          </TouchableOpacity>
        </View>

        {/* Movie Cards */}
        {loading ? (
          <View style={{
            marginTop: 20
          }}>
            <ActivityIndicator size="small" color={Color.primary} />
          </View>
        ) : displayMovies?.length === 0 ? (
          <View style={styles.loadingContainer}>
            <CustomText size={16} color={Color.whiteText} font={font.PoppinsMedium}>
              No movies found
            </CustomText>
          </View>
        ) : (
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            pagingEnabled
            decelerationRate={0.8}
            contentContainerStyle={{
              paddingHorizontal: (width - ITEM_WIDTH) / 2,
              alignItems: "center",
              height: height * 0.38,
            }}
            onScroll={onScroll}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
          >
            {movieCard}
          </Animated.ScrollView>
        )}

        {/* Modals */}
        {InfoModal && (
          <MovieInfoModal
            visible={InfoModal}
            onClose={() => setInfoModal(false)}
            title={displayMovies[activeIndex]?.title || "Movie Title"}
            synopsis={displayMovies[activeIndex]?.description || "Movie Description"}
            releaseDate={displayMovies[activeIndex]?.release_date || "Unknown"}
            genre={(displayMovies[activeIndex]?.genres || []).join(', ')}
            groupMembers={group.members}
          />
        )}

        {watchNow && (
          <WatchNowModal
            visible={watchNow}
            token={token}
            watchNow={watchNow}
            selectedImdbId={selectedImdbId}
            watchModalLoad={watchModalLoad}
            setWatchModalLoad={setWatchModalLoad}
            onClose={() => setWatchNow(false)}
          />
        )}

        {thinkModal && (
          <FriendthinkModal
            headaing={"Details"}
            visible={thinkModal}
            ranking_react={scoreMovieRank}
            onClose={() => setthinkModal(false)}
            reviews={recommgroupMemebrsScore}
            groupActivity={groupActivity}
            type="react"
          />
        )}

        {/* {groupMember && (
          <WatchGroupMemberModal
            visible={groupMember}

      groupMembers={group1?.results}
            // groupMembers={group.members}
            onClose={() => setGroupMember(false)}
            token={token}
            heading={"Group Members"}
          />
        )} */}
        <GroupMembersModal visible={groupMember}
          groupMembers={membersData}
          // groupMembers={group1?.results || group?.members}
          onClose={() => setGroupMember(false)}
          token={token}
          heading={"Group Members"} />


        {groupScoreModal && (
          <GroupScoreModal
            visible={groupScoreModal}

            // groupMembers={group1}
            groupMembers={group.members}
            onClose={() => setgroupScoreModal(false)}
            token={token}
            heading={"Details"}
            imdb_id={displayMovies[activeIndex]?.imdb_id}
            groupId={groupId}
            groupScore={displayMovies[activeIndex]?.rec_score}
          />
        )}

        {/* {groupSettingModal && ( */}
        <GroupSettingModal
          visible={groupSettingModal}
          group={group1?.results}
          // group={group}
          groupId={groupId}
          token={token}
          group_name={group_name}
          setGroup_name={setGroup_name}
          onClose={(cc) => {
            fetchGroups()
            setmemberCount(cc);
            setGroupSettingModal(false)
          }}
        />
        {/* )} */}
        <Notification
          visible={notificationModal}
          onClose={() => {
            fetchGroups();          // call API
            setNotificationModal(false); // close modal
          }}
          bgColor={true}
        />
        {/* <View style={{
          bottom:120
        }}>
 
         </View> */}
        <GroupMovieModal
          visible={modalVisible}
          group={group1?.results || group.member}
          // group={group1?.results ||group.member}
          // group={group}
          groupId={groupId}
          token={token}
          filterFunc={(selectedUsers, groupValue) =>
            filterGroupMovie(token, groupId, selectedUsers, groupValue)
          }
          onClose={() => setModalVisible(false)}
          setTotalFilterApply={setTotalFilterApply}
          groupTotalMember={maxActivitiescnt}
        // groupTotalMember={group.members.length}
        />

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Container styles
  mincontainer: {
    flex: 1,
  },
  bg: {
    backgroundColor: Color.background,
    flex: 1,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  backArrow: {
    height: 24,
    width: 24,
    marginRight: 12,
  },
  groupTitle: {
    textAlign: 'center',
    flex: 1,
  },
  notificationIcon: {
    height: 22,
    width: 22,
    marginRight: 12,
  },
  menuIcon: {
    height: 22,

    width: 22,
  },

  // Members styles
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  memberAvatar: {
    height: 18,
    width: 18,
    borderRadius: 20,
    marginRight: -4,
  },

  // Search and Filter styles
  searchFilterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '90%',
    borderRadius: 25,
    borderWidth: 0.5,
    borderColor: Color.whiteText,
    height: 45,
  },
  input: {
    paddingHorizontal: 5,
    flex: 1,
    color: Color.whiteText,
    paddingVertical: 0,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    includeFontPadding: false,
  },
  searchImg: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  closingImg: {
    height: 16,
    width: 16,
    resizeMode: 'contain',
    tintColor: Color.whiteText,
  },
  filterIcon: {
    height: 24,
    width: 24,
    marginLeft: 8,
    resizeMode: "contain",
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Color.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Movie cards styles
  cardContainer: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING / 2,
    position: 'relative',
    height: ITEM_WIDTH * 1.5,
    marginLeft: 4
  },
  poster: {
    width: '88%',
    height: ITEM_WIDTH * 1.2,
    borderRadius: 12,
  },
  movieInfo: {
    width: ITEM_WIDTH * 2.1,
    marginRight: ITEM_WIDTH / 50,
    alignSelf: 'center',
    padding: 15,
    borderRadius: 8,
    height: ITEM_WIDTH * 1.2,
    bottom: 40,
    
  },

  // Movie info styles
  thumpCard: {
    flexDirection: 'row',
    alignSelf: 'center',
    bottom: 30
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
    backgroundColor: Color.grey,
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
  watchNowContainer: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Color.primary,
    height: 42,
    alignItems: 'center',
    width: width * 0.4,
    borderRadius: 10,
  },

  groupScoreContainer: {
    flexDirection: 'row',
    // marginTop: 5,
    justifyContent: 'center',
    // alignSelf: 'center',
    // backgroundColor: Color.primary,
    height: 42,
    alignItems: 'center',
    // width: width * 0.4,
    borderRadius: 10,
  },
  watchNowImg: {
    height: 14,
    width: 14,
    marginRight: 10,
  },

  // Loading and no results
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.5,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default memo(WatchWithFrind);