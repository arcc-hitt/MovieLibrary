import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders alert with default variant', () => {
      render(<Alert data-testid="alert">Alert content</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('role', 'alert')
      expect(alert).toHaveClass('bg-card', 'text-card-foreground')
    })

    it('renders alert with destructive variant', () => {
      render(<Alert variant="destructive" data-testid="alert">Error alert</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass('text-destructive', 'bg-card')
    })

    it('applies custom className', () => {
      render(<Alert className="custom-alert" data-testid="alert">Alert</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass('custom-alert')
    })

    it('has proper base classes', () => {
      render(<Alert data-testid="alert">Alert</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'px-4',
        'py-3',
        'text-sm'
      )
    })

    it('has proper data attribute', () => {
      render(<Alert data-testid="alert">Alert</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('data-slot', 'alert')
    })
  })

  describe('AlertTitle', () => {
    it('renders alert title with default classes', () => {
      render(<AlertTitle data-testid="title">Alert Title</AlertTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveClass(
        'col-start-2',
        'line-clamp-1',
        'min-h-4',
        'font-medium',
        'tracking-tight'
      )
    })

    it('applies custom className', () => {
      render(<AlertTitle className="custom-title" data-testid="title">Title</AlertTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
    })

    it('has proper data attribute', () => {
      render(<AlertTitle data-testid="title">Title</AlertTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveAttribute('data-slot', 'alert-title')
    })
  })

  describe('AlertDescription', () => {
    it('renders alert description with default classes', () => {
      render(<AlertDescription data-testid="description">Description</AlertDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toHaveClass(
        'text-muted-foreground',
        'col-start-2',
        'grid',
        'justify-items-start',
        'gap-1',
        'text-sm'
      )
    })

    it('applies custom className', () => {
      render(<AlertDescription className="custom-desc" data-testid="description">Desc</AlertDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toHaveClass('custom-desc')
    })

    it('has proper data attribute', () => {
      render(<AlertDescription data-testid="description">Description</AlertDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toHaveAttribute('data-slot', 'alert-description')
    })
  })

  describe('Complete Alert', () => {
    it('renders complete alert structure', () => {
      render(
        <Alert data-testid="complete-alert">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>This is a warning message.</AlertDescription>
        </Alert>
      )

      expect(screen.getByTestId('complete-alert')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('This is a warning message.')).toBeInTheDocument()
    })

    it('renders alert with icon', () => {
      render(
        <Alert data-testid="alert-with-icon">
          <svg data-testid="alert-icon" />
          <AlertTitle>Alert with Icon</AlertTitle>
          <AlertDescription>This alert has an icon.</AlertDescription>
        </Alert>
      )

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
      expect(screen.getByText('Alert with Icon')).toBeInTheDocument()
    })
  })
})