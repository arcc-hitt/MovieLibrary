import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MovieCard } from '../MovieCard'
import type { Movie } from '@/types/movie'

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  overview: 'A test movie',
  vote_average: 8.5,
  genre_ids: [1, 2, 3]
}

const mockMovieWithoutPoster: Movie = {
  ...mockMovie,
  poster_path: null
}

describe('MovieCard', () => {
  const mockOnAddToWatchlist = vi.fn()
  const mockOnRemoveFromWatchlist = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders movie information correctly', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('⭐ 8.5')).toBeInTheDocument()
  })

  it('displays movie poster when poster_path is provided', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    const posterImage = screen.getByAltText('Test Movie poster')
    expect(posterImage).toBeInTheDocument()
    expect(posterImage).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/test-poster.jpg')
  })

  it('displays fallback when poster_path is null', () => {
    render(
      <MovieCard
        movie={mockMovieWithoutPoster}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    expect(screen.getByText('No Image')).toBeInTheDocument()
    expect(screen.getByText('🎬')).toBeInTheDocument()
  })

  it('shows add to watchlist button when not in watchlist', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    const addButton = screen.getByLabelText('Add to watchlist')
    expect(addButton).toBeInTheDocument()
  })

  it('shows remove from watchlist button when in watchlist', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={true}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    const removeButton = screen.getByLabelText('Remove from watchlist')
    expect(removeButton).toBeInTheDocument()
  })

  it('calls onAddToWatchlist when add button is clicked', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    const addButton = screen.getByLabelText('Add to watchlist')
    fireEvent.click(addButton)

    expect(mockOnAddToWatchlist).toHaveBeenCalledWith(mockMovie)
    expect(mockOnRemoveFromWatchlist).not.toHaveBeenCalled()
  })

  it('calls onRemoveFromWatchlist when remove button is clicked', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={true}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    const removeButton = screen.getByLabelText('Remove from watchlist')
    fireEvent.click(removeButton)

    expect(mockOnRemoveFromWatchlist).toHaveBeenCalledWith(mockMovie.id)
    expect(mockOnAddToWatchlist).not.toHaveBeenCalled()
  })

  it('shows watchlist indicator in watchlist variant', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={true}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
        variant="watchlist"
      />
    )

    expect(screen.getByText('In Watchlist')).toBeInTheDocument()
  })

  it('handles image loading states correctly', async () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    const posterImage = screen.getByAltText('Test Movie poster')
    
    // Initially image should have opacity-0 class
    expect(posterImage).toHaveClass('opacity-0')

    // Simulate image load
    fireEvent.load(posterImage)

    await waitFor(() => {
      expect(posterImage).toHaveClass('opacity-100')
    })
  })

  it('handles image error correctly', async () => {
    render(
      <MovieCard
        movie={mockMovie}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    const posterImage = screen.getByAltText('Test Movie poster')
    
    // Simulate image error
    fireEvent.error(posterImage)

    await waitFor(() => {
      expect(screen.getByText('No Image')).toBeInTheDocument()
    })
  })

  it('does not show rating badge when vote_average is 0', () => {
    const movieWithoutRating = { ...mockMovie, vote_average: 0 }
    
    render(
      <MovieCard
        movie={movieWithoutRating}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    expect(screen.queryByText(/⭐/)).not.toBeInTheDocument()
  })

  it('handles missing release date gracefully', () => {
    const movieWithoutDate = { ...mockMovie, release_date: '' }
    
    render(
      <MovieCard
        movie={movieWithoutDate}
        isInWatchlist={false}
        onAddToWatchlist={mockOnAddToWatchlist}
        onRemoveFromWatchlist={mockOnRemoveFromWatchlist}
      />
    )

    expect(screen.queryByText('2023')).not.toBeInTheDocument()
  })
})