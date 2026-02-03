import { useState } from 'react';

/**
 * Custom hook for managing all modal states in MovieDetailScreen
 */
export const useModalManager = () => {
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [watchNow, setWatchNow] = useState(false);
  const [isFeedbackModal, setIsFeedbackModal] = useState(false);
  const [modalMovieId, setModalMovieId] = useState<string | null>(null);

  const openMoreModal = (imdb_id: string) => {
    setModalMovieId(imdb_id);
  };

  const closeAllModals = () => {
    setShowFirstModal(false);
    setShowSecondModal(false);
    setWatchNow(false);
    setIsFeedbackModal(false);
  };

  return {
    showFirstModal,
    setShowFirstModal,
    showSecondModal,
    setShowSecondModal,
    watchNow,
    setWatchNow,
    isFeedbackModal,
    setIsFeedbackModal,
    modalMovieId,
    openMoreModal,
    closeAllModals
  };
};
