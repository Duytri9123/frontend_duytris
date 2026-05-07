'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { TrendingUp, Flame, Eye } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { ProductCard } from '@/components/product/product-card'
import { PopularProductCard } from '@/components/product/popular-product-card'
import type { Product } from '@/types'

interface RecommendedProductsProps {
  title?: string
  type?: 'popular' | 'trending' | 'new'
  limit?: number
}

interface PopularProductItem {
  product_id: number
  total_views: number
  product: Product
}

export function RecommendedProducts({ 
  title = 'Sản phẩm đề xuất', 
  type = 'popular',
  limit = 8 
}: RecommendedProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['recommended-products', type, limit],
    queryFn: async () => {
      try {
        if (type === 'popular') {
          // API trả về array of { product_id, total_views, product }
          const { data } = await apiClient.get<PopularProductItem[]>('/api/products/popular')
          return {
            products: (data ?? [])
              .filter(item => item.product && item.product.status === 'active')
              .slice(0, limit)
              .map(item => item.product),
            viewCounts: (data ?? [])
              .filter(item => item.product && item.product.status === 'active')
              .slice(0, limit)
              .reduce((acc, item) => {
                acc[item.product_id] = item.total_views
                return acc
              }, {} as Record<number, number>)
          }
        } else {
          // API trả về paginated response
          const { data } = await apiClient.get<{ data: Product[] }>('/api/products', {
            params: { 
              per_page: limit,
              status: 'active',
              ...(type === 'new' && { sort: 'created_at', order: 'desc' })
            }
          })
          return {
            products: data.data ?? [],
            viewCounts: {}
          }
        }
      } catch (error) {
        console.error('Error fetching recommended products:', error)
        return { products: [], viewCounts: {} }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const products = data?.products ?? []
  const viewCounts = data?.viewCounts ?? {}

  const getIcon = () => {
    switch (type) {
      case 'popular':
        return <Eye size={20} className="text-indigo-600" />
      case 'trending':
        return <TrendingUp size={20} className="text-indigo-600" />
      case 'new':
        return <Flame size={20} className="text-indigo-600" />
      default:
        return <TrendingUp size={20} className="text-indigo-600" />
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'popular':
        return 'Sản phẩm được xem nhiều nhất'
      case 'trending':
        return 'Sản phẩm đang thịnh hành'
      case 'new':
        return 'Sản phẩm mới nhất'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {getIcon()}
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">{getDescription()}</p>
        </div>
        <Link 
          href="/products" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          type === 'popular' ? (
            <PopularProductCard 
              key={product.id} 
              product={product} 
              viewCount={viewCounts[product.id]}
              priority={index < 4} 
            />
          ) : (
            <ProductCard 
              key={product.id} 
              product={product} 
              priority={index < 4} 
            />
          )
        ))}
      </div>
    </section>
  )
}
