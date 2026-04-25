import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FeedbackModal, StepProgressModal } from '@components/index';
import type { MovieForComparison } from '@components/modal/feedbackModal/FeedbackModal';
import { setModalClosed } from '@redux/feature/modalSlice/modalSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STEPPER_VALUE } from './useCompareComponent';

type RankMovie = {
  imdb_id?: string;
  title?: string;
  release_year?: string | number;
  cover_image_url?: string;
  rating?: string | number;
};

const CompareModals = ({
  token,
  useCompareHook,
  onModalClose,
  onReviewAdded,
  isOnboarding = false,
}: {
  token: string;
  useCompareHook: ReturnType<typeof import('./useCompareComponent').useCompareComponent>;
  onModalClose?: () => void;
  onReviewAdded?: (imdb_id: string) => void;
  isOnboarding?: boolean;
}) => {
  const {
    selectedMovie,
    setSelectedMovie,
    secondMovieData,
    isFeedbackVisible,
    isComparisonVisible,
    isComparisonLoading,
    handleFeedbackSubmit,
    handleSelectFirst,
    handleSelectSecond,
    handleSkipSetFirst,
    setFeedbackVisible,
    setComparisonVisible,
    comparisonMovies,
    setUserPreference,
    resetComparisonData,
    userPreference,
    currentComparisonIndex,
    handleNextComparison,
    isStepsModalVisible,
    currentStep,
    setCurrentStep,
    setStepsModalVisible,
    handleCloseRating,
    hasComparisonsAvailable, // Add this
    isOnboardingFlow,
    onModalCloseCallback,
    onReviewAddedCallback,
  } = useCompareHook;
  const dispatch = useDispatch();
  useEffect(() => {
    if (isStepsModalVisible) {
      dispatch(setModalClosed(true));
    } else {
      dispatch(setModalClosed(false));
    }
  }, [isStepsModalVisible, dispatch]);

  const wasAnyModalOpen = useRef(false);

  useEffect(() => {
    const anyModalOpen = isFeedbackVisible || isComparisonVisible || isStepsModalVisible;

    if (anyModalOpen) {
      wasAnyModalOpen.current = true;
    } else if (wasAnyModalOpen.current && !anyModalOpen) {
      wasAnyModalOpen.current = false;
      onModalClose?.();
      onModalCloseCallback?.();
    }
  }, [isFeedbackVisible, isComparisonVisible, isStepsModalVisible, onModalClose, onModalCloseCallback]);
  const [fetchStep1, setfetchStep] = useState<string | object>();

  const getCurrentStep = async () => {
    try {
      const value = await AsyncStorage.getItem('currentStep');
      if (value !== null) {
        return Number(value);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (isStepsModalVisible) return;
    const fetchStep = async () => {
      const step = await getCurrentStep();
      setfetchStep(step as unknown as string | object);
      if (typeof step !== 'number') return;
      const atStepPopup = currentStep === 1 || currentStep === STEPPER_VALUE;
      if (atStepPopup && step !== currentStep) return;
      setCurrentStep(step);
    };
    fetchStep();
  }, [isFeedbackVisible, isComparisonVisible, currentStep, setCurrentStep]);

  const isAnyModalVisible = isFeedbackVisible || isComparisonVisible;
  const movie = selectedMovie as RankMovie | undefined;
  const secondMovie = secondMovieData as RankMovie | undefined;
  const isComparisonStep = isComparisonVisible && !!movie && !!secondMovie;
  const step = isComparisonVisible ? 'comparison' : isFeedbackVisible ? 'feedback' : 'comparison';

  return (
    <>
      {isAnyModalVisible && (
        <FeedbackModal
          visible={isAnyModalVisible}
          step={step}
          isOnboarding={isOnboarding || isOnboardingFlow}
          onClose={() => {
            if (isComparisonStep) {
              handleCloseRating();
              /*
              if (currentStep === 1 || currentStep === STEPPER_VALUE) {
                setStepsModalVisible(true);
              }
              */
              resetComparisonData();
              setSelectedMovie(undefined as never);
            } else {
              setFeedbackVisible(false);
              resetComparisonData();
              onModalClose?.();
              onModalCloseCallback?.();
            }
          }}
          setFeedbackVisible={setFeedbackVisible}
          token={token}
          selectedMovie={movie}
          imdb_id={movie?.imdb_id ?? ''}
          movieTitle={movie?.title ?? ''}
          movieYear={movie?.release_year?.toString() ?? ''}
          poster={{ uri: movie?.cover_image_url }}
          isLoading={isComparisonLoading}
          onSubmit={(preference) => {
            setUserPreference({ preference });
            handleFeedbackSubmit(preference);
          }}
          firstMovie={
            isComparisonStep && movie
              ? {
                title: movie?.title ?? '',
                year: String(movie?.release_year ?? ''),
                poster: { uri: movie?.cover_image_url ?? '' },
                rating: movie?.rating?.toString(),
                imdb_id: movie?.imdb_id,
              }
              : undefined
          }
          secondMovie={
            isComparisonStep && secondMovie
              ? {
                title: secondMovie?.title ?? '',
                year: String(secondMovie?.release_year ?? ''),
                poster: { uri: secondMovie?.cover_image_url ?? '' },
                rating: secondMovie?.rating?.toString(),
                imdb_id: secondMovie?.imdb_id,
              }
              : undefined
          }
          onReviewAdded={(imdb_id) => {
            onReviewAdded?.(imdb_id);
            onReviewAddedCallback?.(imdb_id);
          }}
          onSelectFirst={handleSelectFirst}
          onSelectSecond={handleSelectSecond}
          onSkipSelect={handleSkipSetFirst}
          handleCloseRating={() => {
            handleCloseRating();
            /*
            if (currentStep === 1 || currentStep === STEPPER_VALUE) {
              setStepsModalVisible(true);
            }
            */
            resetComparisonData();
            setSelectedMovie(undefined as never);
          }}
          comparisonMovies={Array.isArray(comparisonMovies) ? (comparisonMovies as MovieForComparison[]) : []}
          hasComparisonsAvailable={hasComparisonsAvailable}
          initialPreference={userPreference.preference}
        />
      )}
      {/* 
      {(currentStep === 1 || currentStep === STEPPER_VALUE) && (
        <StepProgressModal
          visible={isStepsModalVisible}
          onClose={() => {
            setStepsModalVisible(false);
            onModalClose?.();
          }}
          progress={currentStep / STEPPER_VALUE}
          navigationProps={() => { }}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setStepsModal={setStepsModalVisible}
          selectedMovieId={movie?.imdb_id}
          setMoviereommNav={() => { }}
          totalSteps={STEPPER_VALUE}
        />
      )}
      */}


    </>
  );
};

// export default ;
export default React.memo(CompareModals);
