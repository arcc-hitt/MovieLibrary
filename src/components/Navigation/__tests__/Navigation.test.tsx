import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Navigation } from '../Navigation'

// Mock the watchlist store
vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: vi.fn(() => ({ watchlist: [] }))
}))

// Test wrapper with router context
const NavigationWrapper = () => (
  <BrowserRouter>
    <Navigation />
  </BrowserRouter>
)

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the brand/logo', () => {
    render(<NavigationWrapper />)
    
    expect(screen.getByText('🎬 Movie Library')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    render(<NavigationWrapper />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
  })

  it('shows mobile menu button', () => {
    render(<NavigationWrapper />)
    
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles mobile menu when button is clicked', () => {
    render(<NavigationWrapper />)
    
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    
    // Initially menu should be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    // Click to open
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    
    // Click to close
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows navigation links as Link components', () => {
    render(<NavigationWrapper />)
    
    const homeLink = screen.getByRole('link', { name: /home/i })
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    
    expect(homeLink).toHaveAttribute('href', '/')
    expect(watchlistLink).toHaveAttribute('href', '/watchlist')
  })

  it('shows correct icons for navigation items', () => {
    render(<NavigationWrapper />)
    
    const homeLink = screen.getByRole('link', { name: /home/i })
    const watchlistLink = screen.getByRole('link', { name: /watchlist/i })
    
    expect(homeLink.querySelector('svg')).toBeInTheDocument()
    expect(watchlistLink.querySelector('svg')).toBeInTheDocument()
  })
})