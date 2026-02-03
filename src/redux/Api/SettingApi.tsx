import axiosInstance from "@redux/Api/axiosInstance";
import {
  validateString,
  validateStringArray,
  validatePage,
  validatePageSize,
  validateSearchQuery,
  createSafeParams,
  throwValidationError,
} from '@utils/apiInputValidator';

/**
 * Validates token and returns sanitized value
 */
const validateToken = (token: string): string => {
  const validation = validateString(token, {
    fieldName: 'Token',
    required: true,
    minLength: 1,
  });
  if (!validation.isValid) {
    throwValidationError('Token', validation.error);
  }
  return validation.sanitized;
};

/**
 * Get unique streaming platforms
 */
export const getUniquePlatforms = async ({
  token,
  country,
  query,
  page,
  page_size = 20,
  signal,
}: {
  token: string;
  country?: string;
  query?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
}) => {
  // Validate inputs
  const sanitizedToken = validateToken(token);
  
  // Validate optional country
  let sanitizedCountry: string | undefined;
  if (country) {
    const countryValidation = validateString(country, {
      fieldName: 'Country',
      maxLength: 50,
    });
    if (countryValidation.isValid) {
      sanitizedCountry = countryValidation.sanitized;
    }
  }

  // Validate optional query
  let sanitizedQuery: string | undefined;
  if (query) {
    const queryValidation = validateSearchQuery(query);
    if (queryValidation.isValid) {
      sanitizedQuery = queryValidation.sanitized;
    }
  }

  // Validate page
  const pageValidation = validatePage(page || 1);
  const validatedPage = pageValidation.isValid ? pageValidation.value : 1;

  // Validate page_size
  const pageSizeValidation = validatePageSize(page_size);
  const validatedPageSize = pageSizeValidation.isValid ? pageSizeValidation.value : 20;

  try {
    // Build params safely using axios params (not URL string)
    const params: Record<string, string> = {
      page: String(validatedPage),
      page_size: String(validatedPageSize),
    };
    if (sanitizedCountry) params.country = sanitizedCountry;
    if (sanitizedQuery) params.query = sanitizedQuery;

    const response = await axiosInstance.get('/unique-platforms', {
      headers: {
        Authorization: `Token ${sanitizedToken}`,
      },
      params: createSafeParams(params),
      signal,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Register user streaming subscriptions
 */
export const registerUserSubscriptions = async (token: string, subscriptions: string[]) => {
  // Validate token
  const sanitizedToken = validateToken(token);

  // Validate subscriptions array
  const subscriptionsValidation = validateStringArray(subscriptions, {
    fieldName: 'Subscriptions',
    required: true,
    maxItems: 50,
    maxLength: 100,
  });
  if (!subscriptionsValidation.isValid) {
    throwValidationError('Subscriptions', subscriptionsValidation.error);
  }

  try {
    const response = await axiosInstance.post('/user-subscriptions', 
      {
        subscriptions: subscriptionsValidation.sanitized,
      },
      {
        headers: {
          Authorization: `Token ${sanitizedToken}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user streaming subscriptions
 */
export const getUserSubscriptions = async (token: string) => {
  const sanitizedToken = validateToken(token);

  try {
    const response = await axiosInstance.get('/user-subscriptions', {
      headers: {
        Authorization: `Token ${sanitizedToken}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete user streaming subscriptions
 */
export const deleteUserSubscriptions = async (token: string, subscriptions: string[]) => {
  // Validate token
  const sanitizedToken = validateToken(token);

  // Validate subscriptions array
  const subscriptionsValidation = validateStringArray(subscriptions, {
    fieldName: 'Subscriptions',
    required: true,
    maxItems: 50,
    maxLength: 100,
  });
  if (!subscriptionsValidation.isValid) {
    throwValidationError('Subscriptions', subscriptionsValidation.error);
  }

  try {
    const response = await axiosInstance.delete('/user-subscriptions', {
      headers: {
        Authorization: `Token ${sanitizedToken}`,
      },
      data: {
        subscriptions: subscriptionsValidation.sanitized,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit user feedback
 */
export const userFeedback = async (
  token: string,
  feedback_type: string,
  anonymous: boolean,
  feedback: string
) => {
  // Validate token
  const sanitizedToken = validateToken(token);

  // Validate feedback_type
  const feedbackTypeValidation = validateString(feedback_type, {
    fieldName: 'Feedback type',
    required: true,
    maxLength: 50,
  });
  if (!feedbackTypeValidation.isValid) {
    throwValidationError('Feedback type', feedbackTypeValidation.error);
  }

  // Validate feedback content
  const feedbackValidation = validateString(feedback, {
    fieldName: 'Feedback',
    required: true,
    minLength: 1,
    maxLength: 5000,
  });
  if (!feedbackValidation.isValid) {
    throwValidationError('Feedback', feedbackValidation.error);
  }

  try {
    const response = await axiosInstance.post(
      '/feedback',
      {
        feedback_type: feedbackTypeValidation.sanitized,
        feedback: feedbackValidation.sanitized,
        anonymous: anonymous ? "yes" : "no",
      },
      {
        headers: {
          Authorization: `Token ${sanitizedToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

