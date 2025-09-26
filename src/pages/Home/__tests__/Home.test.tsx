import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

// Mock the stores
const mockMovieStore = {
  popularMovies: [] as any[],
  searchResults: [] as any[],
  isLoading: false,
  error: null as string | null,
  searchQuery: '',
  fetchPopularMovies: vi.fn(),
  searchMovies: vi.fn(),
  clearSearch: vi.fn(),
};

const mockWatchlistStore = {
  watchlist: [],
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
  isInWatchlist: vi.fn(() => false),
  loadWatchlist: vi.fn(),
};

vi.mock('@/stores/movieStore', () => ({
  useMovieStore: vi.fn(() => mockMovieStore),
}));

vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: vi.fn(() => mockWatchlistStore),
}));

// Mock components
vi.mock('@/components/SearchBar/SearchBar', () => ({
  SearchBar: ({ onSearch, placeholder, isLoading }: any) => (
    <div data-testid="search-bar">
      <input
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        disabled={isLoading}
      />
    </div>
  ),
}));

vi.mock('@/components/MovieCard/MovieCard', () => ({
  MovieCard: ({ movie, isInWatchlist, onAddToWatchlist }: any) => (
    <div data-testid={`movie-card-${movie.id}`}>
      <h3>{movie.title}</h3>
      <button onClick={() => onAddToWatchlist(movie)}>
        {isInWatchlist ? 'Remove' : 'Add'}
      </button>
    </div>
  ),
}));

vi.mock('@/components/MovieCard/MovieCardSkeleton', () => ({
  MovieCardSkeleton: () => <div data-testid="movie-skeleton">Loading...</div>,
}));

const HomeWrapper = () => (
  <BrowserRouter>
    <Home />
  </BrowserRouter>
);

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMovieStore.popularMovies = [];
    mockMovieStore.searchResults = [];
    mockMovieStore.isLoading = false;
    mockMovieStore.error = null;
    mockMovieStore.searchQuery = '';
  });

  it('renders the home page with popular movies title', () => {
    render(<HomeWrapper />);
    
    expect(screen.getByText('Popular Movies')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('calls fetchPopularMovies and loadWatchlist on mount', () => {
    render(<HomeWrapper />);
    
    expect(mockMovieStore.fetchPopularMovies).toHaveBeenCalled();
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled();
  });

  it('shows loading skeletons when loading', () => {
    mockMovieStore.isLoading = true;
    
    render(<HomeWrapper />);
    
    const skeletons = screen.getAllByTestId('movie-skeleton');
    expect(skeletons).toHaveLength(10);
  });

  it('displays popular movies when loaded', () => {
    const mockMovies = [
      { id: 1, title: 'Movie 1', poster_path: '/poster1.jpg', release_date: '2023-01-01' },
      { id: 2, title: 'Movie 2', poster_path: '/poster2.jpg', release_date: '2023-02-01' },
    ];
    
    mockMovieStore.popularMovies = mockMovies;
    
    render(<HomeWrapper />);
    
    expect(screen.getByTestId('movie-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('movie-card-2')).toBeInTheDocument();
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    mockMovieStore.error = 'Failed to load movies';
    
    render(<HomeWrapper />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to load movies')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows empty state when no movies are available', () => {
    mockMovieStore.popularMovies = [];
    
    render(<HomeWrapper />);
    
    expect(screen.getByText('No movies available')).toBeInTheDocument();
    expect(screen.getByText('Unable to load popular movies at the moment.')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const mockSearchResults = [
      { id: 3, title: 'Search Result', poster_path: '/search.jpg', release_date: '2023-03-01' },
    ];
    
    mockMovieStore.searchResults = mockSearchResults;
    mockMovieStore.searchQuery = 'search';
    
    render(<HomeWrapper />);
    
    const searchInput = screen.getByPlaceholderText('Search for movies...');
    fireEvent.change(searchInput, { target: { value: 'search' } });
    
    expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('search');
  });

  it('shows search results when searching', () => {
    const mockSearchResults = [
      { id: 3, title: 'Search Result', poster_path: '/search.jpg', release_date: '2023-03-01' },
    ];
    
    mockMovieStore.searchResults = mockSearchResults;
    mockMovieStore.searchQuery = 'search';
    
    render(<HomeWrapper />);
    
    // Simulate that a search has been performed
    fireEvent.change(screen.getByPlaceholderText('Search for movies...'), { target: { value: 'search' } });
    
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('Showing results for "search"')).toBeInTheDocument();
  });

  it('handles adding movies to watchlist', () => {
    const mockMovies = [
      { id: 1, title: 'Movie 1', poster_path: '/poster1.jpg', release_date: '2023-01-01' },
    ];
    
    mockMovieStore.popularMovies = mockMovies;
    
    render(<HomeWrapper />);
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledWith(mockMovies[0]);
  });
});