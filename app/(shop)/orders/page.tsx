import Link from 'next/link'
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

async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await api.get<{ data: Order[] }>('/api/orders')
    return res.data.data ?? []
  } catch {
    return []
  }
}

export default async function OrdersPage() {
  const orders = await fetchOrders()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 py-16 text-center">
          <p className="mb-4 text-lg text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
          <Link href="/products" className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-semibold">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày đặt</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền</p>
                  <p className="font-semibold text-primary">{order.total_amount.toLocaleString('vi-VN')}₫</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Trạng thái</p>
                  <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_CLASSES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <Link href={`/orders/${order.id}`} className="self-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                  Xem chi tiết
                </Link>
              </div>

              {order.items?.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-xs text-muted-foreground">{order.items.length} sản phẩm</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-sm">
                        {item.product_name}
                        {item.variant_sku && <span className="text-muted-foreground"> ({item.variant_sku})</span>}
                        {' '}×{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-sm text-muted-foreground">+{order.items.length - 3} sản phẩm khác</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
