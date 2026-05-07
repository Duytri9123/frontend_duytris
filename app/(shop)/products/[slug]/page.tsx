import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import api from '@/lib/api-client'
import type { ApiResponse, PaginatedResponse, Product } from '@/types'
import ProductDetail from '@/components/product/product-detail'
import ProductReviews from '@/components/product/product-reviews'
import { ProductRecommendations } from '@/components/product/product-recommendations'
import ProductImageTabs from '@/components/product/product-image-tabs'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function resolveUrl(url: string | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_URL}${url}`
  return `${API_URL}/storage/${url}`
}

export const revalidate = 600

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const res = await api.get<PaginatedResponse<Product>>('/api/products', { per_page: '50' })
    return res.data.data.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await api.get<ApiResponse<Product>>(`/api/products/${slug}`)
    return res.data.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Sản phẩm không tồn tại' }
  const thumbnail = product.thumbnail_image?.url ?? product.images[0]?.url
  const description = product.short_description || product.description?.slice(0, 160)
  return {
    title: product.name,
    description,
    keywords: [product.name, product.brand?.name, product.category?.name].filter(Boolean).join(', '),
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: thumbnail ? [{ url: resolveUrl(thumbnail), alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: thumbnail ? [resolveUrl(thumbnail)] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const images = product.images.length > 0 ? product.images : []
  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    image: images.map((img) => resolveUrl(img.url)),
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: defaultVariant
      ? {
          '@type': 'Offer',
          price: defaultVariant.selling_price,
          priceCurrency: 'VND',
          availability:
            defaultVariant.quantity > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        }
      : undefined,
    aggregateRating:
      product.rating_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.avg_rating,
            reviewCount: product.rating_count,
          }
        : undefined,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Trang chủ
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/products" className="hover:text-gray-900 transition-colors">
            Sản phẩm
          </Link>
          {product.category && (
            <>
              <span className="text-gray-300">/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-gray-900 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="text-gray-300">/</span>
          <span className="max-w-[200px] truncate font-medium text-gray-900">
            {product.name}
          </span>
        </nav>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* Left: Image Gallery */}
            <div className="border-b border-gray-100 p-6 lg:border-b-0 lg:border-r lg:p-8">
              {images.length > 0 ? (
                <ProductImageTabs images={images} productName={product.name} />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-xl bg-gray-100">
                  <svg
                    className="h-16 w-16 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col p-6 lg:p-8">
              {/* Brand + Category tags */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.brand && (
                  <Link
                    href={`/products?brand=${product.brand.slug}`}
                    className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    {product.brand.name}
                  </Link>
                )}
                {product.category && (
                  <Link
                    href={`/products?category=${product.category.slug}`}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}
              </div>

              {/* Product name */}
              <h1 className="mb-3 text-2xl font-bold leading-tight text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              {product.avg_rating > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className={`h-4 w-4 ${
                          s <= Math.round(product.avg_rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {product.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({product.rating_count} đánh giá)
                  </span>
                </div>
              )}

              {/* Short description */}
              {product.short_description && (
                <p className="mb-5 border-b border-gray-100 pb-5 text-sm leading-relaxed text-gray-600">
                  {product.short_description}
                </p>
              )}

              {/* Interactive: variant + qty + add to cart */}
              <div className="flex-1">
                <ProductDetail product={product} />
              </div>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                <div className="flex flex-col items-center gap-1 text-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-[10px] leading-tight text-gray-500">Hàng chính hãng</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span className="text-[10px] leading-tight text-gray-500">Thanh toán an toàn</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <svg
                    className="h-5 w-5 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="text-[10px] leading-tight text-gray-500">Đổi trả 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Mô tả sản phẩm</h2>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
          <ProductReviews
            productId={product.id}
            avgRating={product.avg_rating}
            ratingCount={product.rating_count}
          />
        </div>

        {/* AI Recommendations */}
        <ProductRecommendations productId={product.id} />
      </div>
    </div>
  )
}
