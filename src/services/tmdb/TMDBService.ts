import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { TMDBMovieResponse, APIError } from '../../types/api';

/**
 * TMDB API Service for fetching movie data
 */
export class TMDBService {
  private client: AxiosInstance;
  private apiKey: string;
  private imageBaseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY;
    this.imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';
    
    if (!this.apiKey) {
      throw new Error('TMDB API key is required. Please set VITE_TMDB_API_KEY in your environment variables.');
    }

    this.client = axios.create({
      baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making TMDB API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log rate limiting info if available
        const remaining = response.headers['x-ratelimit-remaining'];
        const resetTime = response.headers['x-ratelimit-reset'];
        if (remaining && parseInt(remaining) < 10) {
          console.warn(`TMDB API rate limit warning: ${remaining} requests remaining, resets at ${resetTime}`);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          // Handle rate limiting specifically
          if (error.response.status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            console.error(`TMDB API rate limited. Retry after: ${retryAfter} seconds`);
          }
          
          // Server responded with error status
          const apiError: APIError = {
            status_code: error.response.status,
            status_message: error.response.data?.status_message || error.message,
            success: false,
          };
          console.error('TMDB API Error:', apiError);
          return Promise.reject(apiError);
        } else if (error.request) {
          // Network error
          const networkError: APIError = {
            status_code: 0,
            status_message: 'Network error. Please check your internet connection.',
            success: false,
          };
          console.error('Network Error:', networkError);
          return Promise.reject(networkError);
        } else {
          // Other error
          const unknownError: APIError = {
            status_code: -1,
            status_message: error.message || 'An unknown error occurred',
            success: false,
          };
          console.error('Unknown Error:', unknownError);
          return Promise.reject(unknownError);
        }
      }
    );
  }

  /**
   * Fetch popular movies from TMDB
   * @param page - Page number (default: 1)
   * @returns Promise<TMDBMovieResponse>
   */
  async getPopularMovies(page: number = 1): Promise<TMDBMovieResponse> {
    // Validate page parameter
    if (page < 1 || page > 500) {
      throw new Error('Page must be between 1 and 500');
    }

    try {
      const response = await this.client.get<TMDBMovieResponse>('/movie/popular', {
        params: { 
          page,
          language: 'en-US', // Specify language for consistent results
        },
      });
      
      // Validate response structure
      if (!response.data || !Array.isArray(response.data.results)) {
        throw new Error('Invalid response structure from TMDB API');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  }

  /**
   * Search for movies by query
   * @param query - Search query string
   * @param page - Page number (default: 1)
   * @returns Promise<TMDBMovieResponse>
   */
  async searchMovies(query: string, page: number = 1): Promise<TMDBMovieResponse> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    // Validate page parameter
    if (page < 1 || page > 1000) {
      throw new Error('Page must be between 1 and 1000');
    }

    try {
      const response = await this.client.get<TMDBMovieResponse>('/search/movie', {
        params: { 
          query: query.trim(),
          page,
          include_adult: false, // Exclude adult content by default
        },
      });

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.results)) {
        throw new Error('Invalid response structure from TMDB API');
      }

      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  /**
   * Construct image URL for TMDB images
   * @param path - Image path from TMDB API
   * @param size - Image size (default: 'w500')
   * @returns Complete image URL or null if path is invalid
   */
  getImageURL(path: string | null, size: string = 'w500'): string | null {
    if (!path) {
      return null;
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    return `${this.imageBaseUrl}/${size}/${cleanPath}`;
  }

  /**
   * Get available image sizes for reference
   * @returns Array of available image sizes
   */
  getAvailableImageSizes(): string[] {
    return [
      'w92',
      'w154',
      'w185',
      'w342',
      'w500',
      'w780',
      'original'
    ];
  }
}

// Export singleton instance - created lazily to avoid issues with testing
let _tmdbService: TMDBService | null = null;

export const tmdbService = {
  getInstance(): TMDBService {
    if (!_tmdbService) {
      _tmdbService = new TMDBService();
    }
    return _tmdbService;
  },
  
  // For testing purposes
  resetInstance(): void {
    _tmdbService = null;
  }
};