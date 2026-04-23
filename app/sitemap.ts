/**
 * Dynamic sitemap generation for SEO
 * Automatically includes all products, categories, and static pages
 */
import { MetadataRoute } from 'next'
import { apiClient } from '@/lib/api-client'
import type { Product, Category, PaginatedResponse, ApiResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all products and categories
  const [productsRes, categoriesRes] = await Promise.allSettled([
    apiClient.get<PaginatedResponse<Product>>('/api/products', {
      params: { per_page: 1000, status: 'active' },
    }),
    apiClient.get<ApiResponse<Category[]>>('/api/categories'),
  ])

  const products =
    productsRes.status === 'fulfilled' ? productsRes.value.data.data : []
  const categories =
    categoriesRes.status === 'fulfilled' ? categoriesRes.value.data.data : []

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/products?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Product detail pages
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
