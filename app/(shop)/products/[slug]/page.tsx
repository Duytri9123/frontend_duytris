import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import api from '@/lib/api-client'
import type { ApiResponse, PaginatedResponse, Product } from '@/types'
import ProductDetail from '@/components/product/product-detail'
import ProductReviews from '@/components/product/product-reviews'

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
    keywords: [
      product.name,
      product.brand?.name,
      product.category?.name,
    ].filter(Boolean).join(', '),
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: thumbnail ? [{ url: thumbnail, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const images = product.images.length > 0 ? product.images : []
  const thumbnail = product.thumbnail_image ?? images[0]
  const defaultVariant = product.variants.find(v => v.is_default) ?? product.variants[0]

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    image: images.map(img => img.url),
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: defaultVariant ? {
      '@type': 'Offer',
      price: defaultVariant.selling_price,
      priceCurrency: 'VND',
      availability: defaultVariant.quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    } : undefined,
    aggregateRating: product.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.avg_rating,
      reviewCount: product.rating_count,
    } : undefined,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {thumbnail ? (
              <Image
                src={thumbnail.url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Không có ảnh
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <div key={img.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <Image src={img.url} alt={`${product.name} ảnh ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Trang chủ</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground">Sản phẩm</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
                  {product.category.name}
                </Link>
              </>
            )}
          </nav>

          <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>

          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(product.avg_rating) ? 'text-yellow-400' : 'text-muted-foreground'}>★</span>
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.avg_rating.toFixed(1)} ({product.rating_count} đánh giá)
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {product.brand && (
              <div>
                <span className="text-muted-foreground">Thương hiệu: </span>
                <Link href={`/products?brand=${product.brand.slug}`} className="font-medium hover:text-primary">{product.brand.name}</Link>
              </div>
            )}
            {product.category && (
              <div>
                <span className="text-muted-foreground">Danh mục: </span>
                <Link href={`/products?category=${product.category.slug}`} className="font-medium hover:text-primary">{product.category.name}</Link>
              </div>
            )}
          </div>

          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          {/* Interactive: variant selector + add to cart */}
          <ProductDetail product={product} />
        </div>
      </div>

      {product.description && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Mô tả sản phẩm</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}

      <ProductReviews productId={product.id} avgRating={product.avg_rating} ratingCount={product.rating_count} />
    </div>
  )
}
