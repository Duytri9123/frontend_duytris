'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/types'
import { aiService } from '@/lib/ai-service'
import { ProductGrid } from './product-grid'

interface ProductRecommendationsProps {
  productId: number
  userId?: number
}

export function ProductRecommendations({ productId, userId }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aiService
      .getRecommendations({ productId, userId })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [productId, userId])

  if (loading || products.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold">Khách hàng cũng mua</h2>
      <ProductGrid products={products} />
    </section>
  )
}
