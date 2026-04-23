'use client'

import { useState } from 'react'
import type { Product, ProductVariant } from '@/types'
import { useCartStore } from '@/stores/cart-store'
import VariantSelector from './variant-selector'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0]
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant)
  const addItem = useCartStore((s) => s.addItem)

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem({ id: product.id, name: product.name }, selectedVariant)
  }

  const inStock = selectedVariant ? selectedVariant.quantity > 0 : false

  return (
    <div className="space-y-5">
      {selectedVariant && (
        <div className="space-y-1">
          <p className="text-3xl font-bold text-primary">
            {selectedVariant.selling_price.toLocaleString('vi-VN')}₫
          </p>
          {selectedVariant.original_price > selectedVariant.selling_price && (
            <p className="text-sm text-muted-foreground line-through">
              {selectedVariant.original_price.toLocaleString('vi-VN')}₫
            </p>
          )}
        </div>
      )}

      {product.variants.length > 1 && selectedVariant && (
        <div className="rounded-lg border p-4">
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariant.id}
            onSelect={setSelectedVariant}
          />
        </div>
      )}

      {selectedVariant && (
        <p className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
          {inStock ? `Còn hàng (${selectedVariant.quantity})` : 'Hết hàng'}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={[
            'flex-1 rounded-lg px-6 py-3 font-medium transition-colors',
            inStock
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60',
          ].join(' ')}
        >
          {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
        </button>
      </div>
    </div>
  )
}
