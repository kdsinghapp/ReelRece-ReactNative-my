import axios, { type InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenService from '@services/TokenService';
import { getAxiosConfig } from '@config/api.config';
import { store, persistor, purgeStore } from '@redux/store';
import { logout } from '@redux/feature/authSlice';
import { resetToLogin } from '@navigators/rootNavigationRef';
import { errorToast } from '@utils/customToast';
import {
  getRetryBehavior,
  queueForReconnect,
  isOffline,
  sleep,
} from '@redux/Api/retryQueue';
import { cacheResponse, getCachedResponse, clearResponseCache } from '@redux/Api/responseCache';
import { clearMovieCache } from '@redux/feature/movieCacheSlice/MovieCacheManager';

// ✅ Base configuration from centralized config
const axiosInstance = axios.create(getAxiosConfig());

// Guard: only run 401 logout + navigate once when multiple requests get 401
let hasTriggered401Logout = false;

// ✅ Public endpoints (no auth needed)
const PUBLIC_ENDPOINTS = [
  '/login',
  '/signup',
  '/verify-email',
  '/confirm-email-code',
  '/reset-password',
  '/check-username',
  '/existing-user',
];

// Check if endpoint requires auth
const requiresAuth = (url?: string): boolean => {
  if (!url) return false;
  return !PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// ✅ Request interceptor
axiosInstance.interceptors.request.use(
  async config => {
    const endpoint = config.url || 'unknown';
    const needsAuth = requiresAuth(endpoint);

    // Skip auth for public endpoints
    if (!needsAuth) {
      return config;
    }

    try {
      let token = await TokenService.getToken();

      // Wait for token if not immediately available
      if (!token) {
        token = await TokenService.waitForToken(50, 100); // 5s max
      }

      // ❌ Still no token → block request
      if (!token) {
        const error: string | object = new Error(
          `No authentication token available for ${endpoint}. Please login.`
        );
        error.isAuthError = true;
        error.code = 'NO_AUTH_TOKEN';
        error.endpoint = endpoint;
        throw error;
      }

      // Token must be string
      if (typeof token !== 'string') {
        throw new Error(`Token is not a string (type: ${typeof token})`);
      }

      // Inject header
      config.headers = config.headers || {};
      config.headers.Authorization = `Token ${token}`;

      return config;
    } catch (error: unknown) {
      if (error.isAuthError) {
        throw error;
      }

      const authError: object | string = new Error(
        `Failed to retrieve token: ${error.message}`
      );
      authError.isAuthError = true;
      authError.code = 'TOKEN_RETRIEVAL_FAILED';
      authError.originalError = error;
      throw authError;
    }
  },
  error => Promise.reject(error)
);

// ✅ Response success: cache GET responses for offline use
axiosInstance.interceptors.response.use(
  response => {
    const method = (response.config?.method || 'get').toLowerCase();
    if (method === 'get' && response.config) {
      cacheResponse(response.config, response);
    }
    return response;
  },
  async error => {
    const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };
    const status = error.response?.status;
    const hadAuthHeader = !!config?.headers?.Authorization;

    if (status === 401) {
      if (hadAuthHeader) {
        error.tokenInvalid = true;
        error.requiresReauth = true;
        if (!hasTriggered401Logout) {
          hasTriggered401Logout = true;
          errorToast('Session expired. Please log in again.');
          setTimeout(async () => {
            await TokenService.clearToken();
            store.dispatch(logout());
            try {
              await persistor.purge();
            } catch (_) {
              // ignore purge errors
            }
            store.dispatch(purgeStore());
            clearResponseCache();
            clearMovieCache();
            const userSpecificKeys = [
              'currentStep',
              'homeIndex',
              'profileIndex',
              'otherProfileIndex',
              'selected_group',
              'hasSeenSwipeTooltip',
              'hasSeenTooltip',
              'tooltipShown',
            ];
            await AsyncStorage.multiRemove(userSpecificKeys).catch(() => {});
            resetToLogin();
            hasTriggered401Logout = false;
          }, 1000);
        }
      } else {
        error.noToken = true;
      }
    }

    // Network error flag (for retry logic)
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      error.isNetworkError = true;
    }

    // Offline data: serve from cache for GET requests when network fails
    if (config && error.isNetworkError) {
      const method = (config.method || 'get').toLowerCase();
      if (method === 'get') {
        const cached = getCachedResponse(config);
        if (cached) return Promise.resolve(cached);
      }
    }

    // Smart retry: when OFFLINE, queue immediately (no retries); when ONLINE, retry with backoff
    if (config && !error.tokenInvalid && !error.noToken && status !== 403) {
      if (error.isNetworkError) {
        const offline = await isOffline();
        if (offline) {
          queueForReconnect(config);
          return Promise.reject(error);
        }
      }

      const behavior = getRetryBehavior(error, config);
      if (behavior.shouldRetry && behavior.delayMs != null) {
        config.__retryCount = (config.__retryCount ?? 0) + 1;
        await sleep(behavior.delayMs);
        return axiosInstance.request(config);
      }
      if (behavior.shouldQueue) {
        queueForReconnect(config);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
