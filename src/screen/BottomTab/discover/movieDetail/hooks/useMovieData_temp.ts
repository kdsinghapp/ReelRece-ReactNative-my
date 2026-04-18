import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getMovieMetadata, fetchNextPageLogic } from '@redux/Api/movieApi';
import { getMatchingMovies } from '@redux/Api/ProfileApi';
import { useBookmarks } from '@hooks/useBookmark';
import { fetchHomeBookmarks } from '@redux/feature/homeSlice';

interface UseMovieDataProps {
  token: string;
  initialImdbId: string;
  movieList: any[];
  initialIndex: number;
  source: string | null;
  currentPage: number;
  totalPages: number;
}

export const useMovieData = ({
  token,
  initialImdbId,
  movieList,
  initialIndex,
  source,
  currentPage,
  totalPages,
}: UseMovieDataProps) => {
  const dispatch = useDispatch();
  const { toggleBookmark: toggleBookmarkHook } = useBookmarks(token);

  const [movieData, setMovieData] = useState<any[]>([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [matchingQueue, setMatchingQueue] = useState<any[]>([]);
  const [currentSeedId, setCurrentSeedId] = useState(initialImdbId);
  const [localMovieList, setLocalMovieList] = useState(movieList);
  const [feedPage, setFeedPage] = useState(currentPage);
  const [feedTotalPages, setFeedTotalPages] = useState(totalPages);
  const [bookmarkMap, setBookmarkMap] = useState<{ [k: string]: boolean }>({});

  const matchingQueueRef = useRef(matchingQueue);
  const preloadInProgressRef = useRef(false);
  const isInitialLoad = useRef(true);
  const currentFeedIndexRef = useRef(initialIndex);
  const bookmarkMapRef = useRef(bookmarkMap);

  useEffect(() => {
    matchingQueueRef.current = matchingQueue;
  }, [matchingQueue]);

  useEffect(() => {
    bookmarkMapRef.current = bookmarkMap;
  }, [bookmarkMap]);

  // Sync bookmark map with current item
  useEffect(() => {
    if (movieData && movieData[1]) {
      const m = movieData[1];
      if (m?.imdb_id) {
        setBookmarkMap(prev => ({ ...prev, [m.imdb_id]: !!m.is_bookmarked }));
      }
    }
  }, [movieData]);

  const handleToggleBookmark = useCallback(async (imdb_id: string) => {
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

  const fetchNextMovieFromQueue = useCallback(async (prevImdb: string) => {
    try {
      setLoadingMore(true);
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
      return meta;
    } catch (error) {
      return null;
    } finally {
      setLoadingMore(false);
    }
  }, [token]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [meta, matching] = await Promise.all([
        getMovieMetadata(token, initialImdbId),
        getMatchingMovies(token, initialImdbId)
      ]);
      setMovieData([null, meta, null]);
      setCurrentSeedId(initialImdbId);
      setMatchingQueue(matching?.results || []);
      isInitialLoad.current = false;
    } catch (err) {
      isInitialLoad.current = false;
    } finally {
      setLoading(false);
    }
  }, [token, initialImdbId]);

  return {
    movieData,
    setMovieData,
    loading,
    loadingMore,
    setLoadingMore,
    bookmarkMap,
    handleToggleBookmark,
    loadInitialData,
    fetchNextMovieFromQueue,
    localMovieList,
    setLocalMovieList,
    feedPage,
    setFeedPage,
    feedTotalPages,
    setFeedTotalPages,
    currentSeedId,
    setCurrentSeedId,
    matchingQueueRef,
    preloadInProgressRef,
    isInitialLoad,
    currentFeedIndexRef,
  };
};
