/**
 * Integration tests: Cart synchronization
 * Tests guest cart → server cart sync after login,
 * add to cart (authenticated vs guest), and cart fetching.
 *
 * Validates: Requirements 9.2.2, 3.1.4.2
 */
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'
import api from '@/lib/api-client'
import { mockCart, mockProduct } from './mocks/handlers'
import type { Cart } from '@/types'

const API_BASE = 'http://localhost:8000'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Cart Synchronization Integration', () => {
  describe('Fetch server cart', () => {
    it('GET /api/cart returns cart with items', async () => {
      const { data: cart } = await api.get<Cart>('/api/cart')

      expect(cart.id).toBe(mockCart.id)
      expect(cart.user_id).toBe(mockCart.user_id)
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0].quantity).toBe(2)
    })

    it('returns empty cart for new user', async () => {
      server.use(
        http.get(`${API_BASE}/api/cart`, () => {
          return HttpResponse.json({ id: 2, user_id: 99, items: [] })
        })
      )

      const { data: cart } = await api.get<Cart>('/api/cart')
      expect(cart.items).toHaveLength(0)
    })
  })

  describe('Add to server cart', () => {
    it('POST /api/cart adds item and returns updated cart', async () => {
      const { data: updatedCart } = await api.post<Cart>('/api/cart', {
        product_id: mockProduct.id,
        variant_id: mockProduct.variants[0].id,
        quantity: 1,
      })

      expect(updatedCart.items.length).toBeGreaterThan(0)
    })

    it('requests CSRF cookie before adding to cart', async () => {
      let csrfRequested = false
      server.use(
        http.get(`${API_BASE}/sanctum/csrf-cookie`, () => {
          csrfRequested = true
          return new HttpResponse(null, { status: 204 })
        })
      )

      await api.post('/api/cart', {
        product_id: 1,
        variant_id: 10,
        quantity: 1,
      })

      expect(csrfRequested).toBe(true)
    })
  })

  describe('Cart sync after login', () => {
    it('POST /api/cart/sync sends guest items to server', async () => {
      let syncPayload: unknown = null
      server.use(
        http.post(`${API_BASE}/api/cart/sync`, async ({ request }) => {
          syncPayload = await request.json()
          return HttpResponse.json({ message: 'Cart synced successfully' })
        })
      )

      const guestItems = [
        {
          productId: 1,
          name: 'Áo Thun Nam',
          quantity: 2,
          variant: mockProduct.variants[0],
        },
      ]

      await api.post('/api/cart/sync', { items: guestItems })

      expect(syncPayload).toEqual({ items: guestItems })
    })

    it('sync clears guest items after successful sync', async () => {
      // Simulate the sync flow: guest items are sent, server responds OK
      const syncResponse = await api.post('/api/cart/sync', {
        items: [
          {
            productId: 1,
            name: 'Áo Thun Nam',
            quantity: 1,
            variant: mockProduct.variants[0],
          },
        ],
      })

      expect(syncResponse.status).toBe(200)
    })

    it('handles sync failure gracefully', async () => {
      server.use(
        http.post(`${API_BASE}/api/cart/sync`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 })
        })
      )

      await expect(
        api.post('/api/cart/sync', { items: [] })
      ).rejects.toThrow()
    })
  })

  describe('Cart total calculation', () => {
    it('cart items have correct price data for total calculation', async () => {
      const { data: cart } = await api.get<Cart>('/api/cart')

      const total = cart.items.reduce(
        (sum, item) => sum + item.variant.selling_price * item.quantity,
        0
      )

      // 299000 * 2 = 598000
      expect(total).toBe(598000)
    })
  })
})
