'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Store, Search, Package } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Brand {
  id: number
  name: string
  slug: string
  img_url?: string
  products_count?: number
}

export default function BrandsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['brands', page, search],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{ 
          data: Brand[]
          current_page: number
          last_page: number
          total: number
        }>('/api/brands', {
          params: { 
            page,
            per_page: 24,
            ...(search && { search })
          }
        })
        return data
      } catch (error) {
        console.error('Error fetching brands:', error)
        return { data: [], current_page: 1, last_page: 1, total: 0 }
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const brands = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  const resolveImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${API_URL}${url}`
    const storagePath = url.startsWith('storage/') ? url : `storage/${url}`
    return `${API_URL}/${storagePath}`
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <Store size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thương hiệu</h1>
              <p className="text-sm text-gray-500">Khám phá {total} thương hiệu uy tín</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm thương hiệu..."
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && brands.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-16">
            <Package size={48} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              {search ? 'Không tìm thấy thương hiệu nào' : 'Chưa có thương hiệu nào'}
            </p>
          </div>
        )}

        {/* Brands Grid */}
        {!isLoading && brands.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {brands.map((brand) => {
                const imgSrc = resolveImageUrl(brand.img_url)
                
                return (
                  <Link
                    key={brand.id}
                    href={`/products?brand=${brand.slug}`}
                    className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Brand Image or Icon */}
                    <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
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
                          <span className="text-2xl font-bold text-indigo-600">
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
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        <Package size={10} />
                        {brand.products_count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trước
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                    let pageNum: number
                    if (lastPage <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= lastPage - 2) {
                      pageNum = lastPage - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
