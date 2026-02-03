import axiosInstance from "@redux/Api/axiosInstance";
import { 
  Movie, 
  MovieMetadata, 
  Episode, 
  PaginatedResponse, 
  PairwiseDecisionPayload, 
  CalculateRatingPayload,
  TrailerInteractionData 
} from "@types/api.types";
import {
  validateImdbId,
  validateUsername,
  validatePage,
  validatePageSize,
  validateSearchQuery,
  validateString,
  createSafeParams,
  throwValidationError,
} from '@utils/apiInputValidator';
import { API_ENDPOINTS } from "@config/api.config";

// export const Trending_without_Filter = async (params) => {
//     try {
//         const response = await axiosInstance.get(params.url, {
//             headers: {
//                 Authorization: `Token ${params.token}`
//             }
//         })
 //         return response;

//     } catch {
 //         return { success: false, error: error?.response?.data || error.message };
//     }
// }

interface TrendingParams {
  url: string;
  token: string;
}

export const Trending_without_Filter = async (params: TrendingParams): Promise<PaginatedResponse<Movie>> => {
  try {
    const encodedUrl = encodeURI(params.url);
 
    const response = await axiosInstance.get(encodedUrl, {
      headers: {
        Authorization: `Token ${params.token}`,
      },
    });
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};



export const getUniqueGenres = async (
  token: string,
  options?: { signal?: AbortSignal }
): Promise<{ genres: string[] }> => {
  try {
    const response = await axiosInstance.get(`/unique-genres`, {
      headers: {
        Authorization: `Token ${token}`,
      },
      signal: options?.signal,
    });
    return response.data;
  } catch (error) {
     throw error;
  }
};

export const searchMovies = async (query: string, token: string): Promise<{ data: Movie[] }> => {
   try {
    const response = await axiosInstance.get('/search?', {
      params: { query },
      headers: { Authorization: `Token ${token}` },
    });
     return response;
  } catch (error: unknown) {
    const err = error as { message?: string };
     return { data: [] };
  }
};



export const getRatedMovies = async (token: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
  try {
    // Validate page
    const pageValidation = validatePage(page);
    if (!pageValidation.isValid) {
     }

    const response = await axiosInstance.get('/rated-movies', {
      headers: { Authorization: `Token ${token}` },
      params: createSafeParams({ page: pageValidation.value }),
    });
     return response.data;
  } catch (error) {
     throw error;
  }
};



export const homeDiscoverApi = async (token: string, url: string) => {
 
  try {
    const response = await axiosInstance.get(`${url}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
     return response.data
  } catch (error) {
   }
}

// without pagination
export const getAllRatedMovies = async (token: string) => {
  try {
    const response = await axiosInstance.get(`/ranked-movies`, {
      headers: { Authorization: `Token ${token}` }
    });
     return response.data;
  } catch (error) {
     throw error;
  }
};

// without pagination
export const getAllRated_with_preference = async (token: string, preference: string) => {
  try {
    // Validate preference
    const preferenceValidation = validateString(preference, {
      fieldName: 'Preference',
      required: true,
      maxLength: 50,
    });
    
    if (!preferenceValidation.isValid) {
      throwValidationError('Preference', preferenceValidation.error);
    }

    const response = await axiosInstance.get('/ranked-movies', {
      headers: { Authorization: `Token ${token}` },
      params: createSafeParams({ preference: preferenceValidation.sanitized }),
    });
     return response.data;
  } catch (error) {
     throw error;
  }
};



export const recordPairwiseDecision = async (token: string, payload: PairwiseDecisionPayload) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.MOVIE.RECORD_DECISION,
    payload,
    { headers: { Authorization: `Token ${token}` } }
  );
 
  return response.data;
};

export const recordPairwiseDecision1 = async (token: string, payload: PairwiseDecisionPayload) => {
   const response = await axiosInstance.post(
    API_ENDPOINTS.MOVIE.RECORD_DECISION_WITH_RATING,
    payload,
    { headers: { Authorization: `Token ${token}` } }
  );
   return response.data;
};


export const getOtherUserRatedMovies = async (token: string, username?: string,page = 1 ) => {
   try {
    const response = await axiosInstance.get(`/rated-movies?username=${username}&page=${page}`, {
      headers: { Authorization: `Token ${token}` },
    })
     return response.data
  } catch (error) {
     throw error
  }
}



export const getCommonBookmarks = async (token: string, page =1 ) => {
  try {
    const response = await axiosInstance.get(`/bookmarks?page=${page}`, {
      headers: { Authorization: `Token ${token}` },
    })
     return response.data
  } catch (error) {
     throw error
  }
}


export const getCommonBookmarkOtherUser = async (token: string,username:string, page=1) => {
  try {
    // Validate inputs
    const usernameValidation = validateUsername(username);
    const pageValidation = validatePage(page);
    
    if (!usernameValidation.isValid) {
      throwValidationError('Username', usernameValidation.error);
    }

    const response = await axiosInstance.get('/bookmarks-common', {
      headers: { Authorization: `Token ${token}` },
      params: createSafeParams({ 
        username: usernameValidation.sanitized,
        page: pageValidation.value
      }),
    })
     return response.data
  } catch (error) {
     throw error
  }
}


export const getMovieMetadata = async (token: string, imdb_id: string): Promise<MovieMetadata> => {
  try {
    // Validate IMDB ID
    const imdbIdValidation = validateImdbId(imdb_id);
    if (!imdbIdValidation.isValid) {
      throwValidationError('IMDB ID', imdbIdValidation.error);
    }

    const response = await axiosInstance.get('/movie-metadata', {
      headers: { Authorization: `Token ${token}` },
      params: createSafeParams({ imdb_id: imdbIdValidation.sanitized }),
    });
 

    return response.data;
  } catch (error) {
     throw error;
  };
};

export const getEpisodes = async (token: string, imdb_id: string): Promise<Episode[]> => {
  try {
    // Validate IMDB ID
    const imdbIdValidation = validateImdbId(imdb_id);
    if (!imdbIdValidation.isValid) {
      throwValidationError('IMDB ID', imdbIdValidation.error);
    }

    const response = await axiosInstance.get('/episodes', {
      headers: { Authorization: `Token ${token}` },
      params: createSafeParams({ imdb_id: imdbIdValidation.sanitized }),
    })
     return response.data;
  } catch (error) {
     throw error;
  }
}

export const getEpisodesBySeason = async (token: string, imdb_id: string, season: number): Promise<Episode[]> => {
   try {
    const response = await axiosInstance.get(`episodes?imdb_id=${imdb_id}&season=${season}`, {
      headers: { Authorization: `Token ${token}` },
    });
     return response.data;
  } catch (error) {
     throw error;
  }
};


export const getRankingSuggestionMovie = async (token: string, page = 1) => {
  try {
    // page = 2
    const response = await axiosInstance.get(`/suggest-movies`, {
      headers: {
        Authorization: `Token ${token}`
      },
      params: { page }
    })
      return response.data
  } catch (error) {
     throw error;
  }
};

export const recordTrailerInteraction = async (
  token: string,
  data: TrailerInteractionData
): Promise<{ success: boolean }> => {
 
  try {
    const response = await axiosInstance.post(`/record-user-trailer-interaction`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
 
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};

export const calculateMovieRating = async (
  token: string,
  payload: CalculateRatingPayload
): Promise<boolean> => {
   try {
    const response = await axiosInstance.post(
      '/calculate-movie-rating',
      payload,
      {
        headers: { Authorization: `Token ${token}` },
      }
    );
    
     return true;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
     throw error;
  }
};



export const rollbackPairwiseDecisions = async (
  token: string,
  imdbId: string
): Promise<{ success: boolean; message?: string }> => {
 
  try {
    const response = await axiosInstance.delete('/rollback-pairwise-decisions', {
      headers: { Authorization: `Token ${token}` },
      data: { imdb_id: imdbId },
    });

     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
     throw error;
  }
};



// const handleCalculateRating = async (token) => {
//   try {
//    // your token
//     const response = await calculateMovieRating(token, {
//       imdb_id: 'tt0898266',
//       preference: 'love',
//     });

 //   } catch (err) {
 //   }
// };
