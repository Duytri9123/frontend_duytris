import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'
import { CartItem } from '@/components/cart/cart-item'
import { useCartStore } from '@/stores/cart-store'
import type { GuestCartItem } from '@/types'

const mockVariant = {
  id: 10,
  sku: 'SKU-001',
  selling_price: 100000,
  original_price: 120000,
  quantity: 5,
  weight: null,
  dimensions: null,
  is_default: true,
  attribute_values: [
    {
      id: 1,
      value: 'Đỏ',
      product_attribute: { id: 1, name: 'Màu sắc' },
    },
  ],
  image_indexes: [],
}

const mockItem: GuestCartItem = {
  productId: 1,
  name: 'Test Product',
  quantity: 2,
  variant: mockVariant,
}

beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [] })
  })
})

describe('CartItem', () => {
  it('renders product name', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders variant attribute label', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('Đỏ')).toBeInTheDocument()
  })

  it('renders SKU', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText(/SKU-001/)).toBeInTheDocument()
  })

  it('renders quantity', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders total price (selling_price * quantity)', () => {
    render(<CartItem item={mockItem} />)
    // 100000 * 2 = 200000
    expect(screen.getByText(/200\.000₫/)).toBeInTheDocument()
  })

  it('renders unit price', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText(/100\.000₫ \/ cái/)).toBeInTheDocument()
  })

  it('decrement button is disabled when quantity is 1', () => {
    const item = { ...mockItem, quantity: 1 }
    render(<CartItem item={item} />)
    expect(screen.getByText('−').closest('button')).toBeDisabled()
  })

  it('decrement button is enabled when quantity > 1', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('−').closest('button')).not.toBeDisabled()
  })

  it('calls removeItem when Xóa is clicked', async () => {
    const user = userEvent.setup()
    // Pre-populate store so removeItem has something to remove
    act(() => {
      useCartStore.getState().addItem({ id: 1, name: 'Test Product' }, mockVariant, 2)
    })
    render(<CartItem item={mockItem} />)
    await user.click(screen.getByText('Xóa'))
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
