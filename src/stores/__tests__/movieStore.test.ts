import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMovieStore } from '../movieStore';
import { tmdbService } from '../../services';
import type { TMDBMovieResponse, Movie } from '../../types';

// Mock the TMDB service
const mockTMDBService = {
  getPopularMovies: vi.fn(),
  searchMovies: vi.fn(),
};

vi.mock('../../services', () => ({
  tmdbService: {
    getInstance: vi.fn(() => mockTMDBService),
  },
}));

describe('MovieStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMovieStore.setState({
      popularMovies: [],
      searchResults: [],
      isLoading: false,
      error: null,
      searchQuery: '',
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Test Movie 1',
      poster_path: '/test1.jpg',
      release_date: '2023-01-01',
      overview: 'Test overview 1',
      vote_average: 8.5,
      genre_ids: [28, 12],
    },
    {
      id: 2,
      title: 'Test Movie 2',
      poster_path: '/test2.jpg',
      release_date: '2023-02-01',
      overview: 'Test overview 2',
      vote_average: 7.2,
      genre_ids: [35, 18],
    },
  ];

  const mockResponse: TMDBMovieResponse = {
    page: 1,
    results: mockMovies,
    total_pages: 1,
    total_results: 2,
  };

  describe('fetchPopularMovies', () => {
    it('should fetch popular movies successfully', async () => {
      vi.mocked(mockTMDBService.getPopularMovies).mockResolvedValue(mockResponse);

      const store = useMovieStore.getState();
      await store.fetchPopularMovies();

      const state = useMovieStore.getState();
      expect(state.popularMovies).toEqual(mockMovies);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(mockTMDBService.getPopularMovies).toHaveBeenCalledOnce();
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: TMDBMovieResponse) => void;
      const promise = new Promise<TMDBMovieResponse>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockTMDBService.getPopularMovies.mockReturnValue(promise);

      const store = useMovieStore.getState();
      const fetchPromise = store.fetchPopularMovies();

      // Check loading state is true during fetch
      expect(useMovieStore.getState().isLoading).toBe(true);
      expect(useMovieStore.getState().error).toBe(null);

      // Resolve the promise
      resolvePromise!(mockResponse);
      await fetchPromise;

      // Check final state
      expect(useMovieStore.getState().isLoading).toBe(false);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      vi.mocked(mockTMDBService.getPopularMovies).mockRejectedValue(new Error(errorMessage));

      const store = useMovieStore.getState();
      await store.fetchPopularMovies();

      const state = useMovieStore.getState();
      expect(state.popularMovies).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle TMDB API errors', async () => {
      const apiError = {
        status_code: 401,
        status_message: 'Invalid API key',
        success: false,
      };
      vi.mocked(mockTMDBService.getPopularMovies).mockRejectedValue(apiError);

      const store = useMovieStore.getState();
      await store.fetchPopularMovies();

      const state = useMovieStore.getState();
      expect(state.error).toBe('Invalid API key');
    });
  });

  describe('searchMovies', () => {
    it('should search movies successfully', async () => {
      const query = 'test movie';
      vi.mocked(mockTMDBService.searchMovies).mockResolvedValue(mockResponse);

      const store = useMovieStore.getState();
      await store.searchMovies(query);

      const state = useMovieStore.getState();
      expect(state.searchResults).toEqual(mockMovies);
      expect(state.searchQuery).toBe(query);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(mockTMDBService.searchMovies).toHaveBeenCalledWith(query);
    });

    it('should clear search when query is empty', async () => {
      // Set initial search state
      useMovieStore.setState({
        searchResults: mockMovies,
        searchQuery: 'previous query',
      });

      const store = useMovieStore.getState();
      await store.searchMovies('');

      const state = useMovieStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(mockTMDBService.searchMovies).not.toHaveBeenCalled();
    });

    it('should clear search when query is only whitespace', async () => {
      const store = useMovieStore.getState();
      await store.searchMovies('   ');

      const state = useMovieStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(mockTMDBService.searchMovies).not.toHaveBeenCalled();
    });

    it('should trim search query', async () => {
      const query = '  test movie  ';
      const trimmedQuery = 'test movie';
      vi.mocked(mockTMDBService.searchMovies).mockResolvedValue(mockResponse);

      const store = useMovieStore.getState();
      await store.searchMovies(query);

      const state = useMovieStore.getState();
      expect(state.searchQuery).toBe(trimmedQuery);
      expect(mockTMDBService.searchMovies).toHaveBeenCalledWith(trimmedQuery);
    });

    it('should handle search errors', async () => {
      const errorMessage = 'Search failed';
      vi.mocked(mockTMDBService.searchMovies).mockRejectedValue(new Error(errorMessage));

      const store = useMovieStore.getState();
      await store.searchMovies('test');

      const state = useMovieStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('clearSearch', () => {
    it('should clear search results and query', () => {
      // Set initial search state
      useMovieStore.setState({
        searchResults: mockMovies,
        searchQuery: 'test query',
        error: 'some error',
      });

      const store = useMovieStore.getState();
      store.clearSearch();

      const state = useMovieStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(state.error).toBe(null);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Test error';
      const store = useMovieStore.getState();
      store.setError(errorMessage);

      const state = useMovieStore.getState();
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      // Set initial error
      useMovieStore.setState({ error: 'some error' });

      const store = useMovieStore.getState();
      store.setError(null);

      const state = useMovieStore.getState();
      expect(state.error).toBe(null);
    });
  });
});