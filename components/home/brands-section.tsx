'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Store, ChevronRight } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Brand {
  id: number
  name: string
  slug: string
  img_url?: string
  products_count?: number
}

interface BrandsSectionProps {
  limit?: number
  showViewAll?: boolean
}

export function BrandsSection({ limit = 12, showViewAll = true }: BrandsSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['brands', limit],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{ data: Brand[] }>('/api/brands', {
          params: { per_page: limit }
        })
        return data.data ?? []
      } catch (error) {
        console.error('Error fetching brands:', error)
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const brands = data ?? []

  const resolveImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${API_URL}${url}`
    const storagePath = url.startsWith('storage/') ? url : `storage/${url}`
    return `${API_URL}/${storagePath}`
  }

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          {showViewAll && <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />}
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </section>
    )
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store size={20} className="text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Thương hiệu nổi bật</h2>
        </div>
        {showViewAll && (
          <Link 
            href="/brands" 
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Xem tất cả
            <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6">
        {brands.map((brand) => {
          const imgSrc = resolveImageUrl(brand.img_url)
          
          return (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Brand Image or Icon */}
              <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={brand.name}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                    <span className="text-xl font-bold text-indigo-600">
                      {brand.name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Brand Name */}
              <h3 className="text-center text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                {brand.name}
              </h3>

              {/* Product Count */}
              {brand.products_count !== undefined && brand.products_count > 0 && (
                <span className="mt-1 text-xs text-gray-400">
                  {brand.products_count} sản phẩm
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
