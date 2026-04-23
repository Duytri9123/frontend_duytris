import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import { CartSummary } from '@/components/cart/cart-summary'
import { useCartStore } from '@/stores/cart-store'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockVariant = {
  id: 10,
  sku: 'SKU-001',
  selling_price: 150000,
  original_price: 200000,
  quantity: 5,
  weight: null,
  dimensions: null,
  is_default: true,
  attribute_values: [],
  image_indexes: [],
}

beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [] })
  })
})

describe('CartSummary', () => {
  it('renders 0 when cart is empty', () => {
    render(<CartSummary />)
    expect(screen.getAllByText(/0₫/).length).toBeGreaterThan(0)
  })

  it('renders correct total price', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 1, name: 'P' }, mockVariant, 2)
    })
    render(<CartSummary />)
    // 150000 * 2 = 300000
    expect(screen.getAllByText(/300\.000₫/).length).toBeGreaterThan(0)
  })

  it('renders checkout link', () => {
    render(<CartSummary />)
    expect(screen.getByRole('link', { name: /Tiến hành thanh toán/ })).toHaveAttribute('href', '/checkout')
  })

  it('renders section heading', () => {
    render(<CartSummary />)
    expect(screen.getByText('Tóm tắt đơn hàng')).toBeInTheDocument()
  })
})
