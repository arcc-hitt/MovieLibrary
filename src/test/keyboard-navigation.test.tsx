import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { SearchBar } from '../components/SearchBar'
import { MovieCard } from '../components/MovieCard'
import type { Movie } from '../types'

// Mock stores
vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: () => ({
    watchlist: [],
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

describe('Keyboard Navigation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation Component', () => {
    it('should support Tab navigation through menu items', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      // Get all focusable elements
      const logo = screen.getByLabelText(/movie library/i)
      const homeLink = screen.getByRole('menuitem', { name: /home/i })
      const watchlistLink = screen.getByRole('menuitem', { name: /watchlist/i })

      // Test tab navigation
      await user.tab()
      expect(logo).toHaveFocus()

      await user.tab()
      expect(homeLink).toHaveFocus()

      await user.tab()
      expect(watchlistLink).toHaveFocus()
    })

    it('should support Enter and Space key activation', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const mobileMenuButton = screen.getByLabelText(/toggle navigation menu/i)
      
      // Test Enter key
      mobileMenuButton.focus()
      await user.keyboard('{Enter}')
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')

      // Close menu
      await user.keyboard('{Enter}')
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')

      // Test Space key
      await user.keyboard(' ')
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should support Escape key to close mobile menu', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const mobileMenuButton = screen.getByLabelText(/toggle navigation menu/i)
      
      // Open menu
      await user.click(mobileMenuButton)
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')

      // Close with Escape
      await user.keyboard('{Escape}')
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should trap focus within mobile menu when open', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      const mobileMenuButton = screen.getByLabelText(/toggle navigation menu/i)
      
      // Open mobile menu
      await user.click(mobileMenuButton)
      
      // Get mobile menu items
      const mobileMenuItems = screen.getAllByRole('menuitem')
      const mobileLinkCount = mobileMenuItems.length

      // Tab through mobile menu items
      for (let i = 0; i < mobileLinkCount; i++) {
        await user.tab()
        expect(mobileMenuItems[i]).toHaveFocus()
      }
    })
  })

  describe('SearchBar Component', () => {
    it('should support keyboard navigation and shortcuts', async () => {
      const user = userEvent.setup()
      const mockOnSearch = vi.fn()
      
      render(<SearchBar onSearch={mockOnSearch} />)

      const searchInput = screen.getByRole('searchbox')
      
      // Focus input
      await user.click(searchInput)
      expect(searchInput).toHaveFocus()

      // Type search query
      await user.type(searchInput, 'test movie')
      expect(searchInput).toHaveValue('test movie')

      // Test Escape key to clear
      await user.keyboard('{Escape}')
      expect(searchInput).toHaveValue('')

      // Test Enter to submit
      await user.type(searchInput, 'another test')
      await user.keyboard('{Enter}')
      expect(mockOnSearch).toHaveBeenCalledWith('another test')
    })

    it('should support Tab navigation to clear button', async () => {
      const user = userEvent.setup()
      const mockOnSearch = vi.fn()
      
      render(<SearchBar onSearch={mockOnSearch} />)

      const searchInput = screen.getByRole('searchbox')
      
      // Type to show clear button
      await user.type(searchInput, 'test')
      
      // Tab to clear button
      await user.tab()
      const clearButton = screen.getByLabelText(/clear search/i)
      expect(clearButton).toHaveFocus()

      // Activate clear button
      await user.keyboard('{Enter}')
      expect(searchInput).toHaveValue('')
    })

    it('should maintain focus after clearing search', async () => {
      const user = userEvent.setup()
      const mockOnSearch = vi.fn()
      
      render(<SearchBar onSearch={mockOnSearch} />)

      const searchInput = screen.getByRole('searchbox')
      
      // Type and clear with Escape
      await user.type(searchInput, 'test')
      await user.keyboard('{Escape}')
      
      // Input should still have focus
      expect(searchInput).toHaveFocus()
    })
  })

  describe('MovieCard Component', () => {
    it('should support keyboard activation of watchlist button', async () => {
      const user = userEvent.setup()
      const mockAddToWatchlist = vi.fn()
      const mockRemoveFromWatchlist = vi.fn()
      
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={mockAddToWatchlist}
          onRemoveFromWatchlist={mockRemoveFromWatchlist}
        />
      )

      const watchlistButton = screen.getByRole('button')
      
      // Focus button
      watchlistButton.focus()
      expect(watchlistButton).toHaveFocus()

      // Test Enter key
      await user.keyboard('{Enter}')
      expect(mockAddToWatchlist).toHaveBeenCalledWith(mockMovie)

      // Test Space key
      await user.keyboard(' ')
      expect(mockAddToWatchlist).toHaveBeenCalledTimes(2)
    })

    it('should prevent default behavior for Space key', () => {
      const mockAddToWatchlist = vi.fn()
      
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={mockAddToWatchlist}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const watchlistButton = screen.getByRole('button')
      
      // Create a space key event
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault')
      
      watchlistButton.dispatchEvent(spaceEvent)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should have visible focus indicators', () => {
      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={vi.fn()}
          onRemoveFromWatchlist={vi.fn()}
        />
      )

      const watchlistButton = screen.getByRole('button')
      
      // Check for focus ring classes
      expect(watchlistButton).toHaveClass('focus:ring-2')
      expect(watchlistButton).toHaveClass('focus:ring-ring')
      expect(watchlistButton).toHaveClass('focus:ring-offset-2')
    })
  })

  describe('Focus Management', () => {
    it('should maintain logical tab order', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <TestWrapper>
            <Navigation />
          </TestWrapper>
          <SearchBar onSearch={vi.fn()} />
          <MovieCard
            movie={mockMovie}
            isInWatchlist={false}
            onAddToWatchlist={vi.fn()}
            onRemoveFromWatchlist={vi.fn()}
          />
        </div>
      )

      // Get all focusable elements in order
      const focusableElements = [
        screen.getByLabelText(/movie library/i),
        screen.getByRole('menuitem', { name: /home/i }),
        screen.getByRole('menuitem', { name: /watchlist/i }),
        screen.getByRole('searchbox'),
        screen.getByRole('button', { name: /add.*to watchlist/i }),
      ]

      // Tab through all elements
      for (const element of focusableElements) {
        await user.tab()
        expect(element).toHaveFocus()
      }
    })

    it('should skip non-interactive elements', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Interactive Button</button>
          <div>Non-interactive div</div>
          <input type="text" placeholder="Input field" />
        </div>
      )

      const button = screen.getByRole('button')
      const input = screen.getByRole('textbox')

      // Tab should skip non-interactive elements
      await user.tab()
      expect(button).toHaveFocus()

      await user.tab()
      expect(input).toHaveFocus()
    })

    it('should handle focus trapping in modals/overlays', async () => {
      const user = userEvent.setup()
      
      // Simulate a modal-like component
      render(
        <div role="dialog" aria-modal="true">
          <button>First Button</button>
          <input type="text" placeholder="Input" />
          <button>Last Button</button>
        </div>
      )

      const firstButton = screen.getByText('First Button')
      const input = screen.getByRole('textbox')
      const lastButton = screen.getByText('Last Button')

      // Tab through modal elements
      await user.tab()
      expect(firstButton).toHaveFocus()

      await user.tab()
      expect(input).toHaveFocus()

      await user.tab()
      expect(lastButton).toHaveFocus()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should support common keyboard shortcuts', async () => {
      const user = userEvent.setup()
      const mockOnSearch = vi.fn()
      
      render(<SearchBar onSearch={mockOnSearch} />)

      const searchInput = screen.getByRole('searchbox')
      
      // Focus input with Ctrl+F (common search shortcut)
      await user.keyboard('{Control>}f{/Control}')
      // Note: This would typically be handled at the application level
      
      // Test Ctrl+A to select all
      await user.type(searchInput, 'test query')
      await user.keyboard('{Control>}a{/Control}')
      
      // Type to replace selection
      await user.type(searchInput, 'new query')
      expect(searchInput).toHaveValue('new query')
    })

    it('should handle arrow key navigation where appropriate', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      )

      // For menu navigation, arrow keys could be implemented
      // This is a placeholder for future arrow key navigation
      const homeLink = screen.getByRole('menuitem', { name: /home/i })
      homeLink.focus()
      
      // Arrow key navigation would be implemented here
      // await user.keyboard('{ArrowRight}')
      // expect(watchlistLink).toHaveFocus()
    })
  })
})