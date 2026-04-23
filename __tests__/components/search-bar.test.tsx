import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/common/search-bar'

describe('SearchBar', () => {
  it('renders input and submit button', () => {
    render(<SearchBar onSearch={jest.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tìm/ })).toBeInTheDocument()
  })

  it('uses default placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} />)
    expect(screen.getByPlaceholderText('Tìm kiếm sản phẩm...')).toBeInTheDocument()
  })

  it('uses custom placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} placeholder="Search here" />)
    expect(screen.getByPlaceholderText('Search here')).toBeInTheDocument()
  })

  it('calls onSearch with trimmed query on submit', async () => {
    const onSearch = jest.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)

    await user.type(screen.getByRole('textbox'), '  laptop  ')
    await user.click(screen.getByRole('button', { name: /Tìm/ }))

    expect(onSearch).toHaveBeenCalledWith('laptop')
  })

  it('calls onSearch with empty string when input is blank', async () => {
    const onSearch = jest.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)

    await user.click(screen.getByRole('button', { name: /Tìm/ }))

    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('calls onSearch on form submit via Enter key', async () => {
    const onSearch = jest.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)

    await user.type(screen.getByRole('textbox'), 'shoes{Enter}')

    expect(onSearch).toHaveBeenCalledWith('shoes')
  })
})
