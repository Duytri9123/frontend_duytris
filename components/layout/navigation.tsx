'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',           label: 'Trang chủ' },
  { href: '/products',   label: 'Sản phẩm'  },
  { href: '/affiliate',  label: 'Đề xuất'   },
  { href: '/posts',      label: 'Tin tức'   },
  { href: '/cart',       label: 'Giỏ hàng'  },
]

interface NavigationProps {
  mobile?: boolean
  onClose?: () => void
}

export function Navigation({ mobile, onClose }: NavigationProps) {
  const pathname = usePathname()

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === href || (href !== '/' && pathname.startsWith(href))
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === href || (href !== '/' && pathname.startsWith(href))
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
