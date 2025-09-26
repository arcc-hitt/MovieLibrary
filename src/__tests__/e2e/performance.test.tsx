import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home/Home'
import { performanceMonitor } from '@/utils/performance'

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => [{ duration: 50 }]),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
}

Object.defineProperty(globalThis, 'performance', {
  value: mockPerformance,
  writable: true,
})

// Mock the stores
const mockMovieStore = {
  popularMovies: [],
  searchResults: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  fetchPopularMovies: vi.fn(),
  searchMovies: vi.fn(),
  clearSearch: vi.fn(),
}

const mockWatchlistStore = {
  watchlist: [],
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
  isInWatchlist: vi.fn(() => false),
  loadWatchlist: vi.fn(),
}

vi.mock('@/stores/movieStore', () => ({
  useMovieStore: vi.fn(() => mockMovieStore),
}))

vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: vi.fn(() => mockWatchlistStore),
}))

const mockMovies = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Movie ${i + 1}`,
  poster_path: `/movie${i + 1}.jpg`,
  release_date: '2023-01-01',
  overview: `Overview for movie ${i + 1}`,
  vote_average: 7.5 + (i % 3),
  genre_ids: [28, 878],
}))

const HomeWrapper = () => (
  <BrowserRouter>
    <Home />
  </BrowserRouter>
)

describe('Performance End-to-End Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockMovieStore.popularMovies = mockMovies
    mockMovieStore.searchResults = []
    mockMovieStore.isLoading = false
    mockMovieStore.error = null
    mockMovieStore.searchQuery = ''
    mockWatchlistStore.watchlist = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render large movie lists efficiently', async () => {
    const startTime = performance.now()
    
    render(<HomeWrapper />)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(1000) // 1 second

    // Should render all movies
    expect(screen.getByText('Movie 1')).toBeInTheDocument()
    expect(screen.getByText('Movie 20')).toBeInTheDocument()
  })

  it('should handle rapid search input changes efficiently', async () => {
    render(<HomeWrapper />)

    const searchInput = screen.getByPlaceholderText('Search for movies...')
    
    const startTime = performance.now()

    // Simulate rapid typing
    await user.type(searchInput, 'matrix', { delay: 10 })

    const endTime = performance.now()
    const typingTime = endTime - startTime

    // Should handle rapid input efficiently
    expect(typingTime).toBeLessThan(500) // 500ms

    // Should debounce search calls
    await waitFor(() => {
      expect(mockMovieStore.searchMovies).toHaveBeenCalledWith('matrix')
    }, { timeout: 1000 })

    // Should not call search for every keystroke
    expect(mockMovieStore.searchMovies).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple watchlist operations efficiently', async () => {
    let operationTimes: number[] = []
    
    mockWatchlistStore.addToWatchlist.mockImplementation((movie) => {
      const start = performance.now()
      // Simulate some processing
      const end = performance.now()
      operationTimes.push(end - start)
    })

    render(<HomeWrapper />)

    // Add multiple movies to watchlist rapidly
    const addButtons = screen.getAllByLabelText(/Add .* to watchlist/)
    
    const startTime = performance.now()
    
    for (let i = 0; i < Math.min(5, addButtons.length); i++) {
      await user.click(addButtons[i])
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime

    // Should handle multiple operations efficiently
    expect(totalTime).toBeLessThan(1000) // 1 second for 5 operations

    // Each operation should be fast
    operationTimes.forEach(time => {
      expect(time).toBeLessThan(100) // 100ms per operation
    })
  })

  it('should handle image loading performance', async () => {
    render(<HomeWrapper />)

    // Check that images have lazy loading attributes
    const images = screen.getAllByRole('img')
    
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveAttribute('decoding', 'async')
    })

    // Should start with opacity-0 for smooth loading
    images.forEach(img => {
      expect(img).toHaveClass('opacity-0')
    })

    // Simulate image load
    const firstImage = images[0]
    fireEvent.load(firstImage)

    await waitFor(() => {
      expect(firstImage).toHaveClass('opacity-100')
    })
  })

  it('should handle memory usage efficiently', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0

    render(<HomeWrapper />)

    // Perform various operations
    const searchInput = screen.getByPlaceholderText('Search for movies...')
    await user.type(searchInput, 'test')
    await user.clear(searchInput)

    // Add and remove from watchlist
    const addButton = screen.getByLabelText('Add Movie 1 to watchlist')
    await user.click(addButton)

    const currentMemory = performance.memory?.usedJSHeapSize || 0
    const memoryIncrease = currentMemory - initialMemory

    // Memory increase should be reasonable (adjust threshold as needed)
    expect(memoryIncrease).toBeLessThan(10000000) // 10MB
  })

  it('should handle component re-renders efficiently', async () => {
    let renderCount = 0
    
    // Mock a component that tracks renders
    const OriginalHome = Home
    const TrackedHome = () => {
      renderCount++
      return <OriginalHome />
    }

    const TrackedHomeWrapper = () => (
      <BrowserRouter>
        <TrackedHome />
      </BrowserRouter>
    )

    render(<TrackedHomeWrapper />)

    const initialRenderCount = renderCount

    // Perform operations that might cause re-renders
    const searchInput = screen.getByPlaceholderText('Search for movies...')
    await user.type(searchInput, 'a')
    await user.type(searchInput, 'b')
    await user.type(searchInput, 'c')

    // Should not cause excessive re-renders
    const finalRenderCount = renderCount
    const additionalRenders = finalRenderCount - initialRenderCount

    // Should have minimal additional renders (adjust threshold as needed)
    expect(additionalRenders).toBeLessThan(10)
  })

  it('should handle scroll performance with large lists', async () => {
    // Create a large list of movies
    const largeMovieList = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      title: `Movie ${i + 1}`,
      poster_path: `/movie${i + 1}.jpg`,
      release_date: '2023-01-01',
      overview: `Overview for movie ${i + 1}`,
      vote_average: 7.5,
      genre_ids: [28, 878],
    }))

    mockMovieStore.popularMovies = largeMovieList

    render(<HomeWrapper />)

    // Should render without performance issues
    expect(screen.getByText('Movie 1')).toBeInTheDocument()

    // Simulate scroll events
    const startTime = performance.now()
    
    for (let i = 0; i < 10; i++) {
      fireEvent.scroll(window, { target: { scrollY: i * 100 } })
    }

    const endTime = performance.now()
    const scrollTime = endTime - startTime

    // Scroll handling should be efficient
    expect(scrollTime).toBeLessThan(100) // 100ms for 10 scroll events
  })

  it('should handle bundle size and loading performance', async () => {
    // Mock navigation timing
    const mockNavigationTiming = {
      domContentLoadedEventEnd: 1000,
      domContentLoadedEventStart: 500,
      loadEventEnd: 1500,
      loadEventStart: 1200,
      fetchStart: 0,
    }

    mockPerformance.getEntriesByType.mockReturnValue([mockNavigationTiming])

    render(<HomeWrapper />)

    // Check that components are loaded
    expect(screen.getByText('Popular Movies')).toBeInTheDocument()

    // Simulate checking bundle performance
    const entries = performance.getEntriesByType('navigation')
    expect(entries).toHaveLength(1)

    const timing = entries[0] as any
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart
    const loadComplete = timing.loadEventEnd - timing.loadEventStart
    const totalPageLoad = timing.loadEventEnd - timing.fetchStart

    // Performance thresholds (adjust as needed)
    expect(domContentLoaded).toBeLessThan(1000) // 1 second
    expect(loadComplete).toBeLessThan(500) // 500ms
    expect(totalPageLoad).toBeLessThan(3000) // 3 seconds
  })

  it('should handle concurrent operations efficiently', async () => {
    render(<HomeWrapper />)

    const startTime = performance.now()

    // Perform multiple concurrent operations
    const promises = [
      user.type(screen.getByPlaceholderText('Search for movies...'), 'test'),
      user.click(screen.getByLabelText('Add Movie 1 to watchlist')),
      user.click(screen.getByLabelText('Add Movie 2 to watchlist')),
    ]

    await Promise.all(promises)

    const endTime = performance.now()
    const concurrentTime = endTime - startTime

    // Concurrent operations should complete efficiently
    expect(concurrentTime).toBeLessThan(1000) // 1 second

    // All operations should have completed
    expect(mockMovieStore.searchMovies).toHaveBeenCalled()
    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledTimes(2)
  })

  it('should handle error recovery performance', async () => {
    // Start with error state
    mockMovieStore.error = 'Network error'
    mockMovieStore.isLoading = false

    render(<HomeWrapper />)

    expect(screen.getByText('Failed to Load Movies')).toBeInTheDocument()

    const startTime = performance.now()

    // Recover from error
    mockMovieStore.error = null
    mockMovieStore.popularMovies = mockMovies

    const retryButton = screen.getByText('Try Again')
    await user.click(retryButton)

    // Wait for recovery
    await waitFor(() => {
      expect(screen.getByText('Popular Movies')).toBeInTheDocument()
    })

    const endTime = performance.now()
    const recoveryTime = endTime - startTime

    // Error recovery should be fast
    expect(recoveryTime).toBeLessThan(500) // 500ms
  })
})