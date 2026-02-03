 


import { useEffect, useState } from 'react';
import { getMatchingMovies } from '@redux/Api/ProfileApi';
import { recordPairwiseDecision } from '@redux/Api/movieApi';
// import { getMatchingMovies, recordUserPreferences } from '@redux/Api/ProfileApi';

interface Movie {
  imdb_id: string;
  title: string;
  release_year: number;
  cover_image_url: string;
  rating?: number;
  id?: string;
}
type PreferenceType = 'love' | 'like' | 'dislike';
const useComparisonModal = (token: string | null, selectedMovie: Movie | null) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [comparisonMovies, setComparisonMovies] = useState<Movie[]>([]);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  const [secondMovieData, setSecondMovieData] = useState<Movie | null>(null);
  const [userPreference, setUserPreference] = useState<{
    preference: PreferenceType | null;
    rating: number | null;
  }>({ preference: null, rating: null });
   // Fetch comparison movies based on selectedMovie
  useEffect(() => {
    const fetchMatchingMovies = async () => {
      if (!selectedMovie?.imdb_id || !token) return;
      try {
        const data = await getMatchingMovies(token, selectedMovie.imdb_id);
        const filtered = data.results.filter(m => m.imdb_id !== selectedMovie.imdb_id);
        const randomMovies = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 3);
        setComparisonMovies(randomMovies);
        setSecondMovieData(randomMovies[0]);
        setCurrentComparisonIndex(0);
      } catch (err) { 
       }
    };
    if (selectedMovie) {
      fetchMatchingMovies();
    }
  }, [selectedMovie, token]);
  // 📤 Submit preference
  const submitPreference = async (
    imdb_id: string,
    preference: PreferenceType = 'like',
    rating: number = 5
  ) => {
    if (!token || !imdb_id) return;

    const payload = {
      preferences: [{ imdb_id, preference, rating }],
    };
     try {
      const response = await recordPairwiseDecision(token, payload.preferences);
     } catch (error) {
     }
  };

  // ➡️ Move to next comparison
  const handleNextComparison = () => {
    const nextIndex = currentComparisonIndex + 1;
    if (nextIndex < comparisonMovies.length) {
      setCurrentComparisonIndex(nextIndex);
      setSecondMovieData(comparisonMovies[nextIndex]);
    } else {
      setModalVisible(false);
    }
  };

  // ✅ On selecting second movie
  const handleSecondSelection = (movie: Movie) => {
    submitPreference(
      movie.imdb_id,
      userPreference.preference || 'like',
      userPreference.rating || 5
    );
    handleNextComparison();
  };

  // ✅ On selecting first movie
  const handleFirstSelection = () => {
    if (!selectedMovie) return;
    submitPreference(
      selectedMovie.imdb_id,
      userPreference.preference || 'like',
      userPreference.rating || 5
    );
    handleNextComparison();
  };

  return {
    modalVisible,
    setModalVisible,
    secondMovieData,
    currentComparisonIndex,
    comparisonMovies,
    userPreference,
    setUserPreference,
    handleSecondSelection,
    handleFirstSelection,
    setSecondMovieData,
    submitPreference,   
  };
};

export default useComparisonModal;
