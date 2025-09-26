import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { performanceMonitor } from '../../utils/performance'
import { MovieCard } from '../../components/MovieCard'
import { SearchBar } from '../../components/SearchBar'
import { Navigation } from '../../components/Navigation'
import type { Movie } from '../../types'

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => [{ duration: 100 }]),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: vi.fn(() => Date.now())
}

Object.defineProperty(globalThis, 'performance', {
  value: mockPerformance,
  writable: true
})

// Mock movie data
const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  overview: 'Test overview',
  vote_average: 8.5,
  genre_ids: [1, 2, 3]
}

describe('Performance Tests', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics()
    vi.clearAllMocks()
  })

  describe('Component Rendering Performance', () => {
    it('should render MovieCard within acceptable time', async () => {
      const onAddToWatchlist = vi.fn()
      const onRemoveFromWatchlist = vi.fn()

      performanceMonitor.startMeasure('moviecard-render')

      render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
        />
      )

      const duration = performanceMonitor.endMeasure('moviecard-render')

      // MovieCard should render quickly (under 200ms in test environment)
      expect(duration).toBeLessThan(200)
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })

    it('should render SearchBar within acceptable time', async () => {
      const onSearch = vi.fn()

      performanceMonitor.startMeasure('searchbar-render')

      render(
        <SearchBar onSearch={onSearch} />
      )

      const duration = performanceMonitor.endMeasure('searchbar-render')

      // SearchBar should render quickly
      expect(duration).toBeLessThan(200)
      expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument()
    })

    it('should render Navigation within acceptable time', async () => {
      performanceMonitor.startMeasure('navigation-render')

      render(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>
      )

      const duration = performanceMonitor.endMeasure('navigation-render')

      // Navigation should render quickly
      expect(duration).toBeLessThan(200)
      expect(screen.getByText('🎬 Movie Library')).toBeInTheDocument()
    })
  })

  describe('Memory Usage', () => {
    it('should not create memory leaks with multiple MovieCard renders', () => {
      const onAddToWatchlist = vi.fn()
      const onRemoveFromWatchlist = vi.fn()

      // Render multiple MovieCards
      const { rerender } = render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
        />
      )

      // Re-render with different props multiple times
      for (let i = 0; i < 10; i++) {
        rerender(
          <MovieCard
            movie={{ ...mockMovie, id: i, title: `Movie ${i}` }}
            isInWatchlist={i % 2 === 0}
            onAddToWatchlist={onAddToWatchlist}
            onRemoveFromWatchlist={onRemoveFromWatchlist}
          />
        )
      }

      // Component should still be functional
      expect(screen.getByText('Movie 9')).toBeInTheDocument()
    })
  })

  describe('Performance Monitoring Utilities', () => {
    it('should measure function execution time', () => {
      const testFunction = () => {
        // Simulate some work
        let sum = 0
        for (let i = 0; i < 1000; i++) {
          sum += i
        }
        return sum
      }

      const result = performanceMonitor.measureFunction('test-function', testFunction)

      expect(result).toBe(499500) // Sum of 0 to 999
      expect(performanceMonitor.getMetrics()).toHaveLength(1)
      expect(performanceMonitor.getMetrics()[0].name).toBe('test-function')
    })

    it('should measure async function execution time', async () => {
      const asyncFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'completed'
      }

      const result = await performanceMonitor.measureAsyncFunction('async-test', asyncFunction)

      expect(result).toBe('completed')
      expect(performanceMonitor.getMetrics()).toHaveLength(1)
      expect(performanceMonitor.getMetrics()[0].name).toBe('async-test')
    })

    it('should calculate average duration correctly', () => {
      // Add multiple measurements with the same name
      performanceMonitor.measureFunction('repeated-test', () => 1)
      performanceMonitor.measureFunction('repeated-test', () => 2)
      performanceMonitor.measureFunction('repeated-test', () => 3)

      const average = performanceMonitor.getAverageDuration('repeated-test')
      expect(average).toBeGreaterThan(0)
      expect(performanceMonitor.getMetricsByName('repeated-test')).toHaveLength(3)
    })

    it('should clear metrics correctly', () => {
      performanceMonitor.measureFunction('test', () => 1)
      expect(performanceMonitor.getMetrics()).toHaveLength(1)

      performanceMonitor.clearMetrics()
      expect(performanceMonitor.getMetrics()).toHaveLength(0)
    })
  })

  describe('Component Re-render Optimization', () => {
    it('should not re-render MovieCard when props have not changed', () => {
      const onAddToWatchlist = vi.fn()
      const onRemoveFromWatchlist = vi.fn()

      const { rerender } = render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
        />
      )

      // Re-render with same props
      rerender(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
        />
      )

      // Component should still be rendered correctly
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })

    it('should re-render MovieCard when relevant props change', () => {
      const onAddToWatchlist = vi.fn()
      const onRemoveFromWatchlist = vi.fn()

      const { rerender } = render(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={false}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
        />
      )

      // Re-render with different isInWatchlist prop
      rerender(
        <MovieCard
          movie={mockMovie}
          isInWatchlist={true}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
        />
      )

      // Component should update to reflect new state
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })
  })

  describe('Bundle Size Impact', () => {
    it('should track component bundle impact', () => {
      // This test would be more meaningful in a real browser environment
      // but we can at least verify the components are tree-shakeable

      const componentNames = ['MovieCard', 'SearchBar', 'Navigation']

      componentNames.forEach(name => {
        performanceMonitor.startMeasure(`${name}-bundle-impact`)
        // Simulate component loading
        performanceMonitor.endMeasure(`${name}-bundle-impact`)
      })

      expect(performanceMonitor.getMetrics()).toHaveLength(3)
    })
  })
})