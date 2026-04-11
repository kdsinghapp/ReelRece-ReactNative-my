import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAllRatedMovies, getRankingSuggestionMovie } from '@redux/Api/movieApi';
import { Movie } from '@types/api.types';
import { RootState } from '@redux/store';

export interface RankingState {
  ratedMovies: Movie[];
  ratedPage: number;
  ratedHasMore: boolean;
  suggestionMovies: Movie[];
  suggestionPage: number;
  suggestionHasMore: boolean;
  loadingRated: boolean;
  loadingSuggestion: boolean;
  error: string | null;
}

const initialState: RankingState = {
  ratedMovies: [],
  ratedPage: 1,
  ratedHasMore: true,
  suggestionMovies: [],
  suggestionPage: 1,
  suggestionHasMore: true,
  loadingRated: false,
  loadingSuggestion: false,
  error: null,
};

/** Fetch ranked movies; can be prefetched from Welcome for smooth Ranking tab load. */
export const fetchRankingRatedMovies = createAsyncThunk<
  { results: Movie[]; page: number; totalPages: number },
  { page?: number; silent?: boolean } | undefined,
  { state: RootState; rejectValue: string }
>(
  'ranking/fetchRatedMovies',
  async (opts, { getState, rejectWithValue }) => {
    const page = opts?.page || 1;
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await getAllRatedMovies(token, page);
      const results = Array.isArray(res?.results) ? res.results : [];
      const totalPages = Number(res?.total_pages ?? 1);
      return { results, page, totalPages };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch rated movies';
      return rejectWithValue(msg);
    }
  }
);

/** Fetch suggestion movies for ranking (page default 1). */
export const fetchRankingSuggestionMovies = createAsyncThunk<
  { results: Movie[]; page: number; totalPages: number },
  number | undefined,
  { state: RootState; rejectValue: string }
>(
  'ranking/fetchSuggestionMovies',
  async (page = 1, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await getRankingSuggestionMovie(token, page);
      const results = Array.isArray(res?.results) ? res.results : [];
      const totalPages = Number(res?.total_pages ?? 0);
      return { results, page, totalPages };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch suggestion movies';
      return rejectWithValue(msg);
    }
  }
);

const rankingSlice = createSlice({
  name: 'ranking',
  initialState,
  reducers: {
    resetSuggestionPagination(state) {
      state.suggestionMovies = [];
      state.suggestionPage = 1;
      state.suggestionHasMore = true;
    },
    resetRatedPagination(state) {
      state.ratedMovies = [];
      state.ratedPage = 1;
      state.ratedHasMore = true;
    },
    clearRankingError(state) {
      state.error = null;
    },
    reorderRatedMovies(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      const list = [...state.ratedMovies];
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) return;
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      state.ratedMovies = list;
    },
    updateRatedMovieScores(state, action: PayloadAction<Record<string, number>>) {
      const scores = action.payload;
      state.ratedMovies = state.ratedMovies.map((m) => ({
        ...m,
        rec_score: m?.imdb_id && scores[m.imdb_id] !== undefined ? scores[m.imdb_id] : m?.rec_score,
      }));
    },
    rollbackRatedMovieOrder(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      const list = [...state.ratedMovies];
      const [moved] = list.splice(toIndex, 1);
      list.splice(fromIndex, 0, moved);
      state.ratedMovies = list;
    },
    removeMovieFromSuggestion(state, action: PayloadAction<string>) {
      state.suggestionMovies = state.suggestionMovies.filter(m => m.imdb_id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRankingRatedMovies.pending, (state, action) => {
        const silent = !!action.meta.arg?.silent;
        if (!silent) state.loadingRated = true;
        state.error = null;
      })
      .addCase(fetchRankingRatedMovies.fulfilled, (state, action) => {
        state.loadingRated = false;
        const { results, page, totalPages } = action.payload;
        if (page === 1) {
          state.ratedMovies = results ?? [];
          state.ratedPage = 1;
        } else {
          const existingIds = new Set(state.ratedMovies.map((m: Movie) => m?.imdb_id));
          const newResults = (results ?? []).filter(
            (m: Movie) => m?.imdb_id && !existingIds.has(m.imdb_id)
          );
          state.ratedMovies = [...state.ratedMovies, ...newResults];
          state.ratedPage = page;
        }
        state.ratedHasMore = totalPages > 0 && state.ratedPage < totalPages;
      })
      .addCase(fetchRankingRatedMovies.rejected, (state, action) => {
        state.loadingRated = false;
        state.error = action.payload ?? 'Failed to fetch rated movies';
      });

    builder
      .addCase(fetchRankingSuggestionMovies.pending, (state) => {
        state.loadingSuggestion = true;
        state.error = null;
      })
      .addCase(fetchRankingSuggestionMovies.fulfilled, (state, action) => {
        state.loadingSuggestion = false;
        const { results, page, totalPages } = action.payload;
        if (page === 1) {
          state.suggestionMovies = results ?? [];
          state.suggestionPage = 1;
        } else {
          const existingIds = new Set(state.suggestionMovies.map((m: Movie) => m?.imdb_id));
          const newResults = (results ?? []).filter(
            (m: Movie) => m?.imdb_id && !existingIds.has(m.imdb_id)
          );
          state.suggestionMovies = [...state.suggestionMovies, ...newResults];
          state.suggestionPage = page;
        }
        state.suggestionHasMore = totalPages > 0 && state.suggestionPage < totalPages;
      })
      .addCase(fetchRankingSuggestionMovies.rejected, (state, action) => {
        state.loadingSuggestion = false;
        state.error = action.payload ?? 'Failed to fetch suggestion movies';
      });
  },
});

export const {
  resetSuggestionPagination,
  resetRatedPagination,
  clearRankingError,
  reorderRatedMovies,
  updateRatedMovieScores,
  rollbackRatedMovieOrder,
  removeMovieFromSuggestion,
} = rankingSlice.actions;
export default rankingSlice.reducer;
