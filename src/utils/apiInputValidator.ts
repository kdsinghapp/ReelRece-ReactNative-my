/**
 * API Input Validation Utility
 * 
 * Provides validation and sanitization for API inputs to prevent:
 * - Injection attacks
 * - Encoding issues
 * - Invalid data transmission
 * - Runtime errors from malformed inputs
 */

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * Validates and sanitizes string inputs for API calls
 */
export const validateString = (
  value: unknown,
  options: {
    fieldName?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
    trim?: boolean;
  } = {}
): ValidationResult => {
  const {
    fieldName = 'Input',
    required = false,
    minLength = 0,
    maxLength = 1000,
    allowEmpty = false,
    trim = true,
  } = options;

  // Type check
  if (value === null || value === undefined) {
    if (required) {
      return {
        isValid: false,
        sanitized: '',
        error: `${fieldName} is required`,
      };
    }
    return { isValid: true, sanitized: '' };
  }

  // Convert to string if not already
  let sanitized = String(value);

  // Trim whitespace if enabled
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Check empty
  if (!allowEmpty && sanitized.length === 0) {
    if (required) {
      return {
        isValid: false,
        sanitized: '',
        error: `${fieldName} cannot be empty`,
      };
    }
    return { isValid: true, sanitized: '' };
  }

  // Length validation
  if (sanitized.length < minLength) {
    return {
      isValid: false,
      sanitized: '',
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      sanitized: sanitized.substring(0, maxLength),
      error: `${fieldName} exceeds maximum length of ${maxLength} characters`,
    };
  }

  return { isValid: true, sanitized };
};

/**
 * Validates IMDB ID format
 */
export const validateImdbId = (imdbId: unknown): ValidationResult => {
  const result = validateString(imdbId, {
    fieldName: 'IMDB ID',
    required: true,
    minLength: 7,
    maxLength: 15,
  });

  if (!result.isValid) {
    return result;
  }

  // IMDB IDs should start with 'tt' followed by numbers
  if (!/^tt\d+$/.test(result.sanitized)) {
    return {
      isValid: false,
      sanitized: result.sanitized,
      error: 'Invalid IMDB ID format (should be tt followed by numbers)',
    };
  }

  return result;
};

/**
 * Validates username
 */
export const validateUsername = (username: unknown): ValidationResult => {
  return validateString(username, {
    fieldName: 'Username',
    required: true,
    minLength: 2,
    maxLength: 50,
  });
};

/**
 * Validates group ID
 */
export const validateGroupId = (groupId: unknown): ValidationResult => {
  return validateString(groupId, {
    fieldName: 'Group ID',
    required: true,
    minLength: 1,
    maxLength: 100,
  });
};

/**
 * Validates search query
 */
export const validateSearchQuery = (query: unknown): ValidationResult => {
  return validateString(query, {
    fieldName: 'Search query',
    required: false,
    minLength: 0,
    maxLength: 200,
    allowEmpty: true,
  });
};

/**
 * Validates page number
 */
export const validatePage = (page: unknown): { isValid: boolean; value: number; error?: string } => {
  const pageNum = Number(page);

  if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
    return {
      isValid: false,
      value: 1,
      error: 'Page must be a positive integer',
    };
  }

  if (pageNum > 10000) {
    return {
      isValid: false,
      value: 1,
      error: 'Page number exceeds maximum allowed value',
    };
  }

  return { isValid: true, value: pageNum };
};

/**
 * Validates page size
 */
export const validatePageSize = (pageSize: unknown): { isValid: boolean; value: number; error?: string } => {
  const size = Number(pageSize);

  if (isNaN(size) || !Number.isInteger(size) || size < 1) {
    return {
      isValid: false,
      value: 20,
      error: 'Page size must be a positive integer',
    };
  }

  if (size > 100) {
    return {
      isValid: false,
      value: 100,
      error: 'Page size cannot exceed 100',
    };
  }

  return { isValid: true, value: size };
};

/**
 * Validates email format
 */
export const validateEmail = (email: unknown): ValidationResult => {
  const result = validateString(email, {
    fieldName: 'Email',
    required: true,
    maxLength: 255,
  });

  if (!result.isValid) {
    return result;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(result.sanitized)) {
    return {
      isValid: false,
      sanitized: result.sanitized,
      error: 'Invalid email format',
    };
  }

  return result;
};

/**
 * Validates array of strings (e.g., member IDs)
 */
export const validateStringArray = (
  arr: unknown,
  options: {
    fieldName?: string;
    required?: boolean;
    maxLength?: number;
    maxItems?: number;
  } = {}
): { isValid: boolean; sanitized: string[]; error?: string } => {
  const { fieldName = 'Array', required = false, maxLength = 100, maxItems = 100 } = options;

  if (!Array.isArray(arr)) {
    if (required) {
      return {
        isValid: false,
        sanitized: [],
        error: `${fieldName} must be an array`,
      };
    }
    return { isValid: true, sanitized: [] };
  }

  if (arr.length === 0 && required) {
    return {
      isValid: false,
      sanitized: [],
      error: `${fieldName} cannot be empty`,
    };
  }

  if (arr.length > maxItems) {
    return {
      isValid: false,
      sanitized: arr.slice(0, maxItems).map(String),
      error: `${fieldName} exceeds maximum of ${maxItems} items`,
    };
  }

  // Validate each item
  const sanitized: string[] = [];
  for (const item of arr) {
    const result = validateString(item, {
      fieldName: `${fieldName} item`,
      required: true,
      maxLength,
    });

    if (!result.isValid) {
      return {
        isValid: false,
        sanitized: [],
        error: result.error,
      };
    }

    sanitized.push(result.sanitized);
  }

  return { isValid: true, sanitized };
};

/**
 * Sanitizes URL parameters by encoding
 * Use this as a fallback when you must use string interpolation
 */
export const sanitizeUrlParam = (param: unknown): string => {
  if (param === null || param === undefined) {
    return '';
  }
  return encodeURIComponent(String(param).trim());
};

/**
 * Creates safe query params object for axios
 * This is the PREFERRED way to pass query parameters
 */
export const createSafeParams = (params: Record<string, string | object>): Record<string, string | number> => {
  const safeParams: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      continue; // Skip empty values
    }

    if (typeof value === 'string') {
      const validated = validateString(value, { allowEmpty: false });
      if (validated.isValid) {
        safeParams[key] = validated.sanitized;
      }
    } else if (typeof value === 'number') {
      safeParams[key] = value;
    } else {
      // Convert other types to string
      safeParams[key] = String(value);
    }
  }

  return safeParams;
};

/**
 * Helper to throw validation errors
 */
export const throwValidationError = (fieldName: string, error?: string): never => {
  const message = error || `Invalid ${fieldName}`;
   throw new Error(message);
};
