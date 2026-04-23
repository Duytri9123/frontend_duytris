'use client'

import { useCartStore } from '@/stores/cart-store'
import type { GuestCartItem } from '@/types'

interface CartItemProps {
  item: GuestCartItem
}

export function CartItem({ item }: CartItemProps) {
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const variantLabel = item.variant.attribute_values?.map((av) => av.value).join(', ')

  return (
    <div className="flex items-center gap-4 border-b py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.name}</p>
        {variantLabel && <p className="text-sm text-muted-foreground">{variantLabel}</p>}
        <p className="text-sm text-muted-foreground">SKU: {item.variant.sku}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted"
        >
          +
        </button>
      </div>

      <div className="w-28 text-right">
        <p className="font-medium">
          {(item.variant.selling_price * item.quantity).toLocaleString('vi-VN')}₫
        </p>
        <p className="text-xs text-muted-foreground">
          {item.variant.selling_price.toLocaleString('vi-VN')}₫ / cái
        </p>
      </div>

      <button
        onClick={() => removeItem(item.variant.id)}
        className="ml-2 text-sm text-destructive hover:text-destructive/80"
      >
        Xóa
      </button>
    </div>
  )
}
