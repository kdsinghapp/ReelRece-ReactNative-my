import React, { useEffect } from "react";
import isEqual from "lodash.isequal";
import FeedCard from "./FeedCard";


  const MemoFeedCard = React.memo(FeedCard, (prev, next) => {
    // useEffect(()=> {
   
    if (prev.imdb_id !== next.imdb_id) return false;
   
    if (prev.videoUri !== next.videoUri) return false;


  // objects comparison (poster, avatar)
    if (!isEqual(prev.poster, next.poster)) return false;
    if (!isEqual(prev.avatar, next.avatar)) return false;

    // playback / visibility
    if (prev.shouldPlay !== next.shouldPlay) return false;
    if (prev.isVisible !== next.isVisible) return false;
    // if (prev.isPaused !== next.isPaused) return false;
    if (prev.isMuted !== next.isMuted) return false;
    if (prev.shouldAutoPlay !== next.shouldAutoPlay) return false;
  // if (prev.videoIndex !== next.videoIndex) return false; 
  if (prev.videoIndex !== next.videoIndex) return false; 

    return true;
  });

  export default MemoFeedCard;



// import React from "react";
// import FeedCard from "./FeedCard";

// const MemoFeedCard = React.memo(FeedCard, (prev, next) => {
 //   return (
//     prev.imdb_id === next.imdb_id &&
//     prev.title === next.title &&
//     prev.comment === next.comment &&
//     prev.release_year === next.release_year &&
//     prev.ranked === next.ranked &&
//     prev.avatar === next.avatar &&
//     prev.poster === next.poster &&
//     prev.videoUri === next.videoUri &&
//     prev.shouldPlay === next.shouldPlay &&
//     prev.isVisible === next.isVisible &&
//     prev.isPaused === next.isPaused &&
//     prev.isMuted === next.isMuted &&
//     prev.shouldAutoPlay === next.shouldAutoPlay &&
//     prev.videoIndex === next.videoIndex &&
//     prev.token === next.token &&
//     prev.onRankPress === next.onRankPress // make sure parent memoizes this
//   );
// });

// export default MemoFeedCard;
