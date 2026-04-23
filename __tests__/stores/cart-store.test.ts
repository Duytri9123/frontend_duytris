import { act } from '@testing-library/react'
import { useCartStore } from '@/stores/cart-store'
import type { Product, ProductVariant } from '@/types'

// Helper to reset store between tests
function resetStore() {
  act(() => {
    useCartStore.setState({ items: [] })
  })
}

const mockProduct: Pick<Product, 'id' | 'name'> = { id: 1, name: 'Test Product' }

const mockVariant: ProductVariant = {
  id: 10,
  sku: 'SKU-001',
  selling_price: 100000,
  original_price: 120000,
  quantity: 50,
  weight: null,
  dimensions: null,
  is_default: true,
  attribute_values: [],
  image_indexes: [],
}

const mockVariant2: ProductVariant = {
  id: 20,
  sku: 'SKU-002',
  selling_price: 200000,
  original_price: 250000,
  quantity: 30,
  weight: null,
  dimensions: null,
  is_default: false,
  attribute_values: [],
  image_indexes: [],
}

beforeEach(() => {
  resetStore()
})

describe('cart-store', () => {
  describe('addItem', () => {
    it('adds a new item to the cart', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant)
      })
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variant.id).toBe(10)
      expect(items[0].quantity).toBe(1)
    })

    it('increments quantity when adding an existing item', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant, 2)
        useCartStore.getState().addItem(mockProduct, mockVariant, 3)
      })
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(5)
    })

    it('adds multiple distinct variants as separate items', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant)
        useCartStore.getState().addItem(mockProduct, mockVariant2)
      })
      expect(useCartStore.getState().items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('removes an item by variantId', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant)
        useCartStore.getState().addItem(mockProduct, mockVariant2)
        useCartStore.getState().removeItem(10)
      })
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variant.id).toBe(20)
    })

    it('does nothing when variantId does not exist', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant)
        useCartStore.getState().removeItem(999)
      })
      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity for a given variantId', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant)
        useCartStore.getState().updateQuantity(10, 7)
      })
      expect(useCartStore.getState().items[0].quantity).toBe(7)
    })

    it('clamps quantity to minimum of 1', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant)
        useCartStore.getState().updateQuantity(10, 0)
      })
      expect(useCartStore.getState().items[0].quantity).toBe(1)
    })
  })

  describe('clearCart', () => {
    it('empties the cart', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant)
        useCartStore.getState().addItem(mockProduct, mockVariant2)
        useCartStore.getState().clearCart()
      })
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('totalItems', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().totalItems()).toBe(0)
    })

    it('returns correct total item count', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant, 3)
        useCartStore.getState().addItem(mockProduct, mockVariant2, 2)
      })
      expect(useCartStore.getState().totalItems()).toBe(5)
    })
  })

  describe('totalPrice', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().totalPrice()).toBe(0)
    })

    it('returns correct total price', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, mockVariant, 2)   // 2 * 100000 = 200000
        useCartStore.getState().addItem(mockProduct, mockVariant2, 1)  // 1 * 200000 = 200000
      })
      expect(useCartStore.getState().totalPrice()).toBe(400000)
    })
  })
})
