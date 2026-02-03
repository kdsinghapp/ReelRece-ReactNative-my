import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistReducer,
  persistStore,
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

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'videoAudio'], // ✅ Persist auth/token, user/profile, and video preferences
  // ℹ️ Not persisted: multiSelect, modal (UI state should reset on app restart)
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  multiSelect: multiSelectReducer,
  modal: modalReducer,
  videoAudio: videoAudioReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions ignoredActions contain non-serializable values
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Add specific paths if needed:
        // ignoredActionPaths: ['payload.timestamp'],
        // ignoredPaths: ['items.dates'],
      },
    }),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
