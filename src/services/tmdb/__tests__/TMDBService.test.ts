import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { TMDBService } from '../TMDBService';
import type { TMDBMovieResponse, APIError } from '../../../types/api';
import type { Movie } from '../../../types/movie';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
  },
}));
const mockedAxios = vi.mocked(axios);

describe('TMDBService', () => {
  let tmdbService: TMDBService;
  let mockAxiosInstance: any;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/test-poster.jpg',
    release_date: '2023-01-01',
    overview: 'A test movie',
    vote_average: 8.5,
    genre_ids: [28, 12],
  };

  const mockMovieResponse: TMDBMovieResponse = {
    page: 1,
    results: [mockMovie],
    total_pages: 1,
    total_results: 1,
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock axios.create
    mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };

    (mockedAxios.create as any).mockReturnValue(mockAxiosInstance);

    // Create new service instance
    tmdbService = new TMDBService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.themoviedb.org/3',
        timeout: 10000,
        headers: {
          'Authorization': expect.stringMatching(/^Bearer .+/),
          'Content-Type': 'application/json;charset=utf-8',
        },
      });
    });

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('getPopularMovies', () => {
    it('should fetch popular movies successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockMovieResponse });

      const result = await tmdbService.getPopularMovies();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular', {
        params: { 
          page: 1,
          language: 'en-US',
        },
      });
      expect(result).toEqual(mockMovieResponse);
    });

    it('should fetch popular movies with custom page', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockMovieResponse });

      await tmdbService.getPopularMovies(2);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular', {
        params: { 
          page: 2,
          language: 'en-US',
        },
      });
    });

    it('should throw error for invalid response structure', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { invalid: 'response' } });

      await expect(tmdbService.getPopularMovies()).rejects.toThrow(
        'Invalid response structure from TMDB API'
      );
    });

    it('should throw error when results is not an array', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { ...mockMovieResponse, results: 'not-an-array' }
      });

      await expect(tmdbService.getPopularMovies()).rejects.toThrow(
        'Invalid response structure from TMDB API'
      );
    });

    it('should handle API errors', async () => {
      const apiError: APIError = {
        status_code: 401,
        status_message: 'Invalid API key',
        success: false,
      };

      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(tmdbService.getPopularMovies()).rejects.toEqual(apiError);
    });

    it('should throw error for invalid page numbers in popular movies', async () => {
      await expect(tmdbService.getPopularMovies(0)).rejects.toThrow(
        'Page must be between 1 and 500'
      );

      await expect(tmdbService.getPopularMovies(501)).rejects.toThrow(
        'Page must be between 1 and 500'
      );
    });
  });

  describe('searchMovies', () => {
    it('should search movies successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockMovieResponse });

      const result = await tmdbService.searchMovies('test query');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie', {
        params: {
          query: 'test query',
          page: 1,
          include_adult: false,
        },
      });
      expect(result).toEqual(mockMovieResponse);
    });

    it('should search movies with custom page', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockMovieResponse });

      await tmdbService.searchMovies('test query', 3);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie', {
        params: {
          query: 'test query',
          page: 3,
          include_adult: false,
        },
      });
    });

    it('should trim whitespace from query', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockMovieResponse });

      await tmdbService.searchMovies('  test query  ');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie', {
        params: {
          query: 'test query',
          page: 1,
          include_adult: false,
        },
      });
    });

    it('should throw error for empty query', async () => {
      await expect(tmdbService.searchMovies('')).rejects.toThrow(
        'Search query cannot be empty'
      );

      await expect(tmdbService.searchMovies('   ')).rejects.toThrow(
        'Search query cannot be empty'
      );
    });

    it('should throw error for invalid page numbers in search', async () => {
      await expect(tmdbService.searchMovies('test', 0)).rejects.toThrow(
        'Page must be between 1 and 1000'
      );

      await expect(tmdbService.searchMovies('test', 1001)).rejects.toThrow(
        'Page must be between 1 and 1000'
      );
    });

    it('should throw error for invalid response structure', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { invalid: 'response' } });

      await expect(tmdbService.searchMovies('test')).rejects.toThrow(
        'Invalid response structure from TMDB API'
      );
    });

    it('should handle API errors', async () => {
      const apiError: APIError = {
        status_code: 404,
        status_message: 'Not found',
        success: false,
      };

      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(tmdbService.searchMovies('test')).rejects.toEqual(apiError);
    });
  });

  describe('getImageURL', () => {
    it('should construct image URL correctly', () => {
      const result = tmdbService.getImageURL('/test-poster.jpg');
      expect(result).toBe('https://image.tmdb.org/t/p/w500/test-poster.jpg');
    });

    it('should construct image URL with custom size', () => {
      const result = tmdbService.getImageURL('/test-poster.jpg', 'w780');
      expect(result).toBe('https://image.tmdb.org/t/p/w780/test-poster.jpg');
    });

    it('should handle path without leading slash', () => {
      const result = tmdbService.getImageURL('test-poster.jpg');
      expect(result).toBe('https://image.tmdb.org/t/p/w500/test-poster.jpg');
    });

    it('should return null for null path', () => {
      const result = tmdbService.getImageURL(null);
      expect(result).toBeNull();
    });

    it('should return null for empty path', () => {
      const result = tmdbService.getImageURL('');
      expect(result).toBeNull();
    });
  });

  describe('getAvailableImageSizes', () => {
    it('should return array of available image sizes', () => {
      const sizes = tmdbService.getAvailableImageSizes();

      expect(sizes).toEqual([
        'w92',
        'w154',
        'w185',
        'w342',
        'w500',
        'w780',
        'original'
      ]);
    });
  });
});