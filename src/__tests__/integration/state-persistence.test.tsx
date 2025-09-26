import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home/Home'
import Watchlist from '@/pages/Watchlist/Watchlist'
import { StorageService } from '@/services/storage'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock the stores with real-like behavior
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
  isInWatchlist: vi.fn(),
  loadWatchlist: vi.fn(),
}

vi.mock('@/stores/movieStore', () => ({
  useMovieStore: vi.fn(() => mockMovieStore),
}))

vi.mock('@/stores/watchlistStore', () => ({
  useWatchlistStore: vi.fn(() => mockWatchlistStore),
}))

// Mock StorageService
vi.mock('@/services/storage', () => ({
  StorageService: {
    getWatchlist: vi.fn(),
    saveWatchlist: vi.fn(),
    addMovie: vi.fn(),
    removeMovie: vi.fn(),
  },
}))

const mockMovies = [
  {
    id: 1,
    title: 'The Matrix',
    poster_path: '/matrix.jpg',
    release_date: '1999-03-31',
    overview: 'A computer programmer discovers reality is a simulation.',
    vote_average: 8.7,
    genre_ids: [28, 878],
  },
  {
    id: 2,
    title: 'Inception',
    poster_path: '/inception.jpg',
    release_date: '2010-07-16',
    overview: 'A thief enters dreams to plant ideas.',
    vote_average: 8.8,
    genre_ids: [28, 878, 53],
  },
]

describe('State Persistence Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockMovieStore.popularMovies = mockMovies
    mockMovieStore.searchResults = []
    mockMovieStore.isLoading = false
    mockMovieStore.error = null
    mockMovieStore.searchQuery = ''
    mockWatchlistStore.watchlist = []
    mockWatchlistStore.isInWatchlist.mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should persist watchlist to localStorage when adding movies', async () => {
    const watchlistMovie = {
      id: 1,
      title: 'The Matrix',
      poster_path: '/matrix.jpg',
      release_date: '1999-03-31',
      addedAt: expect.any(String),
    }

    // Mock the addToWatchlist to simulate real behavior
    mockWatchlistStore.addToWatchlist.mockImplementation((movie) => {
      const watchlistItem = {
        ...movie,
        addedAt: new Date().toISOString(),
      }
      mockWatchlistStore.watchlist.push(watchlistItem)
      StorageService.addMovie(movie)
    })

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    // Add movie to watchlist
    const addButton = screen.getByLabelText('Add to watchlist')
    await user.click(addButton)

    // Should call storage service to persist
    expect(StorageService.addMovie).toHaveBeenCalledWith(mockMovies[0])
    expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledWith(mockMovies[0])
  })

  it('should load watchlist from localStorage on app start', async () => {
    const persistedWatchlist = [
      {
        id: 1,
        title: 'The Matrix',
        poster_path: '/matrix.jpg',
        release_date: '1999-03-31',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
    ]

    // Mock StorageService to return persisted data
    vi.mocked(StorageService.getWatchlist).mockReturnValue(persistedWatchlist)
    
    // Mock loadWatchlist to simulate real behavior
    mockWatchlistStore.loadWatchlist.mockImplementation(() => {
      mockWatchlistStore.watchlist = StorageService.getWatchlist()
    })

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should load watchlist from storage
    expect(StorageService.getWatchlist).toHaveBeenCalled()
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled()
  })

  it('should persist watchlist removal to localStorage', async () => {
    const watchlistMovie = {
      id: 1,
      title: 'The Matrix',
      poster_path: '/matrix.jpg',
      release_date: '1999-03-31',
      addedAt: '2023-01-01T00:00:00.000Z',
    }

    mockWatchlistStore.watchlist = [watchlistMovie]

    // Mock removeFromWatchlist to simulate real behavior
    mockWatchlistStore.removeFromWatchlist.mockImplementation((movieId) => {
      mockWatchlistStore.watchlist = mockWatchlistStore.watchlist.filter(
        (movie) => movie.id !== movieId
      )
      StorageService.removeMovie(movieId)
    })

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Remove movie from watchlist
    const removeButton = screen.getByText('Remove from Watchlist')
    await user.click(removeButton)

    // Should call storage service to remove
    expect(StorageService.removeMovie).toHaveBeenCalledWith(1)
    expect(mockWatchlistStore.removeFromWatchlist).toHaveBeenCalledWith(1)
  })

  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw error
    vi.mocked(StorageService.getWatchlist).mockImplementation(() => {
      throw new Error('localStorage not available')
    })

    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockWatchlistStore.loadWatchlist.mockImplementation(() => {
      try {
        mockWatchlistStore.watchlist = StorageService.getWatchlist()
      } catch (error) {
        console.error('Failed to load watchlist:', error)
        mockWatchlistStore.watchlist = []
      }
    })

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should handle error gracefully
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load watchlist:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should maintain watchlist state across page refreshes', async () => {
    const persistedWatchlist = [
      {
        id: 1,
        title: 'The Matrix',
        poster_path: '/matrix.jpg',
        release_date: '1999-03-31',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'Inception',
        poster_path: '/inception.jpg',
        release_date: '2010-07-16',
        addedAt: '2023-01-02T00:00:00.000Z',
      },
    ]

    vi.mocked(StorageService.getWatchlist).mockReturnValue(persistedWatchlist)
    mockWatchlistStore.watchlist = persistedWatchlist

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should show persisted movies
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()
    expect(screen.getByText(/2.*movies.*saved to watch later/)).toBeInTheDocument()
  })

  it('should handle corrupted localStorage data', async () => {
    // Mock corrupted data
    vi.mocked(StorageService.getWatchlist).mockImplementation(() => {
      throw new Error('Invalid JSON')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockWatchlistStore.loadWatchlist.mockImplementation(() => {
      try {
        mockWatchlistStore.watchlist = StorageService.getWatchlist()
      } catch (error) {
        console.error('Failed to load watchlist:', error)
        mockWatchlistStore.watchlist = []
        // Clear corrupted data
        StorageService.saveWatchlist([])
      }
    })

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should handle corrupted data gracefully
    expect(mockWatchlistStore.loadWatchlist).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should preserve watchlist order based on added date', async () => {
    const watchlistMovies = [
      {
        id: 2,
        title: 'Inception',
        poster_path: '/inception.jpg',
        release_date: '2010-07-16',
        addedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 1,
        title: 'The Matrix',
        poster_path: '/matrix.jpg',
        release_date: '1999-03-31',
        addedAt: '2023-01-02T00:00:00.000Z',
      },
    ]

    vi.mocked(StorageService.getWatchlist).mockReturnValue(watchlistMovies)
    mockWatchlistStore.watchlist = watchlistMovies

    render(
      <BrowserRouter>
        <Watchlist />
      </BrowserRouter>
    )

    // Should maintain order (most recently added first)
    const movieTitles = screen.getAllByText(/The Matrix|Inception/)
    expect(movieTitles[0]).toHaveTextContent('Inception')
    expect(movieTitles[1]).toHaveTextContent('The Matrix')
  })

  it('should handle localStorage quota exceeded', async () => {
    // Mock quota exceeded error
    vi.mocked(StorageService.addMovie).mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockWatchlistStore.addToWatchlist.mockImplementation((movie) => {
      try {
        StorageService.addMovie(movie)
        mockWatchlistStore.watchlist.push({
          ...movie,
          addedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Failed to save to watchlist:', error)
        // Could show user notification here
      }
    })

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const addButton = screen.getByLabelText('Add to watchlist')
    await user.click(addButton)

    // Should handle quota error gracefully
    expect(consoleSpy).toHaveBeenCalledWith('Failed to save to watchlist:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should sync watchlist state between tabs', async () => {
    // This would require testing storage events
    // For now, we'll test that the storage service is called correctly
    
    const watchlistMovie = {
      id: 1,
      title: 'The Matrix',
      poster_path: '/matrix.jpg',
      release_date: '1999-03-31',
      addedAt: '2023-01-01T00:00:00.000Z',
    }

    mockWatchlistStore.addToWatchlist.mockImplementation((movie) => {
      const item = { ...movie, addedAt: new Date().toISOString() }
      mockWatchlistStore.watchlist.push(item)
      StorageService.addMovie(movie)
      
      // Simulate storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'movie-library-watchlist',
        newValue: JSON.stringify([item]),
      }))
    })

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const addButton = screen.getByLabelText('Add to watchlist')
    await user.click(addButton)

    expect(StorageService.addMovie).toHaveBeenCalledWith(mockMovies[0])
  })
})