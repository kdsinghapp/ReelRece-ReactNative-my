import { useState, useRef } from "react";
import { toggleBookmark as toggleBookmarkApi } from "@redux/Api/ProfileApi";

export const useBookmarks = (token: string) => {
  const [bookmarksMap, setBookmarksMap] = useState<{ [imdb_id: string]: boolean }>({});
  
  const toggleBookmark = async (imdb_id: string): Promise<boolean> => {
    try {
      const updatedStatus = await toggleBookmarkApi(token, imdb_id);
  
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
