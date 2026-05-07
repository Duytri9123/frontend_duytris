'use client'

import { useState } from 'react'
import { ShoppingCart, Zap, Minus, Plus, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Product, ProductVariant } from '@/types'
import { useCartStore } from '@/stores/cart-store'
import VariantSelector from './variant-selector'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0]
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const inStock = (selectedVariant?.quantity ?? 0) > 0
  const maxQty = selectedVariant?.quantity ?? 1
  const price = selectedVariant?.selling_price
  const originalPrice = selectedVariant?.original_price
  const hasDiscount = price != null && originalPrice != null && originalPrice > price
  const discountPct = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0

  function handleQtyChange(delta: number) {
    setQuantity((q) => Math.min(maxQty, Math.max(1, q + delta)))
  }

  function handleAddToCart() {
    if (!selectedVariant || !inStock) return
    addItem({ id: product.id, name: product.name }, selectedVariant, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    if (!selectedVariant || !inStock) return
    addItem({ id: product.id, name: product.name }, selectedVariant, quantity)
    router.push('/cart')
  }

  return (
    <div className="space-y-5">
      {/* Price block */}
      {price != null && (
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-indigo-600">
            {price.toLocaleString('vi-VN')}₫
          </span>
          {hasDiscount && (
            <>
              <span className="mb-0.5 text-base text-gray-400 line-through">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="mb-0.5 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                -{discountPct}%
              </span>
            </>
          )}
        </div>
      )}

      {/* Variant selector */}
      {product.variants.length > 1 && selectedVariant && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariant.id}
            onSelect={(v) => {
              setSelectedVariant(v)
              setQuantity(1)
            }}
          />
        </div>
      )}

      {/* Stock status */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            inStock
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {inStock ? `Còn hàng (${selectedVariant?.quantity})` : 'Hết hàng'}
        </span>
        {selectedVariant?.sku && (
          <span className="text-xs text-gray-400">SKU: {selectedVariant.sku}</span>
        )}
      </div>

      {/* Quantity selector */}
      {inStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Số lượng:</span>
          <div className="flex items-center rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => handleQtyChange(-1)}
              disabled={quantity <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-l-lg text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Giảm số lượng"
            >
              <Minus size={14} />
            </button>
            <span className="flex h-9 w-10 items-center justify-center border-x border-gray-200 text-sm font-semibold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => handleQtyChange(1)}
              disabled={quantity >= maxQty}
              className="flex h-9 w-9 items-center justify-center rounded-r-lg text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Tăng số lượng"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-xs text-gray-400">Tối đa {maxQty}</span>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            !inStock
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : added
              ? 'bg-green-500 text-white shadow-sm'
              : 'border-2 border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          {added ? (
            <>
              <Check size={16} />
              Đã thêm vào giỏ!
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Thêm vào giỏ hàng
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            !inStock
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]'
          }`}
        >
          <Zap size={16} />
          Mua ngay
        </button>
      </div>
    </div>
  )
}
