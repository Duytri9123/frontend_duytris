import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@/components/common/pagination'

describe('Pagination', () => {
  it('renders prev and next buttons', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByText(/Trước/)).toBeInTheDocument()
    expect(screen.getByText(/Sau/)).toBeInTheDocument()
  })

  it('calls onPageChange with correct page when clicking a page button', async () => {
    const onPageChange = jest.fn()
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByText('2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with currentPage - 1 when clicking prev', async () => {
    const onPageChange = jest.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByText(/Trước/))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with currentPage + 1 when clicking next', async () => {
    const onPageChange = jest.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByText(/Sau/))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('disables prev button on first page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} />)
    expect(screen.getByText(/Trước/).closest('button')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination currentPage={3} totalPages={3} onPageChange={jest.fn()} />)
    expect(screen.getByText(/Sau/).closest('button')).toBeDisabled()
  })

  it('returns null when totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={jest.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })
})
