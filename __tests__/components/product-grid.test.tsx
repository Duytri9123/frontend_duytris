import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProductGrid } from '@/components/product/product-grid'
import type { Product } from '@/types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; sizes?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const makeProduct = (id: number): Product => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  description: '',
  short_description: '',
  status: 'active',
  brand: null,
  category: null,
  images: [],
  thumbnail_image: null,
  variants: [
    {
      id: id * 10,
      sku: `SKU-${id}`,
      selling_price: 100000 * id,
      original_price: 120000 * id,
      quantity: 10,
      weight: null,
      dimensions: null,
      is_default: true,
      attribute_values: [],
      image_indexes: [],
    },
  ],
  avg_rating: 0,
  rating_count: 0,
})

describe('ProductGrid', () => {
  it('renders empty state when no products', () => {
    render(<ProductGrid products={[]} />)
    expect(screen.getByText(/Không tìm thấy sản phẩm/)).toBeInTheDocument()
  })

  it('renders all products', () => {
    const products = [makeProduct(1), makeProduct(2), makeProduct(3)]
    render(<ProductGrid products={products} />)
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
    expect(screen.getByText('Product 3')).toBeInTheDocument()
  })

  it('renders correct number of product cards', () => {
    const products = [makeProduct(1), makeProduct(2)]
    render(<ProductGrid products={products} />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})
