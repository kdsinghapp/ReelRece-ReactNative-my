import { API_ENDPOINTS } from '@config/api.config';
import axiosInstance from './axiosInstance';
import {
  validateString,
  validateUsername,
  validatePage,
  validatePageSize,
  createSafeParams,
  throwValidationError,
} from '@utils/apiInputValidator';

/** Number of feed items per page */
export const USER_FEED_PAGE_SIZE = 10;

/**
 * Get user feed with input validation
 *
 * @param token - Auth token (required)
 * @param type - Feed type: home, profile, or otherprofile
 * @param username - Username for otherprofile type
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 10)
 */
export const getUserFeed = async (
  token: string,
  type: "home" | "profile" | "otherprofile",
  username?: string,
  page: number = 1,
  pageSize: number = USER_FEED_PAGE_SIZE
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

  const pageSizeValidation = validatePageSize(pageSize);
  const validPageSize = pageSizeValidation.isValid ? pageSizeValidation.value : USER_FEED_PAGE_SIZE;

  try {
    // Build params safely (page, page_size for pagination; username for otherprofile)
    const params: Record<string, string> = {
      page: String(page),
      page_size: String(validPageSize),
    };
    if (type === "otherprofile" && username) {
      params.username = username;
    }

    if (type === "profile" && username) {
      params.username = username;
    }

    // Use relative path - axiosInstance already has baseURL configured
    const response = await axiosInstance.get(API_ENDPOINTS.USER.FEED, {
      headers: {
        Authorization: `Token ${tokenValidation.sanitized}`,
      },
      params: createSafeParams(params),
    });
  // console.log("response.data", response.data, 'params', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};