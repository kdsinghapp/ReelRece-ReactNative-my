import React, { useEffect, useRef } from 'react';
 import { useDispatch } from 'react-redux';
 import { ComparisonModal, FeedbackModal, StepProgressModal } from '@components/index';
import { setModalClosed } from '@redux/feature/modalSlice/modalSlice';
  

const CompareModals = ({
  token,
  useCompareHook,
  onModalClose,
}: {
  token: string;
  useCompareHook: ReturnType<typeof import('./useCompareComponent').useCompareComponent>;
  onModalClose?: () => void;
}) => {
  const {
    selectedMovie,
    secondMovieData,
    isFeedbackVisible,
    isComparisonVisible,
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
    // step progressbar
    isStepsModalVisible,      //  step modal visibility
    currentStep,              //  current step count
    setCurrentStep,           //  set step count
    setStepsModalVisible,     //  set step modal visibility
    handleCloseRating,

  } = useCompareHook;
  const dispatch = useDispatch();
  useEffect(() => {
    if (isStepsModalVisible) {
      dispatch(setModalClosed(true));
    } else {
      dispatch(setModalClosed(false));
    }
  }, [isStepsModalVisible, dispatch]);

  // Track if any modal was ever open
  const wasAnyModalOpen = useRef(false);
  
  // Call onModalClose when all modals are closed (only if they were previously open)
  useEffect(() => {
    const anyModalOpen = isFeedbackVisible || isComparisonVisible || isStepsModalVisible;
    
    if (anyModalOpen) {
      wasAnyModalOpen.current = true;
    } else if (wasAnyModalOpen.current && !anyModalOpen) {
      // All modals closed after being open - call onModalClose
      wasAnyModalOpen.current = false;
      onModalClose?.();
    }
  }, [isFeedbackVisible, isComparisonVisible, isStepsModalVisible]);


  return (
    <>
      {isFeedbackVisible && (
        <FeedbackModal
          visible={isFeedbackVisible}
          onClose={() => {
            setFeedbackVisible(false);
            resetComparisonData();
            onModalClose?.(); // Call parent callback when modal closes
          }}
          setFeedbackVisible={setFeedbackVisible}
          token={token}
          selectedMovie={selectedMovie}
          imdb_id={selectedMovie?.imdb_id}
          movieTitle={selectedMovie?.title}
          movieYear={selectedMovie?.release_year?.toString()}
          poster={{ uri: selectedMovie?.cover_image_url }}

          // submitPreference={handleFeedbackSubmit}
          onOpenSecondModal={() => {
            // Alert.alert(
            //   "Select a movie",)
            setFeedbackVisible(false)
            setFeedbackVisible(false);
            setComparisonVisible(true);

          }}
          onSubmit={(preference) => {
             setUserPreference({ preference }); // Save it in hook state
            handleFeedbackSubmit(preference); // additional
          }}
        />
      )}
       {isComparisonVisible && selectedMovie && secondMovieData && (
        <ComparisonModal
          visible={isComparisonVisible}
          onClose={() => {
            setComparisonVisible(false);
            setStepsModalVisible(true);
            resetComparisonData();
            setSelectedMovie(null);
            // SecondMovieData(null);
          }}
          setComparisonVisible={setComparisonVisible}
          onSkip={() => setComparisonVisible(false)}
          firstMovie={{
            title: selectedMovie?.title,
            year: selectedMovie?.release_year,
            poster: { uri: selectedMovie?.cover_image_url },
            rating: selectedMovie.rating?.toString(),
            imdb_id: selectedMovie.imdb_id,
          }}
          secondMovie={{
            title: secondMovieData?.title,
            year: secondMovieData?.release_year,
            poster: { uri: secondMovieData?.cover_image_url },
            rating: secondMovieData?.rating?.toString(),
            imdb_id: secondMovieData?.imdb_id,
          }}
          onSelectFirst={handleSelectFirst}
          onSelectSecond={handleSelectSecond}
          comparisonMovies={comparisonMovies}
          onSkipSelect={handleSkipSetFirst}
          handleCloseRating={handleCloseRating}  // close modal by close
        // currentComparisonIndex={currentComparisonIndex}
        />
      )}
      {/* {currentStep > 6 ?
        null : */}
        <StepProgressModal
          visible={isStepsModalVisible}
          onClose={() => {
            setStepsModalVisible(false);
            onModalClose?.(); // Call parent callback when modal closes
          }}
          progress={currentStep / comparisonMovies.length}
          navigationProps={() => { }}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setStepsModal={setStepsModalVisible}
          selectedMovieId={selectedMovie?.imdb_id}
          setMoviereommNav={() => { }}
          totalSteps={5}
        />
      {/* } */}

    </>
  );
};

// export default ;
export default React.memo(CompareModals);

