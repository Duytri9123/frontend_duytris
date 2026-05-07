import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Calendar, Tag, ArrowLeft, Eye } from 'lucide-react'

export const revalidate = 300

interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string
  content?: string
  thumbnail_url?: string
  category?: string
  views_count?: number
  meta_title?: string
  meta_description?: string
  created_at: string
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const { data } = await apiClient.get<{ data: Post }>(`/api/posts/${slug}`)
    return data.data
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Không tìm thấy' }
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.thumbnail_url ? [post.thumbnail_url] : [] },
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />')
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Back */}
      <Link href="/posts" className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={16} /> Quay lại tin tức
      </Link>

      {/* Header */}
      <div className="mb-6">
        {post.category && (
          <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Tag size={10} /> {post.category}
          </span>
        )}
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          {post.views_count !== undefined && (
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {post.views_count.toLocaleString()} lượt xem
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {post.thumbnail_url && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img src={post.thumbnail_url} alt={post.title} className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mb-6 text-lg text-gray-600 leading-relaxed border-l-4 border-indigo-400 pl-4 italic">
          {post.excerpt}
        </p>
      )}

      {/* Content */}
      {post.content && (
        <div
          className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${renderContent(post.content)}</p>` }}
        />
      )}

      {/* Footer */}
      <div className="mt-10 border-t border-gray-200 pt-6">
        <Link href="/posts" className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft size={14} /> Xem tất cả bài viết
        </Link>
      </div>
    </div>
  )
}
