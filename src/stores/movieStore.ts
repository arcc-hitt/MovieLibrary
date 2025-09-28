import { create } from 'zustand';
import type { MovieStore } from '../types';
import { tmdbService } from '../services';

export const useMovieStore = create<MovieStore>((set, get) => ({
  popularMovies: [],
  searchResults: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  fetchPopularMovies: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await tmdbService.getPopularMovies();
      set({ 
        popularMovies: response.results,
        isLoading: false,
        error: null 
      });
    } catch (error) {
      let errorMessage = 'Failed to fetch popular movies';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'status_message' in error) {
        errorMessage = (error as any).status_message;
      }
      
      console.error('Error fetching popular movies:', error);
      set({ 
        isLoading: false, 
        error: errorMessage,
        popularMovies: [] 
      });
    }
  },

  searchMovies: async (query: string) => {
    const trimmedQuery = query.trim();
    
    // Clear search if query is empty
    if (!trimmedQuery) {
      get().clearSearch();
      return;
    }

    set({ 
      isLoading: true, 
      error: null, 
      searchQuery: trimmedQuery 
    });

    try {
      const response = await tmdbService.searchMovies(trimmedQuery);
      set({ 
        searchResults: response.results,
        isLoading: false,
        error: null 
      });
    } catch (error) {
      let errorMessage = 'Failed to search movies';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'status_message' in error) {
        errorMessage = (error as any).status_message;
      }
      
      console.error('Error searching movies:', error);
      set({ 
        isLoading: false, 
        error: errorMessage,
        searchResults: [] 
      });
    }
  },

  clearSearch: () => {
    set({ 
      searchResults: [], 
      searchQuery: '', 
      error: null 
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));