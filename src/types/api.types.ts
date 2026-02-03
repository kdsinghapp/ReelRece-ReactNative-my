/**
 * Central Type Definitions for ReelRece API
 * This file contains all shared types to reduce  usage across the codebase
 */

// ============================================
// API RESPONSE TYPES (Standardized)
// ============================================

/**
 * Standardized API Response Type
 * 
 * All API functions should return this type for consistency.
 * Import from '@utils/apiErrorHandler' for helper functions.
 * 
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T> {
  /** Indicates if the API call was successful */
  success: boolean;
  
  /** The data returned from the API (only present on success) */
  data?: T;
  
  /** Error message (only present on failure) */
  error?: string;
  message?: string; // Alias for error (backward compatibility)
  
  /** http status code */
  statusCode?: number;
  
  /** Additional error details for debugging */
  details?: object | string;
}

// ============================================
// USER & AUTH TYPES
// ============================================

export interface UserProfile {
  id?: number;
  username: string;
  email_id?: string;
  name?: string;
  bio?: string;
  pronouns?: string;
  avatar?: string;
  avatar_url?: string;
  
  // Profile flags
  is_private?: 'yes' | 'no';
  autoplay_trailer?: 'yes' | 'no';
  videos_start_with_sound?: 'yes' | 'no';
  group_add_approval_required?: 'yes' | 'no';
  opt_out_third_party_data_sharing?: 'yes' | 'no';
  
  // Social stats
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
  
  // Additional fields that might be returned
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isLogin: boolean;
  userData: UserProfile | null;
  token: string | null;
  userGetData: UserProfile | null;
  logout: boolean | null;
}

export interface ProfileFlags {
  is_private?: 'yes' | 'no';
  autoplay_trailer?: 'yes' | 'no';
  videos_start_with_sound?: 'yes' | 'no';
  group_add_approval_required?: 'yes' | 'no';
  opt_out_third_party_data_sharing?: 'yes' | 'no';
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  pronouns?: string;
  username?: string;
}

// ============================================
// MOVIE & MEDIA TYPES
// ============================================

export interface Movie {
  imdb_id: string;
  title: string;
  imdb_rating?: number;
  release_year?: number;
  cover_image_url?: string;
  poster_url?: string;
  rec_score?: number;
  rating?: number;
  runtime?: number;
  genres?: string[];
  plot?: string;
  director?: string;
  cast?: string[];
  trailer_url?: string;
  content_type?: 'movie' | 'series' | 'episode';
  
  // Additional metadata
  is_bookmarked?: boolean;
  user_rating?: number;
  
  // Series-specific
  total_seasons?: number;
  season_number?: number;
  episode_number?: number;
  parent_imdb_id?: string;
}

export interface MovieMetadata extends Movie {
  platforms?: Platform[];
  matching_movies?: Movie[];
  episodes?: Episode[];
  seasons?: Season[];
}

export interface Episode {
  imdb_id: string;
  title: string;
  episode_number: number;
  season_number: number;
  plot?: string;
  release_date?: string;
  imdb_rating?: number;
  runtime?: number;
}

export interface Season {
  season_number: number;
  episode_count: number;
  episodes?: Episode[];
}

export interface Platform {
  platform_name: string;
  logo_url?: string;
  watch_link?: string;
  watch_type?: 'stream' | 'rent' | 'buy' | 'free';
  price?: string;
  quality?: string;
}

export interface Bookmark {
  imdb_id: string;
  title: string;
  imdb_rating?: number;
  release_year?: number;
  cover_image_url?: string;
  rec_score?: number;
  bookmarked_at?: string;
}

// ============================================
// PAGINATION & API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  current_page: number;
  total_pages: number;
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface BookmarksResponse extends PaginatedResponse<Bookmark> {}
export interface MoviesResponse extends PaginatedResponse<Movie> {}

// Note: ApiResponse is already defined at line 18
// Removed duplicate definition here

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

// ============================================
// RANKING & COMPARISON TYPES
// ============================================

export type PreferenceType = 'love' | 'like' | 'okay' | 'dislike';

export interface PairwiseDecisionPayload {
  imdb_id_1: string;
  imdb_id_2: string;
  winner: string;
  preference: 'love' | 'like' | 'dislike';
}

export interface CalculateRatingPayload {
  imdb_id: string;
  preference: PreferenceType;
}

export interface RankedMovie extends Movie {
  rank?: number;
  user_rating?: number;
  preference?: PreferenceType;
}

// ============================================
// SOCIAL & GROUP TYPES
// ============================================

export interface User {
  id?: number;
  username: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  is_following?: boolean;
  followers_count?: number;
  following_count?: number;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  members_count?: number;
  is_member?: boolean;
  created_by?: User;
  created_at?: string;
}

export interface Comment {
  id: number;
  user: User;
  text: string;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
  replies?: Comment[];
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
  user?: User;
  movie?: Movie;
  group?: Group;
}

// ============================================
// FEED & ACTIVITY TYPES
// ============================================

export interface FeedItem {
  id: number;
  user: User;
  type: 'rating' | 'bookmark' | 'review' | 'list';
  movie?: Movie;
  content?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface Activity {
  id: number;
  type: string;
  user: User;
  movie?: Movie;
  group?: Group;
  description: string;
  created_at: string;
}

// ============================================
// TRAILER INTERACTION TYPES
// ============================================

export interface TrailerInteractionData {
  imdb_id: string;
  trailer_url: string;
  start_at: string;
  end_at: string;
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface SearchParams {
  query?: string;
  genres?: string[];
  year_min?: number;
  year_max?: number;
  rating_min?: number;
  rating_max?: number;
  content_type?: 'movie' | 'series';
  platform?: string;
  country?: string;
}

export interface FilterOptions {
  genres: string[];
  platforms: string[];
  years: { min: number; max: number };
  ratings: { min: number; max: number };
}

// ============================================
// HISTORY TYPES
// ============================================

export interface HistoryItem {
  id: number;
  movie: Movie;
  watched_at: string;
  watch_duration?: number;
  completed?: boolean;
}

export interface HistoryResponse extends PaginatedResponse<HistoryItem> {}

// ============================================
// ADDITIONAL API RESPONSE TYPES
// ============================================

export interface UserFeedResponse extends PaginatedResponse<FeedItem> {}

export interface RecentActiveUsersResponse {
  results: User[];
}

export interface GenresResponse {
  genres: string[];
}

export interface PlatformSubscription {
  platform_name: string;
  subscribed: boolean;
}

export interface SubscriptionsResponse {
  subscriptions: PlatformSubscription[];
}

export interface GroupMembersResponse {
  members: User[];
  count: number;
}

export interface GroupActivitiesResponse {
  activities: Activity[];
}

export interface GroupRecommendedMoviesResponse {
  movies: Movie[];
  count: number;
}

export interface GroupInvitationResponse {
  id: number;
  group: Group;
  invited_by: User;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface NotificationsResponse {
  results: Notification[];
  unread_count?: number;
}

export interface FeedbackRequest {
  type: 'bug' | 'feature' | 'other';
  message: string;
  email?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}
