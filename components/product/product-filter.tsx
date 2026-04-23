'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Brand, Category } from '@/types'

interface CurrentFilters {
  category?: string
  brand?: string
  search?: string
  sort?: string
}

interface ProductFilterProps {
  categories: Category[]
  brands: Brand[]
  currentFilters: CurrentFilters
}

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'latest' },
  { label: 'Giá tăng', value: 'price_asc' },
  { label: 'Giá giảm', value: 'price_desc' },
]

export function ProductFilter({ categories, brands, currentFilters }: ProductFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to page 1 on filter change
    params.delete('page')

    router.push(`/products?${params.toString()}`)
  }

  const activeCategory = currentFilters.category ?? ''
  const activeBrand = currentFilters.brand ?? ''
  const activeSort = currentFilters.sort ?? ''

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div>
        <h3 className="mb-3 font-semibold">Danh mục</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <button
              onClick={() => updateFilter('category', '')}
              className={`block w-full rounded px-2 py-1 text-left hover:bg-muted ${!activeCategory ? 'font-medium text-primary' : ''}`}
            >
              Tất cả
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilter('category', cat.slug)}
                className={`block w-full rounded px-2 py-1 text-left hover:bg-muted ${activeCategory === cat.slug ? 'font-medium text-primary' : ''}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brand filter */}
      <div>
        <h3 className="mb-3 font-semibold">Thương hiệu</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <button
              onClick={() => updateFilter('brand', '')}
              className={`block w-full rounded px-2 py-1 text-left hover:bg-muted ${!activeBrand ? 'font-medium text-primary' : ''}`}
            >
              Tất cả
            </button>
          </li>
          {brands.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => updateFilter('brand', b.slug)}
                className={`block w-full rounded px-2 py-1 text-left hover:bg-muted ${activeBrand === b.slug ? 'font-medium text-primary' : ''}`}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort options */}
      <div>
        <h3 className="mb-3 font-semibold">Sắp xếp</h3>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('sort', opt.value)}
              className={`rounded border px-3 py-1.5 text-sm text-left hover:bg-muted ${activeSort === opt.value ? 'border-primary bg-primary/10 text-primary' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
