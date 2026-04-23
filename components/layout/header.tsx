'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Navigation } from './navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCartStore } from '@/stores/cart-store'
import { useSiteSettings } from '@/hooks/use-site-settings'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const totalItems = useCartStore((s) => s.totalItems())
  const { settings } = useSiteSettings()

  return (
    <>
      {/* Announcement Banner */}
      {settings.banner_enabled === '1' && settings.banner_text && (
        <div
          className="w-full py-2 text-center text-sm text-white"
          style={{ backgroundColor: settings.primary_color }}
        >
          {settings.banner_text}
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {settings.logo_url ? (
              <Image
                src={`${API}${settings.logo_url}`}
                alt={settings.site_name}
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: settings.primary_color, fontFamily: settings.font_family }}
              >
                {settings.site_name || 'EShop'}
              </span>
            )}
          </Link>

          {/* Navigation */}
          <Navigation />

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <button onClick={logout} className="text-sm font-medium hover:text-primary">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium hover:text-primary">
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
