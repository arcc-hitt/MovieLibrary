import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '../Navigation'

describe('Navigation', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the brand/logo', () => {
    render(<Navigation currentPath="/" />)
    
    expect(screen.getByText('🎬 Movie Library')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    render(<Navigation currentPath="/" />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
  })

  it('highlights the active path', () => {
    render(<Navigation currentPath="/" />)
    
    const homeButton = screen.getByRole('button', { name: /home/i })
    expect(homeButton).toHaveAttribute('aria-current', 'page')
  })

  it('highlights watchlist path when active', () => {
    render(<Navigation currentPath="/watchlist" />)
    
    const watchlistButton = screen.getByRole('button', { name: /watchlist/i })
    expect(watchlistButton).toHaveAttribute('aria-current', 'page')
  })

  it('shows watchlist count badge when count > 0', () => {
    render(<Navigation currentPath="/" watchlistCount={5} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show watchlist count badge when count is 0', () => {
    render(<Navigation currentPath="/" watchlistCount={0} />)
    
    // Should not find any badge with count
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows mobile menu button on mobile', () => {
    render(<Navigation currentPath="/" />)
    
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles mobile menu when button is clicked', () => {
    render(<Navigation currentPath="/" />)
    
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

  it('shows mobile navigation items when menu is open', () => {
    render(<Navigation currentPath="/" />)
    
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    fireEvent.click(menuButton)
    
    // Should show navigation items in mobile menu
    const homeButtons = screen.getAllByText('Home')
    const watchlistButtons = screen.getAllByText('Watchlist')
    
    // Should have both desktop and mobile versions
    expect(homeButtons).toHaveLength(2)
    expect(watchlistButtons).toHaveLength(2)
  })

  it('calls onNavigate when navigation item is clicked', () => {
    render(<Navigation currentPath="/" onNavigate={mockOnNavigate} />)
    
    const watchlistButton = screen.getByRole('button', { name: /watchlist/i })
    fireEvent.click(watchlistButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('/watchlist')
  })

  it('closes mobile menu when navigation item is clicked', () => {
    render(<Navigation currentPath="/" onNavigate={mockOnNavigate} />)
    
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    
    // Open mobile menu
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    
    // Click a navigation item in mobile menu
    const mobileNavItems = screen.getAllByText('Home')
    fireEvent.click(mobileNavItems[1]) // Second one is the mobile version
    
    // Menu should be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows correct icons for navigation items', () => {
    render(<Navigation currentPath="/" />)
    
    // Check that navigation buttons contain icons (SVG elements)
    const homeButton = screen.getByRole('button', { name: /home/i })
    const watchlistButton = screen.getByRole('button', { name: /watchlist/i })
    
    expect(homeButton.querySelector('svg')).toBeInTheDocument()
    expect(watchlistButton.querySelector('svg')).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(<Navigation currentPath="/" onNavigate={mockOnNavigate} />)
    
    const homeButton = screen.getByRole('button', { name: /home/i })
    
    // Focus and press Enter
    homeButton.focus()
    fireEvent.keyDown(homeButton, { key: 'Enter' })
    fireEvent.click(homeButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('/')
  })

  it('shows watchlist count in mobile menu', () => {
    render(<Navigation currentPath="/" watchlistCount={3} />)
    
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    fireEvent.click(menuButton)
    
    // Should show count in both desktop and mobile versions
    const badges = screen.getAllByText('3')
    expect(badges).toHaveLength(2) // Desktop and mobile
  })

  it('applies correct CSS classes for styling', () => {
    render(<Navigation currentPath="/" />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-background', 'border-b', 'border-border', 'sticky', 'top-0', 'z-50')
  })

  it('handles empty currentPath gracefully', () => {
    render(<Navigation currentPath="" />)
    
    // Should not crash and should render navigation items
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
  })

  it('handles large watchlist counts', () => {
    render(<Navigation currentPath="/" watchlistCount={999} />)
    
    expect(screen.getByText('999')).toBeInTheDocument()
  })

  it('shows menu and close icons correctly', () => {
    render(<Navigation currentPath="/" />)
    
    const menuButton = screen.getByLabelText('Toggle navigation menu')
    
    // Should always have an SVG icon
    expect(menuButton.querySelector('svg')).toBeInTheDocument()
    
    // After clicking, should still have an SVG icon (but different one)
    fireEvent.click(menuButton)
    expect(menuButton.querySelector('svg')).toBeInTheDocument()
  })
})