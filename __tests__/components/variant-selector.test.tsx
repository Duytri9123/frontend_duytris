import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VariantSelector from '@/components/product/variant-selector'
import type { ProductVariant } from '@/types'

const makeVariant = (id: number, attrs: Array<{ attrId: number; attrName: string; valId: number; val: string }>, qty = 5): ProductVariant => ({
  id,
  sku: `SKU-${id}`,
  selling_price: 100000,
  original_price: 120000,
  quantity: qty,
  weight: null,
  dimensions: null,
  is_default: id === 1,
  attribute_values: attrs.map(a => ({
    id: a.valId,
    value: a.val,
    product_attribute: { id: a.attrId, name: a.attrName },
  })),
  image_indexes: [],
})

const variants: ProductVariant[] = [
  makeVariant(1, [{ attrId: 1, attrName: 'Màu', valId: 1, val: 'Đỏ' }, { attrId: 2, attrName: 'Size', valId: 3, val: 'M' }]),
  makeVariant(2, [{ attrId: 1, attrName: 'Màu', valId: 2, val: 'Xanh' }, { attrId: 2, attrName: 'Size', valId: 3, val: 'M' }]),
  makeVariant(3, [{ attrId: 1, attrName: 'Màu', valId: 1, val: 'Đỏ' }, { attrId: 2, attrName: 'Size', valId: 4, val: 'L' }], 0),
]

describe('VariantSelector', () => {
  it('renders attribute group labels', () => {
    render(<VariantSelector variants={variants} selectedVariantId={1} onSelect={jest.fn()} />)
    expect(screen.getByText('Màu')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
  })

  it('renders all attribute values', () => {
    render(<VariantSelector variants={variants} selectedVariantId={1} onSelect={jest.fn()} />)
    expect(screen.getByText('Đỏ')).toBeInTheDocument()
    expect(screen.getByText('Xanh')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
  })

  it('disables out-of-stock attribute values', () => {
    render(<VariantSelector variants={variants} selectedVariantId={1} onSelect={jest.fn()} />)
    // Variant 3 (Đỏ + L) has qty=0, so L should be disabled
    expect(screen.getByText('L').closest('button')).toBeDisabled()
  })

  it('calls onSelect when a valid attribute value is clicked', async () => {
    const onSelect = jest.fn()
    const user = userEvent.setup()
    render(<VariantSelector variants={variants} selectedVariantId={1} onSelect={onSelect} />)
    await user.click(screen.getByText('Xanh'))
    expect(onSelect).toHaveBeenCalledWith(variants[1])
  })

  it('returns null when no attribute groups', () => {
    const simpleVariants: ProductVariant[] = [
      makeVariant(1, []),
    ]
    const { container } = render(
      <VariantSelector variants={simpleVariants} selectedVariantId={1} onSelect={jest.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })
})
