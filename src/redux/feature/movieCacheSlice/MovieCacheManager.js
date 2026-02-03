 
const MAX_CACHE_SIZE = 15;
const movieCache = new Map(); // key = imdb_id, value = movie object

export const getCachedMovie = (imdb_id) => {
  if (movieCache.has(imdb_id)) {
    const movie = movieCache.get(imdb_id);
    movieCache.delete(imdb_id);
    movieCache.set(imdb_id, movie); // refresh LRU position
    return movie;
  }
  return null;
};

export const setCachedMovie = (imdb_id, data) => {
  if (!imdb_id || !data) return;

  if (movieCache.has(imdb_id)) {
    movieCache.delete(imdb_id);
  } else if (movieCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = movieCache.keys().next().value;
    movieCache.delete(oldestKey); // evict LRU
  }

  movieCache.set(imdb_id, data);

  

  // Optional: print all cached movie IDs (for debugging)
 };

export const clearMovieCache = () => {
  movieCache.clear();
 };

export const getCacheSize = () => movieCache.size;