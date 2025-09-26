import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './StorageService';
import type { Movie, WatchlistItem } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test data
const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  overview: 'A test movie',
  vote_average: 8.5,
  genre_ids: [28, 12],
};

const mockWatchlistItem: WatchlistItem = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  addedAt: '2023-12-01T10:00:00.000Z',
};

const mockWatchlistItem2: WatchlistItem = {
  id: 2,
  title: 'Another Movie',
  poster_path: null,
  release_date: '2023-02-01',
  addedAt: '2023-12-02T10:00:00.000Z',
};

describe('StorageService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('getWatchlist', () => {
    it('should return empty array when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = StorageService.getWatchlist();
      
      expect(result).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('movie-library-watchlist');
    });

    it('should return parsed watchlist when valid data exists', () => {
      const watchlist = [mockWatchlistItem, mockWatchlistItem2];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(watchlist));
      
      const result = StorageService.getWatchlist();
      
      expect(result).toEqual(watchlist);
    });

    it('should handle invalid JSON and reset to empty array', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      localStorageMock.setItem.mockImplementation(() => {});
      
      const result = StorageService.getWatchlist();
      
      expect(result).toEqual([]);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('movie-library-watchlist', '[]');
    });

    it('should handle non-array data and reset to empty array', () => {
      localStorageMock.getItem.mockReturnValue('{"not": "array"}');
      localStorageMock.setItem.mockImplementation(() => {});
      
      const result = StorageService.getWatchlist();
      
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Invalid watchlist data format, resetting to empty array');
    });

    it('should filter out invalid watchlist items', () => {
      const invalidData = [
        mockWatchlistItem,
        { id: 'invalid', title: 123 }, // Invalid item
        mockWatchlistItem2,
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));
      localStorageMock.setItem.mockImplementation(() => {});
      
      const result = StorageService.getWatchlist();
      
      expect(result).toEqual([mockWatchlistItem, mockWatchlistItem2]);
      expect(console.warn).toHaveBeenCalledWith('Some watchlist items were invalid and have been removed');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      localStorageMock.setItem.mockImplementation(() => {});
      
      const result = StorageService.getWatchlist();
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error reading watchlist from localStorage:', expect.any(Error));
    });
  });

  describe('saveWatchlist', () => {
    it('should save watchlist to localStorage', () => {
      const watchlist = [mockWatchlistItem];
      
      StorageService.saveWatchlist(watchlist);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'movie-library-watchlist',
        JSON.stringify(watchlist)
      );
    });

    it('should throw error when localStorage save fails', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      expect(() => StorageService.saveWatchlist([mockWatchlistItem])).toThrow(
        'Failed to save watchlist. Storage may be full or unavailable.'
      );
    });
  });

  describe('addMovie', () => {
    it('should add movie to empty watchlist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementation(() => {});
      
      StorageService.addMovie(mockMovie);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'movie-library-watchlist',
        expect.stringContaining('"id":1')
      );
    });

    it('should add movie to existing watchlist', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockWatchlistItem2]));
      localStorageMock.setItem.mockImplementation(() => {});
      
      StorageService.addMovie(mockMovie);
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[1].id).toBe(1);
      expect(savedData[1].addedAt).toBeDefined();
    });

    it('should throw error when movie already exists in watchlist', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockWatchlistItem]));
      
      expect(() => StorageService.addMovie(mockMovie)).toThrow('Movie is already in watchlist');
    });

    it('should set addedAt timestamp when adding movie', () => {
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementation(() => {});
      const beforeTime = Date.now();
      
      StorageService.addMovie(mockMovie);
      
      const afterTime = Date.now();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      const addedAt = new Date(savedData[0].addedAt).getTime();
      
      expect(addedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(addedAt).toBeLessThanOrEqual(afterTime);
      expect(savedData[0].addedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('removeMovie', () => {
    it('should remove movie from watchlist', () => {
      const watchlist = [mockWatchlistItem, mockWatchlistItem2];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(watchlist));
      localStorageMock.setItem.mockImplementation(() => {});
      
      StorageService.removeMovie(1);
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe(2);
    });

    it('should throw error when movie not found', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockWatchlistItem2]));
      
      expect(() => StorageService.removeMovie(999)).toThrow('Movie not found in watchlist');
    });

    it('should handle empty watchlist when removing', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      expect(() => StorageService.removeMovie(1)).toThrow('Movie not found in watchlist');
    });
  });

  describe('isInWatchlist', () => {
    it('should return true when movie is in watchlist', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockWatchlistItem]));
      
      const result = StorageService.isInWatchlist(1);
      
      expect(result).toBe(true);
    });

    it('should return false when movie is not in watchlist', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockWatchlistItem]));
      
      const result = StorageService.isInWatchlist(999);
      
      expect(result).toBe(false);
    });

    it('should return false for empty watchlist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = StorageService.isInWatchlist(1);
      
      expect(result).toBe(false);
    });
  });

  describe('clearWatchlist', () => {
    it('should remove watchlist from localStorage', () => {
      StorageService.clearWatchlist();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('movie-library-watchlist');
    });

    it('should throw error when localStorage clear fails', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Clear failed');
      });
      
      expect(() => StorageService.clearWatchlist()).toThrow('Failed to clear watchlist');
    });
  });

  describe('getWatchlistCount', () => {
    it('should return correct count for watchlist', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockWatchlistItem, mockWatchlistItem2]));
      
      const count = StorageService.getWatchlistCount();
      
      expect(count).toBe(2);
    });

    it('should return 0 for empty watchlist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const count = StorageService.getWatchlistCount();
      
      expect(count).toBe(0);
    });
  });
});