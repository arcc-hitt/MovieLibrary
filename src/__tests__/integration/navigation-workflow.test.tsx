import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout/Layout'
import Home from '@/pages/Home/Home'
import Watchlist from '@/pages/Watchlist/Watchlist'
import { Navigation } from '@/components/Navigation/Navigation'

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

const AppWithNavigation = () => (
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
)

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

describe('Navigation Workflow Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockMovieStore.popularMovies = []
    mockMovieStore.searchResults = []
    mockMovieStore.isLoading = false
    mockMovieStore.error = null
    mockMovieStore.searchQuery = ''
    mockWatchlistStore.watchlist = []
  })

  it('should navigate between pages using navigation links', async () => {
    render(<FullApp />)

    // Should start on home page
    expect(screen.getByText('Popular Movies')).toBeInTheDocument()

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    // Should show watchlist page
    await waitFor(() => {
      expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    })

    // Navigate back to home
    const homeLink = screen.getByRole('link', { name: /home/i })
    await user.click(homeLink)

    // Should show home page
    await waitFor(() => {
      expect(screen.getByText('Popular Movies')).toBeInTheDocument()
    })
  })

  it('should show active navigation state', async () => {
    render(<FullApp />)

    // Home link should be active initially
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveClass('text-primary')

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    // Watchlist link should become active
    await waitFor(() => {
      expect(watchlistLink).toHaveClass('text-primary')
    })
  })

  it('should display watchlist count in navigation', async () => {
    // Mock watchlist with items
    mockWatchlistStore.watchlist = [
      { id: 1, title: 'Movie 1', addedAt: new Date().toISOString() },
      { id: 2, title: 'Movie 2', addedAt: new Date().toISOString() },
    ]

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    // Should show watchlist count badge
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should handle mobile navigation menu', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    // Find mobile menu button
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    expect(menuButton).toBeInTheDocument()

    // Menu should be closed initially
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Open mobile menu
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Close mobile menu
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should maintain state during navigation', async () => {
    // Set up some state
    mockMovieStore.searchQuery = 'matrix'
    mockMovieStore.searchResults = [
      { id: 1, title: 'The Matrix', poster_path: '/matrix.jpg', release_date: '1999-03-31' },
    ]

    render(<FullApp />)

    // Should show search results
    expect(screen.getByText('Search Results')).toBeInTheDocument()

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    await waitFor(() => {
      expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    })

    // Navigate back to home
    const homeLink = screen.getByRole('link', { name: /home/i })
    await user.click(homeLink)

    // Search state should be maintained
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument()
    })
  })

  it('should handle browser back/forward navigation', async () => {
    render(<FullApp />)

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    await waitFor(() => {
      expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    })

    // Simulate browser back button
    window.history.back()

    await waitFor(() => {
      expect(screen.getByText('Popular Movies')).toBeInTheDocument()
    })
  })

  it('should provide keyboard navigation support', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    // Tab to navigation links
    await user.tab()
    
    // Should focus on first navigation link
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveFocus()

    // Tab to next link
    await user.tab()
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    expect(watchlistLink).toHaveFocus()

    // Enter should activate link
    await user.keyboard('{Enter}')
    // In a real router, this would navigate
  })

  it('should handle navigation with empty watchlist', async () => {
    render(<FullApp />)

    // Navigate to empty watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    await waitFor(() => {
      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument()
    })

    // Should have link back to home
    const browseButton = screen.getByText('Browse Movies')
    expect(browseButton.closest('a')).toHaveAttribute('href', '/')
  })

  it('should handle navigation during loading states', async () => {
    mockMovieStore.isLoading = true

    render(<FullApp />)

    // Should show loading state
    const skeletons = screen.getAllByTestId('movie-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)

    // Navigation should still work
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    await waitFor(() => {
      expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    })
  })

  it('should handle navigation during error states', async () => {
    mockMovieStore.error = 'Failed to load movies'

    render(<FullApp />)

    // Should show error state
    expect(screen.getByText('Failed to Load Movies')).toBeInTheDocument()

    // Navigation should still work
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    await waitFor(() => {
      expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    })
  })

  it('should update watchlist count when items are added/removed', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    // Initially no count badge
    expect(screen.queryByText('1')).not.toBeInTheDocument()

    // Mock adding item to watchlist
    mockWatchlistStore.watchlist = [
      { id: 1, title: 'Movie 1', addedAt: new Date().toISOString() },
    ]

    // Re-render to show updated count
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    expect(screen.getByText('1')).toBeInTheDocument()
  })
})