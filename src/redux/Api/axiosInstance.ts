import axios from 'axios';
import TokenService from '@services/TokenService';
import { getAxiosConfig } from '@config/api.config';

// ✅ Base configuration from centralized config
const axiosInstance = axios.create(getAxiosConfig());

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

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status;
    const hadAuthHeader = !!error.config?.headers?.Authorization;

    if (status === 401) {
      if (hadAuthHeader) {
        await TokenService.clearToken();
        error.tokenInvalid = true;
        error.requiresReauth = true;
      } else {
        error.noToken = true;
      }
    }

    // Network error handling
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      error.isNetworkError = true;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
