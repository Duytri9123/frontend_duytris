import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/types'

// Mock next/image and next/link
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

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  description: 'A test product',
  short_description: 'Short desc',
  status: 'active',
  brand: null,
  category: null,
  images: [],
  thumbnail_image: null,
  variants: [
    {
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
    },
  ],
  avg_rating: 0,
  rating_count: 0,
  ...overrides,
})

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={makeProduct()} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders selling price formatted in VND', () => {
    render(<ProductCard product={makeProduct()} />)
    expect(screen.getByText(/150\.000₫/)).toBeInTheDocument()
  })

  it('renders brand name when present', () => {
    const product = makeProduct({ brand: { id: 1, name: 'Nike', slug: 'nike' } })
    render(<ProductCard product={product} />)
    expect(screen.getByText('Nike')).toBeInTheDocument()
  })

  it('does not render brand when absent', () => {
    render(<ProductCard product={makeProduct({ brand: null })} />)
    expect(screen.queryByText('Nike')).not.toBeInTheDocument()
  })

  it('renders "No image" placeholder when no thumbnail', () => {
    render(<ProductCard product={makeProduct({ thumbnail_image: null })} />)
    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('renders thumbnail image when present', () => {
    const product = makeProduct({
      thumbnail_image: { id: 1, url: 'https://example.com/img.jpg', is_thumbnail: true },
    })
    render(<ProductCard product={product} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('renders star rating when avg_rating > 0', () => {
    render(<ProductCard product={makeProduct({ avg_rating: 4.5 })} />)
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
  })

  it('does not render rating when avg_rating is 0', () => {
    render(<ProductCard product={makeProduct({ avg_rating: 0 })} />)
    expect(screen.queryByText(/★/)).not.toBeInTheDocument()
  })

  it('renders "Liên hệ" when no variants', () => {
    render(<ProductCard product={makeProduct({ variants: [] })} />)
    expect(screen.getByText('Liên hệ')).toBeInTheDocument()
  })

  it('links to the correct product slug', () => {
    render(<ProductCard product={makeProduct({ slug: 'my-product' })} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/my-product')
  })
})
