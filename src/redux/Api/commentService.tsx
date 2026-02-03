import axiosInstance from "@redux/Api/axiosInstance";
import { ApiResponse, safeApiCall } from "@utils/apiErrorHandler";
import { 
  validateImdbId, 
  validatePage,
  validatePageSize,
  validateString,
  createSafeParams,
  throwValidationError 
} from "@utils/apiInputValidator";

// Comment response type
interface CommentData {
  id: number;
  username: string;
  comment: string;
  created_at: string;
  avatar?: string;
}

interface CommentsResponse {
  results: CommentData[];
  current_page: number;
  total_pages: number;
  has_commented: boolean;
}

/**
 * Get comments for a movie
 * @param imdb_id - IMDB ID of the movie
 * @param page - Page number (default 1)
 * @param page_size - Items per page (default 20)
 * @returns ApiResponse with paginated comments
 */
export const getCommentsByMovie = (
  imdb_id: string,
  page: number = 1,
  page_size: number = 20
): Promise<ApiResponse<CommentsResponse>> =>
  safeApiCall(
    async () => {
      // Validate inputs
      const imdbValidation = validateImdbId(imdb_id);
      const pageValidation = validatePage(page);
      const pageSizeValidation = validatePageSize(page_size);

      if (!imdbValidation.isValid) {
        throwValidationError('IMDB ID', imdbValidation.error);
      }

      const res = await axiosInstance.get('/comments', {
        params: createSafeParams({
          imdb_id: imdbValidation.sanitized,
          page: String(pageValidation.value),
          page_size: String(pageSizeValidation.value),
        }),
      });

      return res.data;
    },
    'Failed to fetch comments'
  );

/**
 * Post a new comment on a movie
 * @param imdb_id - IMDB ID of the movie
 * @param comment - Comment text
 * @returns ApiResponse with posted comment data
 */
export const postComment = (
  imdb_id: string, 
  comment: string
): Promise<ApiResponse<CommentData>> =>
  safeApiCall(
    async () => {
      // Validate inputs
      const imdbValidation = validateImdbId(imdb_id);
      const commentValidation = validateString(comment, {
        fieldName: 'Comment',
        required: true,
        minLength: 1,
        maxLength: 1000,
      });

      if (!imdbValidation.isValid) {
        throwValidationError('IMDB ID', imdbValidation.error);
      }
      if (!commentValidation.isValid) {
        throwValidationError('Comment', commentValidation.error);
      }

      const response = await axiosInstance.post('/comment', {
        imdb_id: imdbValidation.sanitized,
        comment: commentValidation.sanitized,
      });
      return response.data;
    },
    'Failed to post comment'
  );

/**
 * Update an existing comment
 * @param imdb_id - IMDB ID of the movie
 * @param comment - Updated comment text
 * @returns ApiResponse with updated comment data
 */
export const updateComment = (
  imdb_id: string, 
  comment: string
): Promise<ApiResponse<CommentData>> =>
  safeApiCall(
    async () => {
      // Validate inputs
      const imdbValidation = validateImdbId(imdb_id);
      const commentValidation = validateString(comment, {
        fieldName: 'Comment',
        required: true,
        minLength: 1,
        maxLength: 1000,
      });

      if (!imdbValidation.isValid) {
        throwValidationError('IMDB ID', imdbValidation.error);
      }
      if (!commentValidation.isValid) {
        throwValidationError('Comment', commentValidation.error);
      }

      const response = await axiosInstance.put('/comment', {
        imdb_id: imdbValidation.sanitized,
        comment: commentValidation.sanitized,
      });
      return response.data;
    },
    'Failed to update comment'
  );

/**
 * Delete a comment
 * @param imdb_id - IMDB ID of the movie
 * @returns ApiResponse with deletion result
 */
export const deleteComment = (imdb_id: string): Promise<ApiResponse<{ message: string }>> =>
  safeApiCall(
    async () => {
      // Validate input
      const imdbValidation = validateImdbId(imdb_id);

      if (!imdbValidation.isValid) {
        throwValidationError('IMDB ID', imdbValidation.error);
      }

      const response = await axiosInstance.delete('/comment', {
        data: { imdb_id: imdbValidation.sanitized },
      });
      return response.data;
    },
    'Failed to delete comment'
  );