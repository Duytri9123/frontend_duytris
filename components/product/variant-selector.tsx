'use client'

import type { ProductVariant, AttributeValue } from '@/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId: number
  onSelect: (variant: ProductVariant) => void
}

function groupAttributes(variants: ProductVariant[]): Map<string, AttributeValue[]> {
  const groups = new Map<string, AttributeValue[]>()
  for (const variant of variants) {
    for (const av of variant.attribute_values) {
      const name = av.product_attribute.name
      if (!groups.has(name)) groups.set(name, [])
      const existing = groups.get(name)!
      if (!existing.find((v) => v.id === av.id)) existing.push(av)
    }
  }
  return groups
}

function findVariantForSelection(
  variants: ProductVariant[],
  currentVariant: ProductVariant,
  changedAttrName: string,
  newAttrValueId: number
): ProductVariant | null {
  const desiredAttrs = new Map<string, number>()
  for (const av of currentVariant.attribute_values) {
    desiredAttrs.set(av.product_attribute.name, av.id)
  }
  desiredAttrs.set(changedAttrName, newAttrValueId)
  return (
    variants.find((v) => {
      if (v.attribute_values.length !== desiredAttrs.size) return false
      return v.attribute_values.every((av) => desiredAttrs.get(av.product_attribute.name) === av.id)
    }) ?? null
  )
}

export default function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0]
  const groups = groupAttributes(variants)
  if (groups.size === 0) return null

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([attrName, values]) => (
        <div key={attrName}>
          <p className="mb-2 text-sm font-medium">{attrName}</p>
          <div className="flex flex-wrap gap-2">
            {values.map((av) => {
              const isSelected = selectedVariant?.attribute_values.some((v) => v.id === av.id)
              const hasStock = variants.some(
                (variant) =>
                  variant.attribute_values.some((v) => v.id === av.id) && variant.quantity > 0
              )
              return (
                <button
                  key={av.id}
                  onClick={() => {
                    const target = findVariantForSelection(variants, selectedVariant, attrName, av.id)
                    if (target) onSelect(target)
                  }}
                  disabled={!hasStock}
                  className={[
                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                    isSelected ? 'border-primary bg-primary/10 text-primary font-medium' : 'hover:border-primary',
                    !hasStock ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer',
                  ].join(' ')}
                >
                  {av.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
