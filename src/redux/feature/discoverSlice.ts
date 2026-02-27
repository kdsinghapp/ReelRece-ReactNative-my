import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@redux/store';
import { Trending_without_Filter } from '@redux/Api/movieApi';

export interface DiscoverState {
  movies: unknown[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  lastFilterKey: string;
}

const initialState: DiscoverState = {
  movies: [],
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  loading: false,
  loadingMore: false,
  refreshing: false,
  lastFilterKey: '',
};

type FetchDiscoverArg = { page?: number; reset?: boolean; filterKey: string; url: string };

export const fetchDiscoverMovies = createAsyncThunk<
  { results: unknown[]; current_page: number; total_pages: number },
  FetchDiscoverArg,
  { state: RootState; rejectValue: string }
>(
  'discover/fetchMovies',
  async ({ page = 1, reset = false, url }, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const result = await Trending_without_Filter({ token, url });
      const results = Array.isArray(result?.results) ? result.results : [];
      const current_page = Number(result?.current_page ?? page);
      const total_pages = Number(result?.total_pages ?? 1);
      return { results, current_page, total_pages };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch discover';
      return rejectWithValue(msg);
    }
  }
);

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {
    resetDiscover(state) {
      state.movies = [];
      state.currentPage = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscoverMovies.pending, (state, action) => {
        const { reset } = action.meta.arg;
        if (reset) {
          state.loading = true;
          state.refreshing = true;
          state.hasMore = true;
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(fetchDiscoverMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;
        const { results, current_page, total_pages } = action.payload;
        const { reset, filterKey } = action.meta.arg;
        state.lastFilterKey = filterKey;

        if (reset) {
          state.movies = results ?? [];
          state.currentPage = current_page ?? 1;
        } else if (Array.isArray(results) && results.length > 0) {
          const existingIds = new Set(
            state.movies.map((m: { imdb_id?: string }) => m?.imdb_id).filter(Boolean) as string[]
          );
          const newItems = (results as { imdb_id?: string }[]).filter(
            m => m?.imdb_id && !existingIds.has(m.imdb_id)
          );
          if (newItems.length > 0) state.movies = [...state.movies, ...newItems];
          state.currentPage = current_page ?? state.currentPage;
        }
        state.totalPages = total_pages ?? 1;
        state.hasMore = (results?.length ?? 0) > 0 && (current_page ?? 1) < (total_pages ?? 1);
      })
      .addCase(fetchDiscoverMovies.rejected, (state) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;
        state.hasMore = false;
      });
  },
});

export const { resetDiscover } = discoverSlice.actions;
export default discoverSlice.reducer;
