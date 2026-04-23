import Link from 'next/link'
import { ProductGrid } from '@/components/product/product-grid'
import { Pagination } from '@/components/common/pagination'
import api from '@/lib/api-client'
import type { Brand, Category, PaginatedResponse, Product } from '@/types'

interface SearchParams {
  page?: string
  category?: string
  brand?: string
  search?: string
  sort?: string
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

async function fetchProducts(params: Record<string, string>) {
  try {
    const res = await api.get<PaginatedResponse<Product>>('/api/products', params)
    return res.data
  } catch {
    return null
  }
}

async function fetchCategories() {
  try {
    const res = await api.get<{ data: Category[] }>('/api/categories')
    return res.data.data ?? []
  } catch {
    return []
  }
}

async function fetchBrands() {
  try {
    const res = await api.get<{ data: Brand[] }>('/api/brands')
    return res.data.data ?? []
  } catch {
    return []
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const category = params.category ?? ''
  const brand = params.brand ?? ''
  const search = params.search ?? ''
  const sort = params.sort ?? ''

  // Build query params — omit empty values
  const queryParams: Record<string, string> = { page: String(page) }
  if (category) queryParams.category = category
  if (brand) queryParams.brand = brand
  if (search) queryParams.search = search
  if (sort) queryParams.sort = sort

  const [productsData, categories, brands] = await Promise.all([
    fetchProducts(queryParams),
    fetchCategories(),
    fetchBrands(),
  ])

  const products = productsData?.data ?? []
  const totalPages = productsData?.last_page ?? 1

  function buildUrl(overrides: Partial<SearchParams>) {
    const next: Record<string, string> = {
      page: String(page),
      ...(category && { category }),
      ...(brand && { brand }),
      ...(search && { search }),
      ...(sort && { sort }),
      ...Object.fromEntries(
        Object.entries(overrides).filter(([, v]) => v !== undefined && v !== '') as [string, string][]
      ),
    }
    // Remove page=1 from URL (default)
    if (next.page === '1') delete next.page
    const qs = new URLSearchParams(next).toString()
    return `/products${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search header */}
      {search && (
        <p className="mb-4 text-muted-foreground">
          Kết quả tìm kiếm cho: <span className="font-medium text-foreground">"{search}"</span>
        </p>
      )}

      <div className="flex gap-8">
        {/* Filter sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          {/* Categories */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold">Danh mục</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={buildUrl({ category: '', page: '1' })}
                  className={`block rounded px-2 py-1 hover:bg-muted ${!category ? 'font-medium text-primary' : ''}`}
                >
                  Tất cả
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildUrl({ category: cat.slug, page: '1' })}
                    className={`block rounded px-2 py-1 hover:bg-muted ${category === cat.slug ? 'font-medium text-primary' : ''}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="mb-3 font-semibold">Thương hiệu</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={buildUrl({ brand: '', page: '1' })}
                  className={`block rounded px-2 py-1 hover:bg-muted ${!brand ? 'font-medium text-primary' : ''}`}
                >
                  Tất cả
                </Link>
              </li>
              {brands.map((b) => (
                <li key={b.id}>
                  <Link
                    href={buildUrl({ brand: b.slug, page: '1' })}
                    className={`block rounded px-2 py-1 hover:bg-muted ${brand === b.slug ? 'font-medium text-primary' : ''}`}
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {productsData ? `${productsData.total} sản phẩm` : ''}
            </p>
            <div className="flex gap-2 text-sm">
              {[
                { label: 'Mới nhất', value: 'latest' },
                { label: 'Giá tăng', value: 'price_asc' },
                { label: 'Giá giảm', value: 'price_desc' },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({ sort: opt.value, page: '1' })}
                  className={`rounded border px-3 py-1 hover:bg-muted ${sort === opt.value ? 'border-primary bg-primary/10 text-primary' : ''}`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          <ProductGrid products={products} />

          {totalPages > 1 && (
            <div className="mt-8">
              <PaginationLinks
                currentPage={page}
                totalPages={totalPages}
                buildUrl={buildUrl}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Server-side pagination — renders links instead of onClick handlers
function PaginationLinks({
  currentPage,
  totalPages,
  buildUrl,
}: {
  currentPage: number
  totalPages: number
  buildUrl: (overrides: Partial<SearchParams>) => string
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1">
      <Link
        href={buildUrl({ page: String(currentPage - 1) })}
        aria-disabled={currentPage === 1}
        className={`rounded-md border px-3 py-1.5 text-sm hover:bg-muted ${currentPage === 1 ? 'pointer-events-none opacity-40' : ''}`}
      >
        ‹ Trước
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={buildUrl({ page: String(p) })}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            p === currentPage
              ? 'border-primary bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={buildUrl({ page: String(currentPage + 1) })}
        aria-disabled={currentPage === totalPages}
        className={`rounded-md border px-3 py-1.5 text-sm hover:bg-muted ${currentPage === totalPages ? 'pointer-events-none opacity-40' : ''}`}
      >
        Sau ›
      </Link>
    </div>
  )
}
