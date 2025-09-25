// Environment configuration
export const config = {
  tmdb: {
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    baseUrl: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    imageBaseUrl: import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
  },
} as const;

// Validate required environment variables
if (!config.tmdb.apiKey) {
  console.warn('VITE_TMDB_API_KEY is not set. Please add it to your .env file.');
}