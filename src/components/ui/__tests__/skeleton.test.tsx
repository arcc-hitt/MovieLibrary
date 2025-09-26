import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders skeleton with default classes', () => {
    render(<Skeleton data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md')
  })

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-skeleton')
  })

  it('has proper data attribute', () => {
    render(<Skeleton data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
  })

  it('renders as div element', () => {
    render(<Skeleton>Skeleton content</Skeleton>)
    
    const skeleton = screen.getByText('Skeleton content')
    expect(skeleton.tagName).toBe('DIV')
  })

  it('accepts all div props', () => {
    render(
      <Skeleton
        id="test-skeleton"
        role="presentation"
        aria-label="Loading content"
        data-testid="skeleton"
      />
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('id', 'test-skeleton')
    expect(skeleton).toHaveAttribute('role', 'presentation')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
  })

  it('can be used with custom dimensions', () => {
    render(<Skeleton className="h-4 w-full" data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('h-4', 'w-full')
  })

  it('can be used for different shapes', () => {
    render(<Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />)
    
    const skeleton = screen.getByTestId('avatar-skeleton')
    expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full')
  })

  it('can contain content', () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Loading...</span>
      </Skeleton>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('maintains accessibility', () => {
    render(
      <Skeleton
        role="status"
        aria-label="Loading content"
        data-testid="skeleton"
      />
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('role', 'status')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
  })
})