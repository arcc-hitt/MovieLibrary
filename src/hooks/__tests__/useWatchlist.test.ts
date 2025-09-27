import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWatchlist } from '../useWatchlist';
import { useWatchlistStore } from '../../stores/watchlistStore';
import type { Movie, WatchlistItem } from '../../types';

// Mock the watchlist store
vi.mock('../../stores/watchlistStore');

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test.jpg',
  release_date: '2023-01-01',
  overview: 'Test overview',
  vote_average: 8.5,
  genre_ids: [28, 12],
};

const mockWatchlistItems: WatchlistItem[] = [
  {
    id: 1,
    title: 'A Movie',
    poster_path: '/a.jpg',
    release_date: '2023-01-01',
    addedAt: '2023-12-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'B Movie',
    poster_path: '/b.jpg',
    release_date: '2023-02-01',
    addedAt: '2023-12-02T10:00:00.000Z',
  },
  {
    id: 3,
    title: 'C Movie',
    poster_path: '/c.jpg',
    release_date: '2022-01-01',
    addedAt: '2023-11-30T10:00:00.000Z',
  },
];

describe('useWatchlist', () => {
  const mockAddToWatchlist = vi.fn();
  const mockRemoveFromWatchlist = vi.fn();
  const mockIsInWatchlist = vi.fn();
  const mockLoadWatchlist = vi.fn();
  const mockClearWatchlist = vi.fn();

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  const mockedUseWatchlistStore = vi.mocked(useWatchlistStore);

  beforeEach(() => {
    vi.clearAllMocks();
    // Silence expected error/warn noise produced intentionally by error-path tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Setup default mock implementation
    mockedUseWatchlistStore.mockReturnValue({
      watchlist: [],
      addToWatchlist: mockAddToWatchlist,
      removeFromWatchlist: mockRemoveFromWatchlist,
      isInWatchlist: mockIsInWatchlist,
      loadWatchlist: mockLoadWatchlist,
      clearWatchlist: mockClearWatchlist,
    });

    mockIsInWatchlist.mockReturnValue(false);
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should load watchlist on mount', async () => {
      renderHook(() => useWatchlist());

      await waitFor(() => {
        expect(mockLoadWatchlist).toHaveBeenCalledTimes(1);
      });
    });

    it('should return correct initial state', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(result.current.watchlist).toEqual([]);
      expect(result.current.count).toBe(0);
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.operationError).toBe(null);
    });

    it('should return correct state with watchlist items', () => {
      mockedUseWatchlistStore.mockReturnValue({
        watchlist: mockWatchlistItems,
        addToWatchlist: mockAddToWatchlist,
        removeFromWatchlist: mockRemoveFromWatchlist,
        isInWatchlist: mockIsInWatchlist,
        loadWatchlist: mockLoadWatchlist,
        clearWatchlist: mockClearWatchlist,
      });

      const { result } = renderHook(() => useWatchlist());

      expect(result.current.watchlist).toEqual(mockWatchlistItems);
      expect(result.current.count).toBe(3);
      expect(result.current.isEmpty).toBe(false);
    });
  });

  describe('status checking', () => {
    it('should check if movie is in watchlist', () => {
      mockIsInWatchlist.mockReturnValue(true);

      const { result } = renderHook(() => useWatchlist());

      expect(result.current.isInWatchlist(1)).toBe(true);
      expect(mockIsInWatchlist).toHaveBeenCalledWith(1);
    });

    it('should check if movie is being added', async () => {
      const { result } = renderHook(() => useWatchlist());

      expect(result.current.isMovieBeingAdded(1)).toBe(false);

      // Start adding
      act(() => {
        result.current.addToWatchlist(mockMovie);
      });

      expect(result.current.isMovieBeingAdded(1)).toBe(true);

      // Wait for operation to complete
      await waitFor(() => {
        expect(result.current.isMovieBeingAdded(1)).toBe(false);
      });
    });

    it('should check if movie is being removed', async () => {
      mockIsInWatchlist.mockReturnValue(true);

      const { result } = renderHook(() => useWatchlist());

      expect(result.current.isMovieBeingRemoved(1)).toBe(false);

      // Start removing
      act(() => {
        result.current.removeFromWatchlist(1);
      });

      expect(result.current.isMovieBeingRemoved(1)).toBe(true);

      // Wait for operation to complete
      await waitFor(() => {
        expect(result.current.isMovieBeingRemoved(1)).toBe(false);
      });
    });

    it('should check if any operation is in progress', async () => {
      const { result } = renderHook(() => useWatchlist());

      expect(result.current.isMovieOperationInProgress(1)).toBe(false);

      // Start adding
      act(() => {
        result.current.addToWatchlist(mockMovie);
      });

      expect(result.current.isMovieOperationInProgress(1)).toBe(true);

      // Wait for operation to complete
      await waitFor(() => {
        expect(result.current.isMovieOperationInProgress(1)).toBe(false);
      });
    });
  });

  describe('add to watchlist', () => {
    it('should add movie to watchlist successfully', async () => {
      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.addToWatchlist(mockMovie);
      });

      expect(mockAddToWatchlist).toHaveBeenCalledWith(mockMovie);
      expect(result.current.operationError).toBe(null);
    });

    it('should not add movie if already in watchlist', async () => {
      mockIsInWatchlist.mockReturnValue(true);

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.addToWatchlist(mockMovie);
      });

      expect(mockAddToWatchlist).not.toHaveBeenCalled();
    });

    it('should not add movie if operation is in progress', async () => {
      const { result } = renderHook(() => useWatchlist());

      // Start first operation
      act(() => {
        result.current.addToWatchlist(mockMovie);
      });

      // Try to start second operation
      await act(async () => {
        await result.current.addToWatchlist(mockMovie);
      });

      expect(mockAddToWatchlist).toHaveBeenCalledTimes(1);
    });

    it('should handle add error', async () => {
      const errorMessage = 'Failed to add';
      mockAddToWatchlist.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.addToWatchlist(mockMovie);
      });

      expect(result.current.operationError).toBe(errorMessage);
    });

    it('should handle unknown add error', async () => {
      mockAddToWatchlist.mockImplementation(() => {
        throw 'Unknown error';
      });

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.addToWatchlist(mockMovie);
      });

      expect(result.current.operationError).toBe('Failed to add movie to watchlist');
    });
  });

  describe('remove from watchlist', () => {
    it('should remove movie from watchlist successfully', async () => {
      mockIsInWatchlist.mockReturnValue(true);

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.removeFromWatchlist(1);
      });

      expect(mockRemoveFromWatchlist).toHaveBeenCalledWith(1);
      expect(result.current.operationError).toBe(null);
    });

    it('should not remove movie if not in watchlist', async () => {
      mockIsInWatchlist.mockReturnValue(false);

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.removeFromWatchlist(1);
      });

      expect(mockRemoveFromWatchlist).not.toHaveBeenCalled();
    });

    it('should not remove movie if operation is in progress', async () => {
      mockIsInWatchlist.mockReturnValue(true);

      const { result } = renderHook(() => useWatchlist());

      // Start first operation
      act(() => {
        result.current.removeFromWatchlist(1);
      });

      // Try to start second operation
      await act(async () => {
        await result.current.removeFromWatchlist(1);
      });

      expect(mockRemoveFromWatchlist).toHaveBeenCalledTimes(1);
    });

    it('should handle remove error', async () => {
      const errorMessage = 'Failed to remove';
      mockIsInWatchlist.mockReturnValue(true);
      mockRemoveFromWatchlist.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.removeFromWatchlist(1);
      });

      expect(result.current.operationError).toBe(errorMessage);
    });
  });

  describe('toggle watchlist', () => {
    it('should add movie when not in watchlist', async () => {
      mockIsInWatchlist.mockReturnValue(false);

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.toggleWatchlist(mockMovie);
      });

      expect(mockAddToWatchlist).toHaveBeenCalledWith(mockMovie);
    });

    it('should remove movie when in watchlist', async () => {
      mockIsInWatchlist.mockReturnValue(true);

      const { result } = renderHook(() => useWatchlist());

      await act(async () => {
        await result.current.toggleWatchlist(mockMovie);
      });

      expect(mockRemoveFromWatchlist).toHaveBeenCalledWith(mockMovie.id);
    });
  });

  describe('error handling', () => {
    it('should clear error', async () => {
      mockAddToWatchlist.mockImplementation(() => {
        throw new Error('Test error');
      });

      const { result } = renderHook(() => useWatchlist());

      // Trigger an error
      await act(async () => {
        await result.current.addToWatchlist(mockMovie);
      });

      expect(result.current.operationError).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.operationError).toBe(null);
    });
  });

  describe('utility functions', () => {
    beforeEach(() => {
      mockedUseWatchlistStore.mockReturnValue({
        watchlist: mockWatchlistItems,
        addToWatchlist: mockAddToWatchlist,
        removeFromWatchlist: mockRemoveFromWatchlist,
        isInWatchlist: mockIsInWatchlist,
        loadWatchlist: mockLoadWatchlist,
        clearWatchlist: mockClearWatchlist,
      });
    });

    it('should get watchlist item by ID', () => {
      const { result } = renderHook(() => useWatchlist());

      const item = result.current.getWatchlistItem(1);
      expect(item).toEqual(mockWatchlistItems[0]);

      const nonExistentItem = result.current.getWatchlistItem(999);
      expect(nonExistentItem).toBeUndefined();
    });

    it('should sort watchlist by date added (newest first)', () => {
      const { result } = renderHook(() => useWatchlist());

      const sorted = result.current.sortedWatchlist();
      expect(sorted[0].id).toBe(2); // Most recent
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3); // Oldest
    });

    it('should sort watchlist by title (A-Z)', () => {
      const { result } = renderHook(() => useWatchlist());

      const sorted = result.current.sortedByTitle();
      expect(sorted[0].title).toBe('A Movie');
      expect(sorted[1].title).toBe('B Movie');
      expect(sorted[2].title).toBe('C Movie');
    });

    it('should sort watchlist by release date (newest first)', () => {
      const { result } = renderHook(() => useWatchlist());

      const sorted = result.current.sortedByReleaseDate();
      expect(sorted[0].id).toBe(2); // 2023-02-01
      expect(sorted[1].id).toBe(1); // 2023-01-01
      expect(sorted[2].id).toBe(3); // 2022-01-01
    });

    it('should search within watchlist', () => {
      const { result } = renderHook(() => useWatchlist());

      const results = result.current.searchWatchlist('A Movie');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('A Movie');

      const noResults = result.current.searchWatchlist('Nonexistent');
      expect(noResults).toHaveLength(0);

      const emptyQuery = result.current.searchWatchlist('');
      expect(emptyQuery).toEqual(mockWatchlistItems);

      const caseInsensitive = result.current.searchWatchlist('a movie');
      expect(caseInsensitive).toHaveLength(1);
      expect(caseInsensitive[0].title).toBe('A Movie');
    });
  });

  describe('store integration', () => {
    it('should expose all store actions', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(typeof result.current.clearWatchlist).toBe('function');
      expect(typeof result.current.loadWatchlist).toBe('function');
    });

    it('should call store actions correctly', async () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        result.current.clearWatchlist();
      });

      expect(mockClearWatchlist).toHaveBeenCalled();

      act(() => {
        result.current.loadWatchlist();
      });

      expect(mockLoadWatchlist).toHaveBeenCalled();
    });
  });
});