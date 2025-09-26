import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input.tagName).toBe('INPUT')
  })

  it('renders input with custom type', () => {
    render(<Input type="email" placeholder="Enter email" />)
    
    const input = screen.getByPlaceholderText('Enter email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test value')
  })

  it('applies default classes', () => {
    render(<Input data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'border-input',
      'bg-transparent',
      'px-3',
      'py-1',
      'rounded-md',
      'border'
    )
  })

  it('has proper focus styles', () => {
    render(<Input data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  it('has proper disabled styles', () => {
    render(<Input disabled data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass(
      'disabled:pointer-events-none',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    )
  })

  it('has proper placeholder styles', () => {
    render(<Input placeholder="Placeholder text" data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('placeholder:text-muted-foreground')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} data-testid="input" />)
    
    expect(ref.current).toBeTruthy()
  })

  it('handles all input attributes', () => {
    render(
      <Input
        id="test-input"
        name="test"
        required
        maxLength={100}
        placeholder="Test"
        data-testid="input"
      />
    )
    
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'test')
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('maxLength', '100')
  })

  it('supports controlled input', () => {
    const { rerender } = render(<Input value="initial" onChange={() => {}} />)
    
    const input = screen.getByDisplayValue('initial')
    expect(input).toHaveValue('initial')
    
    rerender(<Input value="updated" onChange={() => {}} />)
    expect(input).toHaveValue('updated')
  })

  it('supports uncontrolled input', () => {
    render(<Input defaultValue="default" />)
    
    const input = screen.getByDisplayValue('default')
    expect(input).toHaveValue('default')
    
    fireEvent.change(input, { target: { value: 'changed' } })
    expect(input).toHaveValue('changed')
  })

  it('has proper aria-invalid styles when invalid', () => {
    render(<Input aria-invalid data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'aria-invalid:border-destructive'
    )
  })
})