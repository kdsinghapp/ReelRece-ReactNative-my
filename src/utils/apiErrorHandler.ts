/**
 * API Error Handler Utilities
 * 
 * Provides standardized error handling patterns for all API calls.
 * Ensures consistent error responses across the application.
 * 
 * @module apiErrorHandler
 */

import { AxiosError } from 'axios';

/**
 * Standardized API Response Type
 * 
 * All API functions should return this type for consistency.
 * Also exported from @types/api.types for use elsewhere.
 * 
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the API call was successful */
  success: boolean;
  
  /** The data returned from the API (only present on success) */
  data?: T;
  
  /** Error message (only present on failure) */
  error?: string;
  
  /** HTTP status code */
  statusCode?: number;
  
  /** Additional error details for debugging */
  details?: Record<string, unknown> | string;
}

/**
 * Error details extracted from Axios errors
 */
interface ErrorDetails {
  message: string;
  statusCode?: number;
  details?: object| string;
}

/**
 * Extract error details from various error types
 * 
 * @param error - The error object (Axios error, Error, or unknown)
 * @returns Structured error details
 */
export const extractErrorDetails = (error: unknown): ErrorDetails => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<object| string>;
    
    return {
      message: 
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error ||
        axiosError.response?.data?.detail ||
        axiosError.message ||
        'Network request failed',
      statusCode: axiosError.response?.status,
      details: axiosError.response?.data,
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      details: error,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }
  
  // Handle unknown errors
  return {
    message: 'An unknown error occurred',
    details: error,
  };
};

/**
 * Type guard to check if error is an Axios error
 */
const isAxiosError = (error: string | object): error is AxiosError => {
  return error && error.isAxiosError === true;
};

/**
 * Create a success response
 * 
 * @template T - The type of data
 * @param data - The data to return
 * @param statusCode - Optional HTTP status code
 * @returns Standardized success response
 * 
 * @example
 * const user = await getUserProfile(token);
 * return createSuccessResponse(user, 200);
 */
export const createSuccessResponse = <T>(
  data: T,
  statusCode?: number
): ApiResponse<T> => {
  return {
    success: true,
    data,
    statusCode: statusCode || 200,
  };
};

/**
 * Create an error response
 * 
 * @param error - The error object
 * @param defaultMessage - Optional default message if error details unavailable
 * @returns Standardized error response
 * 
 * @example
 * try {
 *   const response = await axiosInstance.get('/users');
 *   return createSuccessResponse(response.data);
 * } catch (error) {
 *   return createErrorResponse(error, 'Failed to fetch users');
 * }
 */
export const createErrorResponse = (
  error: unknown,
  defaultMessage?: string
): ApiResponse<never> => {
  const errorDetails = extractErrorDetails(error);
  
  return {
    success: false,
    error: defaultMessage || errorDetails.message,
    statusCode: errorDetails.statusCode,
    details: errorDetails.details,
  };
};

/**
 * Wrap an async API call with standardized error handling
 * 
 * This is the recommended way to make API calls.
 * 
 * @template T - The type of data returned on success
 * @param apiCall - The async function to execute
 * @param errorContext - Optional context for error messages
 * @returns Standardized API response
 * 
 * @example
 * export const getUserProfile = (token: string) =>
 *   safeApiCall(
 *     async () => {
 *       const response = await axiosInstance.get('/profile', {
 *         headers: { Authorization: `Token ${token}` }
 *       });
 *       return response.data;
 *     },
 *     'Failed to fetch user profile'
 *   );
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorContext?: string
): Promise<ApiResponse<T>> => {
  try {
    const data = await apiCall();
    return createSuccessResponse(data);
  } catch (error) {
     return createErrorResponse(error, errorContext);
  }
};

/**
 * Handle API response in UI components
 * 
 * Provides a consistent way to handle API responses with loading states.
 * 
 * @template T - The type of data
 * @param response - The API response
 * @param onSuccess - Callback for successful responses
 * @param onError - Optional callback for errors (defaults to  )
 * 
 * @example
 * const response = await getUserProfile(token);
 * handleApiResponse(
 *   response,
 *   (data) => {
 *     setUser(data);
 *     Alert.alert('Success', 'Profile loaded');
 *   },
 *   (error) => {
 *     Alert.alert('Error', error);
 *   }
 * );
 */
export const handleApiResponse = <T>(
  response: ApiResponse<T>,
  onSuccess: (data: T) => void,
  onError?: (error: string) => void
): void => {
  if (response.success && response.data !== undefined) {
    onSuccess(response.data);
  } else {
    const errorMessage = response.error || 'An unexpected error occurred';
    if (onError) {
      onError(errorMessage);
    } else {
     }
  }
};

/**
 * Check if API response indicates success
 * 
 * Type guard to narrow ApiResponse to successful response.
 * 
 * @param response - The API response
 * @returns True if response is successful
 * 
 * @example
 * const response = await getUserProfile(token);
 * if (isSuccess(response)) {
  * } else {
  * }
 */
export const isSuccess = <T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } => {
  return response.success === true && response.data !== undefined;
};

/**
 * Extract data from API response or return default
 * 
 * @template T - The type of data
 * @param response - The API response
 * @param defaultValue - Default value if response failed
 * @returns The data or default value
 * 
 * @example
 * const response = await getUserProfile(token);
 * const user = getDataOrDefault(response, null);
 */
export const getDataOrDefault = <T>(
  response: ApiResponse<T>,
  defaultValue: T
): T => {
  return isSuccess(response) ? response.data : defaultValue;
};

/**
 * Log API errors consistently
 * 
 * @param context - Context of the error (e.g., function name)
 * @param error - The error object
 */
export const logApiError = (context: string, error: unknown): void => {
  const errorDetails = extractErrorDetails(error);
 
};

/**
 * Network-specific error messages
 */
export const NetworkErrors = {
  TIMEOUT: 'Request timed out. Please check your internet connection.',
  NO_CONNECTION: 'No internet connection. Please check your network.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
} as const;

/**
 * Get user-friendly error message based on status code
 * 
 * @param statusCode - HTTP status code
 * @param defaultMessage - Default message if no specific message exists
 * @returns User-friendly error message
 */
export const getUserFriendlyError = (
  statusCode?: number,
  defaultMessage?: string
): string => {
  if (!statusCode) return defaultMessage || 'An error occurred';
  
  switch (statusCode) {
    case 400:
      return NetworkErrors.BAD_REQUEST;
    case 401:
      return NetworkErrors.UNAUTHORIZED;
    case 403:
      return NetworkErrors.FORBIDDEN;
    case 404:
      return NetworkErrors.NOT_FOUND;
    case 408:
      return NetworkErrors.TIMEOUT;
    case 500:
    case 502:
    case 503:
      return NetworkErrors.SERVER_ERROR;
    default:
      return defaultMessage || 'An unexpected error occurred';
  }
};
