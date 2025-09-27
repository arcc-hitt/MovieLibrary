import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMovies } from '../useMovies';
import { useMovieStore } from '../../stores/movieStore';
import type { Movie } from '../../types';

// Mock the movie store
vi.mock('../../stores/movieStore');

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

describe('useMovies', () => {
  const mockFetchPopularMovies = vi.fn();
  const mockSearchMovies = vi.fn();
  const mockClearSearch = vi.fn();
  const mockSetError = vi.fn();

  const mockedUseMovieStore = vi.mocked(useMovieStore);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    mockedUseMovieStore.mockReturnValue({
      popularMovies: [],
      searchResults: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPopularMovies: mockFetchPopularMovies,
      searchMovies: mockSearchMovies,
      clearSearch: mockClearSearch,
      setError: mockSetError,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useMovies());

      expect(result.current.movies).toEqual([]);
      expect(result.current.popularMovies).toEqual([]);
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.isSearching).toBe(false);
      expect(result.current.hasMovies).toBe(false);
      expect(result.current.isEmpty).toBe(true);
    });

    it('should fetch popular movies on mount when no movies exist', async () => {
      renderHook(() => useMovies());

      await waitFor(() => {
        expect(mockFetchPopularMovies).toHaveBeenCalledTimes(1);
      });
    });

    it('should not fetch popular movies if they already exist', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: mockMovies,
        searchResults: [],
        isLoading: false,
        error: null,
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      renderHook(() => useMovies());

      expect(mockFetchPopularMovies).not.toHaveBeenCalled();
    });

    it('should not fetch popular movies if already loading', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: true,
        error: null,
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      renderHook(() => useMovies());

      expect(mockFetchPopularMovies).not.toHaveBeenCalled();
    });

    it('should not fetch popular movies if there is an error', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: false,
        error: 'Test error',
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      renderHook(() => useMovies());

      expect(mockFetchPopularMovies).not.toHaveBeenCalled();
    });
  });

  describe('movie data handling', () => {
    it('should return popular movies when not searching', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: mockMovies,
        searchResults: [],
        isLoading: false,
        error: null,
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      expect(result.current.movies).toEqual(mockMovies);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.hasMovies).toBe(true);
      expect(result.current.isEmpty).toBe(false);
    });

    it('should return search results when searching', () => {
      const searchResults = [mockMovies[0]];
      
      mockedUseMovieStore.mockReturnValue({
        popularMovies: mockMovies,
        searchResults,
        isLoading: false,
        error: null,
        searchQuery: 'test',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      expect(result.current.movies).toEqual(searchResults);
      expect(result.current.isSearching).toBe(true);
      expect(result.current.hasMovies).toBe(true);
      expect(result.current.isEmpty).toBe(false);
    });

    it('should show empty state when no movies and not loading', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: false,
        error: null,
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      expect(result.current.isEmpty).toBe(true);
      expect(result.current.hasMovies).toBe(false);
    });

    it('should not show empty state when loading', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: true,
        error: null,
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      expect(result.current.isEmpty).toBe(false);
    });

    it('should not show empty state when there is an error', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: false,
        error: 'Test error',
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      expect(result.current.isEmpty).toBe(false);
    });
  });

  describe('retry functionality', () => {
    it('should retry fetching popular movies when not searching', async () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: false,
        error: 'Test error',
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      await act(async () => {
        result.current.retry();
      });

      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockFetchPopularMovies).toHaveBeenCalled();
    });

    it('should retry search when searching', async () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: mockMovies,
        searchResults: [],
        isLoading: false,
        error: 'Search error',
        searchQuery: 'test query',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      await act(async () => {
        result.current.retry();
      });

      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockSearchMovies).toHaveBeenCalledWith('test query');
    });

    it('should retry popular movies specifically', async () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: false,
        error: 'Test error',
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      await act(async () => {
        result.current.retryFetchPopular();
      });

      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockFetchPopularMovies).toHaveBeenCalled();
    });

    it('should retry search specifically', async () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: mockMovies,
        searchResults: [],
        isLoading: false,
        error: 'Search error',
        searchQuery: 'test query',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      await act(async () => {
        result.current.retrySearch();
      });

      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockSearchMovies).toHaveBeenCalledWith('test query');
    });

    it('should not retry search if no search query', async () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: mockMovies,
        searchResults: [],
        isLoading: false,
        error: 'Search error',
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      await act(async () => {
        result.current.retrySearch();
      });

      expect(mockSearchMovies).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should clear error', async () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: [],
        searchResults: [],
        isLoading: false,
        error: 'Test error',
        searchQuery: '',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      await act(async () => {
        result.current.clearError();
      });

      expect(mockSetError).toHaveBeenCalledWith(null);
    });
  });

  describe('store integration', () => {
    it('should expose all store actions', () => {
      const { result } = renderHook(() => useMovies());

      expect(typeof result.current.fetchPopularMovies).toBe('function');
      expect(typeof result.current.searchMovies).toBe('function');
      expect(typeof result.current.clearSearch).toBe('function');
    });

    it('should expose all store state', () => {
      mockedUseMovieStore.mockReturnValue({
        popularMovies: mockMovies,
        searchResults: [mockMovies[0]],
        isLoading: true,
        error: 'Test error',
        searchQuery: 'test',
        fetchPopularMovies: mockFetchPopularMovies,
        searchMovies: mockSearchMovies,
        clearSearch: mockClearSearch,
        setError: mockSetError,
      });

      const { result } = renderHook(() => useMovies());

      expect(result.current.popularMovies).toEqual(mockMovies);
      expect(result.current.searchResults).toEqual([mockMovies[0]]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe('Test error');
      expect(result.current.searchQuery).toBe('test');
    });
  });
});