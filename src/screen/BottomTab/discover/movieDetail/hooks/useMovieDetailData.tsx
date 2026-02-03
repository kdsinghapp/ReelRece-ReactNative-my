import { useState, useEffect, useRef, useCallback } from 'react';
import { getMovieMetadata } from '@redux/Api/movieApi';
import { getMatchingMovies } from '@redux/Api/ProfileApi';

/**
 * Custom hook for managing movie detail data fetching and queue
 */
export const useMovieDetailData = (token: string, initialImdbId: string) => {
  const [movieData, setMovieData] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentSeedId, setCurrentSeedId] = useState(initialImdbId);
  const [matchingQueue, setMatchingQueue] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const isInitialLoad = useRef(true);
  const isResettingRef = useRef(false);

  // Load initial movie data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [meta, matching] = await Promise.all([
          getMovieMetadata(token, initialImdbId),
          getMatchingMovies(token, initialImdbId)
        ]);

        setMovieData([null, meta, null]);
        setCurrentSeedId(initialImdbId);
        setSelectedMovie(meta?.imdb_id);
        setMatchingQueue(matching?.results || []);
        setIsLoading(false);
        isInitialLoad.current = false;
      } catch (err) {
         isInitialLoad.current = false;
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };
    loadInitialData();
  }, [initialImdbId, token]);

  // Fetch next movie from queue
  const fetchNextMovieFromQueue = useCallback(async (prevImdb: string) => {
    try {
      setLoadingMore(true);
      setIsLoading(true);
      
      let queue = [...matchingQueue];
      const matching = await getMatchingMovies(token, prevImdb);
      queue = matching?.results || [];
      
      if (!queue.length) return null;

      // Pick random movie from queue
      const randomIndex = Math.floor(Math.random() * queue.length);
      const nextMovie = queue[randomIndex];
      queue.splice(randomIndex, 1);
      setMatchingQueue(queue);

      const meta = await getMovieMetadata(token, nextMovie?.imdb_id);
      setLoadingMore(true);
      setIsLoading(false);
      setSelectedMovie(meta.imdb_id);

      return meta;
    } catch (error) {
      setIsLoading(false);
      return null;
    } finally {
      setLoadingMore(false);
    }
  }, [token, matchingQueue]);

  return {
    movieData,
    setMovieData,
    loading,
    isLoading,
    loadingMore,
    currentSeedId,
    setCurrentSeedId,
    selectedMovie,
    isInitialLoad,
    isResettingRef,
    fetchNextMovieFromQueue
  };
};
