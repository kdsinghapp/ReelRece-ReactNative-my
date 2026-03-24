import React from "react";
import isEqual from "lodash.isequal";
import FeedCardHome from "./FeedCardHome";

  const MemoFeedCardHome = React.memo(FeedCardHome, (prev, next) => {
    if (prev.imdb_id !== next.imdb_id) return false;
    if (prev.videoUri !== next.videoUri) return false;
    if (!isEqual(prev.poster, next.poster)) return false;
    if (!isEqual(prev.avatar, next.avatar)) return false;
    if (prev.shouldPlay !== next.shouldPlay) return false;
    if (prev.isVisible !== next.isVisible) return false;
    if (prev.isMuted !== next.isMuted) return false;
    if (prev.shouldAutoPlay !== next.shouldAutoPlay) return false;
    if (prev.videoIndex !== next.videoIndex) return false;
    if (prev.onBookmarkSuccess !== next.onBookmarkSuccess) return false;
    if (prev.suggested !== next.suggested) return false;
    if (prev.onFollow !== next.onFollow) return false;
    if (prev.isFollowing !== next.isFollowing) return false;
    if (!isEqual(prev.feedData, next.feedData)) return false;
    return true;
  });

  export default MemoFeedCardHome;