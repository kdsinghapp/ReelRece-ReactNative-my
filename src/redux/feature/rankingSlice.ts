import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAllRatedMovies, getRankingSuggestionMovie } from '@redux/Api/movieApi';
import { Movie } from '@types/api.types';
import { RootState } from '@redux/store';

export interface RankingState {
  ratedMovies: Movie[];
  suggestionMovies: Movie[];
  suggestionPage: number;
  suggestionHasMore: boolean;
  loadingRated: boolean;
  loadingSuggestion: boolean;
  error: string | null;
}

const initialState: RankingState = {
  ratedMovies: [],
  suggestionMovies: [],
  suggestionPage: 1,
  suggestionHasMore: true,
  loadingRated: false,
  loadingSuggestion: false,
  error: null,
};

/** Fetch ranked movies; can be prefetched from Welcome for smooth Ranking tab load. */
export const fetchRankingRatedMovies = createAsyncThunk<
  Movie[],
  { silent?: boolean } | undefined,
  { state: RootState; rejectValue: string }
>(
  'ranking/fetchRatedMovies',
  async (_opts, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await getAllRatedMovies(token);
      const list = Array.isArray(res?.results) ? res.results : [];
      return list;
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
        state.ratedMovies = action.payload ?? [];
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
  clearRankingError,
  reorderRatedMovies,
  updateRatedMovieScores,
  rollbackRatedMovieOrder,
} = rankingSlice.actions;
export default rankingSlice.reducer;
