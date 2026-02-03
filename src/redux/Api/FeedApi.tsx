import { API_ENDPOINTS } from '@config/api.config';
import axiosInstance from './axiosInstance';
import {
  validateString,
  validateUsername,
  validatePage,
  createSafeParams,
  throwValidationError,
} from '@utils/apiInputValidator';

/**
 * Get user feed with input validation
 * 
 * @param token - Auth token (required)
 * @param type - Feed type: home, profile, or otherprofile
 * @param username - Username for otherprofile type
 * @param page - Page number (default: 1)
 */
export const getUserFeed = async (
  token: string,
  type: "home" | "profile" | "otherprofile",
  username?: string,
  page: number = 1 
) => {
  // Validate token
  const tokenValidation = validateString(token, {
    fieldName: 'Token',
    required: true,
    minLength: 1,
  });
  if (!tokenValidation.isValid) {
    throwValidationError('Token', tokenValidation.error);
  }

  // Validate type
  const validTypes = ['home', 'profile', 'otherprofile'];
  if (!validTypes.includes(type)) {
    throwValidationError('Type', 'Invalid feed type');
  }

  // Validate username if provided
  if (username) {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      throwValidationError('Username', usernameValidation.error);
    }
  }

  // Validate page
  const pageValidation = validatePage(page);
  if (!pageValidation.isValid) {
    page = pageValidation.value; // Use default
  }

  try {
    // Build params safely
    const params: Record<string, string> = {};
    if (type === "otherprofile" && username) {
      params.username = username;
    }

    // Use relative path - axiosInstance already has baseURL configured
    const response = await axiosInstance.get(API_ENDPOINTS.USER.FEED, {
      headers: {
        Authorization: `Token ${tokenValidation.sanitized}`,
      },
      params: Object.keys(params).length > 0 ? createSafeParams(params) : undefined,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};