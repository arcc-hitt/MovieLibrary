import { create } from 'zustand';
import { Movie, MovieStore, APIError } from '../types';
import { tmdbService } from '../services';

/**
 * Movie store for managing API data and search functionality
 * Handles popular movies, search results, loading states, and errors
 */
export const useMovieStore = create<MovieStore>((set, get) => ({
  // State
  popularMovies: [],
  searchResults: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  // Actions
  fetchPopularMovies: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await tmdbService.getInstance().getPopularMovies();
      set({ 
        popularMovies: response.results,
        isLoading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as APIError)?.status_message || 'Failed to fetch popular movies';
      
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
      const response = await tmdbService.getInstance().searchMovies(trimmedQuery);
      set({ 
        searchResults: response.results,
        isLoading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as APIError)?.status_message || 'Failed to search movies';
      
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