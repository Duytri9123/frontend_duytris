import Link from 'next/link'
import { notFound } from 'next/navigation'
import api from '@/lib/api-client'
import type { Order, OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

async function fetchOrder(id: string): Promise<Order | null> {
  try {
    const res = await api.get<{ data: Order }>(`/api/orders/${id}`)
    return res.data.data ?? null
  } catch {
    return null
  }
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await fetchOrder(id)
  if (!order) notFound()

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">← Đơn hàng của tôi</Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
        <span className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${STATUS_CLASSES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Sản phẩm đã đặt</h2>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_sku && <p className="text-sm text-muted-foreground">SKU: {item.variant_sku}</p>}
                    <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.price.toLocaleString('vi-VN')}₫</p>
                    <p className="text-sm text-muted-foreground">Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{order.total_amount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {order.address && (
            <div className="rounded-lg border bg-card p-5">
              <h2 className="mb-3 text-base font-semibold">Địa chỉ giao hàng</h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.address.full_name}</p>
                <p className="text-muted-foreground">{order.address.phone}</p>
                <p className="text-muted-foreground">
                  {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-3 text-base font-semibold">Thông tin đơn hàng</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt</span>
                <span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cập nhật</span>
                <span>{new Date(order.updated_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
