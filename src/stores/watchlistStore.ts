import { create } from 'zustand';
import type { Movie, WatchlistItem, WatchlistStore } from '../types';
import { StorageService } from '@/services/storage';

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  watchlist: [],

  addToWatchlist: (movie: Movie) => {
    try {
      StorageService.addMovie(movie);
      
      // Update store state
      const newWatchlistItem: WatchlistItem = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        addedAt: new Date().toISOString()
      };
      
      set(state => ({
        watchlist: [...state.watchlist, newWatchlistItem]
      }));
    } catch (error) {
      console.error('Error adding movie to watchlist:', error);
      // Re-sync with storage in case of inconsistency
      get().loadWatchlist();
      throw error;
    }
  },

  removeFromWatchlist: (movieId: number) => {
    try {
      StorageService.removeMovie(movieId);
      
      // Update store state
      set(state => ({
        watchlist: state.watchlist.filter(item => item.id !== movieId)
      }));
    } catch (error) {
      console.error('Error removing movie from watchlist:', error);
      // Re-sync with storage in case of inconsistency
      get().loadWatchlist();
      throw error;
    }
  },

  isInWatchlist: (movieId: number) => {
    return get().watchlist.some(item => item.id === movieId);
  },

  loadWatchlist: () => {
    try {
      const watchlist = StorageService.getWatchlist();
      set({ watchlist });
    } catch (error) {
      console.error('Error loading watchlist:', error);
      set({ watchlist: [] });
    }
  },

  clearWatchlist: () => {
    try {
      StorageService.clearWatchlist();
      set({ watchlist: [] });
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      throw error;
    }
  },
}));