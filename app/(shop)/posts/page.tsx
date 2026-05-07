import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { Calendar, Tag, ArrowRight, FileText } from 'lucide-react'
import type { PaginatedResponse } from '@/types'

export const revalidate = 300

interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string
  thumbnail_url?: string
  category?: string
  views_count?: number
  created_at: string
}

interface SearchParams { page?: string; category?: string }

async function getPosts(params: Record<string, string>) {
  try {
    const { data } = await apiClient.get<PaginatedResponse<Post>>('/api/posts', { params: { ...params, per_page: 12, status: 'published' } })
    return data
  } catch { return null }
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const data = await getPosts({ page: sp.page ?? '1', ...(sp.category ? { category: sp.category } : {}) })
  const posts = data?.data ?? []

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tin tức & Bài viết</h1>
        <p className="mt-2 text-gray-500">Cập nhật xu hướng thời trang, tips mua sắm và nhiều hơn nữa</p>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">Chưa có bài viết nào</p>
          <Link href="/" className="mt-4 text-sm text-indigo-600 hover:underline">← Về trang chủ</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText size={40} className="text-gray-300" />
                  </div>
                )}
                {post.category && (
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    <Tag size={9} /> {post.category}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="line-clamp-2 text-base font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                )}
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} />
                    {new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-indigo-600">
                    Đọc thêm <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: data.last_page }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/posts?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === data.current_page
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
