
// import { useEffect, useState, useRef } from 'react';
// import { getUserBookmarks, toggleBookmark as toggleBookmarkApi } from '../redux/Api/ProfileApi';

// let cachedBookmarks: { [imdb_id: string]: boolean } | null = null;

// export const useBookmarks = (token: string) => {
//   const [bookmarksMap, setBookmarksMap] = useState<{ [imdb_id: string]: boolean }>({});
//   const initializedRef = useRef(false);


 //   const toggleBookmark = async (imdb_id: string) => {
//     try {
//       const updated = await toggleBookmarkApi(token, imdb_id);
//       setBookmarksMap(prev => {
//         const newMap = { ...prev, [imdb_id]: updated };
//         cachedBookmarks = newMap; // update cache
//         return newMap;
//       });
//     } catch (error:) {
//       if (error.response?.status === 409) {
//         setBookmarksMap(prev => {
//           const newMap = { ...prev, [imdb_id]: true };
//           cachedBookmarks = newMap;
//           return newMap;
//         });
 //       } else {
 //       }
//     }
//   };

//   const isBookmarked = (imdb_id: string): boolean => {
//     return bookmarksMap[imdb_id] ?? false;
//   };

//   return {
//     isBookmarked,
//     toggleBookmark,
//   };
// };


import { useEffect, useState, useRef } from "react";
import { toggleBookmark as toggleBookmarkApi } from "@redux/Api/ProfileApi";

export const useBookmarks = (token: string) => {
  const [bookmarksMap, setBookmarksMap] = useState<{ [imdb_id: string]: boolean }>({});
  const initializedRef = useRef(false);

  const toggleBookmark = async (imdb_id: string): Promise<boolean> => {
    try {
      const updatedStatus = await toggleBookmarkApi(token, imdb_id);
      // const updatedStatus = await toggleBookmarkApi(token, 'tt1645170');

      setBookmarksMap(prev => ({
        ...prev,
        [imdb_id]: updatedStatus,
      }));

      return updatedStatus;
    } catch (error) {
       return bookmarksMap[imdb_id] ?? false; // fallback
    }
  };

  const isBookmarked = (imdb_id: string): boolean => {
    return bookmarksMap[imdb_id] ?? false;
  };

  return {
    isBookmarked,
    toggleBookmark,
  };
};
