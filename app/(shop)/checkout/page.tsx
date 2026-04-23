'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCartStore } from '@/stores/cart-store'
import { CheckoutForm, type CheckoutFormData } from '@/components/checkout/checkout-form'
import { api } from '@/lib/api-client'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice)
  const clearCart = useCartStore((s) => s.clearCart)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Đang tải...</div>
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="mb-6 text-lg text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
        <Link href="/products" className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  if (orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="mb-2 text-2xl font-bold">Đặt hàng thành công!</h1>
          <p className="mb-1 text-muted-foreground">Mã đơn hàng: <span className="font-semibold">#{orderId}</span></p>
          <p className="mb-8 text-sm text-muted-foreground">Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
          <div className="flex justify-center gap-4">
            <Link href="/products" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted">Tiếp tục mua sắm</Link>
            <Link href="/orders" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Xem đơn hàng</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (formData: CheckoutFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post<{ data: { id: number } }>('/api/orders', {
        address: {
          full_name: formData.full_name,
          phone: formData.phone,
          province: formData.province,
          district: formData.district,
          ward: formData.ward,
          street: formData.street,
        },
        payment_method: formData.payment_method,
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variant.id,
          quantity: item.quantity,
          price: item.variant.selling_price,
        })),
      })
      clearCart()
      setOrderId(response.data.data.id)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Đặt hàng thất bại. Vui lòng thử lại.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const total = totalPrice()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Thanh toán</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-muted/30 p-6">
            <h2 className="mb-4 text-lg font-semibold">Tóm tắt đơn hàng</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.variant.id} className="flex items-start justify-between gap-2 text-sm">
                  <div className="flex-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.variant.sku} × {item.quantity}</p>
                  </div>
                  <span className="whitespace-nowrap font-medium">
                    {(item.variant.selling_price * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tạm tính</span>
                <span>{total.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="mt-3 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
