import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LazyImage } from '../LazyImage'

// Mock performance tracking
const mockTracker = {
  onLoad: vi.fn(),
  onError: vi.fn(),
}

vi.mock('@/utils/performance', () => ({
  trackImageLoading: vi.fn(() => mockTracker),
}))

describe('LazyImage', () => {
  const mockOnLoad = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockTracker.onLoad.mockClear()
    mockTracker.onError.mockClear()
  })

  it('renders with placeholder initially', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        placeholder={<div data-testid="placeholder">Loading...</div>}
      />
    )

    expect(screen.getByTestId('placeholder')).toBeInTheDocument()
  })

  it('shows image with opacity-0 initially', () => {
    render(<LazyImage src="/test-image.jpg" alt="Test image" />)

    const img = screen.getByAltText('Test image')
    expect(img).toHaveClass('opacity-0')
  })

  it('shows image with opacity-100 after load', async () => {
    render(<LazyImage src="/test-image.jpg" alt="Test image" />)

    const img = screen.getByAltText('Test image')
    
    // Simulate image load
    fireEvent.load(img)

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100')
    })
  })

  it('calls onLoad callback when image loads', async () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        onLoad={mockOnLoad}
      />
    )

    const img = screen.getByAltText('Test image')
    fireEvent.load(img)

    // Wait for the component to update
    await waitFor(() => {
      expect(img).toHaveClass('opacity-100')
    })
    
    // The performance tracker's onLoad should be called
    expect(mockTracker.onLoad).toHaveBeenCalled()
  })

  it('shows fallback when image fails to load', async () => {
    render(
      <LazyImage
        src="/broken-image.jpg"
        alt="Test image"
        fallback={<div data-testid="fallback">Failed to load</div>}
        onError={mockOnError}
      />
    )

    const img = screen.getByAltText('Test image')
    fireEvent.error(img)

    await waitFor(() => {
      expect(screen.getByTestId('fallback')).toBeInTheDocument()
    })
    
    // The performance tracker's onError should be called
    expect(mockTracker.onError).toHaveBeenCalled()
  })

  it('shows default fallback when no custom fallback provided', async () => {
    render(<LazyImage src="/broken-image.jpg" alt="Test image" />)

    const img = screen.getByAltText('Test image')
    fireEvent.error(img)

    await waitFor(() => {
      expect(screen.getByText('No Image')).toBeInTheDocument()
      expect(screen.getByText('🎬')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        className="custom-class"
      />
    )

    const container = screen.getByAltText('Test image').closest('.custom-class')
    expect(container).toBeInTheDocument()
  })

  it('has proper loading and decoding attributes', () => {
    render(<LazyImage src="/test-image.jpg" alt="Test image" />)

    const img = screen.getByAltText('Test image')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
  })

  it('does not load image until in view', () => {
    render(<LazyImage src="/test-image.jpg" alt="Test image" />)

    const img = screen.getByAltText('Test image')
    // Initially should not have src attribute
    expect(img).not.toHaveAttribute('src')
  })

  it('removes placeholder after image loads', async () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        placeholder={<div data-testid="placeholder">Loading...</div>}
      />
    )

    const img = screen.getByAltText('Test image')
    fireEvent.load(img)

    await waitFor(() => {
      expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument()
    })
  })
})