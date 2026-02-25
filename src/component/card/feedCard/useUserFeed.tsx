import { getUserFeed, USER_FEED_PAGE_SIZE } from "@redux/Api/FeedApi";
import { useState, useCallback, useRef, useEffect } from "react";

type FeedType = "home" | "profile" | "otherprofile";

interface FeedResponse {
  results?: unknown[];
  current_page?: number;
  total_pages?: number;
}

/** Get stable key for deduplication (id or movie.imdb_id) */
function getFeedItemKey(item: unknown): string | null {
  if (item == null || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  if (o.id != null) return String(o.id);
  const movie = o.movie as Record<string, unknown> | undefined;
  if (movie?.imdb_id != null) return String(movie.imdb_id);
  return null;
}

const useUserFeed = (token: string) => {
  const [feedData, setFeedData] = useState<Array<unknown>>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0 = nothing loaded yet; first fetch will request page 1
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFetchingRef = useRef(false);
  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    currentPageRef.current = currentPage;
    hasMoreRef.current = hasMore;
  }, [currentPage, hasMore]);

  const fetchFeed = useCallback(
    async (
      type: FeedType,
      username?: string,
      reset: boolean = false,
      silent: boolean = false
    ) => {
      if (!token) return;
      if (isFetchingRef.current) return;
      if (!reset && !hasMoreRef.current) return;

      // First load (currentPage 0) or reset: fetch page 1; otherwise fetch next page
      const pageToFetch = reset || currentPageRef.current === 0 ? 1 : currentPageRef.current + 1;
      const isInitialLoad = pageToFetch === 1 && currentPageRef.current === 0;
      isFetchingRef.current = true;

      if (!silent) {
        if (reset) {
          setLoading(true);
          setRefreshing(true);
          setHasMore(true);
          setFeedData([]);
        } else if (isInitialLoad) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
      } else if (reset) {
        setHasMore(true);
        setFeedData([]);
      }

      try {
        const res: FeedResponse = await getUserFeed(
          token,
          type,
          username,
          pageToFetch,
          USER_FEED_PAGE_SIZE
        );
        const safeResults = Array.isArray(res?.results) ? res.results : [];

        if (reset || isInitialLoad) {
          setFeedData(safeResults);
        } else if (safeResults.length > 0) {
          setFeedData((prev) => {
            const existingKeys = new Set(
              prev.map(getFeedItemKey).filter(Boolean) as string[]
            );
            const newItems = safeResults.filter((item) => {
              const key = getFeedItemKey(item);
              return key != null && !existingKeys.has(key);
            });
            if (newItems.length === 0) return prev;
            return [...prev, ...newItems];
          });
        }

        const currentPageNum = Number(res?.current_page ?? pageToFetch);
        const totalPagesNum = Number(res?.total_pages ?? 1);
        const hasMoreData =
          safeResults.length > 0 && currentPageNum < totalPagesNum;

        setCurrentPage(currentPageNum);
        setTotalPages(totalPagesNum);
        setHasMore(hasMoreData);
      } catch {
        setHasMore(false);
      } finally {
        if (!silent) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
        isFetchingRef.current = false;
      }
    },
    [token]
  );

  return {
    feedData,
    fetchFeed,
    loadingFeed: loading,
    loadingMore,
    refreshing,
    hasMore,
    currentPage,
    totalPages,
  };
};

export default useUserFeed;
