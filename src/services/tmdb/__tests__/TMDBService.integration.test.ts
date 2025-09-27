import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { TMDBService } from '../TMDBService';

// Mock axios for integration tests
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('TMDBService Integration Tests', () => {
  let tmdbService: TMDBService;
  interface MockAxiosInstance {
    get: ReturnType<typeof vi.fn>;
    interceptors: { request: { use: ReturnType<typeof vi.fn> }; response: { use: ReturnType<typeof vi.fn> } };
  }
  let mockAxiosInstance: MockAxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };
    
  (mockedAxios.create as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockAxiosInstance);
    tmdbService = new TMDBService();
  });

  describe('Error handling integration', () => {
    it('should handle axios errors and pass them through', async () => {
      const axiosError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(tmdbService.getPopularMovies()).rejects.toThrow('Network Error');
    });

    it('should handle API errors and pass them through', async () => {
      const apiError = {
        status_code: 401,
        status_message: 'Invalid API key',
        success: false,
      };
      
      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(tmdbService.searchMovies('test')).rejects.toEqual(apiError);
    });

    it('should handle response validation errors', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { invalid: 'response' } });

      await expect(tmdbService.getPopularMovies()).rejects.toThrow(
        'Invalid response structure from TMDB API'
      );
    });
  });

  describe('Image URL construction', () => {
    it('should handle various image path formats', () => {
      const testCases = [
        { input: '/poster.jpg', size: 'w500', expected: 'https://image.tmdb.org/t/p/w500/poster.jpg' },
        { input: 'poster.jpg', size: 'w780', expected: 'https://image.tmdb.org/t/p/w780/poster.jpg' },
        { input: '/path/to/poster.jpg', size: 'original', expected: 'https://image.tmdb.org/t/p/original/path/to/poster.jpg' },
        { input: null, size: 'w500', expected: null },
        { input: '', size: 'w500', expected: null },
      ];

      testCases.forEach(({ input, size, expected }) => {
        expect(tmdbService.getImageURL(input, size)).toBe(expected);
      });
    });
  });

  describe('API parameter validation', () => {
    it('should validate search query parameters', async () => {
      const invalidQueries = ['', '   ', '\t\n'];
      
      for (const query of invalidQueries) {
        await expect(tmdbService.searchMovies(query)).rejects.toThrow(
          'Search query cannot be empty'
        );
      }
    });

    it('should handle page parameters correctly', async () => {
      const mockResponse = {
        data: {
          page: 2,
          results: [],
          total_pages: 10,
          total_results: 200,
        },
      };
      
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await tmdbService.getPopularMovies(2);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular', {
        params: { 
          page: 2,
          language: 'en-US',
        },
      });

      await tmdbService.searchMovies('test', 3);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie', {
        params: { 
          query: 'test', 
          page: 3,
          include_adult: false,
        },
      });
    });
  });
});