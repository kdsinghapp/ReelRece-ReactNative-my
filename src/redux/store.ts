import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistReducer,
  persistStore,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import authReducer from '@redux/feature/authSlice';
import userReducer from '@redux/feature/userSlice';
import multiSelectReducer from '@redux/feature/multiSelectSlice';
import modalReducer from '@redux/feature/modalSlice/modalSlice';
import videoAudioReducer from '@redux/feature/videoAudioSlice';
import rankingReducer from '@redux/feature/rankingSlice';
import homeReducer from '@redux/feature/homeSlice';
import discoverReducer from '@redux/feature/discoverSlice';
import watchReducer from '@redux/feature/watchSlice';
import profileReducer from '@redux/feature/profileSlice';

// Max items to persist (performance: smaller = faster read/write)
const MAX_FEED_ITEMS = 50;
const MAX_RANKING_RATED = 100;
const MAX_RANKING_SUGGESTION = 30;
const MAX_DISCOVER_ITEMS = 50;
const MAX_WATCH_GROUPS = 30;
const MAX_PROFILE_FEED = 30;
const MAX_PROFILE_BOOKMARKS = 20;
const MAX_PROFILE_HISTORY = 20;
const MAX_PROFILE_RATED = 30;
const MAX_PROFILE_SUGGESTED = 15;

// Cap data size when saving (inbound) + reset loading when restoring (outbound)
const persistTransforms = createTransform(
  (inboundState: Record<string, unknown>, key) => {
    if (!inboundState || typeof inboundState !== 'object') return inboundState;
    if (key === 'home') {
      const feedData = Array.isArray(inboundState.feedData) ? inboundState.feedData : [];
      const recentUsers = Array.isArray(inboundState.recentUsers) ? inboundState.recentUsers : [];
      const trendingData = Array.isArray(inboundState.trendingData) ? inboundState.trendingData : [];
      const recommendData = Array.isArray(inboundState.recommendData) ? inboundState.recommendData : [];
      const bookmarkData = Array.isArray(inboundState.bookmarkData) ? inboundState.bookmarkData : [];
      const suggestedFriends = Array.isArray(inboundState.suggestedFriends) ? inboundState.suggestedFriends : [];
      return {
        ...inboundState,
        feedData: feedData.slice(-MAX_FEED_ITEMS),
        recentUsers: recentUsers.slice(-20),
        trendingData: trendingData.slice(-30),
        recommendData: recommendData.slice(-30),
        bookmarkData: bookmarkData.slice(-30),
        suggestedFriends: suggestedFriends.slice(-20),
      };
    }
    if (key === 'ranking') {
      const rated = Array.isArray(inboundState.ratedMovies) ? inboundState.ratedMovies : [];
      const suggestion = Array.isArray(inboundState.suggestionMovies) ? inboundState.suggestionMovies : [];
      return {
        ...inboundState,
        ratedMovies: rated.slice(-MAX_RANKING_RATED),
        suggestionMovies: suggestion.slice(-MAX_RANKING_SUGGESTION),
      };
    }
    if (key === 'discover') {
      const movies = Array.isArray(inboundState.movies) ? inboundState.movies : [];
      return { ...inboundState, movies: movies.slice(-MAX_DISCOVER_ITEMS) };
    }
    if (key === 'watch') {
      const groups = Array.isArray(inboundState.groupsData) ? inboundState.groupsData : [];
      return { ...inboundState, groupsData: groups.slice(-MAX_WATCH_GROUPS) };
    }
    if (key === 'profile') {
      const feed = Array.isArray(inboundState.profileFeedData) ? inboundState.profileFeedData : [];
      const saved = Array.isArray(inboundState.savedMovies) ? inboundState.savedMovies : [];
      const history = Array.isArray(inboundState.historyMovies) ? inboundState.historyMovies : [];
      const rated = Array.isArray(inboundState.rankingMovie) ? inboundState.rankingMovie : [];
      const suggested = Array.isArray(inboundState.suggestedFriends) ? inboundState.suggestedFriends : [];
      return {
        ...inboundState,
        profileFeedData: feed.slice(-MAX_PROFILE_FEED),
        savedMovies: saved.slice(-MAX_PROFILE_BOOKMARKS),
        historyMovies: history.slice(-MAX_PROFILE_HISTORY),
        rankingMovie: rated.slice(-MAX_PROFILE_RATED),
        suggestedFriends: suggested.slice(-MAX_PROFILE_SUGGESTED),
      };
    }
    return inboundState;
  },
  (outboundState: Record<string, unknown>, key) => {
    if (!outboundState || typeof outboundState !== 'object') return outboundState;
    if (key === 'home') {
      return {
        ...outboundState,
        loadingFeed: false,
        loadingMoreFeed: false,
        loadingRecentUsers: false,
        loadingTrending: false,
        loadingRecs: false,
        loadingBookmark: false,
      };
    }
    if (key === 'ranking') {
      return {
        ...outboundState,
        loadingRated: false,
        loadingSuggestion: false,
      };
    }
    if (key === 'discover') {
      return { ...outboundState, loading: false, loadingMore: false, refreshing: false };
    }
    if (key === 'watch') {
      return { ...outboundState, loadingGroups: false };
    }
    if (key === 'profile') {
      return {
        ...outboundState,
        loadingFeed: false,
        loadingMoreFeed: false,
        loadingBookmarks: false,
        loadingHistory: false,
        loadingRated: false,
        loadingSuggested: false,
      };
    }
    return outboundState;
  },
  { whitelist: ['home', 'ranking', 'discover', 'watch', 'profile'] }
);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'videoAudio', 'home', 'ranking', 'discover', 'watch', 'profile'],
  transforms: [persistTransforms],
};

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  multiSelect: multiSelectReducer,
  modal: modalReducer,
  videoAudio: videoAudioReducer,
  ranking: rankingReducer,
  home: homeReducer,
  discover: discoverReducer,
  watch: watchReducer,
  profile: profileReducer,
});

/** Dispatch this on logout to reset all slices to initial state */
export const PURGE_STORE = 'PURGE_STORE';

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) => {
  if (action.type === PURGE_STORE) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions and purge
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, PURGE_STORE],
        // Add specific paths if needed:
        // ignoredActionPaths: ['payload.timestamp'],
        // ignoredPaths: ['items.dates'],
      },
    }),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Call on logout to clear persisted storage and reset in-memory state */
export const purgeStore = () => ({ type: PURGE_STORE } as const);

export { store, persistor };
