 
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { calculateMovieRating, getAllRated_with_preference, getRatedMovies, recordPairwiseDecision, rollbackPairwiseDecisions } from '@redux/Api/movieApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setModalClosed } from '@redux/feature/modalSlice/modalSlice';
import { getUserProfile } from '@redux/Api/authService';
import { setUserProfile } from '@redux/feature/authSlice';
  
export const useCompareComponent = (token: string) => {
  // ---- Core state ----
  const [selectedMovie, setSelectedMovie] = useState<string | object>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const [comparisonMovies, setComparisonMovies] = useState<string | object[]>([]);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);

  // Modal states (public API same)
  const [isFeedbackVisible, setFeedbackVisible] = useState(false);
  const [isComparisonVisible, setComparisonVisible] = useState(false);
  const [stepsModal, setStepsModal] = useState<boolean>(false); // kept for compatibility
  const [isStepsModalVisible, setStepsModalVisible] = useState(false);
  const dispatch = useDispatch();

  // Steps & preference
  const [currentStep, setCurrentStep] = useState(0);
  const [selectionHistory, setSelectionHistory] = useState<string[]>([]);
  const [userPreference, setUserPreference] = useState<{
    preference: 'love' | 'like' | 'dislike' | null;
  }>({ preference: null });

  // ---- Binary search bounds ----
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [mid, setMid] = useState(0);
  const [lastAction, setLastAction] = useState(null); // 'first' Or 'second'

  const lowRef = useRef(0);
  const highRef = useRef(0);
  const midRef = useRef(0);
  const [userProfileDate, setUserProfileDate] = useState<Record<string, unknown>>({});
useEffect(()=>{
  fetchUserProfile()
},[token])
const fetchUserProfile = useCallback(async () => {
  if (!token) {
    setLoading(false);
    return;
  }
  
  try {
    setLoading(true);
     const res = await getUserProfile(token);
     dispatch(setUserProfile({ userGetData: res }));
  } catch (error) {
     // Set loading to false even on error to prevent infinite loading
    setLoading(false);
  } finally {
    setLoading(false);
  }
}, [token, dispatch]);

  const fetchComparisonMovies = useCallback(async (pref?: 'love' | 'like' | 'dislike') => {
    const preferenceToUse = pref || userPreference.preference;
    if (!token || !selectedMovieId || !preferenceToUse) return [];

    try {
      let allResults: string | object = [];
      let currentPage = 1;
      let totalPages = 1;
      while (currentPage <= totalPages) {
        // const response = await getRatedMovies(token, currentPage);
        const response = await getAllRated_with_preference(token, preferenceToUse)
        const totalRated = response?.results?.length ?? 0;
        setCurrentStep(totalRated);
         await AsyncStorage.setItem('currentStep', String(totalRated));
         totalPages = response?.total_pages ?? 1;
        currentPage = response?.current_page ?? currentPage;
        allResults = [...allResults, ...(response?.results ?? [])];
        currentPage += 1;
      }
      const filtered = allResults
        .filter(m => m.imdb_id !== selectedMovieId)
        .filter(m => m.preference === preferenceToUse)
      // .sort((a, b) => a.title.localeCompare(b.title));
       setComparisonMovies(filtered);

      // set binary search bounds
      const length = filtered.length;
      setLow(0);
      lowRef.current = 0;
      setHigh(length - 1);
      highRef.current = length - 1;
      setMid(Math.floor((length - 1) / 2)); // first pivot = median
      midRef.current = Math.floor((length - 1) / 2);

      return filtered;
    } catch (err) {
       return [];
    }
  }, [token, selectedMovieId, userPreference.preference]);

  const secondMovieData = useMemo(() => {
    if (!comparisonMovies.length) return null;
    if (mid < 0 || mid >= comparisonMovies.length) return null;
     return comparisonMovies[mid];
  }, [comparisonMovies, mid]);

  const resetComparisonData = useCallback(() => {
    setComparisonMovies([]);
    setCurrentComparisonIndex(0);
  }, [isComparisonVisible, setComparisonVisible, setComparisonMovies, setCurrentComparisonIndex]);

  // ---- Open feedback modal ----
  const openFeedbackModal = useCallback((movie: string | object) => {
    // setSelectedMovie(movie);
    // setSelectedMovieId(movie?.imdb_id ?? null);
    // setFeedbackVisible(true);
    setSelectionHistory([]);
    setComparisonMovies([]);
    setCurrentComparisonIndex(0);
    setSelectedMovie(movie);
    setSelectedMovieId(movie?.imdb_id ?? null);
    setFeedbackVisible(true);
    fetchComparisonMovies();
    // }, [isFeedbackVisible, isComparisonVisible,]);
  }, [isFeedbackVisible, isComparisonVisible, setFeedbackVisible, setComparisonVisible, setSelectedMovie, setSelectedMovieId, fetchComparisonMovies]);

  const handleFeedbackSubmit = useCallback(
    async (pref: 'love' | 'like' | 'dislike') => {
      setUserPreference({ preference: pref });
      setFeedbackVisible(false);

      const list = await fetchComparisonMovies(pref);
      if (list.length > 0) {
        setComparisonVisible(true);
      } else if (selectedMovie?.imdb_id) {
        try {
          await calculateMovieRating(token, {
            imdb_id: selectedMovie?.imdb_id,
            preference: pref,
          });
        } catch (error) {
         }
      }
    },
    [fetchComparisonMovies, selectedMovie, token]
  );

  const handleSkipSetFirst = async () => {
 
    if (!selectedMovie || !secondMovieData || !userPreference.preference) return;

    try {
  
      // API call: treat as first movie won by default
      // await recordUserPreferences(
      //   token,
      //   userPreference.preference,
      //   selectedMovie.imdb_id,
      //   secondMovieData.imdb_id,
      //   selectedMovie.imdb_id
      // );

      // Decide whether to update high or low based on lastAction
      if (lastAction === 'first') {
        const newHigh = midRef.current - 1;
        const newMid = Math.floor((lowRef.current + newHigh) / 2);
        setHigh(newHigh);
        highRef.current = newHigh;
        setMid(newMid);
        midRef.current = newMid;
      } else if (lastAction === 'second') {
        const newLow = midRef.current + 1;
        const newMid = Math.floor((newLow + highRef.current) / 2);
        setLow(newLow);
        lowRef.current = newLow;
        setMid(newMid);
        midRef.current = newMid;
      } else {
        const newHigh = midRef.current - 1;
        const newMid = Math.floor((lowRef.current + newHigh) / 2);
        setHigh(newHigh);
        highRef.current = newHigh;
        setMid(newMid);
        midRef.current = newMid;
      }
      
      // if (lowRef.current > highRef.current || !comparisonMovies[midRef.current]) {
      if (lowRef.current > highRef.current || !comparisonMovies[midRef.current]) {
         setComparisonVisible(false);
        setStepsModalVisible(true);

        if (selectedMovie?.imdb_id && userPreference.preference) {
          await calculateMovieRating(token, {
            imdb_id: selectedMovie?.imdb_id,
            preference: userPreference?.preference,
          });
        }
        return;
      }
      // Otherwise → proceed with next comparison
      setCurrentStep(s => s + 1);

    } catch (err) {
     }
  };



  const handleSelectFirst = useCallback(async () => {
    if (!selectedMovie || !secondMovieData || !userPreference.preference) return;
       try {
      // Record user preference
      setLastAction('first');

      // await recordUserPreferences(
      //   token,
      //   userPreference.preference,
      //   selectedMovie.imdb_id,
      //   secondMovieData.imdb_id,
      //   selectedMovie.imdb_id
      // );
      await recordPairwiseDecision(
        token,
        {
          preference: userPreference.preference,
          imdb_id_1: selectedMovie.imdb_id,
          imdb_id_2: secondMovieData.imdb_id,
          winner:selectedMovie.imdb_id
          // winner: selectedMovie.imdb_id

        }

      );
 

      // Update high and mid using refs (binary search logic)
      const newHigh = midRef.current - 1;
      const newMid = Math.floor((lowRef.current + newHigh) / 2);
      setHigh(newHigh);
      highRef.current = newHigh;
      setMid(newMid);
      midRef.current = newMid;

      // Calculate remaining items
      const remainingItems = highRef.current - lowRef.current + 1;
 
      if (remainingItems <= 0) {

        setComparisonVisible(false);
        setStepsModalVisible(true);

        if (selectedMovie?.imdb_id && userPreference.preference) {
          dispatch(setModalClosed(true));
          await calculateMovieRating(token, {
            imdb_id: selectedMovie.imdb_id,
            preference: userPreference.preference,
          });
        }
        return;
      }
      if (remainingItems === 2) {
        setMid(lowRef.current);
        midRef.current = lowRef.current;
      }

    } catch (err) {
     }
  }, [selectedMovie, secondMovieData, token, userPreference.preference]);


  const handleSelectSecond = useCallback(async () => {
    if (!selectedMovie || !secondMovieData || !userPreference.preference) return;
      try {
      setLastAction('second');

      // await recordUserPreferences(
      //   token,
      //   userPreference.preference,
      //   selectedMovie.imdb_id,
      //   secondMovieData.imdb_id,
      //   secondMovieData.imdb_id
      // );

       await recordPairwiseDecision(
        token,
        {
          preference: userPreference.preference,
          imdb_id_1: selectedMovie.imdb_id,
          imdb_id_2: secondMovieData.imdb_id,
          // winner: selectedMovie.imdb_id
          winner: secondMovieData.imdb_id

        }

      );
 
      // Update low and mid using refs
      const newLow = midRef.current + 1;
      const newMid = Math.floor((newLow + highRef.current) / 2);
      setLow(newLow);
       lowRef.current = newLow;
      setMid(newMid);
      midRef.current = newMid;

      // Check if out of bounds
      // if (midRef.current >= highRef.current) {
 
      //   setComparisonVisible(false);
      //   setStepsModalVisible(true);
      // const remainingItems = highRef.current - lowRef.current + 1;

      // if (remainingItems === 2) {
      //   // force final comparison
      //   setMid(lowRef.current); // first of the two
      //   midRef.current = lowRef.current;
      //   // don't close modal yet, wait for user choice
      // } else if (midRef.current >= highRef.current) {
      //   setComparisonVisible(false);
      //   setStepsModalVisible(true);
      //   if (selectedMovie?.imdb_id && userPreference.preference) {
      //     await calculateMovieRating(token, {
      //       imdb_id: selectedMovie.imdb_id,
      //       preference: userPreference.preference,
      //     });
      //   }
      //   return;
      // }


      const remainingItems = highRef.current - lowRef.current + 1;
 
      if (remainingItems <= 0) {
        setComparisonVisible(false);
        setStepsModalVisible(true);

        if (selectedMovie?.imdb_id && userPreference.preference) {
          // dispatch(setModalClosed(true));

          const result_calculate_movie = await calculateMovieRating(token, {
            imdb_id: selectedMovie.imdb_id,
            preference: userPreference.preference,
          });
           if (result_calculate_movie) dispatch(setModalClosed(true));
        }
        return;
      }
    } catch (err) {
     }
  }, [selectedMovie, secondMovieData, token, userPreference.preference]);


  const handleNextComparison = useCallback(
    async (skip = false) => {
      if (
        selectionHistory.length >= 3 &&
        selectionHistory[selectionHistory.length - 3] === "second" &&
        selectionHistory[selectionHistory.length - 2] === "second" &&
        selectionHistory[selectionHistory.length - 1] === "first"
      ) {
         setComparisonVisible(false);
        setStepsModalVisible(true);
        setSelectionHistory([]);
        if (selectedMovie?.imdb_id && userPreference.preference) {

          try {

            await calculateMovieRating(token, {
              imdb_id: selectedMovie.imdb_id,
              preference: userPreference.preference,
            });
          } catch (error) {
           }
        }
        return;
      }
      const next = currentComparisonIndex + 1;

      // if user skipped at the end
      if (skip) {
        setComparisonVisible(false);
        // handleSkipSetFirst();

        if (comparisonMovies.length < 6) setStepsModalVisible(true);
        return;
      }
      if (next < comparisonMovies.length) {
        setCurrentComparisonIndex(next);
        setCurrentStep(s => s + 1); // functional update
      } else {
        // finished comparisons
        setComparisonVisible(false);
        setStepsModalVisible(true);
        if (selectedMovie?.imdb_id && userPreference.preference) {
          try {
            await calculateMovieRating(token, {
              imdb_id: selectedMovie.imdb_id,
              preference: userPreference.preference,
            });
          } catch (error) {
           };
        };
      };
    },
    [comparisonMovies.length, currentComparisonIndex, selectedMovie, token, userPreference.preference]
  );
  // close modal and rollback last decisions
  const [commentMdal, setCommentModal] = useState(false);
  const handleCloseRating = async () => {
    try {
      await rollbackPairwiseDecisions(token, userPreference?.preference,);
 
      setComparisonVisible(false);
    } catch (error) {
     }
  };
  // progress bar
  //  ---- On mount (or token change) → load initial step count ----

  //  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const isFetchedRef = useRef(false); //  prevent multiple calls

  useEffect(() => {
    // agar token na ho to kuch mat kar
    if (!token || isFetchedRef.current) return;

    let mounted = true;
    isFetchedRef.current = true; // ✅ ensures runs only once
     const init = async () => {
      try {
        const storedCount = await AsyncStorage.getItem('currentStep');
        const countNum = storedCount ? Number(storedCount) : 0;
 
        // ✅ skip API if already have 5 or more
        if (countNum >= 5) {
          if (mounted) {
            setCurrentStep(countNum);
            setLoading(false);
          }
           return;
        }

         const resp = await getRatedMovies(token);
        if (!mounted) return;

        const totalRated = resp?.results?.length ?? 0;
        setCurrentStep(totalRated);
 
        await AsyncStorage.setItem('currentStep', String(totalRated));
      } catch (e) {
       } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [token]);

 

  return {
    // State
    selectedMovie,
    selectedMovieId,
    secondMovieData,               // derived
    currentComparisonIndex,
    comparisonMovies,
    userPreference,
    setUserPreference,             // still accepts { preference: ... }
    stepsModal,
    setStepsModal,
    // Modals
    isFeedbackVisible,
    isComparisonVisible,
    openFeedbackModal,
    setFeedbackVisible,
    setComparisonVisible,
    // Actions
    handleFeedbackSubmit,
    handleSelectFirst,
    handleSelectSecond,
    handleNextComparison,
    handleSkipSetFirst,
    resetComparisonData,
    // Step progressbar
    isStepsModalVisible,
    setStepsModalVisible,
    currentStep,
    setCurrentStep,
    handleCloseRating,   // close modal by cross
  };
};
