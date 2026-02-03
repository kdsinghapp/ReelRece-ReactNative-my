// hooks/useFeedCardData.ts
import { useMemo } from 'react';
import { BASE_IMAGE_URL } from '@redux/Api/axiosInstance';
export const useFeedCardData = (movie, user) => {
  const videoUri = useMemo(() => movie?.trailer_url, [movie?.trailer_url]);
  const avatar = useMemo(() => ({ uri: `${BASE_IMAGE_URL}${user?.avatar}` }), [user?.avatar]);
  const poster = useMemo(() => ({ uri: movie?.horizontal_poster_url }), [movie?.horizontal_poster_url]);

  return { videoUri, avatar, poster };
};
