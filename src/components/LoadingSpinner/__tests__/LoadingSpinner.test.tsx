import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  LoadingSpinner, 
  LoadingOverlay, 
  ButtonLoading, 
  PageLoading 
} from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner variant by default', () => {
    render(<LoadingSpinner />);
    
    // Should render Loader2 icon with animation
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with text when provided', () => {
    render(<LoadingSpinner text="Loading movies..." />);
    
    expect(screen.getByText('Loading movies...')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(document.querySelector('.w-4')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    expect(document.querySelector('.w-8')).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    expect(document.querySelector('.w-12')).toBeInTheDocument();
  });

  it('renders dots variant', () => {
    render(<LoadingSpinner variant="dots" />);
    
    // Should render three bouncing dots
    const dots = document.querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('renders pulse variant', () => {
    render(<LoadingSpinner variant="pulse" />);
    
    const pulseElement = document.querySelector('.animate-pulse');
    expect(pulseElement).toBeInTheDocument();
  });

  it('renders movie variant', () => {
    render(<LoadingSpinner variant="movie" />);
    
    // Should render Film icon with pulse animation
    const movieIcon = document.querySelector('.animate-pulse');
    expect(movieIcon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

describe('LoadingOverlay', () => {
  it('renders fullscreen overlay', () => {
    render(<LoadingOverlay />);
    
    // Should render fixed overlay
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingOverlay text="Searching movies..." />);
    
    expect(screen.getByText('Searching movies...')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(<LoadingOverlay variant="dots" />);
    
    const dots = document.querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });
});

describe('ButtonLoading', () => {
  it('renders button loading state', () => {
    render(<ButtonLoading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<ButtonLoading text="Saving..." />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders with small size by default', () => {
    render(<ButtonLoading />);
    
    // Should use small size (w-4 h-4)
    expect(document.querySelector('.w-4')).toBeInTheDocument();
  });
});

describe('PageLoading', () => {
  it('renders page loading state', () => {
    render(<PageLoading />);
    
    expect(screen.getByText('Loading page...')).toBeInTheDocument();
    
    // Should have min-height for centering
    const container = document.querySelector('.min-h-\\[50vh\\]');
    expect(container).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<PageLoading text="Loading movies..." />);
    
    expect(screen.getByText('Loading movies...')).toBeInTheDocument();
  });

  it('renders with movie variant by default', () => {
    render(<PageLoading />);
    
    // Should render with pulse animation (movie variant)
    const pulseElement = document.querySelector('.animate-pulse');
    expect(pulseElement).toBeInTheDocument();
  });

  it('renders with xl size by default', () => {
    render(<PageLoading />);
    
    // Should use xl size (w-12 h-12)
    expect(document.querySelector('.w-12')).toBeInTheDocument();
  });
});