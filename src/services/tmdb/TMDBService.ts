import axios, { type AxiosInstance } from 'axios';
import type { TMDBMovieResponse } from '@/types/api';

/**
 * TMDB API Service for fetching movie data
 */
export class TMDBService {
  private client: AxiosInstance;

  constructor() {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const baseURL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

    if (!apiKey) {
      throw new Error('TMDB API key is required');
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
  }

  async getPopularMovies(page: number = 1): Promise<TMDBMovieResponse> {
    if (page < 1 || !Number.isInteger(page)) {
      throw new Error('Page must be a positive integer');
    }

    try {
      const response = await this.client.get<TMDBMovieResponse>('/movie/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch popular movies: ${error.response?.data?.status_message || error.message}`);
      }
      throw error;
    }
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBMovieResponse> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }
    if (page < 1 || !Number.isInteger(page)) {
      throw new Error('Page must be a positive integer');
    }

    try {
      const response = await this.client.get<TMDBMovieResponse>('/search/movie', {
        params: { query: query.trim(), page },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to search movies: ${error.response?.data?.status_message || error.message}`);
      }
      throw error;
    }
  }
}

export const tmdbService = new TMDBService();