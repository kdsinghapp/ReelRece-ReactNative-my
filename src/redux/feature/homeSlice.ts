import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@redux/store';
import { getUserFeed, USER_FEED_PAGE_SIZE } from '@redux/Api/FeedApi';
import { getRecentActiveUsers } from '@redux/Api/ProfileApi';
import { getSuggestedFriends } from '@redux/Api/followService';
import { homeDiscoverApi } from '@redux/Api/movieApi';
import { User } from '@types/api.types';

/** Feed item key for deduplication */
function getFeedItemKey(item: unknown): string | null {
  if (item == null || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  if (o.id != null) return String(o.id);
  const movie = o.movie as Record<string, unknown> | undefined;
  if (movie?.imdb_id != null) return String(movie.imdb_id);
  return null;
}

export interface HomeState {
  feedData: unknown[];
  feedPage: number;
  feedTotalPages: number;
  feedHasMore: boolean;
  loadingFeed: boolean;
  loadingMoreFeed: boolean;
  recentUsers: User[];
  suggestedFriends: (User & { is_following?: boolean })[];
  trendingData: unknown[];
  recommendData: unknown[];
  bookmarkData: unknown[];
  loadingRecentUsers: boolean;
  loadingTrending: boolean;
  loadingRecs: boolean;
  loadingBookmark: boolean;
  trendingError: boolean;
  recommendError: boolean;
}

const initialState: HomeState = {
  feedData: [],
  feedPage: 0, // Start at 0: indicates no page loaded yet; first fetch should be page 1
  feedTotalPages: 1,
  feedHasMore: true,
  loadingFeed: false,
  loadingMoreFeed: false,
  recentUsers: [],
  suggestedFriends: [],
  trendingData: [],
  recommendData: [],
  bookmarkData: [],
  loadingRecentUsers: true,
  loadingTrending: true,
  loadingRecs: true,
  loadingBookmark: true,
  trendingError: false,
  recommendError: false,
};

type FetchHomeFeedArg = { reset?: boolean; silent?: boolean };
type FetchSilentArg = { silent?: boolean };

export const fetchHomeFeed = createAsyncThunk<
  { results: unknown[]; current_page: number; total_pages: number; reset: boolean },
  FetchHomeFeedArg,
  { state: RootState; rejectValue: string }
>(
  'home/fetchFeed',
  async ({ reset = false, silent = false }, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    const state = getState().home;
    const pageToFetch = reset ? 1 : state.feedPage + 1;
    try {
      const res = await getUserFeed(token, 'home', undefined, pageToFetch, USER_FEED_PAGE_SIZE);
      const results = Array.isArray(res?.results) ? res.results : [];
      const current_page = Number(res?.current_page ?? pageToFetch);
      const total_pages = Number(res?.total_pages ?? 1);
      return { results, current_page, total_pages, reset };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch feed';
      return rejectWithValue(msg);
    }
  }
);

export const fetchHomeRecentUsers = createAsyncThunk<
  User[],
  FetchSilentArg | undefined,
  { state: RootState; rejectValue: string }
>(
  'home/fetchRecentUsers',
  async (_opts, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const response = await getRecentActiveUsers(token);
      const list = response?.data?.results ?? [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch recent users';
      return rejectWithValue(msg);
    }
  }
);

export const fetchHomeSuggestedFriends = createAsyncThunk<
  (User & { is_following?: boolean })[],
  FetchSilentArg | undefined,
  { state: RootState; rejectValue: string }
>(
  'home/fetchSuggestedFriends',
  async (_opts, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const data = await getSuggestedFriends(token);
      const results = (data as { results?: (User & { is_following?: boolean })[] })?.results;
      return Array.isArray(results) ? results : [];
    } catch {
      return [];
    }
  }
);

export const fetchHomeTrending = createAsyncThunk<
  unknown[],
  FetchSilentArg | undefined,
  { state: RootState; rejectValue: string }
>(
  'home/fetchTrending',
  async (_opts, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await homeDiscoverApi(token, '/trending?country=US');
      const list = res?.results;
      return Array.isArray(list) ? list : [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch trending';
      return rejectWithValue(msg);
    }
  }
);

export const fetchHomeRecommend = createAsyncThunk<
  unknown[],
  FetchSilentArg | undefined,
  { state: RootState; rejectValue: string }
>(
  'home/fetchRecommend',
  async (_opts, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await homeDiscoverApi(token, '/recommend-movies?sort_by=rec_score');
      const list = res?.results;
      return Array.isArray(list) ? list : [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch recommend';
      return rejectWithValue(msg);
    }
  }
);

export const fetchHomeBookmarks = createAsyncThunk<
  unknown[],
  FetchSilentArg | undefined,
  { state: RootState; rejectValue: string }
>(
  'home/fetchBookmarks',
  async (_opts, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await homeDiscoverApi(token, '/bookmarks?country=US');
      const list = res?.results;
      return Array.isArray(list) ? list : [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch bookmarks';
      return rejectWithValue(msg);
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    resetHomeFeedPagination(state) {
      state.feedData = [];
      state.feedPage = 0; // Reset to 0: next fetch should be page 1
      state.feedHasMore = true;
    },
  },
  extraReducers: (builder) => {
    // Feed
    builder
      .addCase(fetchHomeFeed.pending, (state, action) => {
        const silent = !!action.meta.arg?.silent;
        const reset = !!action.meta.arg?.reset;
        if (!silent) {
          if (reset) state.loadingFeed = true;
          else state.loadingMoreFeed = true;
        }
      })
      .addCase(fetchHomeFeed.fulfilled, (state, action) => {
        state.loadingFeed = false;
        state.loadingMoreFeed = false;
        const { results, current_page, total_pages, reset } = action.payload;
        if (reset) {
          state.feedData = results ?? [];
          state.feedPage = current_page ?? 1;
        } else if (Array.isArray(results) && results.length > 0) {
          const existingKeys = new Set(state.feedData.map(getFeedItemKey).filter(Boolean) as string[]);
          const newItems = results.filter((item: unknown) => {
            const key = getFeedItemKey(item);
            return key != null && !existingKeys.has(key);
          });
          if (newItems.length > 0) state.feedData = [...state.feedData, ...newItems];
          state.feedPage = current_page ?? state.feedPage;
        }
        state.feedTotalPages = total_pages ?? 1;
        // Fix: Check if more pages exist, regardless of current page having results
        state.feedHasMore = (current_page ?? 1) < (total_pages ?? 1);
      })
      .addCase(fetchHomeFeed.rejected, (state) => {
        state.loadingFeed = false;
        state.loadingMoreFeed = false;
        state.feedHasMore = false;
      });

    // Recent users
    builder
      .addCase(fetchHomeRecentUsers.pending, (state, action) => {
        if (!action.meta.arg?.silent) state.loadingRecentUsers = true;
      })
      .addCase(fetchHomeRecentUsers.fulfilled, (state, action) => {
        state.loadingRecentUsers = false;
        state.recentUsers = action.payload ?? [];
      })
      .addCase(fetchHomeRecentUsers.rejected, (state) => {
        state.loadingRecentUsers = false;
      });

    // Suggested friends (no loading flag used on home; keep for consistency)
    builder
      .addCase(fetchHomeSuggestedFriends.fulfilled, (state, action) => {
        state.suggestedFriends = action.payload ?? [];
      });

    // Trending
    builder
      .addCase(fetchHomeTrending.pending, (state, action) => {
        if (!action.meta.arg?.silent) state.loadingTrending = true;
        state.trendingError = false;
      })
      .addCase(fetchHomeTrending.fulfilled, (state, action) => {
        state.loadingTrending = false;
        state.trendingData = action.payload ?? [];
        state.trendingError = false;
      })
      .addCase(fetchHomeTrending.rejected, (state) => {
        state.loadingTrending = false;
        state.trendingError = true;
      });

    // Recommend
    builder
      .addCase(fetchHomeRecommend.pending, (state, action) => {
        if (!action.meta.arg?.silent) state.loadingRecs = true;
        state.recommendError = false;
      })
      .addCase(fetchHomeRecommend.fulfilled, (state, action) => {
        state.loadingRecs = false;
        state.recommendData = action.payload ?? [];
        state.recommendError = false;
      })
      .addCase(fetchHomeRecommend.rejected, (state) => {
        state.loadingRecs = false;
        state.recommendData = [];
        state.recommendError = true;
      });

    // Bookmarks
    builder
      .addCase(fetchHomeBookmarks.pending, (state, action) => {
        if (!action.meta.arg?.silent) state.loadingBookmark = true;
      })
      .addCase(fetchHomeBookmarks.fulfilled, (state, action) => {
        state.loadingBookmark = false;
        state.bookmarkData = action.payload ?? [];
      })
      .addCase(fetchHomeBookmarks.rejected, (state) => {
        state.loadingBookmark = false;
      });
  },
});

export const { resetHomeFeedPagination } = homeSlice.actions;
export default homeSlice.reducer;
