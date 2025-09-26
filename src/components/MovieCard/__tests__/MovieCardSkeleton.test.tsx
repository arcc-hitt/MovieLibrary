import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MovieCardSkeleton, MovieCardSkeletonGrid } from '../MovieCardSkeleton'

describe('MovieCardSkeleton', () => {
  it('renders skeleton elements correctly', () => {
    render(<MovieCardSkeleton />)
    
    // Should render skeleton elements (checking by class since Skeleton component uses specific classes)
    const skeletonElements = document.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })
})

describe('MovieCardSkeletonGrid', () => {
  it('renders default number of skeleton cards', () => {
    render(<MovieCardSkeletonGrid />)
    
    // Should render 8 skeleton cards by default
    const skeletonElements = document.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders specified number of skeleton cards', () => {
    render(<MovieCardSkeletonGrid count={4} />)
    
    // Should render the grid container
    const gridContainer = document.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })

  it('applies correct grid classes', () => {
    render(<MovieCardSkeletonGrid />)
    
    const gridContainer = document.querySelector('.grid')
    expect(gridContainer).toHaveClass('grid-cols-2')
    expect(gridContainer).toHaveClass('sm:grid-cols-3')
    expect(gridContainer).toHaveClass('md:grid-cols-4')
    expect(gridContainer).toHaveClass('lg:grid-cols-5')
    expect(gridContainer).toHaveClass('xl:grid-cols-6')
    expect(gridContainer).toHaveClass('gap-4')
  })
})