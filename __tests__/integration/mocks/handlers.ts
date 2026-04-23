// MSW v2 handlers for Laravel backend API
import { http, HttpResponse } from 'msw'
import type { User, Product, Cart, PaginatedResponse } from '@/types'

const API_BASE = 'http://localhost:8000'

// ===== MOCK DATA =====

export const mockUser: User = {
  id: 1,
  name: 'Nguyen Van A',
  email: 'user@example.com',
  isAdmin: false,
  email_verified_at: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
}

export const mockAdmin: User = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  isAdmin: true,
  email_verified_at: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
}

export const mockProduct: Product = {
  id: 1,
  name: 'Áo Thun Nam',
  slug: 'ao-thun-nam',
  description: 'Áo thun nam chất lượng cao',
  short_description: 'Áo thun nam',
  status: 'active',
  brand: { id: 1, name: 'Nike', slug: 'nike' },
  category: { id: 1, name: 'Áo', slug: 'ao' },
  images: [{ id: 1, url: '/images/ao-thun.jpg', is_thumbnail: true }],
  thumbnail_image: { id: 1, url: '/images/ao-thun.jpg', is_thumbnail: true },
  variants: [
    {
      id: 10,
      sku: 'AT-001-M',
      selling_price: 299000,
      original_price: 399000,
      quantity: 50,
      weight: 0.3,
      dimensions: null,
      is_default: true,
      attribute_values: [],
      image_indexes: [],
    },
  ],
  avg_rating: 4.5,
  rating_count: 20,
}

export const mockProduct2: Product = {
  id: 2,
  name: 'Quần Jean Nam',
  slug: 'quan-jean-nam',
  description: 'Quần jean nam thời trang',
  short_description: 'Quần jean nam',
  status: 'active',
  brand: { id: 2, name: 'Levi\'s', slug: 'levis' },
  category: { id: 2, name: 'Quần', slug: 'quan' },
  images: [],
  thumbnail_image: null,
  variants: [
    {
      id: 20,
      sku: 'QJ-001-32',
      selling_price: 599000,
      original_price: 799000,
      quantity: 30,
      weight: 0.6,
      dimensions: null,
      is_default: true,
      attribute_values: [],
      image_indexes: [],
    },
  ],
  avg_rating: 4.2,
  rating_count: 15,
}

export const mockCart: Cart = {
  id: 1,
  user_id: 1,
  items: [
    {
      id: 1,
      cart_id: 1,
      product_id: 1,
      variant: mockProduct.variants[0],
      quantity: 2,
      product: { id: 1, name: 'Áo Thun Nam', thumbnail_image: mockProduct.thumbnail_image },
    },
  ],
}

export const mockProductsPage: PaginatedResponse<Product> = {
  data: [mockProduct, mockProduct2],
  current_page: 1,
  last_page: 3,
  per_page: 10,
  total: 25,
}

// ===== HANDLERS =====

export const handlers = [
  // CSRF cookie
  http.get(`${API_BASE}/sanctum/csrf-cookie`, () => {
    return new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': 'XSRF-TOKEN=test-csrf-token; Path=/' },
    })
  }),

  // Auth: GET /api/user
  http.get(`${API_BASE}/api/user`, () => {
    return HttpResponse.json(mockUser)
  }),

  // Auth: POST /login
  http.post(`${API_BASE}/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'user@example.com' && body.password === 'password123') {
      return HttpResponse.json(mockUser)
    }
    if (body.email === 'admin@example.com' && body.password === 'admin123') {
      return HttpResponse.json(mockAdmin)
    }
    return HttpResponse.json(
      { message: 'These credentials do not match our records.' },
      { status: 422 }
    )
  }),

  // Auth: POST /register
  http.post(`${API_BASE}/register`, async ({ request }) => {
    const body = await request.json() as { name: string; email: string }
    return HttpResponse.json({
      ...mockUser,
      name: body.name,
      email: body.email,
    })
  }),

  // Auth: POST /logout
  http.post(`${API_BASE}/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Products: GET /api/products
  http.get(`${API_BASE}/api/products`, ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')

    let products = [mockProduct, mockProduct2]

    if (category) {
      products = products.filter(p => p.category?.slug === category)
    }
    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    return HttpResponse.json({
      ...mockProductsPage,
      data: products,
      total: products.length,
    })
  }),

  // Products: GET /api/products/:slug
  http.get(`${API_BASE}/api/products/:slug`, ({ params }) => {
    const { slug } = params
    if (slug === mockProduct.slug) {
      return HttpResponse.json({ data: mockProduct })
    }
    if (slug === mockProduct2.slug) {
      return HttpResponse.json({ data: mockProduct2 })
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),

  // Cart: GET /api/cart
  http.get(`${API_BASE}/api/cart`, () => {
    return HttpResponse.json(mockCart)
  }),

  // Cart: POST /api/cart
  http.post(`${API_BASE}/api/cart`, async ({ request }) => {
    const body = await request.json() as { product_id: number; variant_id: number; quantity: number }
    return HttpResponse.json({
      ...mockCart,
      items: [
        ...mockCart.items,
        {
          id: 99,
          cart_id: 1,
          product_id: body.product_id,
          variant: mockProduct.variants[0],
          quantity: body.quantity,
        },
      ],
    })
  }),

  // Cart: POST /api/cart/sync
  http.post(`${API_BASE}/api/cart/sync`, () => {
    return HttpResponse.json({ message: 'Cart synced successfully' })
  }),

  // Checkout: POST /api/checkout
  http.post(`${API_BASE}/api/checkout`, () => {
    return HttpResponse.json({
      id: 100,
      user_id: 1,
      status: 'pending',
      total_amount: 598000,
      items: [],
      address: {
        id: 1,
        user_id: 1,
        full_name: 'Nguyen Van A',
        phone: '0901234567',
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Dịch Vọng',
        street: '123 Đường ABC',
        is_default: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }),

  // Admin: GET /api/admin/products
  http.get(`${API_BASE}/api/admin/products`, () => {
    return HttpResponse.json(mockProductsPage)
  }),

  // Admin: POST /api/admin/products
  http.post(`${API_BASE}/api/admin/products`, async ({ request }) => {
    const body = await request.json() as Partial<Product>
    return HttpResponse.json({
      ...mockProduct,
      id: 99,
      name: body.name ?? 'New Product',
      slug: 'new-product',
    }, { status: 201 })
  }),

  // Admin: PUT /api/admin/products/:id
  http.put(`${API_BASE}/api/admin/products/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<Product>
    return HttpResponse.json({
      ...mockProduct,
      id: Number(params.id),
      ...body,
    })
  }),

  // Admin: DELETE /api/admin/products/:id
  http.delete(`${API_BASE}/api/admin/products/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
