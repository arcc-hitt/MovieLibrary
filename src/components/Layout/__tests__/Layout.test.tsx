import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../Layout'

// Mock the Navigation component
vi.mock('../../Navigation/Navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}))

// Mock react-router-dom Outlet
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Page Content</div>,
  }
})

const LayoutWrapper = () => (
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
)

describe('Layout', () => {
  it('renders navigation component', () => {
    render(<LayoutWrapper />)
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
  })

  it('renders main content area', () => {
    render(<LayoutWrapper />)
    
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main-content')
    expect(main).toHaveAttribute('aria-label', 'Main content')
  })

  it('renders outlet for page content', () => {
    render(<LayoutWrapper />)
    
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<LayoutWrapper />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('tabIndex', '-1')
    expect(main).toHaveClass('focus:outline-none')
  })

  it('has responsive container classes', () => {
    render(<LayoutWrapper />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('container', 'mx-auto')
    expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
    expect(main).toHaveClass('py-6', 'sm:py-8')
  })

  it('has minimum height for full screen layout', () => {
    render(<LayoutWrapper />)
    
    const layoutContainer = screen.getByRole('main').parentElement
    expect(layoutContainer).toHaveClass('min-h-screen')
  })

  it('has proper background styling', () => {
    render(<LayoutWrapper />)
    
    const layoutContainer = screen.getByRole('main').parentElement
    expect(layoutContainer).toHaveClass('bg-background')
  })
})