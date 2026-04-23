'use client'

import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { CartItem } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'

export default function CartPage() {
  const items = useCartStore((s) => s.items)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="mb-6 text-lg text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
        <Link
          href="/products"
          className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Giỏ hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.variant.id} item={item} />
          ))}
        </div>
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
