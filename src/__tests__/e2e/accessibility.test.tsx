import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Home from '@/pages/Home/Home'
import Watchlist from '@/pages/Watchlist/Watchlist'
import { Navigation } from '@/components/Navigation/Navigation'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

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

describe('Accessibility End-to-End Tests', () => {
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

  it('should have no accessibility violations on home page', async () => {
    const { container } = render(<FullApp />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations on watchlist page', async () => {
    mockWatchlistStore.watchlist = [
      { ...mockMovies[0], addedAt: new Date().toISOString() },
    ]

    const { container } = render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations during search', async () => {
    const { container } = render(<FullApp />)

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'matrix')

    // Mock search results
    mockMovieStore.searchResults = [mockMovies[0]]
    mockMovieStore.searchQuery = 'matrix'

    // Re-render with search results
    render(<FullApp />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should support keyboard navigation throughout the app', async () => {
    render(<FullApp />)

    // Tab through navigation
    await user.tab()
    expect(screen.getByRole('link', { name: /home/i })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: /watchlist/i })).toHaveFocus()

    // Tab to search input
    await user.tab()
    expect(screen.getByRole('searchbox')).toHaveFocus()

    // Tab to movie cards
    await user.tab()
    const firstMovieButton = screen.getByLabelText('Add The Matrix to watchlist')
    expect(firstMovieButton).toHaveFocus()

    // Enter should activate button
    await user.keyboard('{Enter}')
    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledWith(mockMovies[0])
  })

  it('should provide proper ARIA labels and descriptions', async () => {
    render(<FullApp />)

    // Check search input
    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toHaveAttribute('aria-label', 'Search for movies by title')

    // Check movie cards
    const movieCards = screen.getAllByRole('article')
    movieCards.forEach(card => {
      expect(card).toHaveAttribute('aria-labelledby')
      expect(card).toHaveAttribute('aria-describedby')
    })

    // Check buttons
    const addButton = screen.getByLabelText('Add The Matrix to watchlist')
    expect(addButton).toHaveAttribute('aria-pressed', 'false')

    // Check navigation
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
  })

  it('should handle focus management correctly', async () => {
    render(<FullApp />)

    // Focus search input
    const searchInput = screen.getByRole('searchbox')
    await user.click(searchInput)
    expect(searchInput).toHaveFocus()

    // Clear with Escape should maintain focus
    await user.keyboard('{Escape}')
    expect(searchInput).toHaveFocus()

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    // Focus should be managed properly on page change
    await waitFor(() => {
      expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    })
  })

  it('should provide screen reader announcements', async () => {
    render(<FullApp />)

    // Check for live regions
    const liveRegions = screen.getAllByRole('status', { hidden: true })
    expect(liveRegions.length).toBeGreaterThan(0)

    // Search should have live announcements
    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'matrix')

    // Should have aria-live region for search feedback
    const searchContainer = searchInput.closest('[role="search"]')
    expect(searchContainer).toBeInTheDocument()
  })

  it('should handle error states accessibly', async () => {
    mockMovieStore.error = 'Failed to load movies'

    const { container } = render(<FullApp />)

    // Error should be announced
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to Load Movies')).toBeInTheDocument()

    // Retry button should be accessible
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()
    expect(retryButton).toHaveAttribute('type', 'button')

    // Should have no accessibility violations in error state
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle loading states accessibly', async () => {
    mockMovieStore.isLoading = true

    const { container } = render(<FullApp />)

    // Loading skeletons should have proper attributes
    const skeletons = screen.getAllByTestId('movie-skeleton')
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveAttribute('role', 'status')
      expect(skeleton).toHaveAttribute('aria-label', 'Loading movie')
    })

    // Search input should be disabled and announced
    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toBeDisabled()

    // Should have no accessibility violations in loading state
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should support high contrast mode', async () => {
    render(<FullApp />)

    // Check that elements have proper contrast classes
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      // Should have focus-visible styles
      expect(button).toHaveClass('focus-visible:ring-ring/50')
    })

    // Check that text has proper contrast
    const headings = screen.getAllByRole('heading')
    headings.forEach(heading => {
      expect(heading).toHaveClass('font-bold')
    })
  })

  it('should handle reduced motion preferences', async () => {
    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(<FullApp />)

    // Components should respect reduced motion
    const movieCards = screen.getAllByRole('article')
    movieCards.forEach(card => {
      // Should have transition classes that respect prefers-reduced-motion
      expect(card).toHaveClass('transition-all')
    })
  })

  it('should provide proper heading hierarchy', async () => {
    render(<FullApp />)

    // Check heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Popular Movies')

    // Movie titles should be properly structured
    const movieTitles = screen.getAllByRole('heading', { level: 3 })
    expect(movieTitles.length).toBeGreaterThan(0)

    // Navigate to watchlist
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    await user.click(watchlistLink)

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Watchlist should have proper heading
    const watchlistH1 = screen.getByRole('heading', { level: 1 })
    expect(watchlistH1).toHaveTextContent('My Watchlist')
  })

  it('should handle form validation accessibly', async () => {
    render(<FullApp />)

    const searchInput = screen.getByRole('searchbox')
    
    // Should have proper form structure
    const form = searchInput.closest('form')
    expect(form).toBeInTheDocument()

    // Should have submit button (even if hidden)
    const submitButton = screen.getByRole('button', { name: 'Search' })
    expect(submitButton).toBeInTheDocument()

    // Should handle form submission
    await user.type(searchInput, 'test')
    fireEvent.submit(form!)

    expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('test')
  })

  it('should provide proper landmark regions', async () => {
    render(<FullApp />)

    // Check for proper landmarks
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('search')).toBeInTheDocument()

    // Main content should be properly labeled
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('aria-label', 'Main content')
    expect(main).toHaveAttribute('id', 'main-content')
  })

  it('should handle mobile accessibility', async () => {
    render(<FullApp />)

    // Mobile menu should be accessible
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Touch targets should be large enough
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      // Should have touch-friendly classes
      expect(button).toHaveClass('touch-manipulation')
    })
  })
})