 import { AxiosResponse } from "axios";
import {
  validateImdbId,
  validateString,
  createSafeParams,
  throwValidationError,
} from '@utils/apiInputValidator';
import { Platform, User } from "@types/api.types";
import { API_ENDPOINTS } from "@config/api.config";
import axiosInstance from "./axiosInstance";

// ✅ Use relative path - axiosInstance already has baseURL configured
const BOOKMARK_ENDPOINT = API_ENDPOINTS.BOOKMARK.LIST;

interface GetMoviePlatformsParams {
  token: string;
  imdb_id: string;
  country?: string;
  watch_type?: string;
}

export const getMoviePlatforms = async ({
  token,
  imdb_id,
  country,
  watch_type,
}: GetMoviePlatformsParams): Promise<AxiosResponse<{ platforms: Platform[] }> | Platform[]> => {
  try {
    // Validate IMDB ID
    const imdbIdValidation = validateImdbId(imdb_id);
    if (!imdbIdValidation.isValid) {
      throwValidationError('IMDB ID', imdbIdValidation.error);
    }

    // Build params
    const params: Record<string, string> = { imdb_id: imdbIdValidation.sanitized };
    
    if (country) {
      const countryValidation = validateString(country, {
        fieldName: 'Country',
        maxLength: 10,
      });
      if (countryValidation.isValid) {
        params.country = countryValidation.sanitized;
      }
    }
    
    if (watch_type) {
      const watchTypeValidation = validateString(watch_type, {
        fieldName: 'Watch type',
        maxLength: 50,
      });
      if (watchTypeValidation.isValid) {
        params.watch_type = watchTypeValidation.sanitized;
      }
    }

     const response = await axiosInstance.get('/platforms', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams(params),
    });
     return response;
  } catch (error) {
     return [];
  }
};



export const getRecentActiveUsers = async (token: string): Promise<AxiosResponse<{ results: User[] }>> => {
  try {
    const response = await axiosInstance.get<{ results: User[] }>('/recent-active-users', {
      headers: { Authorization: `Token ${token}` },
    });
 
    return response; // don't wrap in `[]`, let caller handle .data?.results
  } catch (error) {
     // Create a minimal AxiosResponse-like object
    return {
      data: { results: [] },
      status: 500,
      statusText: 'Error',
      headers: {},
      config: {} ,
    } as AxiosResponse<{ results: User[] }>;
  }
};

export const getOthereUsers = async (token: string, username: string): Promise<AxiosResponse<User> | User[]> => {
   try {
     const response = await axiosInstance.get<User>('/user-profile', {
      params: { username },
      headers: { Authorization: `Token ${token}` },
    });
     return response || [];
  } catch (error) {
     return [];
  }
};

export const userBookMark = async (token: string): Promise<AxiosResponse<BookmarksResponse> | undefined> => {
  try {
    const response = await axiosInstance.get<BookmarksResponse>("/bookmarks",
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
 
    return response;
  } catch (error) {
     return undefined;
  }
};
interface Bookmark {
  imdb_id: string;
  title: string;
  imdb_rating: number;
  release_year: number;
  cover_image_url: string;
  rec_score?: number;
}

interface BookmarksResponse {
  current_page: number;
  total_pages: number;
  results: Bookmark[];
}

export const getUserBookmarks = async (token: string): Promise<BookmarksResponse> => {
   try {
    const response = await axiosInstance.get("/bookmarks", {
      headers: { Authorization: `Token ${token}` },
    });
     return response.data; // ✅ only the useful data
  } catch (error) {
     throw error;
  }
};

// export const toggleBookmark = async (token: string, imdb_id: string): Promise<boolean> => {
//   try {
//     // Try to add bookmark first
//     await axiosInstance.post(
//       "/bookmark",
//       { imdb_id },
//       { headers: { Authorization: `Token ${token}` } }
//     );
 
 //     return true; // Successfully bookmarked
//   } catch (error) {
//     if (error.response?.status === 409) {
 
//       // Already bookmarked → remove it
//       try {
//         await axiosInstance.delete("/bookmark", {
//           headers: { Authorization: `Token ${token}` },
//           data: { imdb_id },
//         });
 //         return false;
//       } catch (deleteError) {
  //       }
//     } else {
 //       throw error;
//     }
//   }
// };




export const toggleBookmark = async (token: string, imdb_id: string): Promise<boolean> => {
  const headers = { Authorization: `Token ${token}` };

  try {
    // Try adding first
    const addRes = await axiosInstance.post(BOOKMARK_ENDPOINT, { imdb_id }, { headers });
 
    if (addRes.status === 200 || addRes.status === 201) {
 
       return true; // Added
    }
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown } };
    if (err?.response?.status === 409) {
       // Already exists → Try deleting
      const delRes = await axiosInstance.delete(BOOKMARK_ENDPOINT, {
        headers,
        data: { imdb_id },
      });

       if (delRes.status === 200) {
         return false; // Removed
      }
    } else {
       throw error;
    }
  }

  return false;
};




export const getOtherUserBookmarks = async (token: string, username?: string,page = 1): Promise<BookmarksResponse> => {
  try {
    // Validate inputs
    const { validateUsername, validatePage } = await import('../../utils/apiInputValidator');
    
    const params: Record<string> = {};
    
    if (username) {
      const usernameValidation = validateUsername(username);
      if (usernameValidation.isValid) {
        params.username = usernameValidation.sanitized;
      } else {
       }
    }
    
    const pageValidation = validatePage(page);
    if (pageValidation.isValid) {
      params.page = pageValidation.value;
    }

    const response = await axiosInstance.get('/bookmarks', {
      headers: { Authorization: `Token ${token}` },
      params: createSafeParams(params),
    });
    return response.data;
  } catch (error) {
     throw error;
  }
};



// matching movie 

// l

export const getMatchingMovies = async (
  token: string,
  imdb_id: string
) => {
  try {
    // Validate IMDB ID
    const imdbIdValidation = validateImdbId(imdb_id);
    if (!imdbIdValidation.isValid) {
      throwValidationError('IMDB ID', imdbIdValidation.error);
    }

    const response = await axiosInstance.get('/matching-movies', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams({ imdb_id: imdbIdValidation.sanitized }),
    });
    return response.data;
  } catch (error) {
     throw error;
  }
};



// history api

export const getHistoryApi = async (token: string, username?: string,page = 1) => {
  try {
    // Validate inputs
    const { validateUsername, validatePage } = await import('../../utils/apiInputValidator');

    const params: Record<string, string[]> = {};

    const pageValidation = validatePage(page);
    if (pageValidation.isValid) {
      params.page = pageValidation.value;
    }
    
    if (username) {
      const usernameValidation = validateUsername(username);
      if (usernameValidation.isValid) {
        params.username = usernameValidation.sanitized;
      } else {
       }
    }

    const response = await axiosInstance.get('/history', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams(params),
    });
     return response.data; // ✅ return result
  } catch (error) {
     return null;
  }
};
