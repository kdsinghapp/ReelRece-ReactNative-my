import { Alert } from 'react-native';
import axiosInstance from '@redux/Api/axiosInstance';
import { ApiResponse, UpdateProfileData, UserProfile } from '@types/api.types';
import { createErrorResponse, safeApiCall } from '@utils/apiErrorHandler';
import Logger from '@utils/Logger';
import {
  createSafeParams,
  throwValidationError,
  validateEmail,
  validateString,
} from '@utils/apiInputValidator';
import { validateResponse, unwrapValidation } from '@utils/apiResponseValidator';
import { z } from 'zod';
import toastConfig, { errorToast, normalToast, successToast } from '@utils/customToast';
import { ErrorToast } from 'react-native-toast-message';

const loginResponseSchema = z.object({
  token: z.string(),
});

const ensureStringField = (
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number } = {}
): string => {
  const result = validateString(value, {
    fieldName,
    required: true,
    minLength: options.minLength ?? 0,
    maxLength: options.maxLength ?? 1000,
  });

  if (!result.isValid) {
    throwValidationError(fieldName, result.error);
  }

  return result.sanitized;
};

const ensureEmail = (value: unknown): string => {
  const result = validateEmail(value);
  if (!result.isValid) {
    throwValidationError('Email', result.error);
  }

  return result.sanitized;
};

/**
 * Login user with email and password
 * 
 * @param email - User email address
 * @param password - User password
 * @returns ApiResponse with auth token on success
 */
export const loginUser_Api = (email: string, password: string): Promise<ApiResponse<string>> =>
  safeApiCall(
    async () => {
      const sanitizedEmail = ensureEmail(email);
      const sanitizedPassword = ensureStringField(password, 'Password', {
        minLength: 6,
        maxLength: 256,
      });

      const response = await axiosInstance.post('/login', {
        email_id: sanitizedEmail,
        password: sanitizedPassword,
      });

      const validation = validateResponse(loginResponseSchema, response.data, {
        endpoint: '/login',
        strict: true,
      });

      const { token } = unwrapValidation(validation);

      return token;
    },
    'Login failed'
  );


/**
 * Check if email already exists in the system
 * 
 * @param email - Email address to check
 * @returns ApiResponse with boolean indicating if email exists
 */
export const checkEmailExists = (email: string): Promise<ApiResponse<boolean>> =>
  safeApiCall(
    async () => {
      const sanitizedEmail = ensureEmail(email);
      const response = await axiosInstance.get('/existing-user', {
        params: createSafeParams({
          email_id: sanitizedEmail,
        }),
      });

      Logger.debug('Check email exists response', response.data);
      return response.data?.existing_user === 'yes';
    },
    'Failed to check email availability'
  );

/**
 * Send OTP to email for signup verification
 * 
 * @param email - Email address to send OTP to
 * @returns ApiResponse with OTP send confirmation
 */
export const sendOTPToEmail_GET = (email: string): Promise<ApiResponse> =>
  safeApiCall(
    async () => {
      const sanitizedEmail = ensureEmail(email);

      const response = await axiosInstance.get('/verify-email', {
        params: createSafeParams({
          email_id: sanitizedEmail,
          purpose: 'signup',
        }),
      });
       return response.data;
    },
    'Failed to send OTP'
  );
/**
 * Confirm email verification code (OTP)
 * 
 * @param email - Email address
 * @param code - Verification code
 * @returns ApiResponse with verification result
 */
export const confirmEmailCodeApi = (
  email: string, 
  code: string
): Promise<ApiResponse<boolean>> =>
  safeApiCall(
    async () => {
      const sanitizedEmail = ensureEmail(email);
      const sanitizedCode = ensureStringField(code, 'Verification code', {
        minLength: 1,
        maxLength: 20,
      });

      const response = await axiosInstance.post('/confirm-email-code', {
        email_id: sanitizedEmail,
        purpose: 'signup',
        code: sanitizedCode,
      });

      const isVerified = response.status === 200 && response.data?.verification === 'success';
      
      if (!isVerified) {
        throw new Error('Verification failed');
      }
      
      return true;
    },
    'Email verification failed'
  );


export const checkUsernameAvailability = async (username) => {
  
  try {
    const response = await axiosInstance.get(`/check-username-availability?username=${username}`);
  if (response?.data?.username_available === "yes") {
  // successToast("Username is available.");
} else {
  errorToast("Username is already in use.");
}

    return {
      success: true,
      available: response?.data?.username_available === "yes",
    };

  } catch (error) {
 
     return {
      success: false,
      message: error?.response?.data?.message || 'Something went wrong',
    };
  }
};



// ✅ authService.js

export const signupWithUsername = async (
  email: string, 
  password: string, 
  username: string
): Promise<ApiResponse<UserProfile>> => {
  try {
    const response = await axiosInstance.post('/signup', {
      email_id: email,
      password: password,
      username: username,
    });

    return {
      success: true,
      data: response?.data?.result as UserProfile,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
     return {
      success: false,
      message: err?.response?.data?.message || 'Signup failed',
    };
  }
};



export const logoutApi = async (token: string) => {
   try {
    const response = await axiosInstance.post(
      '/logout',
      {}, // empty JSON body
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response.status === 200) {
       return true;
    } else {
       return false;
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
     return false;
  }
};

// export const getMovieMetadata_Api = async (imdb_id: string, token: string) => {
//   try {
//     const response = await axiosInstance.get(`/movie-metadata?imdb_id=${imdb_id}`, {
//       headers: {
//         Authorization: `Token ${token}`,
//       },
//     });

//     if (response.status === 200) {
 //       return response.data;
//     } else {
 //       return null;
//     }
//   } catch (error) {
 //     return null;
//   }
// };


// 1



export const sendResetOTP = async (email: string): Promise<ApiResponse> => {
   try {
    const sanitizedEmail = ensureEmail(email);

    const response = await axiosInstance.get(`/verify-email`, {
      params: createSafeParams({
        email_id: sanitizedEmail,
        purpose: "reset_password",
      }),
    });
     return { success: true, message: response.data.message };
  } catch (error: unknown) {
     const err = error as { response?: { data?: { message?: string } } };
    const msg = err?.response?.data?.message || "Failed to send OTP";
     return { success: false, message: msg };
  }
};

// 2
export const verifyResetOTP = async (
  email: string, 
  code: string
): Promise<ApiResponse> => {
  try {
    const sanitizedEmail = ensureEmail(email);
    const sanitizedCode = ensureStringField(code, 'Verification code', {
      minLength: 1,
      maxLength: 20,
    });

    const response = await axiosInstance.post(`/confirm-email-code`, {
      email_id: sanitizedEmail,
      code: sanitizedCode,
      purpose: "reset_password",
    });
     return { success: true, message: response.data.verification };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    const msg = err?.response?.data?.message || "OTP verification failed";
     return { success: false, message: msg };
  }
};



//3 Password Reset
// export const resetPassword = async (email: string, newPassword: string) => {
//   const trimmedEmail = email.toLowerCase();
 
//   try {
//     const response = await axiosPublic.post(`/reset-password`, {
//       email_id: email,  // Ensure this matches backend expectations
//       password: newPassword,  // Some APIs expect "new_password" instead
//     });
//     Alert.alert("password__change")
 //     return {
//       success: true,
//       data: response?.data
//     };
//   } catch (error) {
 //     return {
//       success: false,
//       message: error.response?.data?.message || "Password reset failed"
//     };
//   }
// };


export const resetPassword = async (
  email: string, 
  newPassword: string
): Promise<ApiResponse> => {
  const sanitizedEmail = ensureEmail(email);
  const sanitizedPassword = ensureStringField(newPassword, 'Password', {
    minLength: 6,
    maxLength: 256,
  });
 
  try {
    const response = await axiosInstance.post(
      `/reset-password`,
      {
        email_id: sanitizedEmail,
        password: sanitizedPassword,
      }
    );

    Alert.alert("Password changed successfully!");
     return {
      success: true,
      data: response?.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
     return {
      success: false,
      message: err.response?.data?.message || "Password reset failed",
    };
  }
};

export const changePassword = async (
  token: string, 
  newPassword: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post('/change-password', {
      password: newPassword,
    }, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return {
      success: response.status === 200 && response.data?.password_reset === "success",
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
     return {
      success: false,
      message: err?.response?.data?.message || "Password change failed",
    };
  }
};



// user profile  update


export const updateUserProfile = async (
  token: string,
  data: UpdateProfileData
): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.put(`/user-profile`, data, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
     return response.data as UserProfile;
  } catch (error) {
     throw error;
  }
};


export const getUserProfile = async (token: string): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get(`/user-profile`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
     return response.data as UserProfile;
  } catch (error) {
     throw error;
  }
};




// export const uploadAvatarImage = async (token: string, image) => {
//   try {
 

//     const formData = new FormData();
//     formData.append('avatar', {
//       uri: image?.path || image?.uri,
//       type: image?.mime || 'image/jpeg',
//       name: 'avatar.jpg',
//     });

//     const response = await axios.post(
//       'http://reelrecs.us-east-1.elasticbeanstalk.com/v1/avatar',
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Token ${token}`,
//         },
//       }
//     );
 
//     // getUserProfile(token)

//     return response;
//   } catch (error) {
 //     throw error;
//   }
// };

export interface ImagePickerResult {
  path?: string;
  uri?: string;
  mime?: string;
}
export const uploadAvatarImage = async (
  token: string, 
  image: ImagePickerResult
): Promise<{ data: { avatar_url: string } }> => {

  // ✅ allowed image mime types
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

   if (!image?.mime || !allowedTypes.includes(image.mime)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WEBP images are allowed.");
  }

  try {
    const formData = new FormData();

    formData.append('avatar', {
      uri: image?.path || image?.uri,
      type: image.mime, // ✅ now safe
      name: 'avatar.jpg',
    } as unknown as Blob);

    const response = await axiosInstance.post(
      `/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${token}`,
        },
      }
    );

    return response; 
  } catch (error: unknown) {
    throw error;
  }
};

// export const uploadAvatarImage = async (
//   token: string, 
//   image: ImagePickerResult
// ): Promise<{ data: { avatar_url: string } }> => {
//   try {
//     const formData = new FormData();
//     formData.append('avatar', {
//       uri: image?.path || image?.uri,
//       type: image?.mime || 'image/jpeg',
//       name: 'avatar.jpg',
//     } as unknown as Blob);

//     const response = await axiosInstance.post(
//       `/avatar`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Token ${token}`,
//         },
//       }
//     );

//      return response; 
//   } catch (error: unknown) {
//     const err = error as { response?: { data?: unknown }; message?: string };
//      throw error;
//   }
// };

export const updateProfileFlags = async (
  token: string, 
  flags: ProfileFlags
): Promise<{ data: UserProfile }> => {
  try {
    const response = await axiosInstance.put(`/user-profile`,
      flags,
      {headers : {
        Authorization : `Token ${token}`
      }}
    )
     return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
     throw error;  
  }
}


export const appNotification = async (token: string): Promise<{ results: unknown[] }> => {
  try {
    const response = await axiosInstance.get(`/notifications`, {
      headers: {
        Authorization: `Token ${token}`
      }
    })
     return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
     throw error;
  }
}