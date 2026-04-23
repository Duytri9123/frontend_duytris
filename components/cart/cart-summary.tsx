'use client'

import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'

export function CartSummary() {
  const totalPrice = useCartStore((s) => s.totalPrice)
  const total = totalPrice()

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-6">
      <h2 className="text-lg font-semibold">Tóm tắt đơn hàng</h2>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tạm tính</span>
        <span>{total.toLocaleString('vi-VN')}₫</span>
      </div>

      <div className="flex justify-between border-t pt-4 font-semibold">
        <span>Tổng cộng</span>
        <span>{total.toLocaleString('vi-VN')}₫</span>
      </div>

      <Link
        href="/checkout"
        className="block w-full rounded-lg bg-primary py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Tiến hành thanh toán
      </Link>
    </div>
  )
}
