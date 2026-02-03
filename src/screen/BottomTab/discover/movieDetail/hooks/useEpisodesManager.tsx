import { useState, useRef, useEffect, useCallback } from 'react';
import { getEpisodes, getEpisodesBySeason } from '@redux/Api/movieApi';

/**
 * Custom hook for managing TV show episodes
 */
export const useEpisodesManager = (token: string) => {
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
  const [sessionList, setSessionList] = useState<{ id: number; session: string }[]>([]);
  const [episodesLoader, setEpisodesLoader] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch episodes for a movie/show
  const getEpisodesData = useCallback(async (imdb_id: string) => {
    if (!imdb_id) return;

    try {
      const response = await getEpisodes(token, imdb_id);
      let episodesData = [];
      
      if (response && typeof response === "object" && !Array.isArray(response)) {
        episodesData = Object.values(response).flat();
      } else if (Array.isArray(response)) {
        episodesData = response;
      }

      const formattedEpisodes = episodesData.map((ep: object| string | null | number, index: number) => ({
        id: index + 1,
        title: ep.episode_name || `Episode ${index + 1}`,
        duration: ep.runtime ? `${ep.runtime} min` : "Unknown",
      }));

      setEpisodes(formattedEpisodes);
    } catch (error) {
       setEpisodes([]);
    }
  }, [token]);

  // Fetch all seasons
  const fetchAllSeasons = useCallback(async (imdb_id: string) => {
    if (!imdb_id) return;

    setEpisodesLoader(true);
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
      setEpisodesLoader(false);
    }
  }, [token]);

  // Fetch episodes for specific season
  const handleFetchSeasonEpisodes = useCallback(async (imdb_id: string, seasonNumber: number = 3) => {
    setEpisodesLoader(true);
    try {
      const response = await getEpisodesBySeason(token, imdb_id, seasonNumber);
      const seasonData = Object.values(response).flat();

      const formattedEpisodes = seasonData.map((ep: object| string | null | number, index: number) => ({
        id: index + 1,
        title: ep?.episode_name || `Episode ${index + 1}`,
        duration: ep?.runtime ? `${ep?.runtime} min` : "Unknown",
      }));

      setEpisodes(formattedEpisodes);
    } catch (err) {
 
      setEpisodes([]);
    } finally {
      setEpisodesLoader(false);
    }
  }, [token]);

  // Reset episodes data
  const resetEpisodes = useCallback(() => {
    hasFetchedRef.current = false;
    setEpisodes([]);
    setSessionList([]);
  }, []);

  return {
    episodes,
    selectedEpisodeId,
    setSelectedEpisodeId,
    sessionList,
    episodesLoader,
    hasFetchedRef,
    getEpisodesData,
    fetchAllSeasons,
    handleFetchSeasonEpisodes,
    resetEpisodes
  };
};
