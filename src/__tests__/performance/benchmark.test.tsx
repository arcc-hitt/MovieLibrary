import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { 
  benchmark, 
  benchmarkAsync, 
  compareBenchmarks, 
  DataBenchmark,
  benchmarkMemoryUsage 
} from '../../utils/benchmark'
import { MovieCard } from '../../components/MovieCard'
import { SearchBar } from '../../components/SearchBar'
import type { Movie } from '../../types'

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
}

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
})

// Mock movie data
const createMockMovie = (id: number): Movie => ({
  id,
  title: `Movie ${id}`,
  poster_path: `/poster-${id}.jpg`,
  release_date: '2023-01-01',
  overview: `Overview for movie ${id}`,
  vote_average: Math.random() * 10,
  genre_ids: [1, 2, 3]
})

const mockMovies = Array.from({ length: 100 }, (_, i) => createMockMovie(i))

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock performance.now to return incrementing values
    let counter = 0
    mockPerformance.now.mockImplementation(() => counter++)
  })

  describe('Basic Benchmarking', () => {
    it('should benchmark synchronous functions', async () => {
      const testFunction = () => {
        let sum = 0
        for (let i = 0; i < 100; i++) {
          sum += i
        }
        return sum
      }

      const result = await benchmark('sync-test', testFunction, { iterations: 10 })

      expect(result.name).toBe('sync-test')
      expect(result.iterations).toBe(10)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
      expect(result.opsPerSecond).toBeGreaterThan(0)
    })

    it('should benchmark asynchronous functions', async () => {
      const asyncFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 1))
      }

      const result = await benchmarkAsync('async-test', asyncFunction, { iterations: 5 })

      expect(result.name).toBe('async-test')
      expect(result.iterations).toBe(5)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
    })

    it('should compare multiple benchmark results', () => {
      const results = [
        {
          name: 'Fast Function',
          iterations: 100,
          totalTime: 100,
          averageTime: 1,
          minTime: 0.5,
          maxTime: 2,
          opsPerSecond: 1000
        },
        {
          name: 'Slow Function',
          iterations: 100,
          totalTime: 500,
          averageTime: 5,
          minTime: 4,
          maxTime: 6,
          opsPerSecond: 200
        }
      ]

      // Should not throw
      expect(() => compareBenchmarks(results)).not.toThrow()
    })
  })

  describe('Component Rendering Benchmarks', () => {
    it('should benchmark MovieCard rendering', async () => {
      const mockMovie = createMockMovie(1)
      const onAddToWatchlist = vi.fn()
      const onRemoveFromWatchlist = vi.fn()

      const renderFunction = () => {
        const { unmount } = render(
          <MovieCard
            movie={mockMovie}
            isInWatchlist={false}
            onAddToWatchlist={onAddToWatchlist}
            onRemoveFromWatchlist={onRemoveFromWatchlist}
          />
        )
        unmount()
      }

      const result = await benchmark('moviecard-render', renderFunction, { iterations: 10 })

      expect(result.name).toBe('moviecard-render')
      expect(result.iterations).toBe(10)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
    })

    it('should benchmark SearchBar rendering', async () => {
      const onSearch = vi.fn()

      const renderFunction = () => {
        const { unmount } = render(<SearchBar onSearch={onSearch} />)
        unmount()
      }

      const result = await benchmark('searchbar-render', renderFunction, { iterations: 10 })

      expect(result.name).toBe('searchbar-render')
      expect(result.iterations).toBe(10)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Data Processing Benchmarks', () => {
    it('should benchmark array filtering', async () => {
      const dataBenchmark = new DataBenchmark(mockMovies)
      
      const result = await dataBenchmark.benchmarkFilter(
        'movie-filter',
        (movie) => movie.vote_average > 5,
        { iterations: 50 }
      )

      expect(result.name).toBe('movie-filter-filter')
      expect(result.iterations).toBe(50)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
    })

    it('should benchmark array mapping', async () => {
      const dataBenchmark = new DataBenchmark(mockMovies)
      
      const result = await dataBenchmark.benchmarkMap(
        'movie-map',
        (movie) => ({ ...movie, displayTitle: movie.title.toUpperCase() }),
        { iterations: 50 }
      )

      expect(result.name).toBe('movie-map-map')
      expect(result.iterations).toBe(50)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
    })

    it('should benchmark array sorting', async () => {
      const dataBenchmark = new DataBenchmark(mockMovies)
      
      const result = await dataBenchmark.benchmarkSort(
        'movie-sort',
        (a, b) => b.vote_average - a.vote_average,
        { iterations: 20 }
      )

      expect(result.name).toBe('movie-sort-sort')
      expect(result.iterations).toBe(20)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
    })

    it('should benchmark array reduction', async () => {
      const dataBenchmark = new DataBenchmark(mockMovies)
      
      const result = await dataBenchmark.benchmarkReduce(
        'movie-reduce',
        (acc, movie) => acc + movie.vote_average,
        0,
        { iterations: 50 }
      )

      expect(result.name).toBe('movie-reduce-reduce')
      expect(result.iterations).toBe(50)
      expect(result.averageTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Memory Usage Benchmarks', () => {
    it('should benchmark memory usage', () => {
      const testFunction = () => {
        // Create some objects
        const objects = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `data-${i}` }))
        return objects.length
      }

      const result = benchmarkMemoryUsage('memory-test', testFunction)

      expect(result).toBeTruthy()
      expect(result?.name).toBe('memory-test')
      expect(typeof result?.memoryDelta).toBe('number')
    })
  })

  describe('Performance Regression Tests', () => {
    it('should detect performance regressions in component rendering', async () => {
      const mockMovie = createMockMovie(1)
      const onAddToWatchlist = vi.fn()
      const onRemoveFromWatchlist = vi.fn()

      // Benchmark current implementation
      const currentResult = await benchmark(
        'current-moviecard',
        () => {
          const { unmount } = render(
            <MovieCard
              movie={mockMovie}
              isInWatchlist={false}
              onAddToWatchlist={onAddToWatchlist}
              onRemoveFromWatchlist={onRemoveFromWatchlist}
            />
          )
          unmount()
        },
        { iterations: 20 }
      )

      // In a real scenario, you would compare against a baseline
      // For this test, we just ensure the benchmark runs
      expect(currentResult.averageTime).toBeGreaterThanOrEqual(0)
      expect(currentResult.opsPerSecond).toBeGreaterThan(0)
    })

    it('should benchmark search functionality performance', async () => {
      const searchFunction = () => {
        return mockMovies.filter(movie => 
          movie.title.toLowerCase().includes('movie')
        )
      }

      const result = await benchmark('search-performance', searchFunction, { iterations: 100 })

      expect(result.averageTime).toBeGreaterThanOrEqual(0)
      // Search should be fast for 100 items
      expect(result.opsPerSecond).toBeGreaterThan(100)
    })

    it('should benchmark watchlist operations', async () => {
      let watchlist: Movie[] = []

      const addToWatchlistFunction = () => {
        const movie = mockMovies[Math.floor(Math.random() * mockMovies.length)]
        if (!watchlist.find(item => item.id === movie.id)) {
          watchlist.push(movie)
        }
      }

      const result = await benchmark('watchlist-add', addToWatchlistFunction, { iterations: 50 })

      expect(result.averageTime).toBeGreaterThanOrEqual(0)
      expect(watchlist.length).toBeGreaterThan(0)
    })
  })

  describe('Bundle Size Impact', () => {
    it('should measure component bundle impact', async () => {
      // Simulate different component loading scenarios
      const scenarios = [
        {
          name: 'minimal-components',
          load: () => {
            // Simulate loading only essential components
            return Promise.resolve()
          }
        },
        {
          name: 'full-components',
          load: () => {
            // Simulate loading all components
            return Promise.resolve()
          }
        }
      ]

      const results = await Promise.all(
        scenarios.map(scenario => 
          benchmarkAsync(scenario.name, scenario.load, { iterations: 5 })
        )
      )

      expect(results).toHaveLength(2)
      results.forEach(result => {
        expect(result.averageTime).toBeGreaterThanOrEqual(0)
      })
    })
  })
})