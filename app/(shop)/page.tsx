import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { ProductGrid } from '@/components/product/product-grid'
import type { Product, Category, PaginatedResponse, ApiResponse } from '@/types'

export const revalidate = 3600

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/api/products', {
      params: { per_page: 8, status: 'active' },
    })
    return data.data ?? []
  } catch {
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/api/categories')
    return data.data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Mua sắm thông minh, sống đẳng cấp
          </h1>
          <p className="mb-8 text-lg opacity-90">
            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
          </p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Mua ngay
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center transition-shadow hover:shadow-md"
              >
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
          <Link href="/products" className="text-sm text-primary hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </main>
  )
}
