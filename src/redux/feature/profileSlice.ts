import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@redux/store';
import { getUserFeed, USER_FEED_PAGE_SIZE } from '@redux/Api/FeedApi';
import { getUserBookmarks } from '@redux/Api/ProfileApi';
import { getHistoryApi } from '@redux/Api/ProfileApi';
import { getRatedMovies } from '@redux/Api/movieApi';
import { getSuggestedFriends } from '@redux/Api/followService';

function getFeedItemKey(item: unknown): string | null {
  if (item == null || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  if (o.id != null) return String(o.id);
  const movie = o.movie as Record<string, unknown> | undefined;
  if (movie?.imdb_id != null) return String(movie.imdb_id);
  return null;
}

export interface ProfileState {
  profileFeedData: unknown[];
  profileFeedPage: number;
  profileFeedHasMore: boolean;
  savedMovies: unknown[];
  historyMovies: unknown[];
  rankingMovie: unknown[];
  suggestedFriends: unknown[];
  loadingFeed: boolean;
  loadingMoreFeed: boolean;
  loadingBookmarks: boolean;
  loadingHistory: boolean;
  loadingRated: boolean;
  loadingSuggested: boolean;
}

const initialState: ProfileState = {
  profileFeedData: [],
  profileFeedPage: 0,
  profileFeedHasMore: true,
  savedMovies: [],
  historyMovies: [],
  rankingMovie: [],
  suggestedFriends: [],
  loadingFeed: false,
  loadingMoreFeed: false,
  loadingBookmarks: false,
  loadingHistory: false,
  loadingRated: false,
  loadingSuggested: false,
};

export const fetchProfileFeed = createAsyncThunk<
  { results: unknown[]; current_page: number; total_pages: number; reset: boolean },
  { username?: string; reset?: boolean; page?: number },
  { state: RootState; rejectValue: string }
>(
  'profile/fetchFeed',
  async ({ username, reset = false, page }, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    const state = getState().profile;
    if (!token) return rejectWithValue('No token');
    const pageToFetch =
      reset ? 1 : (page ?? (state.profileFeedPage === 0 ? 1 : state.profileFeedPage + 1));
    try {
      const res = await getUserFeed(token, 'profile', username, pageToFetch, USER_FEED_PAGE_SIZE);
      const results = Array.isArray(res?.results) ? res.results : [];
      const current_page = Number(res?.current_page ?? pageToFetch);
      const total_pages = Number(res?.total_pages ?? 1);
      return { results, current_page, total_pages, reset };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch profile feed');
    }
  }
);

export const fetchProfileBookmarks = createAsyncThunk<unknown[], void, { state: RootState; rejectValue: string }>(
  'profile/fetchBookmarks',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await getUserBookmarks(token);
      return res?.results ?? [];
    } catch {
      return rejectWithValue('Failed to fetch bookmarks');
    }
  }
);

export const fetchProfileHistory = createAsyncThunk<
  unknown[],
  string | undefined,
  { state: RootState; rejectValue: string }
>(
  'profile/fetchHistory',
  async (username, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await getHistoryApi(token, username);
      return res?.results ?? [];
    } catch {
      return rejectWithValue('Failed to fetch history');
    }
  }
);

export const fetchProfileRatedMovies = createAsyncThunk<unknown[], void, { state: RootState; rejectValue: string }>(
  'profile/fetchRatedMovies',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await getRatedMovies(token);
      return res?.results ?? [];
    } catch {
      return rejectWithValue('Failed to fetch rated movies');
    }
  }
);

export const fetchProfileSuggestedFriends = createAsyncThunk<unknown[], void, { state: RootState; rejectValue: string }>(
  'profile/fetchSuggestedFriends',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const data = await getSuggestedFriends(token);
      const results = (data as { results?: unknown[] })?.results;
      return Array.isArray(results) ? results : [];
    } catch {
      return [];
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateSuggestedFollow(state, action: { payload: { username: string; isFollowing: boolean } }) {
      const { username, isFollowing } = action.payload;
      state.suggestedFriends = state.suggestedFriends.map((f: unknown) => {
        const x = f as { username?: string; is_following?: boolean };
        return x.username === username ? { ...x, is_following: isFollowing } : x;
      });
    },
    resetProfileFeed(state) {
      state.profileFeedData = [];
      state.profileFeedPage = 1;
      state.profileFeedHasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileFeed.pending, (state, action) => {
        const reset = !!action.meta.arg?.reset;
        if (reset) state.loadingFeed = true;
        else state.loadingMoreFeed = true;
      })
      .addCase(fetchProfileFeed.fulfilled, (state, action) => {
        state.loadingFeed = false;
        state.loadingMoreFeed = false;
        const { results, current_page, total_pages, reset } = action.payload;
        if (reset) {
          state.profileFeedData = results ?? [];
          state.profileFeedPage = current_page ?? 1;
        } else if (Array.isArray(results) && results.length > 0) {
          const existingKeys = new Set(state.profileFeedData.map(getFeedItemKey).filter(Boolean) as string[]);
          const newItems = results.filter((item: unknown) => {
            const key = getFeedItemKey(item);
            return key != null && !existingKeys.has(key);
          });
          if (newItems.length > 0) state.profileFeedData = [...state.profileFeedData, ...newItems];
          state.profileFeedPage = current_page ?? state.profileFeedPage;
        }
        state.profileFeedHasMore =
          (results?.length ?? 0) > 0 && (current_page ?? 1) < (total_pages ?? 1);
      })
      .addCase(fetchProfileFeed.rejected, (state) => {
        state.loadingFeed = false;
        state.loadingMoreFeed = false;
      });

    builder
      .addCase(fetchProfileBookmarks.pending, state => {
        state.loadingBookmarks = true;
      })
      .addCase(fetchProfileBookmarks.fulfilled, (state, action) => {
        state.loadingBookmarks = false;
        state.savedMovies = action.payload ?? [];
      })
      .addCase(fetchProfileBookmarks.rejected, state => {
        state.loadingBookmarks = false;
      });

    builder
      .addCase(fetchProfileHistory.pending, state => {
        state.loadingHistory = true;
      })
      .addCase(fetchProfileHistory.fulfilled, (state, action) => {
        state.loadingHistory = false;
        state.historyMovies = action.payload ?? [];
      })
      .addCase(fetchProfileHistory.rejected, state => {
        state.loadingHistory = false;
      });

    builder
      .addCase(fetchProfileRatedMovies.pending, state => {
        state.loadingRated = true;
      })
      .addCase(fetchProfileRatedMovies.fulfilled, (state, action) => {
        state.loadingRated = false;
        state.rankingMovie = action.payload ?? [];
      })
      .addCase(fetchProfileRatedMovies.rejected, state => {
        state.loadingRated = false;
      });

    builder
      .addCase(fetchProfileSuggestedFriends.fulfilled, (state, action) => {
        state.loadingSuggested = false;
        state.suggestedFriends = action.payload ?? [];
      })
      .addCase(fetchProfileSuggestedFriends.pending, state => {
        state.loadingSuggested = true;
      })
      .addCase(fetchProfileSuggestedFriends.rejected, state => {
        state.loadingSuggested = false;
      });
  },
});

export const { updateSuggestedFollow, resetProfileFeed } = profileSlice.actions;
export default profileSlice.reducer;
