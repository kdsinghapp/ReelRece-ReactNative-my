// hooks/useFeedCardData.ts
import { BASE_IMAGE_URL } from '@config/api.config';
import { useMemo } from 'react';
 export const useFeedCardData = (movie, user) => {
  const videoUri = useMemo(() => movie?.trailer_url, [movie?.trailer_url]);
  const avatar = useMemo(() => ({ uri: `${BASE_IMAGE_URL}${user?.avatar}` }), [user?.avatar]);
  
  const posterUrl = movie?.horizontal_poster_url || movie?.cover_image_url || movie?.poster_url;
  const poster = useMemo(() => (posterUrl ? { uri: posterUrl } : null), [posterUrl]);

  return { videoUri, avatar, poster };
};
