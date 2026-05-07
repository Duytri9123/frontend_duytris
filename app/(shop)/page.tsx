import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { ProductGrid } from '@/components/product/product-grid'
import { HeroBanner } from '@/components/home/hero-banner'
import { PostsSection } from '@/components/home/posts-section'
import { RecommendedProducts } from '@/components/home/recommended-products'
import { BrandsSection } from '@/components/home/brands-section'
import type { Product, Category, PaginatedResponse, ApiResponse } from '@/types'

export const revalidate = 3600

interface Banner {
  id: number
  title: string
  subtitle?: string
  image_url: string
  aspect_ratio?: string
  link_url?: string
  button_text?: string
  button_style?: string
  is_active: boolean
  text_overlays?: string
}

interface CarouselSettings {
  autoplayInterval: number
  showArrows: boolean
  showDots: boolean
  transition: 'fade' | 'slide' | 'zoom'
}

interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string
  thumbnail_url?: string
  category?: string
  created_at: string
}

async function getBanners(): Promise<Banner[]> {
  try {
    const { data } = await apiClient.get<{ data: Banner[] }>('/api/banners')
    return (data.data ?? []).filter((b) => b.is_active)
  } catch {
    return []
  }
}

async function getCarouselSettings(): Promise<CarouselSettings> {
  try {
    const { data } = await apiClient.get<{ data: Record<string, string> }>('/api/settings/flat')
    const s = data.data ?? {}
    return {
      autoplayInterval: parseInt(s['banner_autoplay_interval'] ?? '5000', 10) || 5000,
      showArrows: s['banner_show_arrows'] !== '0',
      showDots: s['banner_show_dots'] !== '0',
      transition: (['fade', 'slide', 'zoom'].includes(s['banner_transition'] ?? '')
        ? s['banner_transition']
        : 'fade') as 'fade' | 'slide' | 'zoom',
    }
  } catch {
    return { autoplayInterval: 5000, showArrows: true, showDots: true, transition: 'fade' }
  }
}

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

async function getLatestPosts(): Promise<Post[]> {
  try {
    const { data } = await apiClient.get<PaginatedResponse<Post>>('/api/posts', {
      params: { per_page: 3, status: 'published' },
    })
    return data.data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [banners, carouselSettings, products, categories, posts] = await Promise.all([
    getBanners(),
    getCarouselSettings(),
    getFeaturedProducts(),
    getCategories(),
    getLatestPosts(),
  ])

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      {banners.length > 0 ? (
        <HeroBanner
          banners={banners}
          autoplayInterval={carouselSettings.autoplayInterval}
          showArrows={carouselSettings.showArrows}
          showDots={carouselSettings.showDots}
          transition={carouselSettings.transition}
        />
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
          <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Mua sắm thông minh
            </h1>
            <p className="mb-8 text-lg text-indigo-200 max-w-xl mx-auto">
              Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
            </p>
            <Link
              href="/products"
              className="inline-block rounded-xl bg-white px-8 py-3 font-semibold text-indigo-700 transition-all hover:bg-indigo-50 hover:shadow-lg"
            >
              Mua ngay →
            </Link>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Danh mục sản phẩm</h2>
            <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                  {category.name[0]}
                </div>
                <span className="text-xs font-medium text-gray-700 leading-tight">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brands Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-12">
        <BrandsSection limit={12} showViewAll={true} />
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Xem tất cả →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>

      {/* Recommended Products - Popular */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-12">
        <RecommendedProducts 
          title="Sản phẩm được xem nhiều" 
          type="popular" 
          limit={8} 
        />
      </section>

      {/* Recommended Products - New */}
      <section className="bg-gray-50 py-12">
        <RecommendedProducts 
          title="Sản phẩm mới nhất" 
          type="new" 
          limit={8} 
        />
      </section>

      {/* Posts / Blog */}
      {posts.length > 0 && (
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <PostsSection posts={posts} />
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Đăng ký nhận ưu đãi</h2>
          <p className="text-indigo-200 mb-6">Nhận thông báo về sản phẩm mới và khuyến mãi độc quyền</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 rounded-xl border-0 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
