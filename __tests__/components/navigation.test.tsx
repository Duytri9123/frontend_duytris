import React from 'react'
import { render, screen } from '@testing-library/react'
import { Navigation } from '@/components/layout/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Navigation', () => {
  it('renders all nav links', () => {
    render(<Navigation />)
    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
    expect(screen.getByText('Sản phẩm')).toBeInTheDocument()
    expect(screen.getByText('Giỏ hàng')).toBeInTheDocument()
  })

  it('links to correct hrefs', () => {
    render(<Navigation />)
    expect(screen.getByText('Trang chủ').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('Sản phẩm').closest('a')).toHaveAttribute('href', '/products')
    expect(screen.getByText('Giỏ hàng').closest('a')).toHaveAttribute('href', '/cart')
  })
})
