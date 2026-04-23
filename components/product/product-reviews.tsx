'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api-client'
import type { ApiResponse, ProductReview } from '@/types'

interface ProductReviewsProps {
  productId: number
  avgRating?: number
  ratingCount?: number
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'text-xl' : 'text-sm'
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`${cls} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-muted-foreground'}`}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function ProductReviews({ productId, avgRating, ratingCount }: ProductReviewsProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () =>
      api.get<ApiResponse<ProductReview[]>>(`/api/products/${productId}/reviews`).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-xl font-semibold">Đánh giá sản phẩm</h2>

      {avgRating !== undefined && avgRating > 0 && (
        <div className="mb-6 flex items-center gap-4 rounded-lg border p-4">
          <div className="text-center">
            <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
            <StarRating rating={avgRating} size="lg" />
            <p className="mt-1 text-sm text-muted-foreground">{ratingCount ?? 0} đánh giá</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-muted-foreground">Không thể tải đánh giá.</p>}
      {data && data.length === 0 && <p className="text-sm text-muted-foreground">Chưa có đánh giá nào.</p>}

      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((review) => (
            <div key={review.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.user.name}</span>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
