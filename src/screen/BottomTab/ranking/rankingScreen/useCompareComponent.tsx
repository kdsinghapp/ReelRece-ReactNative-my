import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { calculateMovieRating, getAllRatedMovies, getAllRated_with_preference, recordPairwiseDecision, rollbackPairwiseDecisions } from '@redux/Api/movieApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setModalClosed } from '@redux/feature/modalSlice/modalSlice';
import { fetchProfileFeed, fetchProfileRatedMovies, fetchProfileBookmarks } from '@redux/feature/profileSlice';
import { getUserProfile } from '@redux/Api/authService';
import { setUserProfile } from '@redux/feature/authSlice';
import { errorToast } from '@utils/customToast';

/** Number of movies to rank before step progress modal (show after 1st and 5th) */
export const STEPPER_VALUE = 6;

export const useCompareComponent = (token: string, options?: { onRatingSuccess?: () => void }) => {
  // ---- Core state ----
  const [selectedMovie, setSelectedMovie] = useState<string | object>();
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const [comparisonMovies, setComparisonMovies] = useState<string | object[]>([]);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);

  // Modal states (public API same)
  const [isFeedbackVisible, setFeedbackVisible] = useState(false);
  const [isComparisonVisible, setComparisonVisible] = useState(false);
  const [isComparisonLoading, setComparisonLoading] = useState(false);
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
  /** Only show step modal when currentStep becomes 1 (first movie) or STEPPER_VALUE (fifth movie) */
  const shouldShowStepModalRef = useRef(false);
  /** Prefetched comparison lists by preference (love/like/dislike) for the current selectedMovieId - used to avoid API wait on preference select */
  const prefetchedByPreferenceRef = useRef<Record<string, unknown[]>>({});

  const performCalculateRating = useCallback(async (payload: any) => {
    const res = await calculateMovieRating(token, payload);
    options?.onRatingSuccess?.();
    return res;
  }, [token, options]);
  useEffect(() => {
    fetchUserProfile()
  }, [token])
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

  /** Single API call per preference; returns filtered list for the given movie id (excludes self, same preference). */
  const fetchComparisonMovies = useCallback(async (pref?: 'love' | 'like' | 'dislike', excludeImdbId?: string | null) => {
    const preferenceToUse = pref || userPreference.preference;
    const movieId = excludeImdbId ?? selectedMovieId;
    if (!token || !movieId || !preferenceToUse) return [];

    try {
      const response = await getAllRated_with_preference(token, preferenceToUse);
      const allResults = response?.results ?? [];
      const filtered = allResults
        .filter((m: { imdb_id?: string; preference?: string }) => m.imdb_id !== movieId && m.preference === preferenceToUse);

      // set binary search bounds
      setComparisonMovies(filtered);

      const length = filtered.length;
      setLow(0);
      lowRef.current = 0;
      setHigh(length - 1);
      highRef.current = length - 1;
      setMid(Math.floor((length - 1) / 2));
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

  // Show step modal only when currentStep is 1 (first movie ranked) or STEPPER_VALUE (fifth movie ranked)
  useEffect(() => {
    if ((currentStep === 1 || currentStep === STEPPER_VALUE) && shouldShowStepModalRef.current) {
      shouldShowStepModalRef.current = false;
      setStepsModalVisible(true);
    }
  }, [currentStep]);
  const prefetchComparisonByPreference = useCallback((movieImdbId: string | null | undefined) => {
    if (!token || !movieImdbId) return;
    prefetchedByPreferenceRef.current = {};
    const prefs: ('love' | 'like' | 'dislike')[] = ['love', 'like', 'dislike'];
    Promise.all(
      prefs.map(async (pref) => {
        try {
          const response = await getAllRated_with_preference(token, pref);
          const results = response?.results ?? [];
          const filtered = results.filter(
            (m: { imdb_id?: string; preference?: string }) => m.imdb_id !== movieImdbId && m.preference === pref
          );
          prefetchedByPreferenceRef.current[pref] = filtered;
        } catch {
          prefetchedByPreferenceRef.current[pref] = [];
        }
      })
    ).catch(() => { });
  }, [token]);

  /** Apply a pre-fetched list to state and binary search bounds (no API call). */
  const applyComparisonList = useCallback((filtered: unknown[]) => {
    setComparisonMovies(filtered);
    const length = filtered.length;
    setLow(0);
    lowRef.current = 0;
    setHigh(length - 1);
    highRef.current = length - 1;
    const midVal = Math.floor((length - 1) / 2);
    setMid(midVal);
    midRef.current = midVal;
  }, []);

  const openFeedbackModal = useCallback((movie: string | object) => {
    setSelectionHistory([]);
    setComparisonMovies([]);
    setCurrentComparisonIndex(0);
    setSelectedMovie(movie);
    setSelectedMovieId(movie?.imdb_id ?? null);
    setFeedbackVisible(true);
    prefetchComparisonByPreference(movie?.imdb_id ?? null);
  }, [setFeedbackVisible, setSelectedMovie, setSelectedMovieId, prefetchComparisonByPreference]);

  const handleFeedbackSubmit = useCallback(
    // Switch to comparison step immediately so animation can run right away
    (pref: 'love' | 'like' | 'dislike') => {
      setUserPreference({ preference: pref });

      const prefetched = prefetchedByPreferenceRef.current[pref];
      const hasPrefetched = Array.isArray(prefetched);

      // Direct close for first movie (no comparisons) if list is known empty
      if (hasPrefetched && prefetched.length === 0) {
        setFeedbackVisible(false);
        setComparisonVisible(false); // Make sure comparison is not shown
        if (selectedMovie?.imdb_id) {
          performCalculateRating({
            imdb_id: selectedMovie.imdb_id,
            preference: pref,
          }).then(() => {
            setCurrentStep((s) => {
              const next = s + 1;
              if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
              AsyncStorage.setItem('currentStep', String(next));
              return next;
            });
          }).catch(handleCloseRating);
        }
        return;
      }

      setComparisonVisible(true);
      setFeedbackVisible(false);

      (async () => {
        try {
          if (hasPrefetched) {
            applyComparisonList(prefetched);
            if (prefetched.length === 0) {
              setComparisonVisible(false);
              if (selectedMovie?.imdb_id) {
                try {
                  await performCalculateRating({
                    imdb_id: selectedMovie?.imdb_id,
                    preference: pref,
                  });
                  setCurrentStep((s) => {
                    const next = s + 1;
                    if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
                    AsyncStorage.setItem('currentStep', String(next));
                    return next;
                  });
                } catch (error) {
                  handleCloseRating();
                }
              }
            }
            return;
          }
          const list = await fetchComparisonMovies(pref);
          if (list.length === 0) {
            setComparisonVisible(false);
            if (selectedMovie?.imdb_id) {
              try {
                await performCalculateRating({
                  imdb_id: selectedMovie?.imdb_id,
                  preference: pref,
                });
                setCurrentStep((s) => {
                  const next = s + 1;
                  if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
                  AsyncStorage.setItem('currentStep', String(next));
                  return next;
                });
              } catch (error) {
                handleCloseRating();
              }
            }
          }
        } catch (_) {
          setFeedbackVisible(false);
        }
      })();
    },
    [fetchComparisonMovies, applyComparisonList, selectedMovie, token]
  );

  const handleSkipSetFirst = async () => {
    // Direct close if no comparison movies (e.g., first movie rating)
    if (!secondMovieData) {
      setComparisonVisible(false);
      if (selectedMovie?.imdb_id && userPreference.preference) {
        try {
          await performCalculateRating({
            imdb_id: selectedMovie.imdb_id,
            preference: userPreference.preference,
          });
          setCurrentStep((s) => {
            const next = s + 1;
            if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
            AsyncStorage.setItem('currentStep', String(next));
            return next;
          });
        } catch (error) {
          handleCloseRating();
        }
      }
      return;
    }

    if (!selectedMovie || !userPreference.preference) return;

    try {

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

      if (lowRef.current > highRef.current || !comparisonMovies[midRef.current]) {
        setComparisonVisible(false);
        setCurrentStep((s) => {
          const next = s + 1;
          if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
          AsyncStorage.setItem('currentStep', String(next));
          return next;
        });

        if (selectedMovie?.imdb_id && userPreference.preference) {
          try {
            await performCalculateRating({
              imdb_id: selectedMovie?.imdb_id,
              preference: userPreference?.preference,
            });
          } catch (error) {
            handleCloseRating();
            errorToast("movie ranking failed, please try again.");

            return;
          }
        }
        return;
      }
      setCurrentStep(s => s + 1);

    } catch (err) {
    }
  };



  const handleSelectFirst = useCallback(() => {
    if (!selectedMovie || !secondMovieData || !userPreference.preference) return;
    setLastAction('first');

    // Update UI state first so slide-in shows next card immediately (no wait for API)
    const newHigh = midRef.current - 1;
    const newMid = Math.floor((lowRef.current + newHigh) / 2);
    setHigh(newHigh);
    highRef.current = newHigh;
    setMid(newMid);
    midRef.current = newMid;

    const remainingItems = highRef.current - lowRef.current + 1;

    if (remainingItems <= 0) {
      setComparisonVisible(false);
      setCurrentStep((s) => {
        const next = s + 1;
        if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
        AsyncStorage.setItem('currentStep', String(next));
        return next;
      });
      const imdbId = selectedMovie?.imdb_id;
      const pref = userPreference.preference;
      const pairwisePayload = {
        preference: pref,
        imdb_id_1: selectedMovie.imdb_id,
        imdb_id_2: secondMovieData.imdb_id,
        winner: selectedMovie.imdb_id,
      };
      recordPairwiseDecision(token, pairwisePayload)
        .catch(() => recordPairwiseDecision(token, pairwisePayload))
        .then(() => {
          if (imdbId && pref) {
            return performCalculateRating({ imdb_id: imdbId, preference: pref }).then(() => {
              dispatch(setModalClosed(true));
              dispatch(fetchProfileFeed({ reset: true }) as any);
              dispatch(fetchProfileRatedMovies() as any);
              dispatch(fetchProfileBookmarks() as any);
            });
          }
        })
        .catch(() => {
          handleCloseRating();
          errorToast('movie ranking failed, please try again.');
        });
      return;
    }
    if (remainingItems === 2) {
      setMid(lowRef.current);
      midRef.current = lowRef.current;
    }

    // Run API in background so slide-in is not blocked
    const payload = {
      preference: userPreference.preference,
      imdb_id_1: selectedMovie.imdb_id,
      imdb_id_2: secondMovieData.imdb_id,
      winner: selectedMovie.imdb_id,
    };
    recordPairwiseDecision(token, payload).catch(() =>
      recordPairwiseDecision(token, payload)
    ).catch(() => {
      handleCloseRating();
      errorToast('movie ranking failed, please try again.');
    });
  }, [selectedMovie, secondMovieData, token, userPreference.preference]);


  const handleSelectSecond = useCallback(() => {
    if (!selectedMovie || !secondMovieData || !userPreference.preference) return;
    setLastAction('second');

    // Update UI state first so slide-in shows next card immediately (no wait for API)
    const newLow = midRef.current + 1;
    const newMid = Math.floor((newLow + highRef.current) / 2);
    setLow(newLow);
    lowRef.current = newLow;
    setMid(newMid);
    midRef.current = newMid;

    const remainingItems = highRef.current - lowRef.current + 1;

    if (remainingItems <= 0) {
      setComparisonVisible(false);
      setCurrentStep((s) => {
        const next = s + 1;
        if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
        AsyncStorage.setItem('currentStep', String(next));
        return next;
      });
      const imdbId = selectedMovie?.imdb_id;
      const pref = userPreference.preference;
      const pairwisePayload = {
        preference: pref,
        imdb_id_1: selectedMovie.imdb_id,
        imdb_id_2: secondMovieData.imdb_id,
        winner: secondMovieData.imdb_id,
      };
      recordPairwiseDecision(token, pairwisePayload)
        .catch(() => recordPairwiseDecision(token, pairwisePayload))
        .then(() => {
          if (imdbId && pref) {
            return performCalculateRating({ imdb_id: imdbId, preference: pref }).then((res) => {
              if (res) {
                dispatch(setModalClosed(true));
                dispatch(fetchProfileFeed({ reset: true }) as any);
                dispatch(fetchProfileRatedMovies() as any);
                dispatch(fetchProfileBookmarks() as any);
              }
            });
          }
        })
        .catch(() => {
          handleCloseRating();
          errorToast(
            "Unable to save your rating. Your previous choices were rolled back. Please try again from the beginning."
          );
        });
      return;
    }

    // Run API in background so slide-in is not blocked
    const payload = {
      preference: userPreference.preference,
      imdb_id_1: selectedMovie.imdb_id,
      imdb_id_2: secondMovieData.imdb_id,
      winner: secondMovieData.imdb_id,
    };
    recordPairwiseDecision(token, { ...payload, winner: secondMovieData.imdb_id })
      .catch(() => recordPairwiseDecision(token, { ...payload, winner: secondMovieData.imdb_id }))
      .catch(() => {
        handleCloseRating();
        errorToast('movie ranking failed, please try again.');
      });
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
        setCurrentStep((s) => {
          const next = s + 1;
          if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
          AsyncStorage.setItem('currentStep', String(next));
          return next;
        });
        setSelectionHistory([]);
        if (selectedMovie?.imdb_id && userPreference.preference) {
          try {
            await performCalculateRating({
              imdb_id: selectedMovie.imdb_id,
              preference: userPreference.preference,
            });
          } catch (error) {
            try {
              await performCalculateRating({
                imdb_id: selectedMovie.imdb_id,
                preference: userPreference.preference,
              });
            } catch (error) {
              handleCloseRating();
              errorToast("movie ranking failed, please try again.");

            }
          }
        }
        return;
      }
      const next = currentComparisonIndex + 1;

      // if user skipped at the end
      if (skip) {
        setComparisonVisible(false);
        setCurrentStep((s) => {
          const next = s + 1;
          if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
          AsyncStorage.setItem('currentStep', String(next));
          return next;
        });
        return;
      }
      if (next < comparisonMovies.length) {
        setCurrentComparisonIndex(next);
        setCurrentStep(s => s + 1); // functional update
      } else {
        setComparisonVisible(false);
        setCurrentStep((s) => {
          const next = s + 1;
          if (next === 1 || next === STEPPER_VALUE) shouldShowStepModalRef.current = true;
          AsyncStorage.setItem('currentStep', String(next));
          return next;
        });
        if (selectedMovie?.imdb_id && userPreference.preference) {
          try {
            await performCalculateRating({
              imdb_id: selectedMovie.imdb_id,
              preference: userPreference.preference,
            });
          } catch (error) {
            // handleRatingRollbackError(error); 
            handleCloseRating();
            errorToast("movie ranking failed, please try again.");
          }
        }
      }
    },
    [comparisonMovies.length, currentComparisonIndex, selectedMovie, token, userPreference.preference]
  );
  // close modal and rollback last decisions
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

        // ✅ skip API if already have STEPPER_VALUE or more
        if (countNum >= STEPPER_VALUE) {
          if (mounted) {
            setCurrentStep(countNum);
            setLoading(false);
          }
          return;
        }

        const resp = await getAllRatedMovies(token);
        if (!mounted) return;

        const totalRated = Array.isArray(resp?.results) ? resp.results.length : 0;
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

  // Refresh step count from API (e.g. when screen is focused after ranking)
  const refreshStepCount = useCallback(async () => {
    if (!token) return;
    try {
      const resp = await getAllRatedMovies(token);
      const totalRated = Array.isArray(resp?.results) ? resp.results.length : 0;
      setCurrentStep(totalRated);
      await AsyncStorage.setItem('currentStep', String(totalRated));
    } catch (e) {
      // ignore
    }
  }, [token]);

  const hasComparisonsAvailable = useCallback((pref: 'love' | 'like' | 'dislike') => {
    const list = prefetchedByPreferenceRef.current[pref];
    return Array.isArray(list) && list.length > 0;
  }, []);

  return {
    // State
    selectedMovie,
    setSelectedMovie,
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
    isComparisonLoading,
    openFeedbackModal,
    setFeedbackVisible,
    setComparisonVisible,
    // Actions
    handleFeedbackSubmit,
    handleSelectFirst,
    handleSelectSecond,
    handleNextComparison,
    handleSkipSetFirst,
    hasComparisonsAvailable, // Add this
    resetComparisonData,
    // Step progressbar
    isStepsModalVisible,
    setStepsModalVisible,
    currentStep,
    setCurrentStep,
    refreshStepCount,
    handleCloseRating,   // close modal by cross
  };
};
