/**
 * Centralized API Configuration
 * 
 * This file contains all API-related configuration to eliminate duplicated hardcoded URLs.
 * All API modules should import from this file instead of hardcoding URLs.
 * 
 * Benefits:
 * - Single source of truth for all API endpoints
 * - Easy to switch between environments (dev, staging, prod)
 * - Supports environment variables via .env files
 * - Prevents https/httpsS inconsistencies
 * - Easy to update URLs in one place
 */

// ============================================
// ENVIRONMENT VARIABLES (from .env if available)
// ============================================

// Note: React Native doesn't natively support process.env
// If you want to use environment variables, you need to:
// 1. Install: npm install react-native-dotenv
// 2. Configure babel.config.js
// 3. Then uncomment below and use process.env

// For now, we'll use compile-time constants
// You can change these based on your build configuration

// ============================================
// API BASE URLs
// ============================================

/**
 * Main API base URL
 * Used for all backend API calls
 */
export const API_BASE_URL = 'https://api.reelrecs.com/v1';
// export const API_BASE_URL = 'http://reelrecs.us-east-1.elasticbeanstalk.com/v1'; // For proxy debugging only

/**
 * Image/Asset storage URL
 * Used for user avatars and static assets
 */
 export const BASE_IMAGE_URL = 'https://reelrecs.s3.us-east-1.amazonaws.com/static/users';

/**
 * API request timeout in milliseconds
 * Default: 30 seconds for video operations
 */
export const API_TIMEOUT = 30000;

// ============================================
// API ENDPOINTS
// ============================================

/**
 * All API endpoints relative to API_BASE_URL
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_EMAIL: '/verify-email',
    RESET_PASSWORD: '/reset-password',
    UPLOAD_AVATAR: '/avatar',
  },

  // User endpoints
  USER: {
    PROFILE: '/user-profile',
    FEED: '/user-feed',
    UPDATE_FLAGS: '/update-user-flags',
  },

  // Movie endpoints
  MOVIE: {
    DETAILS: '/movie-detail',
    TRENDING: '/trending',
    RECOMMENDATIONS: '/recommendations',
    SEARCH: '/search',
    RECORD_DECISION: '/record-pairwise-decision',
    RECORD_DECISION_WITH_RATING: '/record-pairwise-decision-and-calculate-rating',
    RATE: '/rate-movie',
  },

  // Bookmark endpoints
  BOOKMARK: {
    LIST: '/bookmark',
    TOGGLE: '/bookmark',
  },

  // Group endpoints
  GROUP: {
    CREATE: '/group',
    LIST: '/groups',
    DETAILS: '/group-details',
    MEMBERS: '/group-members',
    ADD_MEMBERS: '/add-group-members',
    ACTIVITIES: '/group-activities',
    RECOMMENDATIONS: '/group-recommendations',
  },

  // Social endpoints
  SOCIAL: {
    FOLLOWERS: '/followers',
    FOLLOWING: '/following',
    FOLLOW: '/follow',
    UNFOLLOW: '/unfollow',
    SUGGESTED_FRIENDS: '/suggested-friends',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build full URL for an endpoint
 * @param endpoint - The endpoint path
 * @param baseUrl - Optional custom base URL (defaults to API_BASE_URL)
 * @returns Full URL
 */
export const buildApiUrl = (endpoint: string, baseUrl: string = API_BASE_URL): string => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

/**
 * Build image URL for user avatar
 * @param avatarPath - Avatar filename or path
 * @returns Full image URL
 */
export const buildImageUrl = (avatarPath: string): string => {
  if (!avatarPath) return '';
  
  // If already a full URL, return as-is
  if (avatarPath.startsWith('https://') || avatarPath.startsWith('http://')) {
    return avatarPath;
  }
  
  // Remove leading slash if present
  const cleanPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = BASE_IMAGE_URL.endsWith('/') ? BASE_IMAGE_URL.slice(0, -1) : BASE_IMAGE_URL;
  return `${cleanBaseUrl}/${cleanPath}`;
};

/**
 * Get axios configuration with centralized settings
 */
export const getAxiosConfig = () => ({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// ENVIRONMENT-SPECIFIC OVERRIDES
// ============================================

/**
 * Check if running in development mode
 */
export const isDevelopment = __DEV__;

/**
 * Check if running in production mode
 */
export const isProduction = !__DEV__;

/**
 * Log API configuration (for debugging)
 * Only logs in development mode
 */
export const logApiConfig = () => {
  if (isDevelopment) {
   }
};

// ============================================
// VALIDATION
// ============================================

/**
 * Validate that API configuration is properly set
 * Call this on app startup to catch configuration issues early
 */
export const validateApiConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!API_BASE_URL) {
    errors.push('API_BASE_URL is not defined');
  }

  if (!API_BASE_URL.startsWith('https://') && !API_BASE_URL.startsWith('http://')) {
    errors.push('API_BASE_URL must start with https:// or http://');
  }

  if (!BASE_IMAGE_URL) {
    errors.push('BASE_IMAGE_URL is not defined');
  }

  if (API_TIMEOUT <= 0) {
    errors.push('API_TIMEOUT must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================
// EXPORT DEFAULT CONFIG
// ============================================

export default {
  API_BASE_URL,
  BASE_IMAGE_URL,
  API_TIMEOUT,
  API_ENDPOINTS,
  buildApiUrl,
  buildImageUrl,
  getAxiosConfig,
  isDevelopment,
  isProduction,
  logApiConfig,
  validateApiConfig,
};
