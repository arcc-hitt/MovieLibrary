import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home/Home'
import { useMovieStore } from '@/stores/movieStore'
import { useWatchlistStore } from '@/stores/watchlistStore'

// Mock the stores
const mockMovieStore = {
  popularMovies: [],
  searchResults: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  fetchPopularMovies: vi.fn(),
  searchMovies: vi.fn(),
  clearSearch: vi.fn(),
}

const mockWatchlistStore = {
  watchlist: [],
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
  isInWatchlist: vi.fn(() => false),
  loadWatchlist: vi.fn(),
}

vi.mock('@/stores/movieStore', () => ({
  useMovieStore: vi.fn(() => mockMovieStore),
}))

vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: vi.fn(() => mockWatchlistStore),
}))

// Mock TMDB service
vi.mock('@/services/tmdb', () => ({
  TMDBService: {
    searchMovies: vi.fn(),
    getPopularMovies: vi.fn(),
  },
}))

const mockMovies = [
  {
    id: 1,
    title: 'The Matrix',
    poster_path: '/matrix.jpg',
    release_date: '1999-03-31',
    overview: 'A computer programmer discovers reality is a simulation.',
    vote_average: 8.7,
    genre_ids: [28, 878],
  },
  {
    id: 2,
    title: 'Inception',
    poster_path: '/inception.jpg',
    release_date: '2010-07-16',
    overview: 'A thief enters dreams to plant ideas.',
    vote_average: 8.8,
    genre_ids: [28, 878, 53],
  },
]

const HomeWrapper = () => (
  <BrowserRouter>
    <Home />
  </BrowserRouter>
)

describe('Search Workflow Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockMovieStore.popularMovies = mockMovies
    mockMovieStore.searchResults = []
    mockMovieStore.isLoading = false
    mockMovieStore.error = null
    mockMovieStore.searchQuery = ''
    mockWatchlistStore.watchlist = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should perform complete search workflow', async () => {
    // Mock search results
    const searchResults = [
      {
        id: 3,
        title: 'Matrix Reloaded',
        poster_path: '/reloaded.jpg',
        release_date: '2003-05-15',
        overview: 'Neo continues his fight against the machines.',
        vote_average: 7.2,
        genre_ids: [28, 878],
      },
    ]

    render(<HomeWrapper />)

    // Initially shows popular movies
    expect(screen.getByText('Popular Movies')).toBeInTheDocument()
    expect(mockMovieStore.fetchPopularMovies).toHaveBeenCalled()

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search for movies...')
    expect(searchInput).toBeInTheDocument()

    // Type search query
    await user.type(searchInput, 'matrix')

    // Wait for debounced search
    await waitFor(() => {
      expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('matrix')
    }, { timeout: 1000 })

    // Mock search results being returned
    mockMovieStore.searchResults = searchResults
    mockMovieStore.searchQuery = 'matrix'

    // Re-render with search results
    render(<HomeWrapper />)

    // Should show search results
    expect(screen.getByText('Search Results')).toBeInTheDocument()
    expect(screen.getByText(/Showing results for/)).toBeInTheDocument()

    // Clear search
    const clearButton = screen.getByText('Clear search')
    await user.click(clearButton)

    expect(mockMovieStore.clearSearch).toHaveBeenCalled()
  })

  it('should handle search with no results', async () => {
    render(<HomeWrapper />)

    const searchInput = screen.getByPlaceholderText('Search for movies...')
    await user.type(searchInput, 'nonexistentmovie')

    await waitFor(() => {
      expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('nonexistentmovie')
    })

    // Mock empty search results
    mockMovieStore.searchResults = []
    mockMovieStore.searchQuery = 'nonexistentmovie'

    render(<HomeWrapper />)

    expect(screen.getByText('No movies found')).toBeInTheDocument()
    expect(screen.getByText(/No movies match your search/)).toBeInTheDocument()
  })

  it('should handle search loading state', async () => {
    mockMovieStore.isLoading = true

    render(<HomeWrapper />)

    const searchInput = screen.getByPlaceholderText('Search for movies...')
    expect(searchInput).toBeDisabled()

    // Should show loading skeletons
    const skeletons = screen.getAllByTestId('movie-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should handle search error state', async () => {
    mockMovieStore.error = 'Failed to search movies'

    render(<HomeWrapper />)

    expect(screen.getByText('Failed to Load Movies')).toBeInTheDocument()
    expect(screen.getByText('Failed to search movies')).toBeInTheDocument()

    // Should have retry button
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()

    await user.click(retryButton)
    expect(mockMovieStore.fetchPopularMovies).toHaveBeenCalled()
  })

  it('should maintain search state during navigation', async () => {
    mockMovieStore.searchQuery = 'matrix'
    mockMovieStore.searchResults = [mockMovies[0]]

    render(<HomeWrapper />)

    // Should maintain search state
    const searchInput = screen.getByPlaceholderText('Search for movies...')
    expect(searchInput).toHaveValue('matrix')
    expect(screen.getByText('Search Results')).toBeInTheDocument()
  })

  it('should handle keyboard navigation in search', async () => {
    render(<HomeWrapper />)

    const searchInput = screen.getByPlaceholderText('Search for movies...')
    
    // Focus search input
    await user.click(searchInput)
    expect(searchInput).toHaveFocus()

    // Type and clear with Escape
    await user.type(searchInput, 'test')
    expect(searchInput).toHaveValue('test')

    await user.keyboard('{Escape}')
    expect(searchInput).toHaveValue('')
  })

  it('should handle form submission for immediate search', async () => {
    render(<HomeWrapper />)

    const searchInput = screen.getByPlaceholderText('Search for movies...')
    await user.type(searchInput, 'matrix')

    // Submit form
    const form = searchInput.closest('form')!
    fireEvent.submit(form)

    // Should trigger immediate search
    expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('matrix')
  })
})