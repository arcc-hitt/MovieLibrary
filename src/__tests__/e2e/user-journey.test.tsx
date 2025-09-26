import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout/Layout'
import Home from '@/pages/Home/Home'
import Watchlist from '@/pages/Watchlist/Watchlist'
import { Navigation } from '@/components/Navigation/Navigation'

// Mock localStorage for persistence testing
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock the stores with realistic behavior
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
  isInWatchlist: vi.fn(),
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
  {
    id: 3,
    title: 'Interstellar',
    poster_path: '/interstellar.jpg',
    release_date: '2014-11-07',
    overview: 'A team of explorers travel through a wormhole in space.',
    vote_average: 8.6,
    genre_ids: [18, 878],
  },
]

const FullApp = () => (
  <BrowserRouter>
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </div>
  </BrowserRouter>
)

describe('End-to-End User Journey Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockMovieStore.popularMovies = mockMovies
    mockMovieStore.searchResults = []
    mockMovieStore.isLoading = false
    mockMovieStore.error = null
    mockMovieStore.searchQuery = ''
    mockWatchlistStore.watchlist = []
    mockWatchlistStore.isInWatchlist.mockReturnValue(false)
    
    // Mock localStorage to be empty initially
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full user journey: browse → search → add to watchlist → view watchlist → remove', async () => {
    // Simulate realistic store behavior
    let currentWatchlist: any[] = []
    
    mockWatchlistStore.addToWatchlist.mockImplementation((movie) => {
      const watchlistItem = { ...movie, addedAt: new Date().toISOString() }
      currentWatchlist.push(watchlistItem)
      mockWatchlistStore.watchlist = [...currentWatchlist]
      mockLocalStorage.setItem('movie-library-watchlist', JSON.stringify(currentWatchlist))
    })

    mockWatchlistStore.removeFromWatchlist.mockImplementation((movieId) => {
      currentWatchlist = currentWatchlist.filter(movie => movie.id !== movieId)
      mockWatchlistStore.watchlist = [...currentWatchlist]
      mockLocalStorage.setItem('movie-library-watchlist', JSON.stringify(currentWatchlist))
    })

    mockWatchlistStore.isInWatchlist.mockImplementation((movieId) => {
      return currentWatchlist.some(movie => movie.id === movieId)
    })

    render(<FullApp />)

    // Step 1: User lands on home page and sees popular movies
    expect(screen.getByText('Popular Movies')).toBeInTheDocument()
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()
    expect(mockMovieStore.fetchPopularMovies).toHaveBeenCalled()

    // Step 2: User searches for a specific movie
    const searchInput = screen.getByPlaceholderText('Search for movies...')
    await user.type(searchInput, 'matrix')

    // Mock search results
    mockMovieStore.searchResults = [mockMovies[0]]
    mockMovieStore.searchQuery = 'matrix'

    await waitFor(() => {
      expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('matrix')
    })

    // Re-render to show search results
    render(<FullApp />)

    // Step 3: User adds movie to watchlist from search results
    const addButton = screen.getByLabelText('Add The Matrix to watchlist')
    await user.click(addButton)

    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledWith(mockMovies[0])
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'movie-library-watchlist',
      expect.stringContaining('The Matrix')
    )

    // Step 4: User navigates to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    // Mock watchlist page with the added movie
    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Step 5: User sees their watchlist with the added movie
    expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    expect(screen.getByText('The Matrix')).toBeInTheDocument()

    // Step 6: User removes movie from watchlist
    const removeButton = screen.getByLabelText('Remove The Matrix from watchlist')
    await user.click(removeButton)

    expect(mockWatchlistStore.removeFromWatchlist).toHaveBeenCalledWith(1)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'movie-library-watchlist',
      '[]'
    )

    // Step 7: User sees empty watchlist
    mockWatchlistStore.watchlist = []
    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument()
  })

  it('should handle complete search and filter workflow', async () => {
    render(<FullApp />)

    // User starts with popular movies
    expect(screen.getByText('Popular Movies')).toBeInTheDocument()

    // User searches for different terms
    const searchInput = screen.getByPlaceholderText('Search for movies...')
    
    // Search for "inception"
    await user.clear(searchInput)
    await user.type(searchInput, 'inception')

    mockMovieStore.searchResults = [mockMovies[1]]
    mockMovieStore.searchQuery = 'inception'

    await waitFor(() => {
      expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('inception')
    })

    // Clear search and return to popular movies
    await user.clear(searchInput)
    await user.keyboard('{Escape}')

    expect(mockMovieStore.clearSearch).toHaveBeenCalled()

    // Search for non-existent movie
    await user.type(searchInput, 'nonexistentmovie')

    mockMovieStore.searchResults = []
    mockMovieStore.searchQuery = 'nonexistentmovie'

    render(<FullApp />)

    expect(screen.getByText('No movies found')).toBeInTheDocument()
  })

  it('should handle multiple movies in watchlist workflow', async () => {
    let currentWatchlist: any[] = []
    
    mockWatchlistStore.addToWatchlist.mockImplementation((movie) => {
      const watchlistItem = { ...movie, addedAt: new Date().toISOString() }
      currentWatchlist.push(watchlistItem)
      mockWatchlistStore.watchlist = [...currentWatchlist]
    })

    mockWatchlistStore.isInWatchlist.mockImplementation((movieId) => {
      return currentWatchlist.some(movie => movie.id === movieId)
    })

    render(<FullApp />)

    // Add multiple movies to watchlist
    const matrixButton = screen.getByLabelText('Add The Matrix to watchlist')
    await user.click(matrixButton)

    const inceptionButton = screen.getByLabelText('Add Inception to watchlist')
    await user.click(inceptionButton)

    const interstellarButton = screen.getByLabelText('Add Interstellar to watchlist')
    await user.click(interstellarButton)

    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledTimes(3)

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    // Mock watchlist with all movies
    mockWatchlistStore.watchlist = currentWatchlist
    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should show all movies
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()
    expect(screen.getByText('Interstellar')).toBeInTheDocument()

    // Should show correct count
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('3') && element?.textContent?.includes('movies')
    })).toBeInTheDocument()
  })

  it('should persist watchlist across browser sessions', async () => {
    // Simulate existing data in localStorage
    const persistedWatchlist = [
      {
        id: 1,
        title: 'The Matrix',
        poster_path: '/matrix.jpg',
        release_date: '1999-03-31',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'Inception',
        poster_path: '/inception.jpg',
        release_date: '2010-07-16',
        addedAt: '2023-01-02T00:00:00.000Z',
      },
    ]

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(persistedWatchlist))
    mockWatchlistStore.watchlist = persistedWatchlist

    mockWatchlistStore.loadWatchlist.mockImplementation(() => {
      const stored = mockLocalStorage.getItem('movie-library-watchlist')
      if (stored) {
        mockWatchlistStore.watchlist = JSON.parse(stored)
      }
    })

    render(<FullApp />)

    // Should load watchlist from localStorage
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled()

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should show persisted movies
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('should handle error states gracefully throughout user journey', async () => {
    // Start with error state
    mockMovieStore.error = 'Failed to load movies'
    mockMovieStore.isLoading = false

    render(<FullApp />)

    // Should show error state
    expect(screen.getByText('Failed to Load Movies')).toBeInTheDocument()

    // User can retry
    const retryButton = screen.getByText('Try Again')
    await user.click(retryButton)

    expect(mockMovieStore.fetchPopularMovies).toHaveBeenCalled()

    // Clear error and show movies
    mockMovieStore.error = null
    render(<FullApp />)

    expect(screen.getByText('Popular Movies')).toBeInTheDocument()

    // Navigation should still work during error states
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    expect(screen.getByText('My Watchlist')).toBeInTheDocument()
  })

  it('should handle loading states throughout user journey', async () => {
    // Start with loading state
    mockMovieStore.isLoading = true

    render(<FullApp />)

    // Should show loading skeletons
    const skeletons = screen.getAllByTestId('movie-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)

    // Search input should be disabled during loading
    const searchInput = screen.getByPlaceholderText('Search for movies...')
    expect(searchInput).toBeDisabled()

    // Navigation should still work
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    expect(screen.getByText('My Watchlist')).toBeInTheDocument()
  })

  it('should handle responsive behavior across different screen sizes', async () => {
    // This test would ideally use different viewport sizes
    // For now, we'll test that responsive classes are applied
    
    render(<FullApp />)

    // Check that responsive classes are present
    const mainContent = screen.getByRole('main')
    expect(mainContent).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')

    // Navigation should have responsive behavior
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()

    // Mobile menu button should be present
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    expect(menuButton).toBeInTheDocument()

    // Test mobile menu functionality
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should maintain accessibility throughout user journey', async () => {
    render(<FullApp />)

    // Check semantic structure
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    // Check ARIA labels
    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toHaveAttribute('aria-label', 'Search for movies by title')

    // Check movie cards have proper ARIA structure
    const movieCards = screen.getAllByRole('article')
    expect(movieCards.length).toBeGreaterThan(0)

    movieCards.forEach(card => {
      expect(card).toHaveAttribute('aria-labelledby')
      expect(card).toHaveAttribute('aria-describedby')
    })

    // Check buttons have proper labels
    const addButtons = screen.getAllByRole('button', { name: /Add .* to watchlist/ })
    expect(addButtons.length).toBeGreaterThan(0)

    // Navigate to watchlist and check accessibility
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Check watchlist page accessibility
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('My Watchlist')).toBeInTheDocument()
  })
})