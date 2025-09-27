import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeToggle } from '../ThemeToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock the useTheme hook
const mockToggleTheme = vi.fn()
const mockUseTheme = {
  currentTheme: 'light' as const,
  resolvedTheme: 'light' as const,
  toggleTheme: mockToggleTheme,
  setTheme: vi.fn(),
  themes: [],
  systemTheme: 'light' as const,
}

vi.mock('@/contexts/ThemeContext', async () => {
  const actual = await vi.importActual('@/contexts/ThemeContext')
  return {
    ...actual,
    useTheme: () => mockUseTheme,
  }
})

const ThemeToggleWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    render(
      <ThemeToggleWrapper>
        <ThemeToggle />
      </ThemeToggleWrapper>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Switch to'))
  })

  it('calls toggleTheme when clicked', () => {
    render(
      <ThemeToggleWrapper>
        <ThemeToggle />
      </ThemeToggleWrapper>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('shows label when showLabel is true', () => {
    render(
      <ThemeToggleWrapper>
        <ThemeToggle showLabel />
      </ThemeToggleWrapper>
    )

    expect(screen.getByText('Light')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <ThemeToggleWrapper>
        <ThemeToggle className="custom-class" />
      </ThemeToggleWrapper>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('has proper accessibility attributes', () => {
    render(
      <ThemeToggleWrapper>
        <ThemeToggle />
      </ThemeToggleWrapper>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
    expect(button).toHaveAttribute('title')
  })

  it('displays different themes correctly', () => {
    // Test dark theme
    mockUseTheme.currentTheme = 'dark'
    render(
      <ThemeToggleWrapper>
        <ThemeToggle showLabel />
      </ThemeToggleWrapper>
    )
    expect(screen.getByText('Dark')).toBeInTheDocument()

    // Test system theme
    mockUseTheme.currentTheme = 'system'
    render(
      <ThemeToggleWrapper>
        <ThemeToggle showLabel />
      </ThemeToggleWrapper>
    )
    expect(screen.getByText('System')).toBeInTheDocument()
  })
})