import { create } from 'zustand';
import type { MovieStore, APIError } from '../types';
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
      let errorMessage = 'Failed to fetch popular movies';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'status_code' in error) {
        const apiError = error as APIError;
        switch (apiError.status_code) {
          case 0:
            errorMessage = 'Unable to connect to the internet. Please check your connection and try again.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'The movie service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = apiError.status_message || errorMessage;
        }
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
      const response = await tmdbService.getInstance().searchMovies(trimmedQuery);
      set({ 
        searchResults: response.results,
        isLoading: false,
        error: null 
      });
    } catch (error) {
      let errorMessage = 'Failed to search movies';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'status_code' in error) {
        const apiError = error as APIError;
        switch (apiError.status_code) {
          case 0:
            errorMessage = 'Unable to connect to the internet. Please check your connection and try again.';
            break;
          case 404:
            errorMessage = 'No movies found matching your search.';
            break;
          case 429:
            errorMessage = 'Too many search requests. Please wait a moment and try again.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'The search service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = apiError.status_message || errorMessage;
        }
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