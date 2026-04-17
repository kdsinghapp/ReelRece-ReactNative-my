import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  useWindowDimensions,
  AppState,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import styles from './style';
import useMovie from './useMovie';
import { Color } from '@theme/color';
import ScreenNameEnum from '@routes/screenName.enum';
import font from '@theme/font';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import ScoreIntroModal from '@components/modal/ScoreIntroModal/ScoreIntroModal';
import SwipeIntroTooltip, { SWIPE_TOOLTIP_STORAGE_KEY, IS_NEW_USER_KEY } from '@components/modal/SwipeIntroTooltip/SwipeIntroTooltip';
import WatchNowModal from '@components/modal/WatchNowModal/WatchNowModal';
import { getEpisodes, getEpisodesBySeason, getMovieMetadata, recordTrailerInteraction, Trending_without_Filter, searchMovies } from '@redux/Api/movieApi';
import { getMatchingMovies } from '@redux/Api/ProfileApi';
import { useCompareContext } from '../../../../context/CompareContext';
import { useBookmarks } from '@hooks/useBookmark';
import { useTrailerTracker } from '@hooks/useTrailerTracker';
import CustomText from '@components/common/CustomText/CustomText';
import LinearGradient from 'react-native-linear-gradient';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { RootState } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMute } from '@redux/feature/videoAudioSlice';
import { fetchHomeBookmarks } from '@redux/feature/homeSlice';
import VideoPlayer from '@utils/NewNativeView';
import CustomVideoPlayer from '@components/common/CustomVideoPlayerios';
import { CustomStatusBar, EpisodesModal, HeaderCustom, MoreSheetModal, MovieInfoModal } from '@components/index';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import imageIndex from '@assets/imageIndex';
import MovieDetailsShimmer from '@components/MovieDetailsShimmer/MovieDetailsShimmer';
import { t } from 'i18next';
import type { Platform as StreamingPlatform, MovieMetadata } from '../../../../types/api.types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';

const CommentModal = React.lazy(() =>
  import('@components/modal/comment/CommentModal')
);

interface ExtendedMovieMetadata extends MovieMetadata {
  has_rated?: boolean;
  preference?: string;
  n_comments?: number;
}


const MovieDetailScreen = () => {
  const isOnline = useNetworkStatus();
  const navigation = useNavigation();
  const {
    watchModal, setWatchModal,
    episVisible, setEpisVisible,
    MorelikeModal, setMorelikeModal,
    InfoModal, setInfoModal,
    thinkModal, setthinkModal
  } = useMovie();
  const route = useRoute();
  const [watchModalLoad, setWatchModalLoad] = useState<string | null>(null);
  const selectedCountry = useSelector((state: RootState) => state.auth.selectedCountry) || 'US';

  const {
    imdb_idData,
    token,
    movieList = [],
    initialIndex = 0,
    source = null,
    filterGenreString,
    platformFilterString,
    selectedSimpleFilter,
    selectedSortId,
    contentSelect,
    currentPage = 1,
    totalPages = 1,
    searchQuery = '',
  } = (route?.params as any) || {};

  const [currentFeedIndex, setCurrentFeedIndex] = useState(initialIndex);
  const [localMovieList, setLocalMovieList] = useState(movieList);
  const currentFeedIndexRef = useRef(initialIndex);
  useEffect(() => {
    currentFeedIndexRef.current = currentFeedIndex;
  }, [currentFeedIndex]);
  const [feedPage, setFeedPage] = useState(currentPage);
  const [feedTotalPages, setFeedTotalPages] = useState(totalPages);

  // Discover & Search Pagination recreator
  const fetchNextFeedPage = async () => {
    if ((source !== 'discover' && source !== 'search') || feedPage >= feedTotalPages || loadingMore) return;
    try {
      setLoadingMore(true);
      let results: any[] = [];

      if (source === 'discover') {
        let baseEndpoint = '';
        if (selectedSimpleFilter === '1') baseEndpoint = '/recommend-movies?sort_by=rec_score';
        else if (selectedSimpleFilter === '2') baseEndpoint = '/trending';
        else if (selectedSimpleFilter === '5') baseEndpoint = '/bookmarks';

        const urlStarts = baseEndpoint.includes('?')
          ? `${baseEndpoint}&country=${selectedCountry}&page=${feedPage + 1}`
          : `${baseEndpoint}?country=${selectedCountry}&page=${feedPage + 1}`;

        let url = urlStarts;
        if (filterGenreString) url += `&genres=${filterGenreString}`;
        if (platformFilterString) {
          url += `&platforms=${platformFilterString}`;
          url += `&watch_type=subscription`;
        }
        if (selectedSortId) url += `&sort_by=${selectedSortId}`;
        if (contentSelect) url += `&media_type=${contentSelect}`;

        const result = await Trending_without_Filter({ token, url });
        results = result?.results || [];
      } else if (source === 'search' && searchQuery) {
        const result = await searchMovies(searchQuery, token, feedPage + 1);
        results = result?.data?.results || [];
      }

      if (results.length > 0) {
        setLocalMovieList(prev => [...prev, ...results]);
        setFeedPage(feedPage + 1);
      }
    } catch (e) {
    } finally {
      setLoadingMore(false);
    }
  };
  const { toggleBookmark: toggleBookmarkHook } = useBookmarks(token);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [movieData, setMovieData] = useState<any[]>([null, null, null]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(1); // Start at the middle item
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  // const BOTTOM_TAB_HEIGHT = 65;
  const BOTTOM_TAB_HEIGHT = useBottomTabBarHeight();
  console.log(BOTTOM_TAB_HEIGHT, 'abc')
  const ITEM_HEIGHT = useMemo(
    () => windowHeight - BOTTOM_TAB_HEIGHT - insets.top - (Platform.OS == "ios" ? insets.bottom + 40 : insets.bottom > 50 ? insets.bottom + 45 : insets.bottom + 10),
    [windowHeight, insets.bottom, insets.top]
  );
  const videoHeight = useMemo(() => windowHeight / 3.9, [windowHeight]);
  // const recommendationRowHeight = useMemo(() => windowHeight * 0.26, [windowHeight]);
  const recommendationRowHeight = useMemo(() => Platform.OS == "ios" ? windowHeight * 0.22 : windowHeight * 0.28 - insets.bottom, [windowHeight]);

  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [watchNow, setWatchNow] = useState(false);
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [sessionList, setSessionList] = useState<{ id: number; session: string }[]>([]);
  const [reviews, setReviews] = useState([])
  const [progress, setProgress] = useState(1);
  const posterOpacity = useRef(new Animated.Value(1)).current;
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(false)
  const trailerTracker = useTrailerTracker(token);
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentSeedId, setCurrentSeedId] = useState(imdb_idData);
  const [matchingQueue, setMatchingQueue] = useState([]);
  const matchingQueueRef = useRef<(typeof matchingQueue)>([]);
  const preloadInProgressRef = useRef(false);
  const isInitialLoad = useRef(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const isResettingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveBookMark_Ref = useRef(false)
  const [modalMovieId, setModalMovieId] = useState<string | null>(null);
  const [titleLinesMap, setTitleLinesMap] = useState<Record<number, number>>({});
  const dispatch = useDispatch()
  const compareHook = useCompareContext();
  const isMuted = useSelector((state: RootState) => state.videoAudio.isMuted);
  const [isShowMuteIcon, setIsShowMuteIcon] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [wholeContentHeight, setWholeContentHeight] = useState(1);
  const [visibleContentHeight, setVisibleContentHeight] = useState(0);
  const [scrollIndicatorHeight, setScrollIndicatorHeight] = useState(0);
  const has_rated_ref = useRef(false);
  const [hasRatedForCommentModal, setHasRatedForCommentModal] = useState(false);
  const [commetText, setCommentText] = useState('')
  const [showSwipeTooltip, setShowSwipeTooltip] = useState(false);
  const swipeTooltipCheckDone = useRef(false);
  const [videoMountKey, setVideoMountKey] = useState(0);
  const [isVideoTransitioning, setIsVideoTransitioning] = useState(false);
  const [appInForeground, setAppInForeground] = useState(true);

  const outerScrollEnableds = useRef(true);

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


  const [bookmarkMap, setBookmarkMap] = useState<{ [k: string]: boolean }>({});
  const bookmarkMapRef = useRef(bookmarkMap);

  useEffect(() => {
    bookmarkMapRef.current = bookmarkMap;
  }, [bookmarkMap]);

  useEffect(() => {
    matchingQueueRef.current = matchingQueue;
  }, [matchingQueue]);

  useEffect(() => {
    if (movieData && movieData[1]) {
      const m = movieData[1];
      if (m?.imdb_id) {
        setBookmarkMap(prev => ({ ...prev, [m.imdb_id]: !!m.is_bookmarked }));
      }
    }
  }, [movieData]);

  useEffect(() => {
    if (swipeTooltipCheckDone.current || loading || !movieData?.[currentIndex]) return;
    swipeTooltipCheckDone.current = true;

    const checkSwipeTooltip = async () => {
      try {
        const [seen, isNewUser] = await Promise.all([
          AsyncStorage.getItem(SWIPE_TOOLTIP_STORAGE_KEY),
          AsyncStorage.getItem(IS_NEW_USER_KEY)
        ]);

        // Only show if it's a new signup AND they haven't seen it yet
        if (isNewUser === 'true' && seen !== 'true') {
          setShowSwipeTooltip(true);
        }
      } catch (err) {
        // Log or handle error
      }
    };

    checkSwipeTooltip();
  }, [loading, movieData, currentIndex]);

  const handleToggleBookmark = useCallback(async (imdb_id) => {
    const current = bookmarkMapRef.current[imdb_id] ?? false;
    setBookmarkMap(prev => {
      const newMap = { ...prev, [imdb_id]: !current };
      bookmarkMapRef.current = newMap;
      return newMap;
    });

    try {
      const res = await toggleBookmarkHook(imdb_id);
      if (typeof res === 'boolean') {
        setBookmarkMap(prev => {
          if (prev[imdb_id] === res) return prev;
          const newMap = { ...prev, [imdb_id]: res };
          bookmarkMapRef.current = newMap;
          return newMap;
        });
        dispatch(fetchHomeBookmarks({ silent: true }));
      }
    } catch (err) {
      setBookmarkMap(prev => {
        const newMap = { ...prev, [imdb_id]: current };
        bookmarkMapRef.current = newMap;
        return newMap;
      });
    }
  }, [toggleBookmarkHook, dispatch]);
  useEffect(() => {
    flatListRef.current?.setNativeProps({
      scrollEnabled: outerScrollEnableds.current
    });
  }, [outerScrollEnableds.current]);
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      setIsVideoPaused(false);

      return () => {
        setIsScreenFocused(false);
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
          getMovieMetadata(token, imdb_idData),
          getMatchingMovies(token, imdb_idData)
        ]);

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
  }, [movieData, posterOpacity]);

  const setPausedState = useCallback((isPlaying: boolean) => {
    setPaused(!isPlaying);
  }, []);

  const handleVideoSeek = useCallback((position: any) => { }, []);

  // more movie sheet
  const openMoreModal = useCallback(() => {
    setModalMovieId(movieData[currentIndex]?.imdb_id ?? null);
    setMorelikeModal(true);
  }, [movieData, currentIndex]);
  const [videoDuration, setVideoDuration] = useState(0);


  const fetchNextMovieFromQueue = async (prevImdb) => {
    try {
      setLoadingMore(true);
      setIsLoading(true);
      let queue = [...matchingQueueRef.current];
      if (!queue.length) {
        const matching = await getMatchingMovies(token, prevImdb);
        queue = matching?.results || [];
        setMatchingQueue(queue);
      }
      if (!queue.length) return null;

      const randomIndex = Math.floor(Math.random() * queue.length);
      const nextMovie = queue[randomIndex];
      queue.splice(randomIndex, 1);
      setMatchingQueue(queue);

      const meta = await getMovieMetadata(token, nextMovie?.imdb_id);
      saveBookMark_Ref.current = meta?.is_bookmarked;
      setIsLoading(false);
      setSelectedMovie(meta?.imdb_id);
      return meta;
    } catch (error) {
      setIsLoading(false);
      return null;
    } finally {
      setLoadingMore(false);
    }
  };

  const preloadNextMovie = useCallback(async (direction = 'next') => {
    if (preloadInProgressRef.current || isResettingRef.current) return;
    preloadInProgressRef.current = true;
    try {
      if (!localMovieList || localMovieList.length === 0) {
        // Fallback to random matching movies for deep links
        let queue = [...matchingQueueRef.current];
        if (!queue.length) {
          const matching = await getMatchingMovies(token, currentSeedId);
          queue = matching?.results || [];
          setMatchingQueue(queue);
        }
        if (!queue.length) return;
        const randomIndex = Math.floor(Math.random() * queue.length);
        const nextMovie = queue[randomIndex];
        queue.splice(randomIndex, 1);
        setMatchingQueue(queue);
        const meta = await getMovieMetadata(token, nextMovie?.imdb_id);
        if (!meta) return;
        setMovieData((prev) => [prev[0], prev[1], meta]);
        return;
      }

      // Sequential navigation from source feed
      const targetIndex = direction === 'next' ? currentFeedIndexRef.current + 1 : currentFeedIndexRef.current - 1;

      if (targetIndex >= 0 && targetIndex < localMovieList.length) {
        const nextMovieItem = localMovieList[targetIndex];
        const imdbIdToFetch = nextMovieItem?.imdb_id || nextMovieItem?.movie?.imdb_id;
        const meta = await getMovieMetadata(token, imdbIdToFetch);
        if (!meta) return;

        setMovieData((prev) => {
          if (direction === 'next') {
            return [prev[0], prev[1], meta];
          } else {
            return [meta, prev[1], prev[2]];
          }
        });
      } else {
        // Upper or lower bounds reached
        if (direction === 'next') {
          // First try to paginate if possible
          if ((source === 'discover' || source === 'search') && feedPage < feedTotalPages) {
            fetchNextFeedPage();
          } else {
            // Fallback to matching movies (AI recommendations) when list ends
            const meta = await fetchNextMovieFromQueue(movieData[1]?.imdb_id || currentSeedId);
            if (meta) {
              setMovieData((prev) => [prev[0], prev[1], meta]);
            } else {
              setMovieData((prev) => [prev[0], prev[1], null]);
            }
          }
        } else {
          setMovieData((prev) => [null, prev[1], prev[2]]);
        }
      }
    } catch (_) {
    } finally {
      preloadInProgressRef.current = false;
    }
  }, [token, currentSeedId, currentFeedIndex, localMovieList, source, movieData, feedPage, feedTotalPages]);

  useEffect(() => {
    if (loading || !movieData[1] || isResettingRef.current) return;
    if (movieData[2] == null) preloadNextMovie('next');
    if (movieData[0] == null) preloadNextMovie('prev');
  }, [loading, movieData, preloadNextMovie, isResettingRef.current]);

  const handleMomentumScrollEnd = useCallback(async (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / ITEM_HEIGHT);

    if (newIndex !== currentIndex && !isResettingRef.current) {
      if (newIndex === 2 && movieData[2]) {
        // Swiped down (Next)
        isResettingRef.current = true;
        const nextMovie = movieData[2];
        setProgress(0);
        saveBookMark_Ref.current = nextMovie?.is_bookmarked ?? false;
        setSelectedMovie(nextMovie?.imdb_id ?? null);
        setCurrentSeedId(nextMovie?.imdb_id ?? currentSeedId);
        setVideoMountKey((k) => k + 1);
        setIsVideoTransitioning(true);
        setMovieData([null, nextMovie, null]);

        setCurrentFeedIndex(prev => prev + 1); // increment array position

        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        setTimeout(() => {
          setCurrentIndex(1);
          isResettingRef.current = false;
          setIsVideoTransitioning(false);
          setPaused(false);
          preloadNextMovie('next');
          preloadNextMovie('prev');
        }, 250);
        return;
      }

      if (newIndex === 0) {
        // Swiped up (Previous) - but check if we're at the beginning
        if (currentFeedIndexRef.current <= 0) {
          // Already at the first movie, reset scroll to center
          flatListRef.current?.scrollToIndex({ index: 1, animated: true });
          setCurrentIndex(1);
          return;
        }

        if (!movieData[0]) return;

        isResettingRef.current = true;
        const prevMovie = movieData[0];
        setProgress(0);
        saveBookMark_Ref.current = prevMovie?.is_bookmarked ?? false;
        setSelectedMovie(prevMovie?.imdb_id ?? null);
        setCurrentSeedId(prevMovie?.imdb_id ?? currentSeedId);
        setVideoMountKey((k) => k + 1);
        setIsVideoTransitioning(true);
        setMovieData([null, prevMovie, null]);

        setCurrentFeedIndex(prev => prev - 1); // decrement array position

        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        setTimeout(() => {
          setCurrentIndex(1);
          isResettingRef.current = false;
          setIsVideoTransitioning(false);
          setPaused(false);
          preloadNextMovie('next');
          preloadNextMovie('prev');
        }, 250);
        return;
      }

      // Edge scenario failsafes
      if (newIndex === 0 || newIndex === 2) {
        isResettingRef.current = false;
      }
    }
  }, [currentIndex, movieData, currentSeedId, currentFeedIndex, ITEM_HEIGHT, preloadNextMovie]);
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
      if (Array.isArray(response)) {
        episodesData = response;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        const keys = Object.keys(response);
        const isErrorShape = keys.some((k) => k === 'detail' || k === 'message' || k === 'error');
        if (!isErrorShape) {
          const numericKeys = keys.filter((k) => /^\d+$/.test(k));
          if (numericKeys.length > 0) {
            episodesData = numericKeys.flatMap((k) => (response[k] && Array.isArray(response[k]) ? response[k] : []));
          }
        }
      }

      const formattedEpisodes = (episodesData || []).map((ep, index) => ({
        id: index + 1,
        title: ep?.episode_name || ep?.title || `Episode ${index + 1}`,
        duration: ep?.runtime ? `${ep.runtime} min` : 'Unknown',
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

      if (response && typeof response === 'object' && !Array.isArray(response)) {
        const keys = Object.keys(response);
        const isErrorShape = keys.some((k) => k === 'detail' || k === 'message' || k === 'error');
        if (!isErrorShape) {
          const seasonKeys = keys.filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
          if (seasonKeys.length > 0) {
            const dynamicList = seasonKeys.map((key) => ({
              id: Number(key),
              session: `Season ${key}`,
            }));
            setSessionList(dynamicList);
          }
        }
      }
    } catch (error) {
    } finally {
      setEpisodesLoder(false);
    }
  };

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const imdb_id = movieData?.[currentIndex]?.imdb_id;

    if (!episVisible || !imdb_id || hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    getEpisodesdata()
  }, [episVisible, currentIndex, movieData]);


  const handleFetchSeasonEpisodes = async (seasonNumber = 1) => {
    const imdb_id = movieData[currentIndex]?.imdb_id;
    if (!imdb_id) return;
    setEpisodesLoder(true);
    try {
      const response = await getEpisodesBySeason(token, imdb_id, seasonNumber);
      let seasonData = [];
      if (Array.isArray(response)) {
        seasonData = response;
      } else if (response && typeof response === 'object') {
        const keys = Object.keys(response);
        const isErrorShape = keys.some((k) => k === 'detail' || k === 'message' || k === 'error');
        if (!isErrorShape) {
          seasonData = Object.values(response).flat().filter(Boolean);
        }
      }
      const formattedEpisodes = (seasonData || []).map((ep, index) => ({
        id: index + 1,
        title: ep?.episode_name || ep?.title || `Episode ${index + 1}`,
        duration: ep?.runtime ? `${ep.runtime} min` : 'Unknown',
        image: ep?.image || imageIndex.moviesPoster,
      }));
      setEpisodes(formattedEpisodes);
    } catch (err) {
      setEpisodes([]);
    } finally {
      setEpisodesLoder(false);
    }
  };
  // Format runtime (memoized to avoid new function reference in renderItem)
  const formatRuntime = useCallback((runtime: number | undefined) => {
    if (!runtime || isNaN(runtime)) return '';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const isFeedbackModal = compareHook.isFeedbackVisible;
  const isComparisonVisible = compareHook.isComparisonVisible;

  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie, undefined, {
      onModalClose: () => {
        if (movieData[currentIndex]) {
          has_rated_ref.current = true;
          setHasRatedForCommentModal(true);
        }
      },
      onReviewAdded: (imdb_id) => {
        setMovieData((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m?.imdb_id === imdb_id);
          if (idx >= 0 && next[idx] && typeof next[idx] === 'object') {
            next[idx] = { ...next[idx], n_comments: (next[idx].n_comments ?? 0) + 1 };
          }
          return next;
        });
      }
    });
  };

  useEffect(() => {
    if (movieData[currentIndex]) {
      setReviews([])
      setCommentText('')
      const currentMovie = movieData[currentIndex];
      has_rated_ref.current = currentMovie?.has_rated ?? false;
      setHasRatedForCommentModal(!!currentMovie?.has_rated);
    }
  }, [currentIndex, movieData]);

  const showCommenRankingCheck = () => {
    if (!movieData[currentIndex]?.has_rated && !has_rated_ref.current) {
      setthinkModal(false);
      handleRankingPress({
        imdb_id: movieData[currentIndex]?.imdb_id,
        title: movieData[currentIndex]?.title,
        release_year: movieData[currentIndex]?.release_year,
        cover_image_url: movieData[currentIndex]?.cover_image_url || '',
      });
      setPaused(true);
    }
  };

  const checkHasRated = () => {
    if (has_rated_ref.current) {
    } else {
    }
  };

  const handleVideoLoad = useCallback((data: { duration: number }) => {
    setVideoDuration(data.duration);
    setDuration(data.duration);

    // Hide poster when video loads
    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [posterOpacity]);
  const [currentTime, setCurrentTime] = useState(0);
  // Fix the progress handler

  // Fix progress handler to properly handle seeking
  const onVideoProgress = useCallback((data: { currentTime: number; duration: number; progress: number }) => {
    // Only update if not currently seeking
    if (!isSeeking) {
      // Throttle state updates: only once per second or if significant
      const shouldUpdateState = Math.abs(data.currentTime - currentTime) >= 1;

      if (shouldUpdateState) {
        setCurrentTime(data.currentTime);
        setDuration(data.duration);
        setProgress(data.progress);
      }

      // Track trailer progress (kept as is for tracking accuracy)
      if (!isVideoPaused && movieData[currentIndex]) {
        trailerTracker.onProgress({
          currentTime: data.currentTime,
          imdb_id: movieData[currentIndex].imdb_id,
          trailer_url: movieData[currentIndex].trailer_url,
        });
      }
    }
  }, [isVideoPaused, currentIndex, isSeeking, currentTime]);


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


  useEffect(() => {
  }, [isMuted]);

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



  const [paused, setPaused] = useState(false); // Start playing by default
  const prevModalState = useRef(false);

  // Stop and unmount video when app goes to background so it doesn't keep playing
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setPaused(true);
        setAppInForeground(false);
      } else if (nextAppState === 'active') {
        setAppInForeground(true);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const isModalOpen = thinkModal || isFeedbackModal || isComparisonVisible || episVisible || MorelikeModal || InfoModal || watchNow;

    if (isModalOpen) {
      // Modal opened - pause video
      prevModalState.current = true;
      setPaused(true);
    } else if (prevModalState.current && !isModalOpen) {
      // Modal just closed - resume video
      prevModalState.current = false;
      setPaused(false);
    }
  }, [thinkModal, isFeedbackModal, isComparisonVisible, episVisible, MorelikeModal, InfoModal, watchNow]);

  const itemContainerStyle = useMemo(
    () => ({ height: ITEM_HEIGHT, flexDirection: 'column' as const, paddingTop: 6 }),
    [ITEM_HEIGHT]
  );
  const videoContainerStyle = useMemo(
    () => ({ height: videoHeight, width: '100%' as const }),
    [videoHeight]
  );
  const contentTopStyle = useMemo(
    () => ({ marginTop: -4, paddingHorizontal: 0 }),
    []
  );
  const goToSearchScreen = useCallback(
    () => navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' }),
    [navigation]
  );
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const renderShimmerEffect = useCallback(() => {
    return <MovieDetailsShimmer ITEM_HEIGHT={ITEM_HEIGHT} navigation={navigation} />;
  }, [ITEM_HEIGHT, navigation]);

  // Render movie item
  const renderMovieDetail = useCallback(
    ({ item, index }) => {

      if (!item) {
        return renderShimmerEffect();
      }
      saveBookMark_Ref.current = item?.is_bookmarked

      return (
        <View style={itemContainerStyle}>
          {/* header */}
          <CustomStatusBar />
          <HeaderCustom
            backIcon={imageIndex.backArrow}
            rightIcon={imageIndex.search}
            onRightPress={goToSearchScreen}
            onBackPressW={goBack}
          />
          <View style={contentTopStyle}
          // onPress={handlerShowMuteImg}
          >

            {Platform.OS == "ios" ? <>

              {index === currentIndex && !isVideoTransitioning && appInForeground && isScreenFocused ? (
                <CustomVideoPlayer
                  key={`video-ios-${item?.imdb_id}-${videoMountKey}`}
                  videoUrl={item.trailer_url}
                  paused={paused || isFeedbackModal || thinkModal}
                  muted={isMuted}
                  onTogglePause={() => setPaused(p => !p)}
                  onToggleMute={() => dispatch(toggleMute())}
                  isModalOpen={thinkModal}
                />
              ) : (
                <Image
                  source={{ uri: item?.horizontal_poster_url || item?.cover_image_url }}
                  style={videoContainerStyle}
                  resizeMode="cover"
                />
              )}

            </> : <>
              {index === currentIndex && !isVideoTransitioning && appInForeground && isScreenFocused && !!item?.trailer_url ? (
                <VideoPlayer
                  key={`video-android-${item?.imdb_id}-${videoMountKey}`}
                  source={{ uri: item.trailer_url }}
                  movieId={item.imdb_id}
                  posterUrl={item.horizontal_poster_url || item?.cover_image_url}
                  style={videoContainerStyle}
                  resizeMode='stretch'
                  repeat
                  muted={isMuted}
                  paused={paused || isFeedbackModal || isComparisonVisible || thinkModal}
                  onPlayPause={setPausedState}
                  onControllerVisibilityChange={setIsShowMuteIcon}
                  onProgress={onVideoProgress}
                  seekTo={isSeeking ? seekPosition : undefined}
                  onLoad={handleVideoLoad}
                  onSeek={handleVideoSeek}
                  ref={videoRef}
                />
              ) : (
                <Image
                  source={{ uri: item?.horizontal_poster_url || item?.cover_image_url }}
                  style={videoContainerStyle}
                  resizeMode="cover"
                />
              )}
            </>}
            {/* Mute/Unmute: with controller on Android (onControllerVisibilityChange), and on iOS with timeout */}
            {index === currentIndex && isShowMuteIcon && (
              <TouchableOpacity
                style={[
                  styles.muteButtonOverlay,
                  {
                    top: Platform.OS === 'ios' ? 33 : 10,
                    right: 10,
                  },
                ]}
                onPress={() => {
                  dispatch(toggleMute());
                  if (Platform.OS === 'ios') handlerShowMuteImg();
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={isMuted ? imageIndex.volumeOff : imageIndex.mute}
                  style={styles.muteButtonIcon}
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
                numberOfLines={1}
                onTextLayout={(e) => {
                  const lines = e.nativeEvent.lines.length;
                  setTitleLinesMap(prev => ({ ...prev, [index]: lines }));
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
                  disabled={true}
                >
                  <View style={{}} >

                    <RankingWithInfo
                      score={item?.friends_rec_score == null || Number(item?.friends_rec_score) <= 0 ? 'N/A' : Number(item.friends_rec_score)}
                      title={t("discover.friendscore")}
                      description={
                        item?.friends_rec_score === null ||
                          item?.friends_rec_score === -1 ||
                          item?.friends_rec_score === 0
                          ? t("discover.nofrienddes")
                          : t("discover.frienddes1")
                      }
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
                    onPress={() => setthinkModal(true)}
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
              {item ?
                (
                  <View style={{ flexDirection: 'row', maxHeight: recommendationRowHeight - ((titleLinesMap[index] || 1) > 1 ? 25 : 0), marginTop: 2 }}>
                    <View style={{ flexDirection: 'row', maxHeight: recommendationRowHeight - ((titleLinesMap[index] || 1) > 1 ? 25 : 0), marginTop: 10 }}>
                      <ScrollView nestedScrollEnabled={false} showsVerticalScrollIndicator={false} bounces={true}>
                        {(item?.plot || item?.description) && (
                          <Text style={[styles.description, { marginBottom: 0 }]}>
                            {item?.plot || item?.description}
                          </Text>
                        )}

                        {item?.media_type && (
                          <Text style={styles.descriptionLabel}>
                            Media Type: <Text style={styles.descriptionValue}>{item.media_type}</Text>
                          </Text>
                        )}

                        {item?.languages_spoken && (
                          <Text style={styles.descriptionLabel}>
                            Language: <Text style={styles.descriptionValue}>{item.languages_spoken}</Text>
                          </Text>
                        )}


                        {item?.director && (
                          <Text style={styles.descriptionLabel}>
                            Director(s): <Text style={styles.descriptionValue}>{item.director}</Text>
                          </Text>
                        )}

                        {item?.cast && item.cast.length > 0 && (
                          <Text style={styles.descriptionLabel}>
                            Stars: <Text style={styles.descriptionValue}>{item.cast.join(', ')}</Text>
                          </Text>
                        )}

                        {item?.genres && item.genres.length > 0 && (
                          <Text style={styles.descriptionLabel}>
                            Genre: <Text style={styles.descriptionValue}>{item.genres.join(', ')}</Text>
                          </Text>
                        )}

                        {item?.subgenres && item.subgenres.length > 0 && (
                          <Text style={styles.descriptionLabel}>
                            Subgenres: <Text style={styles.descriptionValue}>{(item.subgenres as string[]).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</Text>
                          </Text>
                        )}

                        {item?.release_date && (
                          <Text style={styles.descriptionLabel}>
                            Release Date: <Text style={styles.descriptionValue}>{item.release_date}</Text>
                          </Text>
                        )}

                        {item?.runtime && (
                          <Text style={styles.descriptionLabel}>
                            Runtime: <Text style={styles.descriptionValue}>{formatRuntime(item.runtime)}</Text>
                          </Text>
                        )}


                        <View style={{ height: 40 }} />
                        <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.9)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.gradient} />
                      </ScrollView>
                    </View>
                  </View>
                ) :
                <Text style={styles.description} >{t("emptyState.nodescription")}</Text>}

              {item?.platforms && Array.isArray(item.platforms) && item.platforms.length > 0 && (
                <View style={styles.whereToWatchSection}>
                  <CustomText
                    size={14}
                    color={Color.whiteText}
                    style={styles.whereToWatchTitle}
                    font={font.PoppinsBold}
                  >
                    {t("movieDetail.whereToWatch")}
                  </CustomText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.whereToWatchScroll}
                  >
                    {item.platforms
                      .filter((p: any) => {
                        const name = String(p?.platform_name || '');
                        const isNumeric = /^\d+$/.test(name);
                        const isUnknown = name.includes('_Unknown') || name.toLowerCase() === 'unknown';
                        const isNotSet = name.toUpperCase() === 'NOT_SET';
                        return name && !isNumeric && !isUnknown && !isNotSet;
                      })
                      .map((platform: StreamingPlatform, idx: number) => {
                        const hasLink = platform?.watch_link && String(platform.watch_link).trim();
                        return (
                          <TouchableOpacity
                            key={`${platform.platform_name}-${idx}`}
                            style={[styles.whereToWatchCard, !hasLink && styles.whereToWatchCardDisabled]}
                            onPress={() => hasLink && Linking.openURL(platform.watch_link!)}
                            disabled={!hasLink}
                            activeOpacity={hasLink ? 0.7 : 1}
                          >
                            {platform.logo_url ? (
                              <Image
                                source={{ uri: platform.logo_url }}
                                style={styles.whereToWatchLogo}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={styles.whereToWatchLogoPlaceholder}>
                                <Text style={styles.whereToWatchLogoPlaceholderText} numberOfLines={1}>
                                  {(platform.platform_name || '?').slice(0, 2)}
                                </Text>
                              </View>
                            )}
                            <CustomText
                              size={12}
                              color={Color.whiteText}
                              numberOfLines={1}
                              style={styles.whereToWatchName}
                              font={font.PoppinsMedium}
                            >
                              {platform.platform_name || 'Unknown'}
                            </CustomText>
                            {platform.watch_type && (
                              <View style={styles.whereToWatchBadge}>
                                <Text style={styles.whereToWatchBadgeText} numberOfLines={1}>
                                  {platform.watch_type}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={{
              paddingBottom: 0,
            }}>
              <View style={styles.footerNav}>
                <TouchableOpacity
                  onPress={() => setWatchNow(true)}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
                >
                  <Text style={styles.linkText} >{t("movieDetail.watchNow") || "Watch Now"}</Text>
                  {/* <Image source={imageIndex.rightArrow} style={styles.arrowIcon} resizeMode='contain' /> */}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setEpisVisible(true)}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
                >
                  <Text style={styles.linkText} >{t("movieDetail.episodes")}</Text>
                  {/* <Image source={imageIndex.rightArrow} style={styles.arrowIcon} resizeMode='cover' /> */}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openMoreModal}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}
                >
                  <Text style={styles.linkText} >{t("movieDetail.morelike")}</Text>
                  {/* <Image source={imageIndex.rightArrow} style={styles.arrowIcon} resizeMode='contain' /> */}
                </TouchableOpacity>
              </View>

              {/* Immediately Clickable Rating Options */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1A1A1A',
                paddingTop: 14,
                paddingBottom: 14,
                paddingHorizontal: 16,
                marginTop: 12,
              }}>
                <View style={{ flex: 1 }}>
                  <CustomText size={12} color={Color.whiteText} font={font.PoppinsMedium} style={{ textAlign: 'center' }}>
                    {t("movieDetail.howDoYouFeel") || "How do you feel about this one?"}
                  </CustomText>
                  <View style={{ width: '90%', height: 0.5, backgroundColor: Color.whiteText, marginTop: 4, alignSelf: 'center' }} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Loved it */}
                  <TouchableOpacity
                    style={{ alignItems: 'center', minWidth: 60 }}
                    onPress={() => {
                      if (item) {
                        compareHook.openFeedbackModal(item, 'love');
                      }
                    }}
                  >
                    <Image
                      source={item?.preference === 'love' ? imageIndex.acrtivePlay : imageIndex.stopPlay}
                      style={{
                        height: 24, width: 24,
                        //  tintColor: item?.preference === 'love' ? undefined : Color.lightGrayText
                      }}
                      resizeMode="contain"
                    />
                    <CustomText
                      size={12}
                      color={item?.preference === 'love' ? Color.whiteText : Color.subText}
                      font={item?.preference === 'love' ? font.PoppinsMedium : font.PoppinsRegular}
                      style={{ marginTop: 4 }}
                    >
                      {t('modal.loveIt')}
                    </CustomText>
                  </TouchableOpacity>

                  {/* It Was Okay */}
                  <TouchableOpacity
                    style={{ alignItems: 'center', minWidth: 60 }}
                    onPress={() => {
                      if (item) {
                        compareHook.openFeedbackModal(item, 'like');
                      }
                    }}
                  >
                    <Image
                      source={item?.preference === 'like' ? imageIndex.modalitWasPoster : imageIndex.play}
                      style={{
                        height: 24, width: 24,
                        // tintColor: item?.preference === 'like' ? undefined : Color.lightGrayText 
                      }}
                      resizeMode="contain"
                    />
                    <CustomText
                      size={12}
                      color={item?.preference === 'like' ? Color.whiteText : Color.subText}
                      font={item?.preference === 'like' ? font.PoppinsMedium : font.PoppinsRegular}
                      style={{ marginTop: 4 }}
                    >
                      {t('modal.itWasOkay')}
                    </CustomText>
                  </TouchableOpacity>

                  {/* Didn't Like It */}
                  <TouchableOpacity
                    style={{ alignItems: 'center', minWidth: 60 }}
                    onPress={() => {
                      if (item) {
                        compareHook.openFeedbackModal(item, 'dislike');
                      }
                    }}
                  >
                    <Image
                      source={item?.preference === 'dislike' ? imageIndex.redCloseActive : imageIndex.redClose}
                      style={{
                        height: 24, width: 24,
                        // tintColor: item?.preference === 'dislike' ? undefined : Color.lightGrayText 
                      }}
                      resizeMode="contain"
                    />
                    <CustomText
                      size={12}
                      color={item?.preference === 'dislike' ? Color.whiteText : Color.subText}
                      font={item?.preference === 'dislike' ? font.PoppinsMedium : font.PoppinsRegular}
                      style={{ marginTop: 4 }}
                    >
                      {t('modal.didntLikeIt')}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>

          {/* Footer end */}
        </View>
      );
    },
    [
      currentIndex,
      isVideoPaused,
      progress,
      isMuted,
      duration,
      isShowMuteIcon,
      isSeeking,
      bookmarkMap,
      seekPosition,
      paused,
      isFeedbackModal,
      thinkModal,
      itemContainerStyle,
      videoContainerStyle,
      contentTopStyle,
      goToSearchScreen,
      goBack,
      videoMountKey,
      isComparisonVisible,
      isVideoTransitioning,
      appInForeground,
    ]
  );

  const handleCloseEpisodesModal = useCallback(() => {
    setEpisVisible(false);
    hasFetchedRef.current = false;
    setEpisodes([]);
    setSessionList([]);
  }, []);

  const flatListKeyExtractor = useCallback(
    (item: { imdb_id?: string } | null, index: number) =>
      item?.imdb_id ? item.imdb_id : `placeholder-${index}`,
    []
  );

  const getItemLayout = useMemo(
    () => (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [ITEM_HEIGHT]
  );

  const flatListExtraData = useMemo(
    () => [bookmarkMap, paused, isFeedbackModal, isComparisonVisible, thinkModal, currentIndex],
    [bookmarkMap, paused, isFeedbackModal, isComparisonVisible, thinkModal, currentIndex]
  );

  const closeScoreModals = useCallback(() => {
    setShowFirstModal(false);
    setShowSecondModal(false);
  }, []);
  const closeSwipeTooltip = useCallback(() => {
    AsyncStorage.setItem(SWIPE_TOOLTIP_STORAGE_KEY, 'true');
    setShowSwipeTooltip(false);
  }, []);
  const closeMorelikeModal = useCallback(() => setMorelikeModal(false), []);
  const closeWatchNowModal = useCallback(() => setWatchNow(false), []);
  const closeInfoModal = useCallback(() => setInfoModal(false), []);

  if (loading && isInitialLoad.current) {
    return renderShimmerEffect();
  }

  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={movieData}
        keyExtractor={flatListKeyExtractor}
        renderItem={renderMovieDetail}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        scrollEnabled={outerScrollEnableds.current}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={getItemLayout}
        initialScrollIndex={1}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        scrollEventThrottle={16}
        extraData={flatListExtraData}
        removeClippedSubviews={Platform.OS === 'android'}
        nestedScrollEnabled={Platform.OS === 'android'}
      />
      <ScoreIntroModal
        visible={showFirstModal}
        onClose={closeScoreModals}
        variant="first"
      />

      <ScoreIntroModal
        visible={showSecondModal}
        onClose={closeScoreModals}
        variant="second"
      />

      <SwipeIntroTooltip
        visible={showSwipeTooltip}
        onClose={closeSwipeTooltip}
        handImage="tooltipHand3"
      />

      {/* Modals */}
      <MoreSheetModal
        visible={MorelikeModal}
        token={token}
        imdb_idData={modalMovieId}
        onClose={closeMorelikeModal}
      />
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

      <WatchNowModal
        visible={watchNow}
        onClose={closeWatchNowModal}
        token={token}
        watchNow={watchNow}
        country={selectedCountry}
        selectedImdbId={movieData[currentIndex]?.imdb_id ?? imdb_idData}
        watchModalLoad={watchModalLoad}
        setWatchModalLoad={setWatchModalLoad}
      />

      <MovieInfoModal
        visible={InfoModal}
        onClose={closeInfoModal}
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
          has_rated_movie={!!(movieData[currentIndex]?.has_rated || has_rated_ref.current || hasRatedForCommentModal)}
          onCommentAdded={() => {
            setMovieData(prev => {
              const next = [...prev];
              const item = next[currentIndex];
              if (item && typeof item === 'object') {
                next[currentIndex] = {
                  ...item,
                  n_comments: (item.n_comments ?? 0) + 1,
                };
              }
              return next;
            });
          }}
        />
      }
    </SafeAreaView>
  );
};

export default memo(MovieDetailScreen);