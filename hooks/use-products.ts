// hooks/use-products.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api-client'
import type { Product, PaginatedResponse } from '@/types'

export interface ProductFilters {
  category?: string
  brand?: string
  search?: string
  sort?: string
  page?: number
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      api
        .get<PaginatedResponse<Product>>('/api/products', filters as Record<string, unknown>)
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () =>
      api
        .get<{ data: Product }>(`/api/products/${slug}`)
        .then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  })
}
