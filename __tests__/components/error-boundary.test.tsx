import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@/components/common/error-boundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error message')
  return <div>Normal content</div>
}

// Suppress console.error for expected error boundary tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  jest.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('renders default fallback when error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('renders retry button in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByRole('button', { name: /Thử lại/ })).toBeInTheDocument()
  })

  it('resets error state when retry is clicked', async () => {
    const user = userEvent.setup()
    // We need a component that can toggle the error
    let throwError = true
    const ToggleError = () => {
      if (throwError) throw new Error('oops')
      return <div>Recovered</div>
    }

    render(
      <ErrorBoundary>
        <ToggleError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument()

    throwError = false
    await user.click(screen.getByRole('button', { name: /Thử lại/ }))
    expect(screen.getByText('Recovered')).toBeInTheDocument()
  })
})
