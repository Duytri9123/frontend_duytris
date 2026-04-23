import React from 'react'
import { render, container } from '@testing-library/react'
import { LoadingSpinner } from '@/components/common/loading-spinner'

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders a spinning element', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
