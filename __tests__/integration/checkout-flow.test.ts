/**
 * Integration tests: Checkout flow
 * Tests order creation, address handling, and post-checkout state.
 *
 * Validates: Requirements 9.2.2, 3.1.5
 */
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'
import api from '@/lib/api-client'
import type { Order } from '@/types'

const API_BASE = 'http://localhost:8000'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const checkoutPayload = {
  address: {
    full_name: 'Nguyen Van A',
    phone: '0901234567',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng',
    street: '123 Đường ABC',
  },
  payment_method: 'cod',
}

describe('Checkout Flow Integration', () => {
  describe('Create order', () => {
    it('POST /api/checkout creates order and returns order data', async () => {
      const { data: order } = await api.post<Order>('/api/checkout', checkoutPayload)

      expect(order.id).toBeDefined()
      expect(order.status).toBe('pending')
      expect(order.total_amount).toBeGreaterThan(0)
    })

    it('order contains address information', async () => {
      const { data: order } = await api.post<Order>('/api/checkout', checkoutPayload)

      expect(order.address).toBeDefined()
      expect(order.address.full_name).toBe('Nguyen Van A')
      expect(order.address.phone).toBe('0901234567')
    })

    it('requests CSRF cookie before checkout', async () => {
      let csrfRequested = false
      server.use(
        http.get(`${API_BASE}/sanctum/csrf-cookie`, () => {
          csrfRequested = true
          return new HttpResponse(null, { status: 204 })
        })
      )

      await api.post('/api/checkout', checkoutPayload)
      expect(csrfRequested).toBe(true)
    })
  })

  describe('Checkout validation', () => {
    it('returns 422 when required fields are missing', async () => {
      server.use(
        http.post(`${API_BASE}/api/checkout`, () => {
          return HttpResponse.json(
            { message: 'The address field is required.', errors: { address: ['required'] } },
            { status: 422 }
          )
        })
      )

      await expect(api.post('/api/checkout', {})).rejects.toMatchObject({
        response: { status: 422 },
      })
    })

    it('returns 401 when user is not authenticated', async () => {
      server.use(
        http.post(`${API_BASE}/api/checkout`, () => {
          return HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
        })
      )

      await expect(api.post('/api/checkout', checkoutPayload)).rejects.toMatchObject({
        response: { status: 401 },
      })
    })
  })

  describe('Order status', () => {
    it('new order starts with pending status', async () => {
      const { data: order } = await api.post<Order>('/api/checkout', checkoutPayload)
      expect(order.status).toBe('pending')
    })

    it('order has timestamps', async () => {
      const { data: order } = await api.post<Order>('/api/checkout', checkoutPayload)
      expect(order.created_at).toBeDefined()
      expect(order.updated_at).toBeDefined()
    })
  })
})
