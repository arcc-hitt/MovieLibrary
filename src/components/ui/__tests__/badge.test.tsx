import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renders badge with default variant', () => {
    render(<Badge data-testid="badge">Default Badge</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('renders badge with secondary variant', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('renders badge with destructive variant', () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('bg-destructive', 'text-white')
  })

  it('renders badge with outline variant', () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('text-foreground')
  })

  it('applies default base classes', () => {
    render(<Badge data-testid="badge">Badge</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium'
    )
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge" data-testid="badge">Custom</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('custom-badge')
  })

  it('has proper data attribute', () => {
    render(<Badge data-testid="badge">Badge</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  it('renders as span by default', () => {
    render(<Badge>Badge Text</Badge>)
    
    const badge = screen.getByText('Badge Text')
    expect(badge.tagName).toBe('SPAN')
  })

  it('renders as child element when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('bg-primary') // Should still have badge classes
  })

  it('has proper focus styles', () => {
    render(<Badge data-testid="badge">Badge</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  it('has proper aria-invalid styles', () => {
    render(<Badge aria-invalid data-testid="badge">Invalid</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'aria-invalid:border-destructive'
    )
  })

  it('supports icons', () => {
    render(
      <Badge data-testid="badge">
        <svg data-testid="badge-icon" />
        Badge with Icon
      </Badge>
    )
    
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
    expect(screen.getByText('Badge with Icon')).toBeInTheDocument()
  })

  it('has proper sizing constraints', () => {
    render(<Badge data-testid="badge">Badge</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('w-fit', 'whitespace-nowrap', 'shrink-0')
  })
})