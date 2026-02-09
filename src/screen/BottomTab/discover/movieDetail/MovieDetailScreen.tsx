import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import styles from './style';
import useMovie from './useMovie';
import ProgressBar from './ProgressBar';
import { Color } from '@theme/color';
import ScreenNameEnum from '@routes/screenName.enum';
import font from '@theme/font';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScoreIntroModal from '@components/modal/ScoreIntroModal/ScoreIntroModal';
import WatchNowModal from '@components/modal/WatchNowModal/WatchNowModal';
import { getEpisodes, getEpisodesBySeason, getMovieMetadata, recordTrailerInteraction } from '@redux/Api/movieApi';
import { getMatchingMovies } from '@redux/Api/ProfileApi';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import { useBookmarks } from '@hooks/useBookmark';
import { useTrailerTracker } from '@hooks/useTrailerTracker';
import CustomText from '@components/common/CustomText/CustomText';
import LinearGradient from 'react-native-linear-gradient';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { RootState } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMute } from '@redux/feature/videoAudioSlice';
import VideoPlayer from '@utils/NewNativeView';
import CustomVideoPlayer from '@components/common/CustomVideoPlayerios';
import { CustomStatusBar, EpisodesModal, HeaderCustom, MoreSheetModal, MovieInfoModal } from '@components/index';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import imageIndex from '@assets/imageIndex';
import MovieDetailsShimmer from '@components/MovieDetailsShimmer/MovieDetailsShimmer';
import { t } from 'i18next';
// import CommentModal from '@components/modal/comment/CommentModal';
const CommentModal = React.lazy(() =>
  import('@components/modal/comment/CommentModal')
);


type MovieDetailScreenParams = {
  backnavigate: string;
};

const MovieDetailScreen = () => {
  const navigation = useNavigation();
  const {
    watchModal, setWatchModal,
    episVisible, setEpisVisible,
    MorelikeModal, setMorelikeModal,
    InfoModal, setInfoModal,
    thinkModal, setthinkModal
  } = useMovie();
  const route = useRoute();
  const { imdb_idData, token } = route?.params;
  const { toggleBookmark: toggleBookmarkHook } = useBookmarks(token);
  const isModalClosed = useSelector((state: RootState) => state.modal.isModalClosed);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [movieData, setMovieData] = useState([null, null, null]);
  // const [savedMovies, setSavedMovies] = useState({});
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1); // Start at the middle item
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const BOTTOM_TAB_HEIGHT = 65;
  const ITEM_HEIGHT = windowHeight - BOTTOM_TAB_HEIGHT - insets.bottom - insets.top;
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [watchNow, setWatchNow] = useState(false);
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [sessionList, setSessionList] = useState<{ id: number; session: string }[]>([]);
  const [reviews, setReviews] = useState([])
  const [progress, setProgress] = useState(1);
  // const [videoIndex, setVideoIndex] = useState(null);
  const posterOpacity = useRef(new Animated.Value(1)).current;
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(false)
  const trailerTracker = useTrailerTracker(token);
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  // const [movieData__has_rated, setMovieData__has_rated] = useState(false);
  // const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentSeedId, setCurrentSeedId] = useState(imdb_idData);
  const [matchingQueue, setMatchingQueue] = useState([]);
  // const fetchedIdsRef = useRef(new Set());
  const isInitialLoad = useRef(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const isResettingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveBookMark_Ref = useRef(false)
  const [modalMovieId, setModalMovieId] = useState(null);
  const [titleLines, setTitleLines] = useState(1);
  const dispatch = useDispatch()
  const isMuted = useSelector((state: RootState) => state.videoAudio.isMuted);
  const [isShowMuteIcon, setIsShowMuteIcon] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // explain scroll refs   
  const scrollRef = useRef(null);
  const [wholeContentHeight, setWholeContentHeight] = useState(1);
  const [visibleContentHeight, setVisibleContentHeight] = useState(0);
  const [scrollIndicatorHeight, setScrollIndicatorHeight] = useState(0);
  const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);
  const has_rated_ref = useRef(false);
  const [commetText, setCommentText] = useState('')
  const [isFeedbackModal, setIsFeedbackModal] = useState(false);
  // const [isBookmarked, setIsBookmarked] = useState(!!is_bookMark);

  // 1) content size change -> total content height
  const handleContentSizeChange = (contentWidth, contentHeight) => {
    setWholeContentHeight(contentHeight || 1);
  };

  // 2) layout -> visible area height
  const handleLayout = ({ nativeEvent: { layout: { height } } }) => {
    setVisibleContentHeight(height || 0);
  };

  const outerScrollEnableds = useRef(true);

  const setOuterScrollEnabledInstant = (val) => {
    outerScrollEnableds.current = val;
  };


  // 3) calculate indicator height whenever sizes change
  useEffect(() => {
    if (wholeContentHeight > 0 && visibleContentHeight > 0) {
      const ratio = visibleContentHeight / wholeContentHeight;
      const clampedRatio = Math.min(1, ratio);
      const minIndicatorHeight = 20;
      const calcHeight = Math.max(
        visibleContentHeight * clampedRatio,
        Math.min(minIndicatorHeight, visibleContentHeight)
      );
      setScrollIndicatorHeight(calcHeight);
    }
  }, [wholeContentHeight, visibleContentHeight, currentIndex, movieData]);

  // 4) onScroll -> update indicator position
  const handleScroll = ({ nativeEvent: { contentOffset: { y } } }) => {
    const scrollableHeight = Math.max(0, wholeContentHeight - visibleContentHeight);
    const indicatorScrollableHeight = Math.max(0, visibleContentHeight - scrollIndicatorHeight);
    const position =
      scrollableHeight > 0 ? (y / scrollableHeight) * indicatorScrollableHeight : 0;
    setScrollIndicatorPosition(position);
  };

  const [bookmarkMap, setBookmarkMap] = useState<{ [k: string]: boolean }>({});
  const bookmarkMapRef = useRef(bookmarkMap);

  useEffect(() => {
    bookmarkMapRef.current = bookmarkMap;
  }, [bookmarkMap]);

  useEffect(() => {
    if (movieData && movieData[1]) {
      const m = movieData[1];
      if (m?.imdb_id) {
        setBookmarkMap(prev => ({ ...prev, [m.imdb_id]: !!m.is_bookmarked }));
      }
    }
  }, [movieData]);


  const handleToggleBookmark = useCallback(async (imdb_id) => {
    const current = bookmarkMapRef.current[imdb_id] ?? false;
    setBookmarkMap(prev => {
      const newMap = { ...prev, [imdb_id]: !current };
      bookmarkMapRef.current = newMap;
      return newMap;
    });

    // Background API call (doesn't block UI)
    try {
      const res = await toggleBookmarkHook(imdb_id);
      if (typeof res === 'boolean') {
        // ✅ Sync back result (only if changed)
        setBookmarkMap(prev => {
          if (prev[imdb_id] === res) return prev;
          const newMap = { ...prev, [imdb_id]: res };
          bookmarkMapRef.current = newMap;
          return newMap;
        });
      }
    } catch (err) {
      // revert on failure
      setBookmarkMap(prev => {
        const newMap = { ...prev, [imdb_id]: current };
        bookmarkMapRef.current = newMap;
        return newMap;
      });
    }
  }, [toggleBookmarkHook]);
  const [isScrollingDescription, setIsScrollingDescription] = useState(false);
  const descriptionScrollRef = useRef<ScrollView>(null);
  const descriptionScrollOffset = useRef(0);
  const descriptionScrollEnabled = useRef(true);
  useEffect(() => {
    flatListRef.current?.setNativeProps({
      scrollEnabled: outerScrollEnableds.current
    });
  }, [outerScrollEnableds.current]);
  // Navigation effect
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      setIsVideoPaused(false);

      return () => {
        setIsVideoPaused(true);
        trailerTracker.triggerInteractionIfAny();
        trailerTracker.resetTracker();
      };
    }, [])
  );
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [meta, matching] = await Promise.all([
          // getMovieMetadata(token, imdb_idData),
          getMovieMetadata(token, imdb_idData),
          getMatchingMovies(token, imdb_idData)
        ]);

        // Load initial movie
        // const meta = await getMovieMetadata(token, imdb_idData);
        setMovieData([null, meta, null]);
        setCurrentSeedId(imdb_idData);
        saveBookMark_Ref.current = meta?.is_bookmarked
        setSelectedMovie(meta?.imdb_id);

        // Load matching movies for queue
        // const matching = await getMatchingMovies(token, imdb_idData);
        setMatchingQueue(matching?.results || []);
        isInitialLoad.current = false;

        // Load comments
        // await sgetCommenst(token, imdb_idData, false);
        setIsLoading(false)
      } catch (err) {
        isInitialLoad.current = false;

        // Alert.alert("Error", "Failed to load movie data");
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };
    loadInitialData();
  }, [imdb_idData, token]);



  useEffect(() => {
    posterOpacity.setValue(1);
    setProgress(0)
  }, [movieData]);

  // more movie sheet
  const openMoreModal = () => {
    setModalMovieId(movieData[currentIndex]?.imdb_id);
    setMorelikeModal(true);
  };
  const [videoDuration, setVideoDuration] = useState(0);
  const onLoad = useCallback((data: object | string) => {
    setVideoDuration(data.duration || 0);
    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);


  const fetchNextMovieFromQueue = async (prevImdb) => {
    try {
      setLoadingMore(true);
      setIsLoading(true)
      let queue = [...matchingQueue];
      // if (!queue.length) {
      const matching = await getMatchingMovies(token, prevImdb);
      queue = matching?.results || [];
      // }
      if (!queue.length) return null;
      //   const randomId = Math.floor(Math.random() * 10) + 1;

      // const nextMovie = queue.shift();
      // Pick a random index between 0 and queue.length - 1
      const randomIndex = Math.floor(Math.random() * queue.length);

      // Get the movie at that index
      const nextMovie = queue[randomIndex];
      // Optionally, remove it from the queue if you want
      queue.splice(randomIndex, 1);

      setMatchingQueue(queue);

      setMatchingQueue(queue);
      const meta = await getMovieMetadata(token, nextMovie?.imdb_id);
      saveBookMark_Ref.current = meta?.is_bookmarked
      // Alert.alert(meta.imdb_id)
      setLoadingMore(true);
      setIsLoading(false)
      setSelectedMovie(meta.imdb_id);

      return meta;
    } catch (error) {
      setIsLoading(false)
      return null;
    } finally {
      setLoadingMore(false);
    }
  };

  // useEffect(() => {
  // }, [currentIndex, movieData]);

  const handleMomentumScrollEnd = async (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / ITEM_HEIGHT);

    if (newIndex !== currentIndex && !isResettingRef.current) {
      if (newIndex === 0 || newIndex === 2) {
        isResettingRef.current = true; // prevent multiple triggers
        const prevId = movieData[1]?.imdb_id || currentSeedId;

        // Immediately reset middle slot to null for shimmer
        setMovieData([null, null, null]);
        setProgress(0);
        let newMovie = await fetchNextMovieFromQueue(prevId);
        if (newMovie) {
          setMovieData([null, newMovie, null]);
          setIsLoading(false)
          setCurrentSeedId(newMovie.imdb_id);

          // Reset scroll position to the middle and update index after scroll resets
          flatListRef.current?.scrollToIndex({ index: 1, animated: false });

          setTimeout(() => {
            setCurrentIndex(1); // ✅ Update index after scroll resets
            isResettingRef.current = false; // ✅ Allow future scrolls
          }, 200);
        } else {
          isResettingRef.current = false;
        }
      }
    }
  };
  const [EpisodesLoder, setEpisodesLoder] = useState(false)

  useEffect(() => {
    if (
      episVisible === true &&
      movieData?.[currentIndex]?.imdb_id
    ) {
      getEpisodesdata();
      fetchAllSeasons();
    }
  }, [episVisible, movieData, currentIndex]);

  const getEpisodesdata = async () => {
    const imdb_id = movieData[currentIndex]?.imdb_id;
    if (!imdb_id) return;

    try {
      const response = await getEpisodes(token, imdb_id);

      let episodesData = [];
      if (response && typeof response === "object" && !Array.isArray(response)) {
        episodesData = Object.values(response).flat();
      } else if (Array.isArray(response)) {
        episodesData = response;
      }

      const formattedEpisodes = episodesData.map((ep, index) => ({
        id: index + 1,
        title: ep.episode_name || `Episode ${index + 1}`,
        duration: ep.runtime ? `${ep.runtime} min` : "Unknown",
      }));

      setEpisodes(formattedEpisodes);
    } catch (error) {
      setEpisodes([]);
    }
  };
  const fetchAllSeasons = async () => {
    const imdb_id = movieData[currentIndex]?.imdb_id;
    if (!imdb_id) return;

    setEpisodesLoder(true);
    try {
      const response = await getEpisodes(token, imdb_id);

      if (response && typeof response === "object") {
        const seasonKeys = Object.keys(response);

        const dynamicList = seasonKeys.map((key) => ({
          id: Number(key),
          session: `Season ${key}`,
        }));

        setSessionList(dynamicList);
      }
    } catch (error) {
    } finally {
      setEpisodesLoder(false);
    }
  };

  // Episodes data
  // const getEpisodesdata = async () => {
  //   const imdb_id =movieData[currentIndex]?.imdb_id
  //   // const imdb_id = "tt0944947";
  //   try {
  //     const response = await getEpisodes(token, imdb_id);
  //     let episodesData = [];

  //     if (response && typeof response === 'object' && !Array.isArray(response)) {
  //       const allSeasons = Object.values(response);
  //       episodesData = allSeasons.flat();
  //     } else if (Array.isArray(response)) {
  //       episodesData = response;
  //     }
  //     const formattedEpisodes = episodesData.map((ep, index) => ({
  //       id: index + 1,
  //       title: ep.episode_name || `Episode ${index + 1}`,
  //       duration: ep.runtime ? `${ep.runtime} min` : "Unknown",
  //       // image: ep.image || movieData[currentIndex]?.cover_image_url,
  //     }));

  //     setEpisodes(formattedEpisodes);
  //   } catch (error) {
  //     setEpisodes([]);
  //   }
  // };

  // Example in the event handler when opening the modal:
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const imdb_id = movieData?.[currentIndex]?.imdb_id;

    if (!episVisible || !imdb_id || hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    getEpisodesdata()
  }, [episVisible, currentIndex, movieData]);

  // const fetchAllSeasons = async () => {
  //   const imdb_id = movieData[currentIndex]?.imdb_id
  //   // const imdb_id = "tt0944947" 
  //   setEpisodesLoder(true)
  //   try {
  //     const response = await getEpisodes(token, imdb_id);
  //     if (response && typeof response === 'object') {
  //       setEpisodesLoder(false)

  //       const seasonKeys = Object.keys(response);

  //       const dynamicList = seasonKeys.map((key) => ({
  //         id: parseInt(key),
  //         session: `Session ${key}`,
  //       }));
  //       setEpisodesLoder(false)

  //       setSessionList(dynamicList);
  //     }
  //   } catch (error) {
  //     setEpisodesLoder(false)

  //   }
  // };

  const handleFetchSeasonEpisodes = async (seasonNumber = 3) => {
    const imdb_id = movieData[currentIndex]?.imdb_id
    setEpisodesLoder(true)
    try {
      const response = await getEpisodesBySeason(token, imdb_id, seasonNumber);
      const seasonData = Object.values(response).flat();
      setEpisodesLoder(false)

      const formattedEpisodes = seasonData.map((ep, index) => ({
        id: index + 1,
        title: ep?.episode_name || `Episode ${index + 1}`,
        duration: ep?.runtime ? `${ep?.runtime} min` : "Unknown",
        image: ep?.image || imageIndex.moviesPoster,
      }));
      setEpisodesLoder(false)

      setEpisodes(formattedEpisodes);
    } catch (err) {
      setEpisodesLoder(false)

      setEpisodes([]);
    }
  };
  // Format runtime
  const formatRuntime = (runtime) => {
    if (!runtime || isNaN(runtime)) return '';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Compare modals
  const compareHook = useCompareComponent(token);

  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
  };

  useEffect(() => {
    if (movieData[currentIndex]) {
      setReviews([])
      setCommentText('')
      const currentMovie = movieData[currentIndex];
      has_rated_ref.current = currentMovie?.has_rated ?? false;
    }
  }, [currentIndex, movieData]);
  // }, [currentIndex, movieData]);


  const showCommenRankingCheck = () => {
    if (!movieData[currentIndex]?.has_rated && !has_rated_ref.current) {
      handleRankingPress({
        imdb_id: movieData[currentIndex]?.imdb_id,
        title: movieData[currentIndex]?.title,
        release_year: movieData[currentIndex]?.release_year,
        cover_image_url: movieData[currentIndex]?.cover_image_url,
      });
      setthinkModal(true)
      // has_rated_ref.current = true
      // if(imdb_idData && route.name == ScreenNameEnum.MovieDetailScreen){
      // setthinkModal(false)

      // }

      // has_rated_ref.current = true
    } else {
      // getComment(token, movieData[currentIndex]?.imdb_id, true);
    };
  };

  useEffect(() => {
    if (isModalClosed) {

      if (movieData[currentIndex] && route.name == ScreenNameEnum.MovieDetailScreen) {
        setthinkModal(false)
        has_rated_ref.current = true;
        //         setTimeout(() => {
        //         setthinkModal(true)
        //         }, 800);
      }
      // checkHasRated()
    }
  }, [isModalClosed]);

  const checkHasRated = () => {
    if (has_rated_ref.current) {
    } else {
    }
  };

  const handleVideoLoad = (data: { duration: number }) => {
    setVideoDuration(data.duration);
    setDuration(data.duration);

    // Hide poster when video loads
    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  const [currentTime, setCurrentTime] = useState(0);
  // Fix the progress handler

  // Fix progress handler to properly handle seeking
  const onVideoProgress = useCallback((data: { currentTime: number; duration: number; progress: number }) => {
    // Only update if not currently seeking
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
      setDuration(data.duration);
      setProgress(data.progress);


      // Track trailer progress
      if (!isVideoPaused && movieData[currentIndex]) {
        trailerTracker.onProgress({
          currentTime: data.currentTime,
          imdb_id: movieData[currentIndex].imdb_id,
          trailer_url: movieData[currentIndex].trailer_url,
        });
      }
    } else {
    }
  }, [isVideoPaused, currentIndex, isSeeking]);


  const handlerShowMuteImg = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsShowMuteIcon(true);
    timerRef.current = setTimeout(() => {
      setIsShowMuteIcon(false);
    }, 5000);
  }, []);

  useEffect(() => {
    // force minimal update only when required
    flatListRef.current?.setNativeProps({
      scrollEnabled: outerScrollEnableds.current
    });
  }, []);
  useEffect(() => {
    handlerShowMuteImg();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, handlerShowMuteImg]);

  const handleOpenCommentModal = () => {
    if (!movieData[currentIndex]?.has_rated && !has_rated_ref.current) {
      handleRankingPress({
        imdb_id: movieData[currentIndex]?.imdb_id,
        title: movieData[currentIndex]?.title,
        release_year: movieData[currentIndex]?.release_year,
        cover_image_url: movieData[currentIndex]?.cover_image_url,
      });
    }
    setthinkModal(true); // now modal opens only on user action
  };

  useEffect(() => {
  }, [isMuted]);

  const renderShimmerEffect = () => {
    return (
      <MovieDetailsShimmer ITEM_HEIGHT={ITEM_HEIGHT} navigation={navigation} />

    );

  }



  const handleSeek = useCallback((newProgress: number) => {
    if (duration <= 0) {
      return;
    }
    const seekTimeInSeconds = newProgress * duration;
    setIsSeeking(true);
    setProgress(newProgress);
    setCurrentTime(seekTimeInSeconds);
    setSeekPosition(seekTimeInSeconds); // This triggers the native seek

    setTimeout(() => setIsSeeking(false), 300);
  }, [duration]);

  const onProgress = (data: object | string) => {
    setCurrentTime(data.currentTime);
  };

  const seekBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
  };

  const seekForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
  };

  const [paused, setPaused] = useState(false); // Start playing by default
  const prevModalState = useRef(false);

  useEffect(() => {
    const isModalOpen = thinkModal
    // const isModalOpen =  thinkModal || isFeedbackModal;

    if (isModalOpen) {
      // Modal opened - pause video
      prevModalState.current = true;
      setPaused(true);
    } else if (prevModalState.current && !isModalOpen) {
      // Modal just closed - resume video
      prevModalState.current = false;
      setPaused(false);
    }
  }, [isFeedbackModal, thinkModal]);



  // Render movie item
  const renderMovieDetail = useCallback(
    ({ item, index }) => {
      if (item) {
      }
      if (!item) {
        return renderShimmerEffect();
      }
      saveBookMark_Ref.current = item?.is_bookmarked

      return (
        <View style={{ height: ITEM_HEIGHT, flexDirection: "column", paddingTop: 6, }}>
          {/* header */}
          <CustomStatusBar />
          <HeaderCustom
            backIcon={imageIndex.backArrow}
            rightIcon={imageIndex.search}
            onRightPress={() => navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' })}
            onBackPress={() => navigation.goBack()}
          />
          <View style={{ marginTop: -4, paddingHorizontal: 0, }}
          // onPress={handlerShowMuteImg}
          >
            {/* <View style={{ position: 'relative' }}> */}
            {/* <TouchableOpacity
              style={{
                position: 'absolute',
                // bottom: 0,
                right: 10,
                left: 10,
                top: 11,
                height: '30%',
                zIndex: 999
              }}
              onPress={handlerShowMuteImg}
            /> */}
            {Platform.OS == "ios" ? <>

              {/* <CustomVideoPlayer
                videoUrl={item.trailer_url}
                paused={paused || isFeedbackModal || thinkModal}
                muted={isMuted}
                onTogglePause={() => setPaused(p => !p)}
                onToggleMute={() => dispatch(toggleMute())}
                isModalOpen={isFeedbackModal || thinkModal}
              /> */}
              <CustomVideoPlayer
                videoUrl={item.trailer_url}
                // paused={paused}
                paused={paused || isFeedbackModal || thinkModal}
                muted={isMuted}
                onTogglePause={() => setPaused(p => !p)}
                onToggleMute={() => dispatch(toggleMute())}
                isModalOpen={thinkModal}
              />



              {/* <Video
                // source={{ uri: item?.trailer_url }}
                source={{ uri: item.trailer_url }}
                // source={{ uri:   item?.trailer_url  }}
                style={{ height: windowHeight / 3.9, width: '100%' }}
                resizeMode='stretch' 
                
                repeat
                muted={isMuted}
                paused={isVideoPaused || index !== currentIndex || isSeeking}
                onProgress={onVideoProgress}

                onLoad={onLoad}
                ref={videoRef}

                useExoPlayer={Platform.OS === 'android'}

                bufferConfig={{
                  minBufferMs: 2000,
                  maxBufferMs: 5000,
                  bufferForPlaybackMs: 1000,
                  bufferForPlaybackAfterRebufferMs: 1000,
                }}
                ignoreSilentSwitch="ignore"
                playInBackground={false}
                playWhenInactive={false}
                automaticallyWaitsToMinimizeStalling={true} // iOS: auto buffer
                // Prevents the video from playing when the app is inactive or in the background
                controls={true}
                disableFocus={true}

                hideShutterView

                shutterColor="transparent"
              /> */}


            </> : <>

              {/* <VideoPlayer
                // source={{ uri: item?.trailer_url }}
                // movieId={item.imdb_id}
                // posterUrl={item.horizontal_poster_url}
                // style={{ height: windowHeight / 3.9, width: '100%' }}
                // resizeMode='stretch'
                // repeat
                // muted={isMuted}
                // paused={isVideoPaused || index !== currentIndex || isSeeking}
                // onProgress={onVideoProgress}
                // seekTo={isSeeking ? seekPosition : undefined}  
                // onSeek={(position) => {
    
                //  }}
                // ref={videoRef}
                  source={{ uri: item?.trailer_url }}
                movieId={item.imdb_id}
                posterUrl={item.horizontal_poster_url}
                style={{ height: windowHeight / 3.9, width: '100%' }}
                resizeMode='stretch'
                repeat
                muted={isMuted}
                paused={isVideoPaused || index !== currentIndex || isSeeking}
                onProgress={onVideoProgress}
                seekTo={isSeeking ? seekPosition : undefined} // This should be in seconds
                onLoad={handleVideoLoad}
                onSeek={(position) => {
                 ('✅ Native seek completed:', position);
                   // Optional: Handle native seek completion
                }}
                ref={videoRef}
              /> */}
              <CustomVideoPlayer
                videoUrl={item.trailer_url}
                paused={paused}
                muted={isMuted}
                onTogglePause={() => setPaused(p => !p)}
                onToggleMute={() => dispatch(toggleMute())}
                isModalOpen={thinkModal}
              />
              {/* <CustomVideoPlayer
                videoUrl={item.trailer_url}
                paused={paused}
                muted={isMuted}
                onTogglePause={() => setPaused(p => !p)}
                onToggleMute={() => dispatch(toggleMute())}
                isModalOpen={isFeedbackModal || thinkModal}
              /> */}




            </>}
            {isShowMuteIcon && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: Platform.OS === "ios" ? 33 : 10,
                  right: 10,
                  zIndex: 1000,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: 20,
                  padding: 8,
                }}
                onPress={() => {
                  dispatch(toggleMute());
                  handlerShowMuteImg();
                }}
              >
                <Image
                  source={isMuted ? imageIndex.volumeOff : imageIndex.mute}
                  style={{ height: 20, width: 20, tintColor: Color.whiteText }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}

          </View>

          {/* details  */}
          <View style={{ flex: 1, justifyContent: 'space-between' }}  >

            {/* Content */}
            <View style={[styles.infoContainer, {}]}>
              <CustomText
                size={24}
                color={Color.whiteText}
                style={styles.title}
                font={font.PoppinsBold}
                numberOfLines={2}
                onTextLayout={(e) => {
                  const lines = e.nativeEvent.lines.length;
                  setTitleLines(lines);
                }}

              >
                {item?.title}
              </CustomText>

              <View style={{ marginTop: 5 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4, alignItems: 'center' }}
                >
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',

                  }}>
                    {
                      item?.release_year && (
                        <CustomText
                          size={12}
                          color={Color.lightGrayText}
                          style={styles.subInfo}
                          font={font.PoppinsRegular}
                        >
                          {item?.release_year},{' '}
                        </CustomText>
                      )
                    }

                    {formatRuntime(item?.runtime) &&

                      <CustomText
                        size={12}
                        color={Color.lightGrayText}
                        style={styles.subInfo}
                        font={font.PoppinsRegular}
                      >
                        {formatRuntime(item?.runtime)},{' '}
                      </CustomText>
                    }
                    <CustomText
                      size={12}
                      color={Color.lightGrayText}
                      style={styles.subInfo}
                      font={font.PoppinsRegular}
                    >
                      {t("movieDetail.subtitle")},{' '}
                    </CustomText>

                    {item?.genres && item.genres.length > 0 && (
                      <Text style={styles.genresText} allowFontScaling={false}>
                        {item?.genres.join(', ')}
                      </Text>
                    )}
                  </View>
                </ScrollView>
              </View>

              <View style={[styles.scoreRow, { marginTop: 4.5 }]}>
                <TouchableOpacity style={styles.scoreBoxGreen}
                  disabled={true}
                // onPress={() => setShowFirstModal(true)}

                >
                  {/* <RankingCard ranked={item?.rec_score} /> */}
                  <RankingWithInfo
                    score={item?.rec_score}
                    title={t("discover.recscore")}
                    description={t("discover.recscoredes")}
                  // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                  />
                  <TouchableOpacity disabled={true}>
                    <CustomText

                      size={14}
                      color={Color.whiteText}
                      style={{ marginLeft: 6 }}
                      font={font.PoppinsMedium}
                    >

                      {t("discover.recscore")}
                    </CustomText>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.scoreBoxGreen, {
                }]}
                  //  onPress={() => setShowSecondModal(true)}

                  disabled={true}
                >
                  {/* <RankingCard ranked={item?.friends_rec_score} /> */}
                  <View style={{}} >

                    <RankingWithInfo
                      score={item?.friends_rec_score}
                      title={t("discover.friendscore")}
                      description=
                      {t("discover.ratingscoreshows")}

                    // "This score shows the rating from your friend for this title."
                    />
                  </View>

                  <CustomText
                    size={14}
                    color={Color.whiteText}
                    style={{ marginLeft: 6 }}
                    font={font.PoppinsMedium}
                  >
                    {t("discover.friendscore")}

                  </CustomText>
                </TouchableOpacity>


                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}
                    // onPress={showCommenRankingCheck}
                    onPress={() => setthinkModal(true)}
                  // onPress={handleOpenCommentModal}
                  >
                    <Image source={imageIndex.mess} style={{ height: 20, width: 20 }} resizeMode='contain' />
                    {item?.n_comments > 0 && (
                      <CustomText
                        size={14}
                        color={Color.lightGrayText}
                        style={{ marginLeft: 3, marginTop: 4 }}
                        font={font.PoppinsMedium}
                      >
                        {item?.n_comments}
                      </CustomText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleToggleBookmark(item.imdb_id)}
                  >
                    <Image
                      source={(bookmarkMap[item.imdb_id] ?? item.is_bookmarked) ? imageIndex.save : imageIndex.saveMark}

                      style={styles.footerSaveIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {item && item?.description && item?.description.trim() !== "" ?
                (
                  <View style={{ flexDirection: 'row', height: windowHeight * 0.21, marginTop: 2 }}>
                    {/* Content Scroll */}
                    {/* <ScrollView
                      ref={scrollRef}
                      style={{ height: windowHeight * 0.21, }}
                      onContentSizeChange={handleContentSizeChange}
                      onLayout={handleLayout}
                      onScroll={handleScroll}
                      scrollEventThrottle={16}
                      showsVerticalScrollIndicator={true} // default indicator hide
                      onTouchStart={() => setOuterScrollEnabled(false)}
                      onTouchEnd={() => setOuterScrollEnabled(true)}
                      onScrollBeginDrag={() => setOuterScrollEnabled(false)}
                      onMomentumScrollEnd={() => setOuterScrollEnabled(true)}
                      showsHorizontalScrollIndicator={false}
                    > */}
                    <View style={{ flexDirection: 'row', height: windowHeight * 0.21, marginTop: 10 }}>

                      <ScrollView

                        nestedScrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                      >
                        <Text style={[styles.description, {
                          marginBottom: 0
                        }]}>
                          {item?.description || "No description available"} {"\n"} {"\n"} {"\n"}
                        </Text>

                        <LinearGradient
                          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.9)']}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={styles.gradient}
                        />
                        <LinearGradient
                          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.9)']}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={styles.gradient}
                        />
                      </ScrollView>

                    </View>


                  </View>
                ) :
                <Text style={styles.description} >{t("emptyState.nodescription")}</Text>}
            </View>
            <View style={{
              justifyContent: 'space-between',
              paddingBottom: 10,
              flex: 1,
              maxHeight: windowHeight * 0.24,
              // backgroundColor: 'red'

            }}>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10,

                marginTop: 7
              }}>
                <TouchableOpacity
                  style={styles.watchNowContainer}
                  onPress={() => setWatchNow(true)}
                >
                  <Image style={styles.watchNowImg} source={imageIndex.puased} resizeMode='contain' />

                </TouchableOpacity>



                <TouchableOpacity
                  style={[styles.watchNowContainer, {
                    backgroundColor: Color.primary, width: Dimensions.get('window').width * 0.58,


                  }]}
                  onPress={() => {
                    handleRankingPress({
                      imdb_id: item?.imdb_id,
                      title: item?.title,
                      release_year: item?.release_year,
                      cover_image_url: item?.cover_image_url || '',
                    });
                    setIsFeedbackModal(true)
                    setPaused(true)
                  }}
                >
                  <Image style={[styles.watchNowImg, { marginRight: 5, height: 20, width: 20 }]} source={imageIndex.ranking} resizeMode='contain' />
                  <CustomText
                    size={14}
                    color={Color.whiteText}
                    style={styles.watchNowText}
                    font={font.PoppinsBold}
                  >
                    {(t("movieDetail.rankNow"))}
                  </CustomText>
                </TouchableOpacity>
              </View>

              <View style={styles.footerNav}>
                <TouchableOpacity
                  onPress={() => {
                    setEpisVisible(true);
                    //                 if(episVisible == true){
                    //   getEpisodesdata();
                    // fetchAllSeasons();
                    //                 }

                  }}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
                >
                  <Text style={styles.linkText} >{t("movieDetail.episodes")}</Text>
                  <Image source={imageIndex.rightArrow} style={styles.arrowIcon} resizeMode='cover' />
                </TouchableOpacity>
                <TouchableOpacity
                  // onPress={() => setMorelikeModal(true)}
                  onPress={openMoreModal}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
                >
                  <Text style={styles.linkText} >{t("movieDetail.morelike")}</Text>
                  <Image source={imageIndex.rightArrow} style={styles.arrowIcon} resizeMode='contain' />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 20, paddingHorizontal: 16 }}>


                <ProgressBar
                  progress={progress}
                  onSeek={handleSeek}
                  onSeekStart={() => setIsSeeking(true)}
                  onSeekEnd={() => setIsSeeking(false)}
                />

              </View>
            </View>
          </View>

          {/* Footer end */}
        </View>
      );
    },
    [currentIndex, isVideoPaused, progress, isMuted, duration, isShowMuteIcon,
      isSeeking, bookmarkMap, seekPosition, currentTime, paused, isFeedbackModal, thinkModal]

  );

  if (loading && isInitialLoad.current) {
    // if (loading && isInitialLoad.current) {
    return renderShimmerEffect();
  };
  const handleCloseEpisodesModal = () => {
    setEpisVisible(false);

    hasFetchedRef.current = false;
    setEpisodes([]);
    setSessionList([]);


  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={movieData}
        keyExtractor={(item, index) => item?.imdb_id ? item?.imdb_id : `placeholder-${index}`}
        renderItem={renderMovieDetail}
        // pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        // scrollEnabled={outerScrollEnabled}
        scrollEnabled={outerScrollEnableds.current}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        scrollEventThrottle={30}
        // scrollEnabled={outerScrollEnabled}
        extraData={bookmarkMap}
      />

      <ScoreIntroModal
        visible={showFirstModal}
        onClose={() => {
          setShowFirstModal(false);
          setShowSecondModal(false);
        }}
        variant="first"
      />

      <ScoreIntroModal
        visible={showSecondModal}
        onClose={() => {
          setShowFirstModal(false);
          setShowSecondModal(false);
        }}
        variant="second"
      />

      {/* Modals */}
      <MoreSheetModal
        visible={MorelikeModal}
        token={token}
        imdb_idData={modalMovieId}
        onClose={() => setMorelikeModal(false)}
      />

      {/* <EpisodesModal
        visible={episVisible}
        onClose={() => setEpisVisible(false)}
        episodes={episodes}
        EpisodesLoder={EpisodesLoder}
        selectedId={selectedEpisodeId}
        onSelect={(id) => {
          setSelectedEpisodeId(id);
          // setEpisVisible(false);
           setEpisVisible(false);
  hasFetchedRef.current = false;
  setEpisodes([]);
  setSessionList([]);
          
        }}
        token={token}
        bagImges={movieData[currentIndex]?.cover_image_url}
        imdb_id={movieData[currentIndex]?.imdb_id}
        onFetchEpisodes={handleFetchSeasonEpisodes}
        sessionList={sessionList}
      /> */}
      <EpisodesModal
        visible={episVisible}
        onClose={handleCloseEpisodesModal}
        episodes={episodes}
        EpisodesLoder={EpisodesLoder}
        selectedId={selectedEpisodeId}
        onSelect={(id) => {
          setSelectedEpisodeId(id);
          setEpisVisible(false);

          hasFetchedRef.current = false;
          setEpisodes([]);
          setSessionList([]);
        }}
        token={token}
        bagImges={movieData[currentIndex]?.cover_image_url}
        imdb_id={movieData[currentIndex]?.imdb_id}
        onFetchEpisodes={handleFetchSeasonEpisodes}
        sessionList={sessionList}
      />

      <WatchNowModal visible={watchNow} onClose={() => setWatchNow(false)} />

      <MovieInfoModal
        visible={InfoModal}
        onClose={() => setInfoModal(false)}
        title={selectedMovie?.title || (t("movieDetail.movietitle"))}
        synopsis={selectedMovie?.description || (t("movieDetail.moviedescription"))}
        releaseDate={selectedMovie?.release_date || "Unknown"}
        genre={(selectedMovie?.genres || []).join(', ')}
      />

      {thinkModal &&

        <CommentModal
          visible={thinkModal}
          onClose={() => {
            setthinkModal(false);
            if (movieData[currentIndex]?.imdb_id) {
              // getComment(token, movieData[currentIndex]?.imdb_id, false);
            }
          }}
          reviews={reviews}
          heading="Reviews"
          token={token}
          imdb_id={movieData[currentIndex]?.imdb_id || imdb_idData}
          rec_scoreComm={movieData[currentIndex]?.rec_score || 0}
          showCommenRankingCheck={() => showCommenRankingCheck()}
          has_rated_movie={has_rated_ref.current}
        />
      }
      {isFeedbackModal &&
        <CompareModals token={token} useCompareHook={compareHook} />

      }
    </SafeAreaView>
  );
};

export default memo(MovieDetailScreen);


