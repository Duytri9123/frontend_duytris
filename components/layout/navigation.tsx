'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/cart', label: 'Giỏ hàng' },
]

export function Navigation() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-6">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === href ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
