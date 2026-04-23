// stores/cart-store.ts - Zustand store cho guest cart
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GuestCartItem, ProductVariant, Product } from '@/types'

interface CartStore {
  items: GuestCartItem[]
  // Actions
  addItem: (product: Pick<Product, 'id' | 'name'>, variant: ProductVariant, qty?: number) => void
  removeItem: (variantId: number) => void
  updateQuantity: (variantId: number, qty: number) => void
  clearCart: () => void
  // Computed
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, qty = 1) => {
        set(state => {
          const existing = state.items.find(i => i.variant.id === variant.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.variant.id === variant.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              )
            }
          }
          return {
            items: [...state.items, {
              productId: product.id,
              name: product.name,
              quantity: qty,
              variant,
            }]
          }
        })
      },

      removeItem: (variantId) => {
        set(state => ({
          items: state.items.filter(i => i.variant.id !== variantId)
        }))
      },

      updateQuantity: (variantId, qty) => {
        set(state => ({
          items: state.items.map(i =>
            i.variant.id === variantId
              ? { ...i, quantity: Math.max(1, qty) }
              : i
          )
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce(
        (sum, i) => sum + i.variant.selling_price * i.quantity, 0
      ),
    }),
    {
      name: 'cart-storage', // localStorage key (tương thích với Vue store cũ)
    }
  )
)