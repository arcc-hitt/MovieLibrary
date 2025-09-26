import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Find your movie" />)
    
    expect(screen.getByPlaceholderText('Find your movie')).toBeInTheDocument()
  })

  it('shows search icon by default', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const searchIcon = document.querySelector('[class*="lucide-search"]')
    expect(searchIcon).toBeInTheDocument()
  })

  it('shows loading spinner when isLoading is true', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />)
    
    const loadingIcon = document.querySelector('[class*="animate-spin"]')
    expect(loadingIcon).toBeInTheDocument()
  })

  it('disables input when loading', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('calls onSearch after debounce delay', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test query' } })

    // Should call with empty string initially
    expect(mockOnSearch).toHaveBeenCalledWith('')

    // Wait for debounce
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query')
    }, { timeout: 1000 })
  })

  it('shows clear button when input has value', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })
  })

  it('does not show clear button when input is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const clearButton = screen.queryByLabelText('Clear search')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('clears input when clear button is clicked', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)
    })

    expect(input).toHaveValue('')
  })

  it('calls onSearch with empty string when cleared', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)
    })

    // Should eventually call with empty string
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('')
    })
  })

  it('clears input when Escape key is pressed', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })

    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('immediately triggers search on form submit', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test query' } })

    // Submit form before debounce timeout
    const form = input.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query')
    })
  })

  it('has proper accessibility attributes', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    expect(input).toHaveAttribute('aria-label', 'Search for movies by title')
  })

  it('calls onSearch with empty string on initial render', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('updates input value correctly', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })

    expect(input).toHaveValue('test')
  })

  it('handles keyboard navigation', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(input).toHaveValue('')
  })
})