'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_URL}${url}`
  // relative path từ Laravel storage (e.g. "product_media/..." hoặc "storage/product_media/...")
  const storagePath = url.startsWith('storage/') ? url : `storage/${url}`
  return `${API_URL}/${storagePath}`
}

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0]
  const price = defaultVariant?.selling_price
  const thumbnail = product.thumbnail_image

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={resolveImageUrl(thumbnail.url)!}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        {product.brand && (
          <span className="text-xs text-muted-foreground">{product.brand.name}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>

        <div className="mt-1 flex items-center justify-between">
          {price != null ? (
            <span className="text-sm font-semibold text-primary">
              {price.toLocaleString('vi-VN')}₫
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Liên hệ</span>
          )}

          {product.avg_rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              ★ {product.avg_rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
