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
import { t } from "i18next";
import { Alert } from "react-native";

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

/** Normalize any list API response to PaginatedResponse<Movie> so both trending and suggest-movies use the same shape. */
function normalizePaginatedMovies(data: Record<string, unknown> | null | undefined): PaginatedResponse<Movie> {
  const raw = data ?? {};
  const inner = raw.data && typeof raw.data === 'object' && raw.data !== null ? (raw.data as Record<string, unknown>) : raw;
  const list =
    inner.results ?? inner.movies ?? inner.movie ?? raw.results ?? raw.movies ?? raw.movie ?? [];
  const results = Array.isArray(list) ? list : [];
  const total_pages = Number(inner.total_pages ?? inner.total_pages_count ?? raw.total_pages ?? raw.total_pages_count ?? 1);
  const current_page = Number(inner.current_page ?? inner.page ?? raw.current_page ?? raw.page ?? 1);
  return {
    results,
    total_pages: total_pages < 1 ? 1 : total_pages,
    current_page: current_page < 1 ? 1 : current_page,
  };
}

function getPageFromUrl(url: string): number {
  const match = url.match(/[?&]page=(\d+)/i);
  const page = match ? parseInt(match[1], 10) : 1;
  return Number.isFinite(page) && page >= 1 ? page : 1;
}

export const Trending_without_Filter = async (params: TrendingParams): Promise<PaginatedResponse<Movie>> => {
  const pageFromUrl = getPageFromUrl(params.url);

  const fetchSuggestFallback = async (page: number = pageFromUrl): Promise<PaginatedResponse<Movie>> => {
    const suggestResponse = await axiosInstance.get('/suggest-movies', {
      headers: { Authorization: `Token ${params.token}` },
      params: { page, country: 'US' },
    });
    return normalizePaginatedMovies(suggestResponse?.data);
  };

  try {
    const encodedUrl = encodeURI(params.url);

    const response = await axiosInstance.get(encodedUrl, {
      headers: {
        Authorization: `Token ${params.token}`,
      },
    });
    const data = response?.data ?? {};
    const normalized = normalizePaginatedMovies(data);
    const results = normalized.results ?? [];

    if (results.length === 0) {
      // For bookmarks, return empty; do not show recommend-movies / suggest fallback
      if (params.url.includes('bookmarks')) {
        return normalized;
      }
      return fetchSuggestFallback(pageFromUrl);
    }

    return normalized;
  } catch (error: unknown) {
    // Only use suggest fallback for recommend-movies, not for bookmarks
    const useSuggestFallback = params.url.includes('recommend-movies');
    if (useSuggestFallback) {
      try {
        return await fetchSuggestFallback(pageFromUrl);
      } catch (_) {
        throw error;
      }
    }
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

export interface SearchMoviesResponse {
  data: {
    results: Movie[];
    total_pages: number;
    page?: number;
  };
}

const SEARCH_PAGE_SIZE = 20;

export const searchMovies = async (
  query: string,
  token: string,
  page: number = 1,
  pageSize: number = SEARCH_PAGE_SIZE
): Promise<SearchMoviesResponse> => {
  try {
    const pageValidation = validatePage(page);
    const response = await axiosInstance.get('/search?', {
      params: {
        query: validateSearchQuery(query).sanitized || query,
        page: pageValidation.isValid ? pageValidation.value : 1,
        page_size: pageSize,
      },
      headers: { Authorization: `Token ${token}` },
    });
    const data = response?.data ?? {};
    return {
      data: {
        results: data.results ?? [],
        total_pages: data.total_pages ?? 1,
        page: data.page ?? page,
      },
    };
  } catch (error: unknown) {
    return { data: { results: [], total_pages: 1 } };
  }
};

// export const searchMovies = async (query: string, token: string, page: number = 1): Promise<any> => {
//   try {
//     const response = await axiosInstance.get('/v1/search?', {
//       params: { query }, // ✅ Added page parameter
//       headers: { Authorization: `Token ${token}` },
//     });
//     return response // Return the whole object to get total_pages
//   } catch (error) {
//     return { results: [], total_pages: 0 };
//   }
// };

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
  return Trending_without_Filter({ token, url });
}

// without pagination
export const getAllRatedMovies = async (token: string, page = 1) => {
  try {
    const response = await axiosInstance.get(`/ranked-movies`, {
      headers: { Authorization: `Token ${token}` },
      params: { page }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// without pagination
export const getAllRated_with_preference = async (token: string, preference: string, page = 1) => {
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
      params: createSafeParams({ preference: preferenceValidation.sanitized, page }),
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


export const getOtherUserRatedMovies = async (token: string, username?: string, page = 1) => {

  try {
    const response = await axiosInstance.get(`/rated-movies?username=${username}&page=${page}`, {
      headers: { Authorization: `Token ${token}` },
    })
    return response.data
  } catch (error) {
    throw error
  }
}



export const getCommonBookmarks = async (token: string, page = 1) => {
  try {
    const response = await axiosInstance.get(`/bookmarks?page=${page}`, {
      headers: { Authorization: `Token ${token}` },
    })
    return response.data
  } catch (error) {
    throw error
  }
}


export const getCommonBookmarkOtherUser = async (token: string, username: string, page = 1) => {
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

export const getEpisodesBySeason = async (token: string, imdb_id: string, season: number): Promise<Episode[] | Record<string, unknown>> => {
  try {
    const imdbIdValidation = validateImdbId(imdb_id);
    if (!imdbIdValidation.isValid) {
      throwValidationError('IMDB ID', imdbIdValidation.error);
    }
    const response = await axiosInstance.get('/episodes', {
      headers: { Authorization: `Token ${token}` },
      params: { imdb_id: imdbIdValidation.sanitized, season },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getRankingSuggestionMovie = async (token: string, page = 1) => {
  try {
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

export const deleteRatedMovie = async (
  token: string,
  imdbId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.delete('/delete-rated-movie', {
      headers: { Authorization: `Token ${token}` },
      data: { imdb_id: imdbId },
    });
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};
