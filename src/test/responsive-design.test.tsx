import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { MovieCard } from '../components/MovieCard'
import { Home, Watchlist } from '../pages'
import type { Movie } from '../types'

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

// Helper function to simulate different viewport sizes
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Mock matchMedia for responsive tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset viewport to desktop size
    setViewportSize(1024, 768)
  })

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks()
  })

  describe('Navigation Responsive Behavior', () => {
    it('should show desktop navigation on large screens', () => {
      setViewportSize(1024, 768)

      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      // Desktop navigation should be visible
      const desktopNav = screen.getByRole('menubar')
      expect(desktopNav).toBeInTheDocument()

      // Mobile menu button should be hidden (via CSS classes)
      const mobileButton = screen.getByLabelText(/toggle navigation menu/i)
      expect(mobileButton).toHaveClass('md:hidden')
    })

    it('should show mobile navigation on small screens', () => {
      setViewportSize(375, 667) // iPhone size

      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      // Mobile menu button should be visible
      const mobileButton = screen.getByLabelText(/toggle navigation menu/i)
      expect(mobileButton).toBeInTheDocument()

      // Desktop navigation should be hidden (via CSS classes)
      const desktopNav = screen.getByRole('menubar')
      expect(desktopNav.parentElement).toHaveClass('hidden', 'md:block')
    })

    it('should have appropriate touch targets on mobile', () => {
      setViewportSize(375, 667)

      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const mobileButton = screen.getByLabelText(/toggle navigation menu/i)

      // Check for minimum touch target size classes
      expect(mobileButton).toHaveClass('min-h-[44px]')
      expect(mobileButton).toHaveClass('min-w-[44px]')
      expect(mobileButton).toHaveClass('touch-manipulation')
    })

    it('should adapt logo/brand for different screen sizes', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const logo = screen.getByLabelText(/movie library/i)
      expect(logo).toBeInTheDocument()

      // Logo should be responsive
      expect(logo).toHaveClass('text-xl')
    })
  })

  describe('MovieCard Responsive Behavior', () => {
    it('should adapt to different screen sizes', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const card = screen.getByRole('article')

      // Check responsive classes
      expect(card).toHaveClass('w-full')
      expect(card).toHaveClass('max-w-sm')
      expect(card).toHaveClass('mx-auto')
      expect(card).toHaveClass('sm:max-w-none')
    })

    it('should have appropriate button sizes for mobile', () => {
      setViewportSize(375, 667)

      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const button = screen.getByRole('button')

      // Check mobile-friendly button sizing
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('min-w-[44px]')
      expect(button).toHaveClass('touch-manipulation')
    })

    it('should show watchlist button on mobile without hover', () => {
      setViewportSize(375, 667)

      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const buttonContainer = screen.getByRole('button').parentElement

      // Button should be visible on mobile (opacity-100)
      expect(buttonContainer).toHaveClass('opacity-100')
      expect(buttonContainer).toHaveClass('sm:opacity-0')
    })

    it('should have responsive text sizes', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const title = screen.getByText(mockMovie.title)
      const year = screen.getByText('2023')

      // Check responsive text classes
      expect(title).toHaveClass('text-sm', 'sm:text-base')
      expect(year).toHaveClass('text-xs', 'sm:text-sm')
    })
  })

  describe('Grid Layout Responsive Behavior', () => {
    it('should use responsive grid classes', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Look for the responsive grid container
      const gridContainer = document.querySelector('.responsive-grid')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should adapt grid columns for different screen sizes', () => {
      // This test checks that the CSS grid is properly configured
      // The actual responsive behavior is handled by CSS

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const gridContainer = document.querySelector('.responsive-grid')
      expect(gridContainer).toHaveClass('grid')
      expect(gridContainer).toHaveClass('gap-4')
      expect(gridContainer).toHaveClass('sm:gap-6')
    })
  })

  describe('Typography Responsive Behavior', () => {
    it('should have responsive heading sizes', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const heading = screen.getByRole('heading', { level: 1 })

      // Check responsive heading classes
      expect(heading).toHaveClass('text-2xl')
      expect(heading).toHaveClass('sm:text-3xl')
      expect(heading).toHaveClass('lg:text-4xl')
    })

    it('should have responsive spacing', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const mainContainer = screen.getByRole('heading', { level: 1 }).closest('div')

      // Check responsive spacing classes
      expect(mainContainer).toHaveClass('space-y-6')
      expect(mainContainer).toHaveClass('sm:space-y-8')
    })
  })

  describe('Touch and Mobile Interactions', () => {
    it('should have touch-friendly interactive elements', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const button = screen.getByRole('button')

      // Check touch manipulation class
      expect(button).toHaveClass('touch-manipulation')
    })

    it('should handle reduced motion preferences', () => {
      mockMatchMedia(true) // prefers-reduced-motion: reduce

      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const card = screen.getByRole('article')

      // Card should still render properly with reduced motion
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('transition-all')
    })

    it('should support high contrast mode', () => {
      mockMatchMedia(true) // prefers-contrast: high

      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Viewport Meta and Mobile Optimization', () => {
    it('should handle different device orientations', () => {
      // Portrait
      setViewportSize(375, 667)

      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      let mobileButton = screen.getByLabelText(/toggle navigation menu/i)
      expect(mobileButton).toBeInTheDocument()

      // Landscape
      setViewportSize(667, 375)

      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      mobileButton = screen.getByLabelText(/toggle navigation menu/i)
      expect(mobileButton).toBeInTheDocument()
    })

    it('should handle very small screens', () => {
      setViewportSize(320, 568) // iPhone 5/SE size

      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()

      // Should still be usable on very small screens
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[44px]')
    })

    it('should handle large screens appropriately', () => {
      setViewportSize(1920, 1080) // Large desktop

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()

      // Should use appropriate sizing for large screens
      expect(heading).toHaveClass('lg:text-4xl')
    })
  })

  describe('Content Reflow and Readability', () => {
    it('should maintain readability at different zoom levels', () => {
      // Simulate 200% zoom by halving viewport
      setViewportSize(512, 384) // Half of 1024x768

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()

      // Content should still be accessible
      expect(heading).toHaveTextContent(/popular movies|search results/i)
    })

    it('should handle text scaling appropriately', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const title = screen.getByText(mockMovie.title)

      // Should have line clamping for long titles
      expect(title).toHaveClass('line-clamp-2')
    })
  })
})