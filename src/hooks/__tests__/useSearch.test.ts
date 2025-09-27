import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSearch } from '../useSearch';
import { useMovieStore } from '../../stores/movieStore';
import type { Movie } from '../../types';

// Mock the movie store
vi.mock('../../stores/movieStore');

// Mock timers
vi.useFakeTimers();

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

describe('useSearch', () => {
    const mockSearchMovies = vi.fn();
    const mockClearSearch = vi.fn();
    const mockedUseMovieStore = vi.mocked(useMovieStore);

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementation
        mockedUseMovieStore.mockReturnValue({
            searchResults: [],
            isLoading: false,
            error: null,
            searchQuery: '',
            searchMovies: mockSearchMovies,
            clearSearch: mockClearSearch,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    describe('initialization', () => {
        it('should return correct initial state', () => {
            const { result } = renderHook(() => useSearch());

            expect(result.current.inputValue).toBe('');
            expect(result.current.query).toBe('');
            expect(result.current.results).toEqual([]);
            expect(result.current.isSearching).toBe(false);
            expect(result.current.isDebouncing).toBe(false);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe(null);
            expect(result.current.hasResults).toBe(false);
            expect(result.current.isEmpty).toBe(false);
            expect(result.current.isQueryValid).toBe(false);
        });

        it('should accept custom options', () => {
            const options = {
                debounceMs: 500,
                minQueryLength: 3,
                enableCache: false,
            };

            const { result } = renderHook(() => useSearch(options));

            expect(result.current.debounceMs).toBe(500);
            expect(result.current.minQueryLength).toBe(3);
            expect(result.current.enableCache).toBe(false);
        });
    });

    describe('input handling', () => {
        it('should update input value', () => {
            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            expect(result.current.inputValue).toBe('test');
        });

        it('should validate query length', () => {
            const { result } = renderHook(() => useSearch({ minQueryLength: 3 }));

            act(() => {
                result.current.setQuery('te');
            });

            expect(result.current.isQueryValid).toBe(false);

            act(() => {
                result.current.setQuery('test');
            });

            expect(result.current.isQueryValid).toBe(true);
        });
    });

    describe('debouncing', () => {
        it('should debounce search requests', async () => {
            const { result } = renderHook(() => useSearch({ debounceMs: 300 }));

            act(() => {
                result.current.setQuery('test');
            });

            expect(result.current.isDebouncing).toBe(true);
            expect(mockSearchMovies).not.toHaveBeenCalled();

            // Fast forward time
            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(result.current.isDebouncing).toBe(false);
            expect(mockSearchMovies).toHaveBeenCalledWith('test');
        });

        it('should cancel previous debounce when input changes', async () => {
            const { result } = renderHook(() => useSearch({ debounceMs: 300 }));

            act(() => {
                result.current.setQuery('test');
            });

            expect(result.current.isDebouncing).toBe(true);

            // Change input before debounce completes
            act(() => {
                result.current.setQuery('testing');
                vi.advanceTimersByTime(150); // Advance partway through first debounce
            });

            // Should still be debouncing
            expect(result.current.isDebouncing).toBe(true);
            expect(mockSearchMovies).not.toHaveBeenCalled();

            // Complete the new debounce
            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(mockSearchMovies).toHaveBeenCalledWith('testing');
            expect(mockSearchMovies).toHaveBeenCalledTimes(1);
        });

        it('should not search if query is too short', async () => {
            const { result } = renderHook(() => useSearch({ minQueryLength: 3 }));

            act(() => {
                result.current.setQuery('te');
            });

            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(mockSearchMovies).not.toHaveBeenCalled();
            expect(result.current.isDebouncing).toBe(false);
        });

        it('should clear search immediately when input is empty', () => {
            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            expect(result.current.isDebouncing).toBe(true);

            act(() => {
                result.current.setQuery('');
            });

            expect(result.current.isDebouncing).toBe(false);
            expect(mockClearSearch).toHaveBeenCalled();
        });
    });

    describe('search functionality', () => {
        it('should search immediately with searchNow', async () => {
            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            act(() => {
                result.current.searchNow();
            });

            expect(result.current.isDebouncing).toBe(false);
            expect(mockSearchMovies).toHaveBeenCalledWith('test');
        });

        it('should not search immediately if query is too short', () => {
            const { result } = renderHook(() => useSearch({ minQueryLength: 3 }));

            act(() => {
                result.current.setQuery('te');
            });

            act(() => {
                result.current.searchNow();
            });

            expect(mockSearchMovies).not.toHaveBeenCalled();
        });

        it('should clear search and input', () => {
            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            act(() => {
                result.current.clear();
            });

            expect(result.current.inputValue).toBe('');
            expect(result.current.isDebouncing).toBe(false);
            expect(mockClearSearch).toHaveBeenCalled();
        });
    });

    describe('state flags', () => {
        it('should indicate searching state', () => {
            // Test debouncing state
            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            expect(result.current.isSearching).toBe(true);

            // Test loading state
            vi.mocked(useMovieStore).mockReturnValue({
                searchResults: [],
                isLoading: true,
                error: null,
                searchQuery: '',
                searchMovies: mockSearchMovies,
                clearSearch: mockClearSearch,
            });

            const { result: result2 } = renderHook(() => useSearch());
            expect(result2.current.isSearching).toBe(true);
        });

        it('should indicate has results', () => {
            vi.mocked(useMovieStore).mockReturnValue({
                searchResults: mockMovies,
                isLoading: false,
                error: null,
                searchQuery: 'test',
                searchMovies: mockSearchMovies,
                clearSearch: mockClearSearch,
            });

            const { result } = renderHook(() => useSearch());

            expect(result.current.hasResults).toBe(true);
            expect(result.current.isEmpty).toBe(false);
        });

        it('should indicate empty state', () => {
            vi.mocked(useMovieStore).mockReturnValue({
                searchResults: [],
                isLoading: false,
                error: null,
                searchQuery: 'test',
                searchMovies: mockSearchMovies,
                clearSearch: mockClearSearch,
            });

            const { result } = renderHook(() => useSearch());

            expect(result.current.hasResults).toBe(false);
            expect(result.current.isEmpty).toBe(true);
        });

        it('should not show empty state when there is an error', () => {
            vi.mocked(useMovieStore).mockReturnValue({
                searchResults: [],
                isLoading: false,
                error: 'Search failed',
                searchQuery: 'test',
                searchMovies: mockSearchMovies,
                clearSearch: mockClearSearch,
            });

            const { result } = renderHook(() => useSearch());

            expect(result.current.isEmpty).toBe(false);
        });
    });

    describe('caching', () => {
        it('should cache search results', async () => {
            let storeState = {
                searchResults: [] as Movie[],
                isLoading: false,
                error: null,
                searchQuery: '',
                searchMovies: mockSearchMovies,
                clearSearch: mockClearSearch,
            };

            mockedUseMovieStore.mockImplementation(() => storeState);

            const { result, rerender } = renderHook(() => useSearch({ enableCache: true }));

            // Simulate successful search by updating store state
            storeState = {
                ...storeState,
                searchResults: mockMovies,
                searchQuery: 'test',
            };

            rerender();

            const stats = result.current.getCacheStats();
            expect(stats.totalEntries).toBeGreaterThan(0);
        });

        it('should clear cache', () => {
            const { result } = renderHook(() => useSearch({ enableCache: true }));

            act(() => {
                result.current.clearCache();
            });

            const stats = result.current.getCacheStats();
            expect(stats.totalEntries).toBe(0);
        });

        it('should disable caching when enableCache is false', () => {
            const { result } = renderHook(() => useSearch({ enableCache: false }));

            const stats = result.current.getCacheStats();
            expect(stats.totalEntries).toBe(0);
        });
    });

    describe('cleanup', () => {
        it('should cleanup on unmount', () => {
            const { unmount } = renderHook(() => useSearch());

            // Should not throw any errors
            expect(() => unmount()).not.toThrow();
        });

        it('should cancel pending requests on clear', () => {
            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            act(() => {
                result.current.clear();
            });

            // Should not throw any errors and should clear debouncing
            expect(result.current.isDebouncing).toBe(false);
        });
    });

    describe('store integration', () => {
        it('should expose store state correctly', () => {
            mockedUseMovieStore.mockReturnValue({
                searchResults: mockMovies,
                isLoading: true,
                error: 'Test error',
                searchQuery: 'test query',
                searchMovies: mockSearchMovies,
                clearSearch: mockClearSearch,
            });

            const { result } = renderHook(() => useSearch());

            expect(result.current.results).toEqual(mockMovies);
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBe('Test error');
            expect(result.current.query).toBe('test query');
        });

        it('should call store actions correctly', async () => {
            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(mockSearchMovies).toHaveBeenCalledWith('test');

            act(() => {
                result.current.clear();
            });

            expect(mockClearSearch).toHaveBeenCalled();
        });
    });
});