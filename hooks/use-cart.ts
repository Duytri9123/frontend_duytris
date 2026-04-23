// hooks/use-cart.ts - Kết hợp guest cart + server cart
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '@/stores/cart-store'
import { useAuth } from '@/hooks/use-auth'
import api from '@/lib/api-client'
import type { Cart, Product, ProductVariant } from '@/types'

export function useCart() {
  const { isAuthenticated } = useAuth()
  const guestCart = useCartStore()
  const queryClient = useQueryClient()

  // Fetch server cart khi đã đăng nhập
  const { data: serverCart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<Cart>('/api/cart').then((r) => r.data),
    enabled: isAuthenticated,
  })

  // Sync guest cart lên server sau khi login
  const syncMutation = useMutation({
    mutationFn: (items: typeof guestCart.items) =>
      api.post('/api/cart/sync', { items }),
    onSuccess: () => {
      guestCart.clearCart()
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Add to cart - server nếu đã đăng nhập, guest nếu chưa
  const addToCart = async (product: Product, variant: ProductVariant, qty = 1) => {
    if (isAuthenticated) {
      await api.post('/api/cart', {
        product_id: product.id,
        variant_id: variant.id,
        quantity: qty,
      })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    } else {
      guestCart.addItem(product, variant, qty)
    }
  }

  const items = isAuthenticated ? (serverCart?.items ?? []) : guestCart.items
  const totalItems = isAuthenticated
    ? items.reduce((s, i) => s + i.quantity, 0)
    : guestCart.totalItems()

  return {
    items,
    totalItems,
    addToCart,
    syncAfterLogin: syncMutation.mutate,
  }
}
