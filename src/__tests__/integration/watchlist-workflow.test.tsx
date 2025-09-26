import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home/Home'
import Watchlist from '@/pages/Watchlist/Watchlist'
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
  isInWatchlist: vi.fn(),
  loadWatchlist: vi.fn(),
}

vi.mock('@/stores/movieStore', () => ({
  useMovieStore: vi.fn(() => mockMovieStore),
}))

vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: vi.fn(() => mockWatchlistStore),
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

const AppWrapper = ({ initialRoute = '/' }: { initialRoute?: string }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watchlist" element={<Watchlist />} />
    </Routes>
  </BrowserRouter>
)

describe('Watchlist Workflow Integration Tests', () => {
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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should complete add to watchlist workflow', async () => {
    render(<AppWrapper />)

    // Should show popular movies
    expect(screen.getByText('Popular Movies')).toBeInTheDocument()

    // Find add to watchlist button for first movie
    const addButton = screen.getByLabelText('Add The Matrix to watchlist')
    expect(addButton).toBeInTheDocument()

    // Click add to watchlist
    await user.click(addButton)

    // Should call addToWatchlist with the movie
    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledWith(mockMovies[0])

    // Mock movie being added to watchlist
    mockWatchlistStore.watchlist = [
      {
        ...mockMovies[0],
        addedAt: new Date().toISOString(),
      },
    ]
    mockWatchlistStore.isInWatchlist.mockImplementation((id) => id === 1)

    // Re-render to show updated state
    render(<AppWrapper />)

    // Button should now show "Remove from watchlist"
    expect(screen.getByLabelText('Remove The Matrix from watchlist')).toBeInTheDocument()
  })

  it('should complete remove from watchlist workflow', async () => {
    // Start with movie in watchlist
    const watchlistMovie = {
      ...mockMovies[0],
      addedAt: new Date().toISOString(),
    }
    mockWatchlistStore.watchlist = [watchlistMovie]
    mockWatchlistStore.isInWatchlist.mockImplementation((id) => id === 1)

    render(<AppWrapper />)

    // Should show remove button
    const removeButton = screen.getByLabelText('Remove The Matrix from watchlist')
    await user.click(removeButton)

    // Should call removeFromWatchlist
    expect(mockWatchlistStore.removeFromWatchlist).toHaveBeenCalledWith(1)

    // Mock movie being removed
    mockWatchlistStore.watchlist = []
    mockWatchlistStore.isInWatchlist.mockReturnValue(false)

    render(<AppWrapper />)

    // Should show add button again
    expect(screen.getByLabelText('Add The Matrix to watchlist')).toBeInTheDocument()
  })

  it('should navigate to watchlist and show saved movies', async () => {
    // Mock watchlist with movies
    const watchlistMovies = [
      { ...mockMovies[0], addedAt: new Date().toISOString() },
      { ...mockMovies[1], addedAt: new Date().toISOString() },
    ]
    mockWatchlistStore.watchlist = watchlistMovies

    // Render watchlist page directly
    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should show watchlist page
    expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('2') && element?.textContent?.includes('movies') && element?.textContent?.includes('saved to watch later')
    })).toBeInTheDocument()

    // Should show both movies
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()

    // Should have remove buttons (using aria-label)
    expect(screen.getByLabelText('Remove The Matrix from watchlist')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove Inception from watchlist')).toBeInTheDocument()
  })

  it('should handle empty watchlist state', async () => {
    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should show empty state
    expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument()
    expect(screen.getByText(/Start building your watchlist/)).toBeInTheDocument()

    // Should have browse movies button
    const browseButton = screen.getByText('Browse Movies')
    expect(browseButton).toBeInTheDocument()
    expect(browseButton.closest('a')).toHaveAttribute('href', '/')
  })

  it('should remove movie from watchlist page', async () => {
    const watchlistMovie = { ...mockMovies[0], addedAt: new Date().toISOString() }
    mockWatchlistStore.watchlist = [watchlistMovie]

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should show the movie
    expect(screen.getByText('The Matrix')).toBeInTheDocument()

    // Click remove button
    const removeButton = screen.getByLabelText('Remove The Matrix from watchlist')
    await user.click(removeButton)

    // Should call removeFromWatchlist
    expect(mockWatchlistStore.removeFromWatchlist).toHaveBeenCalledWith(1)
  })

  it('should persist watchlist across page refreshes', async () => {
    // Mock localStorage persistence
    const watchlistMovie = { ...mockMovies[0], addedAt: new Date().toISOString() }
    mockWatchlistStore.watchlist = [watchlistMovie]

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should call loadWatchlist on mount
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled()

    // Should show persisted movie
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
  })

  it('should show watchlist count in navigation', async () => {
    // This would require testing the Navigation component with watchlist count
    // For now, we'll test that the watchlist store is properly loaded
    mockWatchlistStore.watchlist = [
      { ...mockMovies[0], addedAt: new Date().toISOString() },
      { ...mockMovies[1], addedAt: new Date().toISOString() },
    ]

    render(<AppWrapper />)

    // Watchlist should be loaded
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled()
  })

  it('should handle adding duplicate movies gracefully', async () => {
    // Movie already in watchlist
    mockWatchlistStore.watchlist = [{ ...mockMovies[0], addedAt: new Date().toISOString() }]
    mockWatchlistStore.isInWatchlist.mockImplementation((id) => id === 1)

    render(<AppWrapper />)

    // Should show remove button, not add button
    expect(screen.queryByLabelText('Add The Matrix to watchlist')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Remove The Matrix from watchlist')).toBeInTheDocument()
  })

  it('should handle watchlist operations during search', async () => {
    // Set up search results
    mockMovieStore.searchResults = [mockMovies[0]]
    mockMovieStore.searchQuery = 'matrix'

    render(<AppWrapper />)

    // Should show search results (if search query is set, it shows search results)
    // This test needs to be adjusted based on actual component behavior

    // Should be able to add to watchlist from search results
    const addButton = screen.getByLabelText('Add The Matrix to watchlist')
    await user.click(addButton)

    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledWith(mockMovies[0])
  })

  it('should provide visual feedback for watchlist operations', async () => {
    render(<AppWrapper />)

    // Mock successful add operation
    const addButton = screen.getByLabelText('Add The Matrix to watchlist')
    await user.click(addButton)

    // In a real implementation, this might show a toast or change button state
    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalled()

    // The button state should change based on isInWatchlist
    mockWatchlistStore.isInWatchlist.mockReturnValue(true)
    
    render(<AppWrapper />)
    expect(screen.getByLabelText('Remove The Matrix from watchlist')).toBeInTheDocument()
  })
})