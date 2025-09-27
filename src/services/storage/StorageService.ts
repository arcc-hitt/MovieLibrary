import type { Movie, WatchlistItem } from '../../types';

/**
 * Service for managing watchlist data in localStorage
 * Provides CRUD operations with proper error handling
 */
export class StorageService {
  private static readonly WATCHLIST_KEY = 'movie-library-watchlist';

  /**
   * Retrieves the complete watchlist from localStorage
   * @returns Array of watchlist items, empty array if none found or on error
   */
  static getWatchlist(): WatchlistItem[] {
    try {
      const stored = localStorage.getItem(this.WATCHLIST_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      
      // Validate that the parsed data is an array
      if (!Array.isArray(parsed)) {
        console.warn('Invalid watchlist data format, resetting to empty array');
        this.saveWatchlist([]);
        return [];
      }

      // Validate each item has required properties
      const validItems = parsed.filter(this.isValidWatchlistItem);
      
      // If some items were invalid, save the cleaned list
      if (validItems.length !== parsed.length) {
        console.warn('Some watchlist items were invalid and have been removed');
        this.saveWatchlist(validItems);
      }

      return validItems;
    } catch (error) {
      console.error('Error reading watchlist from localStorage:', error);
      // Reset to empty array on error
      this.saveWatchlist([]);
      return [];
    }
  }

  /**
   * Saves the complete watchlist to localStorage
   * @param watchlist - Array of watchlist items to save
   */
  static saveWatchlist(watchlist: WatchlistItem[]): void {
    try {
      const serialized = JSON.stringify(watchlist);
      localStorage.setItem(this.WATCHLIST_KEY, serialized);
    } catch (error) {
      console.error('Error saving watchlist to localStorage:', error);
      throw new Error('Failed to save watchlist. Storage may be full or unavailable.');
    }
  }

  /**
   * Adds a movie to the watchlist
   * @param movie - Movie to add to watchlist
   * @throws Error if movie is already in watchlist or save fails
   */
  static addMovie(movie: Movie): void {
    const currentWatchlist = this.getWatchlist();
    
    // Check if movie is already in watchlist
    if (currentWatchlist.some(item => item.id === movie.id)) {
      throw new Error('Movie is already in watchlist');
    }

    // Convert Movie to WatchlistItem
    const watchlistItem: WatchlistItem = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      addedAt: new Date().toISOString()
    };

    const updatedWatchlist = [...currentWatchlist, watchlistItem];
    this.saveWatchlist(updatedWatchlist);
  }

  /**
   * Removes a movie from the watchlist by ID
   * @param movieId - ID of the movie to remove
   * @throws Error if movie is not found in watchlist
   */
  static removeMovie(movieId: number): void {
    const currentWatchlist = this.getWatchlist();
    const movieIndex = currentWatchlist.findIndex(item => item.id === movieId);
    
    if (movieIndex === -1) {
      throw new Error('Movie not found in watchlist');
    }

    const updatedWatchlist = currentWatchlist.filter(item => item.id !== movieId);
    this.saveWatchlist(updatedWatchlist);
  }

  /**
   * Checks if a movie is in the watchlist
   * @param movieId - ID of the movie to check
   * @returns true if movie is in watchlist, false otherwise
   */
  static isInWatchlist(movieId: number): boolean {
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.id === movieId);
  }

  /**
   * Clears the entire watchlist
   */
  static clearWatchlist(): void {
    try {
      localStorage.removeItem(this.WATCHLIST_KEY);
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      throw new Error('Failed to clear watchlist');
    }
  }

  /**
   * Gets the count of items in the watchlist
   * @returns Number of items in watchlist
   */
  static getWatchlistCount(): number {
    return this.getWatchlist().length;
  }

  /**
   * Validates if an object is a valid WatchlistItem
   * @param item - Object to validate
   * @returns true if valid WatchlistItem, false otherwise
   */
  private static isValidWatchlistItem(item: unknown): item is WatchlistItem {
    if (typeof item !== 'object' || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.id === 'number' &&
      typeof obj.title === 'string' &&
      (obj.poster_path === null || typeof obj.poster_path === 'string') &&
      typeof obj.release_date === 'string' &&
      typeof obj.addedAt === 'string'
    );
  }
}