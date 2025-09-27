// @ts-nocheck
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MovieCard } from '../MovieCard'
import type { Movie } from '../../../types/movie'

const baseMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  overview: 'A test movie',
  vote_average: 8.5,
  genre_ids: [1]
}

describe('MovieCard (minimal)', () => {
  const onAdd = vi.fn()
  const onRemove = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders basic movie info', () => {
    render(
      <MovieCard
        movie={baseMovie}
        isInWatchlist={false}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
      />
    )
    expect(screen.getByText('Test Movie')).toBeTruthy()
    expect(screen.getByText('2023')).toBeTruthy()
    expect(screen.getByText('8.5')).toBeTruthy()
  })

  it('renders poster image when poster_path provided', () => {
    render(
      <MovieCard
        movie={baseMovie}
        isInWatchlist={false}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
      />
    )
    expect(screen.getByAltText('Movie poster for Test Movie (2023)')).toBeTruthy()
  })

  it('renders fallback when no poster', () => {
    const noPoster: Movie = { ...baseMovie, poster_path: null }
    render(
      <MovieCard
        movie={noPoster}
        isInWatchlist={false}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
      />
    )
    expect(screen.getByText('No Image Available')).toBeTruthy()
  })

  it('calls add handler when clicking add button', () => {
    render(
      <MovieCard
        movie={baseMovie}
        isInWatchlist={false}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
      />
    )
    fireEvent.click(screen.getByLabelText('Add Test Movie to watchlist'))
    expect(onAdd).toHaveBeenCalledWith(baseMovie)
  })

  it('calls remove handler when clicking remove button', () => {
    render(
      <MovieCard
        movie={baseMovie}
        isInWatchlist={true}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
      />
    )
    fireEvent.click(screen.getByLabelText('Remove Test Movie from watchlist'))
    expect(onRemove).toHaveBeenCalledWith(baseMovie.id)
  })

  it('shows watchlist indicator when variant is watchlist and movie is in watchlist', () => {
    render(
      <MovieCard
        movie={baseMovie}
        isInWatchlist={true}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
        variant="watchlist"
      />
    )
    expect(screen.getByText('In Watchlist')).toBeTruthy()
  })

  it('hides rating badge when vote_average is 0', () => {
    const noRating: Movie = { ...baseMovie, vote_average: 0 }
    render(
      <MovieCard
        movie={noRating}
        isInWatchlist={false}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
      />
    )
    // Star not present when rating zero
    expect(screen.queryByText('⭐')).toBeNull()
  })

  it('handles missing release date gracefully', () => {
    const noDate: Movie = { ...baseMovie, release_date: '' }
    render(
      <MovieCard
        movie={noDate}
        isInWatchlist={false}
        onAddToWatchlist={onAdd}
        onRemoveFromWatchlist={onRemove}
      />
    )
    expect(screen.queryByText('2023')).toBeNull()
  })
})