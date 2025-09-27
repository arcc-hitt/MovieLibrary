import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Watchlist from '../Watchlist';

// Mock the watchlist store
const mockWatchlistStore = {
  watchlist: [] as any[],
  removeFromWatchlist: vi.fn(),
  loadWatchlist: vi.fn(),
};

vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: vi.fn(() => mockWatchlistStore),
}));

// Mock components
vi.mock('@/components/MovieCard/MovieCard', () => ({
  MovieCard: ({ movie, onRemoveFromWatchlist }: any) => (
    <div data-testid={`movie-card-${movie.id}`}>
      <h3>{movie.title}</h3>
      <button onClick={() => onRemoveFromWatchlist(movie.id)}>
        Remove from Watchlist
      </button>
    </div>
  ),
}));

const WatchlistWrapper = () => (
  <BrowserRouter>
    <Watchlist />
  </BrowserRouter>
);

describe('Watchlist Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWatchlistStore.watchlist = [];
  });

  it('renders the watchlist page title', () => {
    render(<WatchlistWrapper />);
    
    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
  });

  it('calls loadWatchlist on mount', () => {
    render(<WatchlistWrapper />);
    
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled();
  });

  it('shows empty state when watchlist is empty', () => {
    render(<WatchlistWrapper />);
    
    expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
    expect(screen.getByText('Start building your watchlist by browsing popular movies and adding the ones you want to watch.')).toBeInTheDocument();
    expect(screen.getByText('Browse Movies')).toBeInTheDocument();
  });

  it('displays watchlist movies when available', () => {
    const mockWatchlist = [
      {
        id: 1,
        title: 'Movie 1',
        poster_path: '/poster1.jpg',
        release_date: '2023-01-01',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'Movie 2',
        poster_path: '/poster2.jpg',
        release_date: '2023-02-01',
        addedAt: '2023-02-01T00:00:00.000Z',
      },
    ];
    
    mockWatchlistStore.watchlist = mockWatchlist;
    
    render(<WatchlistWrapper />);
    
    expect(screen.getByTestId('movie-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('movie-card-2')).toBeInTheDocument();
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('movies saved to watch later')).toBeInTheDocument();
  });

  it('shows singular movie count when watchlist has one movie', () => {
    const mockWatchlist = [
      {
        id: 1,
        title: 'Movie 1',
        poster_path: '/poster1.jpg',
        release_date: '2023-01-01',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
    ];
    
    mockWatchlistStore.watchlist = mockWatchlist;
    
    render(<WatchlistWrapper />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('movie saved to watch later')).toBeInTheDocument();
  });

  it('handles removing movies from watchlist', () => {
    const mockWatchlist = [
      {
        id: 1,
        title: 'Movie 1',
        poster_path: '/poster1.jpg',
        release_date: '2023-01-01',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
    ];
    
    mockWatchlistStore.watchlist = mockWatchlist;
    
    render(<WatchlistWrapper />);
    
    const removeButton = screen.getByText('Remove from Watchlist');
    fireEvent.click(removeButton);
    
    expect(mockWatchlistStore.removeFromWatchlist).toHaveBeenCalledWith(1);
  });

  it('shows browse more movies button when watchlist has movies', () => {
    const mockWatchlist = [
      {
        id: 1,
        title: 'Movie 1',
        poster_path: '/poster1.jpg',
        release_date: '2023-01-01',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
    ];
    
    mockWatchlistStore.watchlist = mockWatchlist;
    
    render(<WatchlistWrapper />);
    
    expect(screen.getByText('Want to add more movies to your watchlist?')).toBeInTheDocument();
    expect(screen.getByText('Browse More Movies')).toBeInTheDocument();
  });

  it('handles movies with missing poster paths', () => {
    const mockWatchlist = [
      {
        id: 1,
        title: 'Movie Without Poster',
        poster_path: null,
        release_date: '2023-01-01',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
    ];
    
    mockWatchlistStore.watchlist = mockWatchlist;
    
    render(<WatchlistWrapper />);
    
    expect(screen.getByTestId('movie-card-1')).toBeInTheDocument();
    expect(screen.getByText('Movie Without Poster')).toBeInTheDocument();
  });
});