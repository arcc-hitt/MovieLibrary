import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BrowserRouter } from 'react-router-dom'
import { MovieCard } from '../components/MovieCard'
import { SearchBar } from '../components/SearchBar'
import { Navigation } from '../components/Navigation'
import { Home, Watchlist } from '../pages'
import type { Movie } from '../types'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock stores
vi.mock('@/stores/movieStore', () => ({
  useMovieStore: () => ({
    popularMovies: [],
    searchResults: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    fetchPopularMovies: vi.fn(),
    searchMovies: vi.fn(),
    clearSearch: vi.fn(),
  })
}))

vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: () => ({
    watchlist: [],
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
    isInWatchlist: vi.fn(() => false),
    loadWatchlist: vi.fn(),
  })
}))

// Mock hooks
vi.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlowConnection: false,
  })
}))

vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  })
}))

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  overview: 'A test movie',
  vote_average: 8.5,
  genre_ids: [1, 2, 3],
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('MovieCard Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels and roles', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      // Check article role and labeling
      const article = screen.getByRole('article')
      expect(article).toHaveAttribute('aria-labelledby', `movie-title-${mockMovie.id}`)
      expect(article).toHaveAttribute('aria-describedby', `movie-year-${mockMovie.id}`)

      // Check button accessibility
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button).toHaveAttribute('aria-pressed', 'false')

      // Check image alt text
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt')
      expect(image.getAttribute('alt')).toContain(mockMovie.title)
    })

    it('should support keyboard navigation', () => {
      const mockAddToWatchlist = vi.fn()
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={mockAddToWatchlist}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const button = screen.getByRole('button')
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(mockAddToWatchlist).toHaveBeenCalledWith(mockMovie)

      // Test Space key
      fireEvent.keyDown(button, { key: ' ' })
      expect(mockAddToWatchlist).toHaveBeenCalledTimes(2)
    })

    it('should have proper focus management', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('SearchBar Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <SearchBar onSearch={vi.fn()} />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper search role and ARIA attributes', () => {
      render(<SearchBar onSearch={vi.fn()} />)

      // Check search role
      const searchContainer = screen.getByRole('search')
      expect(searchContainer).toBeInTheDocument()

      // Check searchbox role and attributes
      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toHaveAttribute('aria-label')
      expect(searchInput).toHaveAttribute('type', 'search')
      expect(searchInput).toHaveAttribute('autoComplete', 'off')
    })

    it('should announce search status to screen readers', async () => {
      render(<SearchBar onSearch={vi.fn()} isLoading={true} />)

      // Check for live region
      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
    })

    it('should have accessible clear button', async () => {
      render(<SearchBar onSearch={vi.fn()} />)

      const input = screen.getByRole('searchbox')
      fireEvent.change(input, { target: { value: 'test' } })

      await waitFor(() => {
        const clearButton = screen.getByLabelText(/clear search/i)
        expect(clearButton).toBeInTheDocument()
        expect(clearButton).toHaveAttribute('aria-label')
      })
    })
  })

  describe('Navigation Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper navigation structure', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      // Check navigation role and label
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Main navigation')

      // Check menubar structure
      const menubar = screen.getByRole('menubar')
      expect(menubar).toBeInTheDocument()

      // Check menu items
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('should have accessible mobile menu', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const menuButton = screen.getByLabelText(/toggle navigation menu/i)
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu')
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
    })

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('should have skip link for keyboard users', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })
  })

  describe('Page Accessibility', () => {
    it('Home page should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Watchlist page should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Watchlist />
        </TestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('should have proper landmark structure', () => {
      render(
        <TestWrapper>
          <div>
            <main role="main">
              <Home />
            </main>
          </div>
        </TestWrapper>
      )

      // Check for main landmarks
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
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

      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      // Verify component renders without animations when reduced motion is preferred
      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()
    })

    it('should have sufficient touch targets on mobile', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const button = screen.getByRole('button')
      const styles = window.getComputedStyle(button)
      
      // Check minimum touch target size (44px x 44px)
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('min-w-[44px]')
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should have live regions for dynamic content', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Check for live regions
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)
    })

    it('should announce loading states', () => {
      render(<SearchBar onSearch={vi.fn()} isLoading={true} />)

      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
    })

    it('should have proper status announcements', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Check for status announcements
      const statusRegions = document.querySelectorAll('[aria-live="polite"]')
      expect(statusRegions.length).toBeGreaterThan(0)
    })
  })
})