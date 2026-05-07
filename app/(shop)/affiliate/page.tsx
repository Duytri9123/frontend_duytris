import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { ExternalLink, ShoppingBag, Tag } from 'lucide-react'
import type { PaginatedResponse } from '@/types'

export const revalidate = 300

interface AffiliateProduct {
  id: number
  name: string
  description?: string
  image_url?: string
  price?: number
  original_price?: number
  affiliate_url: string
  platform: string
  category?: string
  brand?: string
  commission_rate?: number
  is_featured: boolean
}

const PLATFORM_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  shopee:  { label: 'Shopee',  emoji: '🛒', color: 'bg-orange-100 text-orange-700' },
  lazada:  { label: 'Lazada',  emoji: '📦', color: 'bg-blue-100 text-blue-700' },
  tiki:    { label: 'Tiki',    emoji: '🔵', color: 'bg-sky-100 text-sky-700' },
  tiktok:  { label: 'TikTok',  emoji: '🎵', color: 'bg-pink-100 text-pink-700' },
  amazon:  { label: 'Amazon',  emoji: '📫', color: 'bg-yellow-100 text-yellow-700' },
  sendo:   { label: 'Sendo',   emoji: '🏪', color: 'bg-red-100 text-red-700' },
  custom:  { label: 'Khác',    emoji: '🔗', color: 'bg-gray-100 text-gray-700' },
}

async function getAffiliateProducts(params: Record<string, string>) {
  try {
    const { data } = await apiClient.get<PaginatedResponse<AffiliateProduct>>('/api/affiliate', {
      params: { ...params, per_page: 20, active: '1' },
    })
    return data
  } catch { return null }
}

interface SearchParams { page?: string; platform?: string; category?: string }

export default async function AffiliatePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const data = await getAffiliateProducts({
    page: sp.page ?? '1',
    ...(sp.platform ? { platform: sp.platform } : {}),
    ...(sp.category ? { category: sp.category } : {}),
  })
  const products = data?.data ?? []

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sản phẩm đề xuất</h1>
        <p className="mt-2 text-gray-500">Các sản phẩm chất lượng từ Shopee, Lazada, Tiki và nhiều sàn khác</p>
      </div>

      {/* Platform filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/affiliate" className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${!sp.platform ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
          Tất cả
        </Link>
        {Object.entries(PLATFORM_LABELS).map(([key, { label, emoji }]) => (
          <Link key={key} href={`/affiliate?platform=${key}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${sp.platform === key ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {emoji} {label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">Chưa có sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map(product => {
            const platform = PLATFORM_LABELS[product.platform] ?? PLATFORM_LABELS.custom
            const hasDiscount = product.price && product.original_price && product.original_price > product.price
            const discountPct = hasDiscount ? Math.round((1 - product.price! / product.original_price!) * 100) : 0

            return (
              <a
                key={product.id}
                href={`/api/affiliate/${product.id}/click`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag size={36} className="text-gray-300" />
                    </div>
                  )}
                  {/* Platform badge */}
                  <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${platform.color}`}>
                    {platform.emoji} {platform.label}
                  </span>
                  {/* Discount badge */}
                  {discountPct > 0 && (
                    <span className="absolute right-2 top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      -{discountPct}%
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-yellow-400 px-2 py-0.5 text-[9px] font-bold text-yellow-900">
                      ⭐ Nổi bật
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="mt-0.5 text-xs text-gray-400">{product.brand}</p>
                  )}
                  {product.category && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-indigo-500">
                      <Tag size={9} /> {product.category}
                    </span>
                  )}

                  <div className="mt-auto pt-3">
                    {product.price ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-indigo-600">
                          {product.price.toLocaleString('vi-VN')}₫
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            {product.original_price!.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between">
                      {product.commission_rate && (
                        <span className="text-[10px] text-green-600 font-medium">💰 {product.commission_rate}% HH</span>
                      )}
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
                        <ExternalLink size={9} /> Xem ngay
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/affiliate?page=${p}${sp.platform ? `&platform=${sp.platform}` : ''}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === data.current_page ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </Link>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-gray-400">
        * Các sản phẩm trên là liên kết affiliate. Chúng tôi có thể nhận hoa hồng khi bạn mua hàng.
      </p>
    </div>
  )
}
