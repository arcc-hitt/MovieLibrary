import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWatchlistStore } from '../watchlistStore';
import { StorageService } from '../../services';
import type { Movie, WatchlistItem } from '../../types';

// Mock the StorageService
vi.mock('../../services', () => ({
  StorageService: {
    getWatchlist: vi.fn(),
    addMovie: vi.fn(),
    removeMovie: vi.fn(),
    clearWatchlist: vi.fn(),
  },
}));

describe('WatchlistStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useWatchlistStore.setState({
      watchlist: [],
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/test.jpg',
    release_date: '2023-01-01',
    overview: 'Test overview',
    vote_average: 8.5,
    genre_ids: [28, 12],
  };

  const mockWatchlistItem: WatchlistItem = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/test.jpg',
    release_date: '2023-01-01',
    addedAt: '2023-01-01T00:00:00.000Z',
  };

  const mockWatchlist: WatchlistItem[] = [
    mockWatchlistItem,
    {
      id: 2,
      title: 'Test Movie 2',
      poster_path: '/test2.jpg',
      release_date: '2023-02-01',
      addedAt: '2023-02-01T00:00:00.000Z',
    },
  ];

  describe('addToWatchlist', () => {
    it('should add movie to watchlist successfully', () => {
      vi.mocked(StorageService.addMovie).mockImplementation(() => {});

      const store = useWatchlistStore.getState();
      store.addToWatchlist(mockMovie);

      const state = useWatchlistStore.getState();
      expect(state.watchlist).toHaveLength(1);
      expect(state.watchlist[0].id).toBe(mockMovie.id);
      expect(state.watchlist[0].title).toBe(mockMovie.title);
      expect(state.watchlist[0].poster_path).toBe(mockMovie.poster_path);
      expect(state.watchlist[0].release_date).toBe(mockMovie.release_date);
      expect(state.watchlist[0].addedAt).toBeDefined();
      expect(StorageService.addMovie).toHaveBeenCalledWith(mockMovie);
    });

    it('should handle storage errors and re-sync', () => {
      const error = new Error('Storage error');
      vi.mocked(StorageService.addMovie).mockImplementation(() => {
        throw error;
      });
      vi.mocked(StorageService.getWatchlist).mockReturnValue(mockWatchlist);

      const store = useWatchlistStore.getState();
      
      expect(() => store.addToWatchlist(mockMovie)).toThrow(error);
      
      // Should re-sync with storage
      expect(StorageService.getWatchlist).toHaveBeenCalled();
      const state = useWatchlistStore.getState();
      expect(state.watchlist).toEqual(mockWatchlist);
    });

    it('should create watchlist item with current timestamp', () => {
      const mockDate = new Date('2023-01-01T12:00:00.000Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
      vi.mocked(StorageService.addMovie).mockImplementation(() => {});

      const store = useWatchlistStore.getState();
      store.addToWatchlist(mockMovie);

      const state = useWatchlistStore.getState();
      expect(state.watchlist[0].addedAt).toBe('2023-01-01T12:00:00.000Z');
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove movie from watchlist successfully', () => {
      // Set initial state with movies
      useWatchlistStore.setState({ watchlist: mockWatchlist });
      vi.mocked(StorageService.removeMovie).mockImplementation(() => {});

      const store = useWatchlistStore.getState();
      store.removeFromWatchlist(1);

      const state = useWatchlistStore.getState();
      expect(state.watchlist).toHaveLength(1);
      expect(state.watchlist[0].id).toBe(2);
      expect(StorageService.removeMovie).toHaveBeenCalledWith(1);
    });

    it('should handle storage errors and re-sync', () => {
      useWatchlistStore.setState({ watchlist: mockWatchlist });
      const error = new Error('Storage error');
      vi.mocked(StorageService.removeMovie).mockImplementation(() => {
        throw error;
      });
      vi.mocked(StorageService.getWatchlist).mockReturnValue([]);

      const store = useWatchlistStore.getState();
      
      expect(() => store.removeFromWatchlist(1)).toThrow(error);
      
      // Should re-sync with storage
      expect(StorageService.getWatchlist).toHaveBeenCalled();
      const state = useWatchlistStore.getState();
      expect(state.watchlist).toEqual([]);
    });
  });

  describe('isInWatchlist', () => {
    it('should return true if movie is in watchlist', () => {
      useWatchlistStore.setState({ watchlist: mockWatchlist });

      const store = useWatchlistStore.getState();
      const result = store.isInWatchlist(1);

      expect(result).toBe(true);
    });

    it('should return false if movie is not in watchlist', () => {
      useWatchlistStore.setState({ watchlist: mockWatchlist });

      const store = useWatchlistStore.getState();
      const result = store.isInWatchlist(999);

      expect(result).toBe(false);
    });

    it('should return false if watchlist is empty', () => {
      const store = useWatchlistStore.getState();
      const result = store.isInWatchlist(1);

      expect(result).toBe(false);
    });
  });

  describe('loadWatchlist', () => {
    it('should load watchlist from storage successfully', () => {
      vi.mocked(StorageService.getWatchlist).mockReturnValue(mockWatchlist);

      const store = useWatchlistStore.getState();
      store.loadWatchlist();

      const state = useWatchlistStore.getState();
      expect(state.watchlist).toEqual(mockWatchlist);
      expect(StorageService.getWatchlist).toHaveBeenCalled();
    });

    it('should handle storage errors and set empty watchlist', () => {
      const error = new Error('Storage error');
      vi.mocked(StorageService.getWatchlist).mockImplementation(() => {
        throw error;
      });

      const store = useWatchlistStore.getState();
      store.loadWatchlist();

      const state = useWatchlistStore.getState();
      expect(state.watchlist).toEqual([]);
    });
  });

  describe('clearWatchlist', () => {
    it('should clear watchlist successfully', () => {
      useWatchlistStore.setState({ watchlist: mockWatchlist });
      vi.mocked(StorageService.clearWatchlist).mockImplementation(() => {});

      const store = useWatchlistStore.getState();
      store.clearWatchlist();

      const state = useWatchlistStore.getState();
      expect(state.watchlist).toEqual([]);
      expect(StorageService.clearWatchlist).toHaveBeenCalled();
    });

    it('should handle storage errors', () => {
      const error = new Error('Storage error');
      vi.mocked(StorageService.clearWatchlist).mockImplementation(() => {
        throw error;
      });

      const store = useWatchlistStore.getState();
      
      expect(() => store.clearWatchlist()).toThrow(error);
    });
  });
});