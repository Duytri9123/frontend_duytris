'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Star, Eye, Check } from 'lucide-react'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cart-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_URL}${url}`
  const storagePath = url.startsWith('storage/') ? url : `storage/${url}`
  return `${API_URL}/${storagePath}`
}

interface PopularProductCardProps {
  product: Product
  viewCount?: number
  priority?: boolean
}

export function PopularProductCard({ product, viewCount, priority = false }: PopularProductCardProps) {
  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0]
  const price = defaultVariant?.selling_price
  const originalPrice = defaultVariant?.original_price
  const thumbnail = product.thumbnail_image
  const imgSrc = resolveImageUrl(thumbnail?.url)
  const hasDiscount = price != null && originalPrice != null && originalPrice > price
  const discountPct = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0
  const inStock = (defaultVariant?.quantity ?? 0) > 0

  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!defaultVariant || !inStock) return
    addItem({ id: product.id, name: product.name }, defaultVariant, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {imgSrc && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <ShoppingCart size={36} className="text-gray-300" />
          </div>
        )}

        {/* View count badge — top left */}
        {viewCount != null && viewCount > 0 && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
            <Eye size={11} className="text-white" />
            <span className="text-[10px] font-semibold text-white">{viewCount}</span>
          </div>
        )}

        {/* Discount badge — top right */}
        {discountPct > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discountPct}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3">
        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            {product.brand.name}
          </span>
        )}

        {/* Name */}
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-indigo-600">
          {product.name}
        </h3>

        {/* Rating */}
        {product.avg_rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={10}
                  className={
                    s <= Math.round(product.avg_rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.rating_count})</span>
          </div>
        )}

        {/* Price + Add to cart */}
        <div className="mt-auto pt-2">
          {/* Price row */}
          <div className="flex items-baseline gap-1.5">
            {price != null ? (
              <>
                <span className="text-sm font-bold text-indigo-600">
                  {price.toLocaleString('vi-VN')}₫
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through">
                    {originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-400">Liên hệ</span>
            )}
          </div>

          {/* Add to cart button */}
          {inStock ? (
            <button
              onClick={handleAddToCart}
              className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              {added ? (
                <>
                  <Check size={13} />
                  Đã thêm!
                </>
              ) : (
                <>
                  <ShoppingCart size={13} />
                  Thêm vào giỏ
                </>
              )}
            </button>
          ) : (
            <div className="mt-2 flex w-full items-center justify-center rounded-lg bg-gray-100 py-1.5 text-xs font-semibold text-gray-400">
              Hết hàng
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
