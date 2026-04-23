/**
 * Integration tests: Product listing with filters and pagination
 * Tests product fetching, filtering by category/search, and pagination.
 *
 * Validates: Requirements 9.2.2, 3.1.2
 */
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'
import api from '@/lib/api-client'
import { mockProduct, mockProduct2 } from './mocks/handlers'
import type { PaginatedResponse, Product } from '@/types'

const API_BASE = 'http://localhost:8000'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Product Listing Integration', () => {
  describe('Fetch all products', () => {
    it('returns paginated product list', async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/api/products')

      expect(data.data).toHaveLength(2)
      expect(data.current_page).toBe(1)
      expect(data.total).toBe(2)
    })

    it('returns product with correct fields', async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/api/products')
      const product = data.data[0]

      expect(product.id).toBe(mockProduct.id)
      expect(product.name).toBe(mockProduct.name)
      expect(product.slug).toBe(mockProduct.slug)
      expect(product.variants).toHaveLength(1)
      expect(product.variants[0].selling_price).toBe(299000)
    })
  })

  describe('Filter by category', () => {
    it('filters products by category slug', async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/api/products', {
        category: 'ao',
      })

      expect(data.data).toHaveLength(1)
      expect(data.data[0].category?.slug).toBe('ao')
    })

    it('returns empty list for non-existent category', async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/api/products', {
        category: 'non-existent',
      })

      expect(data.data).toHaveLength(0)
    })
  })

  describe('Search products', () => {
    it('filters products by search term', async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/api/products', {
        search: 'Áo',
      })

      expect(data.data).toHaveLength(1)
      expect(data.data[0].name).toContain('Áo')
    })

    it('search is case-insensitive', async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/api/products', {
        search: 'jean',
      })

      expect(data.data).toHaveLength(1)
      expect(data.data[0].id).toBe(mockProduct2.id)
    })
  })

  describe('Pagination', () => {
    it('respects page parameter', async () => {
      server.use(
        http.get(`${API_BASE}/api/products`, ({ request }) => {
          const url = new URL(request.url)
          const page = Number(url.searchParams.get('page') ?? 1)
          return HttpResponse.json({
            data: page === 2 ? [mockProduct2] : [mockProduct],
            current_page: page,
            last_page: 3,
            per_page: 10,
            total: 25,
          })
        })
      )

      const page1 = await api.get<PaginatedResponse<Product>>('/api/products', { page: 1 })
      const page2 = await api.get<PaginatedResponse<Product>>('/api/products', { page: 2 })

      expect(page1.data.current_page).toBe(1)
      expect(page2.data.current_page).toBe(2)
      expect(page1.data.data[0].id).not.toBe(page2.data.data[0].id)
    })

    it('returns pagination metadata', async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/api/products')

      expect(data).toHaveProperty('current_page')
      expect(data).toHaveProperty('last_page')
      expect(data).toHaveProperty('per_page')
      expect(data).toHaveProperty('total')
    })
  })

  describe('Product detail', () => {
    it('fetches product by slug', async () => {
      const { data } = await api.get<{ data: Product }>('/api/products/ao-thun-nam')

      expect(data.data.slug).toBe('ao-thun-nam')
      expect(data.data.name).toBe('Áo Thun Nam')
    })

    it('returns 404 for unknown slug', async () => {
      await expect(
        api.get('/api/products/not-found-product')
      ).rejects.toMatchObject({ response: { status: 404 } })
    })
  })
})
